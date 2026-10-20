"""Inner document containers must not bypass standalone validation."""

import importlib.util
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import Mock

import pytest

from app import archive
from app.common import containers
from app.common.errors import ConversionRejected
from app.converter import DocumentEngine
from zips import make_zip


def fake_engine():
    engine = DocumentEngine.__new__(DocumentEngine)
    engine._md = SimpleNamespace(convert_stream=Mock(return_value=SimpleNamespace(markdown="# Preserved\n\nUnicode: café")))
    engine._stream_info = lambda **kwargs: kwargs
    return engine


@pytest.mark.parametrize("ext", ["docx", "xlsx", "pptx", "epub"])
@pytest.mark.parametrize("data", [b"not zip", b"PK\x03\x04broken", make_zip({"other.xml": "x"})])
def test_archive_document_rejected_before_parser(ext, data):
    engine = fake_engine()
    with pytest.raises(ConversionRejected) as error:
        engine(data, ext, f"bad.{ext}")
    assert error.value.code == "magic_mismatch"
    engine._md.convert_stream.assert_not_called()


@pytest.mark.parametrize("limit", ["entries", "bytes"])
def test_inner_container_limit_fails_only_that_archive_entry(monkeypatch, limit):
    # The outer ZIP sees only a small document. The inner expansion is large.
    inner = make_zip({"word/document.xml": b"x" * 100_000, "extra.xml": b"y"})
    assert len(inner) * 100 < 100_000
    monkeypatch.setattr(containers, "MAX_ZIP_ENTRIES" if limit == "entries" else "MAX_ZIP_UNCOMPRESSED", 1)
    engine = fake_engine()
    entries = archive.process_archive(make_zip({"bad.docx": inner, "keep.txt": "keep this text"}), engine, ocr_available=False)
    by_path = {entry.path: entry for entry in entries}
    assert by_path["bad.docx"].status == "FAILED"
    assert "ConversionRejected" in by_path["bad.docx"].skip_reason
    assert by_path["bad.docx"].content is None
    assert by_path["keep.txt"].status == "DONE"
    assert by_path["keep.txt"].content == "keep this text"
    engine._md.convert_stream.assert_not_called()


@pytest.mark.parametrize("ext,marker", [*containers.OOXML_MARKERS.items(), ("epub", "mimetype")])
def test_validated_document_reaches_parser_unchanged(ext, marker):
    body = "application/epub+zip" if ext == "epub" else "<document/>"
    data = make_zip({marker: body})
    engine = fake_engine()
    output = engine(data, ext, f"valid.{ext}")
    assert output == "# Preserved\n\nUnicode: café"
    args, kwargs = engine._md.convert_stream.call_args
    assert args[0].getvalue() == data
    assert kwargs["stream_info"]["extension"] == f".{ext}"


@pytest.mark.parametrize("ext", ["pdf", "xls", "html", "csv"])
def test_other_document_types_do_not_gain_container_restrictions(ext):
    engine = fake_engine()
    engine(b"existing parser input", ext, f"valid.{ext}")
    engine._md.convert_stream.assert_called_once()


@pytest.mark.parametrize("ext", ["docx", "xlsx", "pptx", "epub"])
def test_real_documents_keep_conversion_content_inside_archive(converter, ext):
    # Reuse the real standalone corpus, rather than a second set of fixtures.
    fixture_path = Path(__file__).resolve().parents[2] / "backendN" / "tests" / "fixtures.py"
    if not fixture_path.is_file():
        pytest.skip("standalone backend fixture corpus not present")
    spec = importlib.util.spec_from_file_location("standalone_fixtures", fixture_path)
    fixtures = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(fixtures)
    makers = {
        "docx": lambda: fixtures.make_docx("Quarterly Memo", "Revenue grew steadily."),
        "xlsx": lambda: fixtures.make_xlsx([["Name", "Score"], ["Ada", 99]]),
        "pptx": lambda: fixtures.make_pptx("Launch Plan", "Ship on Monday"),
        "epub": lambda: fixtures.make_epub("It was a bright cold day."),
    }
    data = makers[ext]()
    filename = f"valid.{ext}"
    direct = converter.documents(data, ext, filename)
    entries = archive.process_archive(make_zip({filename: data}), converter.documents, ocr_available=False)
    assert len(entries) == 1
    assert entries[0].status == "DONE"
    assert entries[0].content == direct
    assert direct
