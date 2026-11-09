#!/usr/bin/env python3
"""M02-S1 fixture: one synthetic page at several orientations through LLMiser's
OCR code (backendO OcrConverter), with its orientation log captured.

Input: the M02 synthetic invoice (../../ocr-checks-before-ai/fixtures/invoice-clean.png).
Variants: 0, 90, 180, 270 degrees (pixels rotated, no EXIF); 3 and 8 degree
skew; and a JPEG stored rotated with EXIF Orientation=6 (as a phone camera
might save it). For each run: whether the orientation step ran (OSD), the
rotation applied, mean word confidence, and a similarity score against the
upright run's text (difflib ratio). LOCAL CODE-LEVEL RUN; tesseract 5.3.4
with tessdata_fast 4.1.0 eng/osd. Requires TESSDATA_PREFIX.

  python rotation_runs.py > rotation-results.json
"""

from __future__ import annotations

import difflib
import hashlib
import io
import json
import logging
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[3]
sys.path.insert(0, str(REPO / "backendO"))

from PIL import Image  # noqa: E402

from app.converter import OcrConverter  # noqa: E402

records: list[str] = []


class Capture(logging.Handler):
    def emit(self, record):
        records.append(record.getMessage())


logging.getLogger("mdify.ocr").addHandler(Capture())
logging.getLogger("mdify.ocr").setLevel(logging.INFO)

src = Image.open(REPO / "blog-pipeline/Blogs/ocr-checks-before-ai/fixtures/invoice-clean.png").convert("L")


def png(img):
    buf = io.BytesIO()
    img.save(buf, "PNG")
    return buf.getvalue(), "png"


def exif_jpeg():
    # Store the pixels rotated 90 degrees counter-clockwise and tag Orientation=6,
    # which tells viewers (and LLMiser) to rotate 270 (i.e. 90 clockwise) to display upright.
    stored = src.rotate(90, expand=True)
    exif = Image.Exif()
    exif[0x0112] = 6
    buf = io.BytesIO()
    stored.convert("RGB").save(buf, "JPEG", quality=92, exif=exif)
    return buf.getvalue(), "jpg"


variants = {
    "upright 0": png(src),
    "rotated 90 cw": png(src.rotate(-90, expand=True, fillcolor=255)),
    "rotated 180": png(src.rotate(180, expand=True, fillcolor=255)),
    "rotated 270 cw": png(src.rotate(-270, expand=True, fillcolor=255)),
    "skew 3": png(src.rotate(-3, expand=True, fillcolor=255)),
    "skew 8": png(src.rotate(-8, expand=True, fillcolor=255)),
    "EXIF orientation 6 (jpg)": exif_jpeg(),
}

conv = OcrConverter()
ready = conv.ready()
out = {"label": "LOCAL CODE-LEVEL RUN of backendO OcrConverter on a synthetic page", "ready": ready, "runs": []}
baseline = None
for name, (data, ext) in variants.items():
    records.clear()
    text, note = conv.convert(data, ext, filename=f"page.{ext}", title="page")
    log = records[-1] if records else ""
    m = re.search(r"osd=(\S+) applied=(\S+) mean_conf=([\d.]+) words=(\d+)", log)
    if baseline is None:
        baseline = text
    out["runs"].append({
        "variant": name,
        "input_sha256": hashlib.sha256(data).hexdigest(),
        "osd": m.group(1) if m else None,
        "applied_rotation": m.group(2) if m else None,
        "mean_conf": float(m.group(3)) if m else None,
        "words": int(m.group(4)) if m else None,
        "warning": note,
        "similarity_to_upright": round(difflib.SequenceMatcher(None, baseline, text).ratio(), 3),
        "has_qty_column": " 12 10.50" in text,
        "order_line": next((ln for ln in text.splitlines() if ln.startswith("Order")), None),
        "first_line": text.splitlines()[0] if text else "",
    })
print(json.dumps(out, indent=2))
