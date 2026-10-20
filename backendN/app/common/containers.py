"""Shared OOXML/EPUB guards, applied before document parsers open a ZIP.

Keep the direct-upload limits and format checks identical in every backend.
The outer project ZIP's size does not bound a compressed document inside it.
"""

from __future__ import annotations

import io
import zipfile

from app.common.errors import ConversionRejected

OOXML_MARKERS = {
    "docx": "word/document.xml",
    "pptx": "ppt/presentation.xml",
    "xlsx": "xl/workbook.xml",
}
CONTAINER_EXTENSIONS = frozenset(OOXML_MARKERS) | {"epub"}
MAX_ZIP_ENTRIES = 10_000
MAX_ZIP_UNCOMPRESSED = 250 * 1024 * 1024


def validate_document_container(data: bytes, ext: str) -> None:
    """Validate supported containers; leave other document formats unchanged."""
    if ext not in CONTAINER_EXTENSIONS:
        return

    def mismatch() -> ConversionRejected:
        return ConversionRejected(400, f"File content does not match the .{ext} extension", "magic_mismatch")

    if not data.startswith(b"PK\x03\x04"):
        raise mismatch()
    try:
        with zipfile.ZipFile(io.BytesIO(data)) as archive:
            infos = archive.infolist()
            if len(infos) > MAX_ZIP_ENTRIES or sum(i.file_size for i in infos) > MAX_ZIP_UNCOMPRESSED:
                raise ConversionRejected(413, "Archive expands beyond the allowed size", "zip_limit")
            names = {i.filename for i in infos}
            if ext == "epub":
                if "mimetype" not in names or archive.read("mimetype").strip() != b"application/epub+zip":
                    raise mismatch()
            elif OOXML_MARKERS[ext] not in names:
                raise mismatch()
    except zipfile.BadZipFile:
        raise mismatch() from None
