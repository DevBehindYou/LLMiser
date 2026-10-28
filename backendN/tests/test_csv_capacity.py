"""CSV output must match the installed, verified upstream converter exactly."""
import csv
import io
import random
from importlib.metadata import version
from pathlib import Path
from types import SimpleNamespace

import pytest
from markitdown import StreamInfo
from markitdown.converters import CsvConverter

from app import csv_converter

VERIFIED = version("markitdown") in csv_converter.VERIFIED_VERSIONS
optimized = pytest.mark.skipif(not VERIFIED, reason="unverified upstream retains its original converter")


def compare(data, charset="utf-8"):
    info = StreamInfo(extension=".csv", charset=charset)
    actual = csv_converter.RowStreamingCsvConverter().convert(io.BytesIO(data), info).markdown
    expected = CsvConverter().convert(io.BytesIO(data), info).markdown
    assert actual == expected
    return actual


@optimized
@pytest.mark.parametrize("text", [
    "", "\n\r\n\n", '""\n', "A,B", "\n\nA,B\n\n\n",
    "\n\nA,B\n\n1,2,3\n\n\n4\n\n", "A\n1,2,3\n4,5",
    "A,B\r\n1,2\r3,4\n", '\ufeff\ufeffA,B\n1,2',
    '"A|B",C\n"line\nbreak","a\\\\|b"\n"carriage\rreturn","quote""quote"',
    "名前,Größe,Español,🙂\n日本語,groß,café,終わり",
    "A,B\n,,\n\n1,2\n\n,,\n", "A\n" + "\n" * 2000 + "last\n" * 2,
])
def test_boundary_rows_and_cells_match_upstream(text):
    compare(text.encode())


@optimized
def test_random_ragged_quoted_tables_match_upstream():
    rng = random.Random(428)
    values = ["", "plain", "漢字🙂", "a|b", "x\\|y", 'quote"value', "first\nsecond", "CR\rLF\r\n", " café "]
    for _ in range(100):
        source = io.StringIO(newline="")
        writer = csv.writer(source)
        writer.writerows([[rng.choice(values) for _ in range(rng.randrange(7))] for _ in range(rng.randrange(30))])
        compare(source.getvalue().encode())


@optimized
@pytest.mark.parametrize("charset", ["utf-8", "utf-16", "cp1252", None])
def test_explicit_and_detected_encodings_match_upstream(charset):
    text = 'Prénom,City\nAndré,Zürich\n'
    compare(text.encode(charset or "utf-8"), charset)


@optimized
def test_undetectable_bytes_keep_upstream_utf8_fallback(monkeypatch):
    from markitdown.converters import _csv_converter as upstream
    monkeypatch.setattr(upstream, "from_bytes", lambda data: SimpleNamespace(best=lambda: None))
    compare(b'A,B\n\xff,1', None)


@optimized
def test_parser_failure_and_borrowed_stream_ownership_match_upstream():
    data = ('A\n' + 'x' * (csv.field_size_limit() + 1)).encode()
    for converter in [CsvConverter(), csv_converter.RowStreamingCsvConverter()]:
        source = io.BytesIO(data)
        with pytest.raises(csv.Error):
            converter.convert(source, StreamInfo(extension=".csv", charset="utf-8"))
        assert not source.closed


def test_unknown_version_keeps_engine_registration_untouched(monkeypatch):
    monkeypatch.setattr(csv_converter, "version", lambda name: "0.1.10")
    engine = SimpleNamespace(register_converter=lambda *args, **kwargs: pytest.fail("unknown converter registered"))
    assert csv_converter.register_csv_converter(engine) is False


def test_unverified_version_keeps_actual_upstream_csv_output(monkeypatch):
    from app.converter import NormalConverter
    monkeypatch.setattr(csv_converter, "version", lambda name: "0.1.10")
    data = b'Name\n"Ada|Lovelace",99\nfinal,100'
    expected = CsvConverter().convert(io.BytesIO(data), StreamInfo(extension=".csv", charset="utf-8")).markdown.strip()
    actual, warning = NormalConverter().convert(data, "csv", filename="old.csv", title="old")
    assert actual == expected
    assert warning is None


@optimized
def test_missing_upstream_helper_keeps_original_converter(monkeypatch):
    from markitdown.converters import _csv_converter as upstream
    monkeypatch.delattr(upstream, "_escape_table_cell")
    engine = SimpleNamespace(register_converter=lambda *args, **kwargs: pytest.fail("incomplete converter registered"))
    assert csv_converter.register_csv_converter(engine) is False


def test_document_pools_share_identical_csv_implementation():
    root = Path(__file__).resolve().parents[2]
    assert (root / "backendN/app/csv_converter.py").read_bytes() == (root / "backendZ/app/csv_converter.py").read_bytes()


@optimized
def test_normal_route_uses_optimized_converter_with_unchanged_output(convert, monkeypatch):
    calls = []
    original = csv_converter.RowStreamingCsvConverter.convert
    def observed(self, *args, **kwargs):
        calls.append(True)
        return original(self, *args, **kwargs)
    monkeypatch.setattr(csv_converter.RowStreamingCsvConverter, "convert", observed)
    response = convert("ragged.csv", b'Name\n"Ada|Lovelace",99\n"end-marker",100')
    assert response.status_code == 200, response.text
    assert calls
    assert "end-marker" in response.json()["content"]
    assert r"Ada\|Lovelace" in response.json()["content"]
