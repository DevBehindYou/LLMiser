#!/usr/bin/env python3
"""Synthetic M10 archive (all content invented): docs-bundle.zip.

Entries chosen to exercise every status the index and manifest report:
converted text, code and a Word document; two images (one with text, one
blank) that the Storage path sends to text recognition; README.md and
readme.md (a case-insensitive duplicate); src/config.txt and docs/config.txt
with different content; a nested ZIP that holds a second nested ZIP; a
symbolic link entry; an unsafe ../ path; a small binary; a dependency folder;
and a .env file.
"""

from __future__ import annotations

import hashlib
import io
import json
import shutil
import zipfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).resolve().parent
STAMP = (2026, 11, 8, 12, 0, 0)
DOCX = HERE.parent.parent / "prepare-word-documents-for-ai" / "fixtures" / "refund-policy.docx"


def png_text(lines):
    img = Image.new("RGB", (900, 70 + 50 * len(lines)), "white")
    d = ImageDraw.Draw(img)
    font = ImageFont.truetype("DejaVuSans.ttf", 32)
    for i, t in enumerate(lines):
        d.text((30, 30 + i * 50), t, fill="black", font=font)
    buf = io.BytesIO()
    img.save(buf, "PNG")
    return buf.getvalue()


def blank_png():
    buf = io.BytesIO()
    Image.new("RGB", (600, 400), (210, 220, 230)).save(buf, "PNG")
    return buf.getvalue()


def zbytes(entries, symlinks=()):
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        for name in entries:
            info = zipfile.ZipInfo(name, STAMP)
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = (0o120777 if name in symlinks else 0o644) << 16
            data = entries[name]
            zf.writestr(info, data.encode() if isinstance(data, str) else data)
    return buf.getvalue()


def main() -> None:
    deeper = zbytes({"deep.txt": "Two levels down.\n"})
    old = zbytes({"notes.txt": "September notes: the deploy window moved to Friday.\n", "deeper.zip": deeper})
    entries = {
        "docs-bundle/README.md": "# Docs bundle\n\nStart with docs/config.txt.\n",
        "docs-bundle/readme.md": "# old readme\n",
        "docs-bundle/src/config.txt": "retries = 3\ntimeout_seconds = 30\n",
        "docs-bundle/docs/config.txt": "Set retries to 5 for the batch importer.\n",
        "docs-bundle/src/app.py": "def main():\n    return 'ok'\n",
        "docs-bundle/report.docx": DOCX.read_bytes(),
        "docs-bundle/images/diagram.png": png_text(["Import flow: upload, convert, review"]),
        "docs-bundle/images/blank-photo.png": blank_png(),
        "docs-bundle/archive/old.zip": old,
        "docs-bundle/tools/run.sh": "../../etc/passwd",
        "../escape.txt": "outside the archive root\n",
        "docs-bundle/data/sample.bin": b"\x00\x01\x02FAKEBINARY\x00" * 20,
        "docs-bundle/node_modules/pkg/index.js": "module.exports = 1;\n",
        "docs-bundle/.env": "API_TOKEN=FAKE-NOT-REAL\n",
    }
    data = zbytes(entries, symlinks={"docs-bundle/tools/run.sh"})
    (HERE / "docs-bundle.zip").write_bytes(data)
    (HERE / "inputs.json").write_text(json.dumps({"label": "Synthetic archive; FAKE token; invented text", "docs-bundle.zip": {"bytes": len(data), "sha256": hashlib.sha256(data).hexdigest(), "entries": len(entries)}}, indent=2) + "\n")
    print(hashlib.sha256(data).hexdigest(), len(entries))


if __name__ == "__main__":
    main()
