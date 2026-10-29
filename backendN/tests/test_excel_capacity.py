import io
from importlib.metadata import version
from pathlib import Path
from types import SimpleNamespace
import weakref

import pytest
from markitdown import StreamInfo
from markitdown.converters import XlsxConverter, XlsConverter

from app import excel_converter as module
from excel_fixtures import make_book

VERIFIED = version("markitdown") in module.VERIFIED_VERSIONS
optimized = pytest.mark.skipif(not VERIFIED, reason="unverified upstream keeps original Excel converters")


@optimized
@pytest.mark.parametrize("ext,legacy_view", [("xlsx", False), ("xlsx", True), ("xls", False)])
def test_whole_workbook_output_matches_upstream(ext, legacy_view):
    data = make_book(ext, legacy_view=legacy_view)
    info = StreamInfo(extension=f".{ext}")
    before, after = (XlsxConverter, module.SheetwiseXlsxConverter) if ext == "xlsx" else (XlsConverter, module.SheetwiseXlsConverter)
    expected = before().convert(io.BytesIO(data), info).markdown
    source = io.BytesIO(data)
    actual = after().convert(source, info).markdown
    assert not source.closed
    assert actual == expected
    assert "終わり🙂" in actual
    assert actual.index("## Mixed 日本語") < actual.index("## Empty") < actual.index("## Results")


@optimized
def test_custom_image_hook_keeps_original_image_behavior():
    class OriginalHook(XlsxConverter):
        def _image_to_html(self, *args, **kwargs):
            return "<p>embedded-pixel-marker</p>"
    class OptimizedHook(module.SheetwiseXlsxConverter):
        _image_to_html = OriginalHook._image_to_html
    data = make_book(image=True)
    info = StreamInfo(extension=".xlsx")
    expected = OriginalHook().convert(io.BytesIO(data), info).markdown
    actual = OptimizedHook().convert(io.BytesIO(data), info).markdown
    assert actual == expected
    assert "embedded-pixel-marker" in actual


@optimized
def test_sheet_frame_is_released_and_workbook_closed_before_next_parse(monkeypatch):
    frames, closed = [], []
    class Frame:
        def to_html(self, **kwargs):
            return "<table/>"
    class Workbook:
        sheet_names = ["One", "Two", "Three"]
        def __enter__(self): return self
        def __exit__(self, *args): closed.append(True)
        def parse(self, **kwargs):
            assert all(reference() is None for reference in frames)
            frame = Frame()
            frames.append(weakref.ref(frame))
            return frame
    monkeypatch.setattr(module.upstream.pd, "ExcelFile", lambda *args, **kwargs: Workbook())
    html = SimpleNamespace(convert_string=lambda *args, **kwargs: SimpleNamespace(markdown="table"))
    result = module._convert_workbook(io.BytesIO(), "openpyxl", html, {})
    assert result.markdown == "## One\ntable\n\n## Two\ntable\n\n## Three\ntable"
    assert closed == [True]
    assert all(reference() is None for reference in frames)


@optimized
def test_late_sheet_repair_discards_partial_output_and_closes_repaired_stream(monkeypatch):
    data = make_book()
    info = StreamInfo(extension=".xlsx")
    expected = XlsxConverter().convert(io.BytesIO(data), info).markdown
    original_read = module._read
    repair = module.upstream._repair_sheetview_show_zeroes
    streams, failed = [], []
    def fail_late(call, *args, **kwargs):
        if kwargs.get("sheet_name") == "Results" and not failed:
            failed.append(True)
            raise module._SheetViewRepair("showZeroes")
        return original_read(call, *args, **kwargs)
    def observe_repair(*args):
        stream = repair(*args)
        streams.append(stream)
        return stream
    monkeypatch.setattr(module, "_read", fail_late)
    monkeypatch.setattr(module.upstream, "_repair_sheetview_show_zeroes", observe_repair)
    actual = module.SheetwiseXlsxConverter().convert(io.BytesIO(data), info).markdown
    assert actual == expected
    assert len(streams) == 1 and streams[0].closed


@optimized
def test_html_failure_is_not_mistaken_for_a_workbook_repair(monkeypatch):
    converter = module.SheetwiseXlsxConverter()
    def fail(*args, **kwargs): raise TypeError("showZeroes is an unrelated HTML error")
    monkeypatch.setattr(converter._html_converter, "convert_string", fail)
    monkeypatch.setattr(module.upstream, "_repair_sheetview_show_zeroes", lambda *args: pytest.fail("HTML error triggered workbook repair"))
    with pytest.raises(TypeError, match="unrelated HTML"):
        converter.convert(io.BytesIO(make_book()), StreamInfo(extension=".xlsx"))


def test_unknown_version_keeps_original_excel_converters(monkeypatch):
    monkeypatch.setattr(module, "version", lambda name: "0.1.10")
    assert not module.register_excel_converters(SimpleNamespace(register_converter=lambda *args: pytest.fail("unknown adapter registered")))


@pytest.mark.parametrize("ext", ["xlsx", "xls"])
def test_unknown_version_normal_conversion_keeps_builtin_output(monkeypatch, ext):
    from app.converter import NormalConverter
    from markitdown import MarkItDown
    monkeypatch.setattr(module, "version", lambda name: "0.1.10")
    def unexpected(*args, **kwargs): pytest.fail("unverified adapter used")
    monkeypatch.setattr(module.SheetwiseXlsxConverter, "convert", unexpected)
    monkeypatch.setattr(module.SheetwiseXlsConverter, "convert", unexpected)
    data = make_book(ext)
    expected = MarkItDown(enable_plugins=False).convert_stream(io.BytesIO(data), stream_info=StreamInfo(extension=f".{ext}")).markdown.strip()
    actual = NormalConverter().convert(data, ext, filename=f"book.{ext}", title="book")[0]
    assert actual == expected


@optimized
def test_missing_upstream_repair_helper_retains_builtins(monkeypatch):
    monkeypatch.setattr(module.upstream, "_repair_sheetview_show_zeroes", None)
    assert not module.register_excel_converters(SimpleNamespace(register_converter=lambda *args: pytest.fail("incompatible adapter registered")))


@optimized
def test_xls_unloads_each_sheet_and_releases_workbook_on_html_failure(monkeypatch):
    original = module.upstream.pd.ExcelFile
    books = []
    def opened(*args, **kwargs):
        workbook = original(*args, **kwargs)
        books.append(workbook.book)
        assert workbook.book.on_demand
        assert not any(workbook.book.sheet_loaded(name) for name in workbook.sheet_names)
        return workbook
    converter = module.SheetwiseXlsConverter()
    def fail(*args, **kwargs):
        assert not any(books[0].sheet_loaded(name) for name in books[0].sheet_names())
        raise ValueError("HTML failure")
    monkeypatch.setattr(module.upstream.pd, "ExcelFile", opened)
    monkeypatch.setattr(converter._html_converter, "convert_string", fail)
    with pytest.raises(ValueError, match="HTML failure"):
        converter.convert(io.BytesIO(make_book("xls")), StreamInfo(extension=".xls"))
    assert books[0]._resources_released


def test_document_pools_keep_identical_excel_adapter():
    root = Path(__file__).resolve().parents[2]
    assert (root / "backendN/app/excel_converter.py").read_bytes() == (root / "backendZ/app/excel_converter.py").read_bytes()


@optimized
@pytest.mark.parametrize("ext", ["xlsx", "xls"])
def test_normal_route_uses_sheetwise_converter(convert, monkeypatch, ext):
    cls = module.SheetwiseXlsxConverter if ext == "xlsx" else module.SheetwiseXlsConverter
    calls, original = [], cls.convert
    def observed(self, *args, **kwargs):
        calls.append(True)
        return original(self, *args, **kwargs)
    monkeypatch.setattr(cls, "convert", observed)
    response = convert(f"generated.{ext}", make_book(ext))
    assert response.status_code == 200, response.text
    assert calls and "終わり🙂" in response.json()["content"]
