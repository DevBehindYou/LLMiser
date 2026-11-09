#!/usr/bin/env python3
"""M02-S3: the two pages packet.pdf left unread (p5 scan with a text stamp,
p6 small receipt photo), rendered as images with LLMiser's own page renderer
(backendN pdf_tasks.render_page_png, 200 dpi) and converted as images through
backendO OcrConverter, as a user would after exporting those pages.

LOCAL CODE-LEVEL RUN. Requires TESSDATA_PREFIX. Writes out-workaround/.
"""

from __future__ import annotations

import hashlib
import json
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[3]
OUT = HERE / "out-workaround"


def render() -> list[Path]:
    sys.path.insert(0, str(REPO / "backendN"))
    import pypdfium2 as pdfium
    from app import pdf_tasks

    pdf = pdfium.PdfDocument((HERE / "packet.pdf").read_bytes())
    paths = []
    for n in (5, 6):
        p = OUT / f"packet-page-{n}.png"
        p.write_bytes(pdf_tasks.render_page_png(pdf, n))
        paths.append(p)
    pdf.close()
    return paths


def main() -> None:
    OUT.mkdir(exist_ok=True)
    paths = render()
    # OCR in a separate process: backendN and backendO both use the package name "app".
    code = (
        "import sys, json; sys.path.insert(0, sys.argv[1]);"
        "from app.converter import OcrConverter; c = OcrConverter();"
        "d = open(sys.argv[2], 'rb').read(); t, n = c.convert(d, 'png', filename='p.png', title='p');"
        "print(json.dumps({'text': t, 'note': n}))"
    )
    result = {"label": "LOCAL CODE-LEVEL RUN: packet pages 5 and 6 exported as images, then converted as images", "runs": []}
    for p in paths:
        out = subprocess.run([sys.executable, "-c", code, str(REPO / "backendO"), str(p)], capture_output=True, text=True, check=True)
        payload = json.loads(out.stdout)
        (OUT / f"{p.stem}.txt").write_text(payload["text"] + "\n")
        result["runs"].append({"image": p.name, "sha256": hashlib.sha256(p.read_bytes()).hexdigest(),
                               "warning": payload["note"], "output": f"{p.stem}.txt"})
    (OUT / "run.json").write_text(json.dumps(result, indent=2) + "\n")
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
