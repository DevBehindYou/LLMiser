"""The direct document route enforces container bounds before parsing."""

import io
import zipfile

import pytest

from app.common import containers
from app.common.errors import ConversionRejected
from app.converter import NormalConverter


def packed(entries):
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as archive:
        for name, body in entries.items():
            archive.writestr(name, body)
    return buf.getvalue()


@pytest.mark.parametrize("ext,marker", [*containers.OOXML_MARKERS.items(), ("epub", "mimetype")])
def test_direct_container_marker_is_required(ext, marker):
    converter = NormalConverter.__new__(NormalConverter)
    for data in (b"not a zip", b"PK\x03\x04broken", packed({"other.xml": "x"})):
        with pytest.raises(ConversionRejected) as error:
            converter.validate(data, ext)
        assert error.value.status_code == 400
        assert error.value.code == "magic_mismatch"
    body = b"application/epub+zip" if ext == "epub" else b"<document/>"
    converter.validate(packed({marker: body}), ext)


def test_wrong_epub_mimetype_rejected():
    with pytest.raises(ConversionRejected, match="does not match"):
        NormalConverter.__new__(NormalConverter).validate(packed({"mimetype": "application/zip"}), "epub")


@pytest.mark.parametrize("limit", ["entries", "bytes"])
def test_direct_route_checks_container_bounds_before_markitdown(convert, monkeypatch, limit):
    data = packed({"word/document.xml": b"x" * 1000, "extra.xml": b"y"})
    monkeypatch.setattr(containers, "MAX_ZIP_ENTRIES" if limit == "entries" else "MAX_ZIP_UNCOMPRESSED", 1)
    response = convert("large.docx", data)
    assert response.status_code == 413
    assert response.json()["detail"] == "Archive expands beyond the allowed size"


def test_high_compression_still_obeys_uncompressed_limit_without_new_ratio_policy(monkeypatch):
    # Repetitive XML is legitimate; preserve the direct route's size-based rule.
    body = b"x" * 100_000
    data = packed({"word/document.xml": body})
    assert len(body) > 100 * len(data)
    monkeypatch.setattr(containers, "MAX_ZIP_ENTRIES", 1)
    monkeypatch.setattr(containers, "MAX_ZIP_UNCOMPRESSED", len(body))
    converter = NormalConverter.__new__(NormalConverter)
    converter.validate(data, "docx")  # Both exact limits are inclusive.
    monkeypatch.setattr(containers, "MAX_ZIP_UNCOMPRESSED", len(body) - 1)
    with pytest.raises(ConversionRejected) as error:
        converter.validate(data, "docx")
    assert error.value.code == "zip_limit"


def test_oversized_declared_size_is_refused_before_member_read(monkeypatch):
    data = bytearray(packed({"mimetype": "application/epub+zip"}))
    central = data.index(b"PK\x01\x02")
    data[central + 24:central + 28] = (containers.MAX_ZIP_UNCOMPRESSED + 1).to_bytes(4, "little")
    monkeypatch.setattr(zipfile.ZipFile, "read", lambda *a, **k: pytest.fail("must reject before decompression"))
    with pytest.raises(ConversionRejected) as error:
        NormalConverter.__new__(NormalConverter).validate(bytes(data), "epub")
    assert error.value.code == "zip_limit"
