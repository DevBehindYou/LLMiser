"""Row-at-a-time CSV formatting for verified MarkItDown versions.

Keep decoding, cell escaping and table semantics identical to upstream.
Two CSV passes determine width/blank boundaries without retaining all rows.
The input text and complete output still occupy memory; this is not a
streaming HTTP/Storage contract or a bound on total parser memory.
"""

from __future__ import annotations

import csv
import io
from importlib.metadata import version

from markitdown import DocumentConverter, DocumentConverterResult

VERIFIED_VERSIONS = frozenset({"0.1.8", "0.1.9"})


class RowStreamingCsvConverter(DocumentConverter):
    def __init__(self):
        # The private escape helper is deliberately version-gated below. Reuse
        # it so pipes, backslash runs and embedded newlines remain identical.
        from markitdown.converters import _csv_converter as upstream

        self._upstream = upstream.CsvConverter()
        self._escape = upstream._escape_table_cell
        self._detect = upstream.from_bytes

    def accepts(self, file_stream, stream_info, **kwargs):
        return self._upstream.accepts(file_stream, stream_info, **kwargs)

    def convert(self, file_stream, stream_info, **kwargs):
        if stream_info.charset:
            content = file_stream.read().decode(stream_info.charset)
        else:
            data = file_stream.read()
            detected = self._detect(data).best()
            content = str(detected) if detected is not None else data.decode("utf-8", errors="ignore")
            del data, detected

        # Upstream strips BOMs and preserves embedded CR/LF until cell escaping.
        source = io.StringIO(content.lstrip("\ufeff"), newline="")
        del content
        with source, io.StringIO() as output:
            width = 0
            header = first_data = last_data = None
            for number, row in enumerate(csv.reader(source)):
                if not row:
                    continue
                width = max(width, len(row))
                if header is None:
                    header = number
                elif first_data is None:
                    first_data = number
                last_data = number
            if header is None:
                return DocumentConverterResult(markdown="")

            source.seek(0)
            for number, row in enumerate(csv.reader(source)):
                if number < header:
                    continue
                if number > last_data:
                    break
                # Leading/trailing empty rows and the empty run immediately
                # after the header are trimmed. Interior empty rows survive.
                if number != header and (first_data is None or number < first_data):
                    continue
                row.extend([""] * (width - len(row)))
                if number != header:
                    output.write("\n")
                output.write("| " + " | ".join(self._escape(cell) for cell in row) + " |")
                if number == header:
                    output.write("\n| " + " | ".join(["---"] * width) + " |")
            return DocumentConverterResult(markdown=output.getvalue())


def register_csv_converter(engine) -> bool:
    """Unknown/older upstream versions keep their own converter unchanged."""
    if version("markitdown") not in VERIFIED_VERSIONS:
        return False
    try:
        converter = RowStreamingCsvConverter()
    except (ImportError, AttributeError):
        return False
    # MarkItDown's public registration API tries the latest converter first
    # at the default specific-format priority. Detection/fallback stay intact.
    engine.register_converter(converter)
    return True
