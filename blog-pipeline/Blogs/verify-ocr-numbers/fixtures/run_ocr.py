#!/usr/bin/env python3
"""M02-S2: run each receipt variant through LLMiser's OCR code (backendO
OcrConverter) and save the exact recognized text plus the orientation log.

LOCAL CODE-LEVEL RUN; tesseract 5.3.4 with tessdata_fast 4.1.0 eng/osd.
Requires TESSDATA_PREFIX.

  python run_ocr.py   ->  out/{variant}.txt and out/runs.json
"""

from __future__ import annotations

import datetime
import hashlib
import json
import logging
import re
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[3]
sys.path.insert(0, str(REPO / "backendO"))

from app.converter import OcrConverter  # noqa: E402

records: list[str] = []


class Capture(logging.Handler):
    def emit(self, record):
        records.append(record.getMessage())


logging.getLogger("mdify.ocr").addHandler(Capture())
logging.getLogger("mdify.ocr").setLevel(logging.INFO)

VARIANTS = ["receipt-200.png", "receipt-150.jpg", "receipt-fax.png", "receipt-photo.jpg"]


def main() -> None:
    out_dir = HERE / "out"
    out_dir.mkdir(exist_ok=True)
    conv = OcrConverter()
    rev = subprocess.run(["git", "-C", str(REPO), "rev-parse", "--short", "HEAD"], capture_output=True, text=True).stdout.strip()
    result = {
        "label": "LOCAL CODE-LEVEL RUN of backendO OcrConverter on synthetic receipts",
        "date": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%MZ"),
        "revision": rev,
        "ready": conv.ready(),
        "runs": [],
    }
    for name in VARIANTS:
        data = (HERE / name).read_bytes()
        ext = name.rsplit(".", 1)[1]
        records.clear()
        text, note = conv.convert(data, ext, filename=name, title=name)
        stem = name.rsplit(".", 1)[0]
        (out_dir / f"{stem}.txt").write_text(text + "\n")
        log = records[-1] if records else ""
        m = re.search(r"osd=(\S+) applied=(\S+) mean_conf=([\d.]+) words=(\d+)", log)
        result["runs"].append({
            "variant": name,
            "input_sha256": hashlib.sha256(data).hexdigest(),
            "output": f"out/{stem}.txt",
            "output_sha256": hashlib.sha256((text + "\n").encode()).hexdigest(),
            "osd": m.group(1) if m else None,
            "applied_rotation": m.group(2) if m else None,
            "mean_conf": float(m.group(3)) if m else None,
            "words": int(m.group(4)) if m else None,
            "warning": note,
        })
    (out_dir / "runs.json").write_text(json.dumps(result, indent=2) + "\n")
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
