"""Same pandas/HTML Excel conversion, retaining one DataFrame at a time."""
from __future__ import annotations

from contextlib import closing
from importlib.metadata import version
import io

from markitdown import DocumentConverterResult
from markitdown.converters import _xlsx_converter as upstream

VERIFIED_VERSIONS = frozenset({"0.1.8", "0.1.9"})


class _SheetViewRepair(TypeError):
    """Only pandas load/parse failures may trigger the upstream XLSX repair."""


def _read(call, *args, repair=False, **kwargs):
    try:
        return call(*args, **kwargs)
    except TypeError as error:
        if repair and "showZeroes" in str(error):
            raise _SheetViewRepair(str(error)) from error
        raise


def _convert_workbook(file_stream, engine, html_converter, options, *, repair=False):
    # xlrd otherwise keeps every sheet's raw cells as well as pandas frames.
    # Older BIFF versions may disable on-demand loading; retain their fallback.
    engine_options = {"engine_kwargs": {"on_demand": True}} if engine == "xlrd" else {}
    workbook = _read(upstream.pd.ExcelFile, file_stream, engine=engine, repair=repair, **engine_options)
    with workbook, io.StringIO() as output:
        for name in workbook.sheet_names:
            frame = _read(workbook.parse, sheet_name=name, repair=repair)
            if engine == "xlrd" and workbook.book.on_demand:
                workbook.book.unload_sheet(name)
            html = frame.to_html(index=False)
            table = html_converter.convert_string(html, **options).markdown.strip()
            output.write(f"## {name}\n")
            output.write(table)
            output.write("\n\n")
            # Do not retain the previous sheet while parsing/rendering the next.
            del frame, html, table
        return DocumentConverterResult(markdown=output.getvalue().strip())


class SheetwiseXlsxConverter(upstream.XlsxConverter):
    def convert(self, file_stream, stream_info, **kwargs):
        # Preserve upstream missing-dependency errors and custom image hooks.
        if (upstream._xlsx_dependency_exc_info is not None
                or type(self)._image_to_html is not upstream.XlsxConverter._image_to_html):
            return super().convert(file_stream, stream_info, **kwargs)
        start = file_stream.tell()
        try:
            return _convert_workbook(file_stream, "openpyxl", self._html_converter, kwargs, repair=True)
        except _SheetViewRepair:
            # Discard the partial text before retrying the entire repaired book.
            with closing(upstream._repair_sheetview_show_zeroes(file_stream, start)) as repaired:
                return _convert_workbook(repaired, "openpyxl", self._html_converter, kwargs)


class SheetwiseXlsConverter(upstream.XlsConverter):
    def convert(self, file_stream, stream_info, **kwargs):
        if upstream._xls_dependency_exc_info is not None:
            return super().convert(file_stream, stream_info, **kwargs)
        return _convert_workbook(file_stream, "xlrd", self._html_converter, kwargs)


def register_excel_converters(engine) -> bool:
    """Unknown versions retain their built-in converters, including image hooks."""
    if version("markitdown") not in VERIFIED_VERSIONS:
        return False
    if (not callable(getattr(upstream, "_repair_sheetview_show_zeroes", None))
            or not hasattr(upstream.XlsxConverter, "_image_to_html")):
        return False
    engine.register_converter(SheetwiseXlsxConverter())
    engine.register_converter(SheetwiseXlsConverter())
    return True
