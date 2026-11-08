#!/usr/bin/env python3
"""Synthetic OCR fixtures for the M02 cluster (all content invented).

Pages are drawn at 200 dpi on a US Letter canvas (1700 x 2200 px), the same
resolution LLMiser renders scanned PDF pages at. No real document, customer
or company is depicted.

  invoice-clean.png       upright invoice: leading zeros, decimals, a date in
                          two formats, identifiers mixing the letter O and
                          zero, a four-column table and small print
  invoice-rot90.png       the same page turned 90 degrees clockwise, no EXIF
  invoice-degraded.png    the same page at 45% scale, blurred, with noise
  two-column.png          numbered sentences in two columns
  mixed.pdf               page 1 native text, page 2 the clean invoice as an
                          image only, page 3 intentionally blank
  truth.json              exact expected strings for every check
"""

from __future__ import annotations

import io
import json
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = Path(__file__).resolve().parent
SANS = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
SERIF = "/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf"
W, H = 1700, 2200

TRUTH = {
    "invoice_number": "INV-00123",
    "customer_id": "C0O1-7781",
    "po_number": "PO 10O5-B",
    "date_slash": "03/04/2026",
    "date_iso": "2026-04-17",
    "rows": [
        ["Gasket 1/2 in", "12", "10.50", "126.00"],
        ["Valve, brass", "3", "1,250.00", "3,750.00"],
        ["Seal kit", "1", "0.75", "0.75"],
    ],
    "subtotal": "3,876.75",
    "tax": "290.76",
    "total": "4,167.51",
    "small_print": "Terms: net 30. A late fee of 1.5% per month applies after 2026-05-17.",
}


def font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size)


def invoice() -> Image.Image:
    img = Image.new("L", (W, H), 255)
    d = ImageDraw.Draw(img)
    d.text((140, 140), "ACME FIELD SUPPLY", font=font(BOLD, 64), fill=0)
    d.text((140, 230), "Synthetic sample for OCR testing", font=font(SANS, 34), fill=60)
    d.text((1180, 150), "INVOICE", font=font(BOLD, 72), fill=0)
    y = 380
    for label, value in [("Invoice no:", TRUTH["invoice_number"]), ("Customer ID:", TRUTH["customer_id"]),
                         ("Order:", TRUTH["po_number"]), ("Issued:", TRUTH["date_slash"]), ("Due:", TRUTH["date_iso"])]:
        d.text((140, y), label, font=font(SANS, 44), fill=0)
        d.text((520, y), value, font=font(SANS, 44), fill=0)
        y += 70
    y += 60
    cols = [140, 820, 1020, 1320]
    for x, head in zip(cols, ["Item", "Qty", "Unit price", "Amount"]):
        d.text((x, y), head, font=font(BOLD, 42), fill=0)
    d.line((140, y + 62, 1560, y + 62), fill=0, width=3)
    y += 90
    for row in TRUTH["rows"]:
        for x, cell in zip(cols, row):
            d.text((x, y), cell, font=font(SANS, 42), fill=0)
        y += 72
    d.line((140, y + 4, 1560, y + 4), fill=0, width=2)
    y += 40
    for label, value in [("Subtotal", TRUTH["subtotal"]), ("Tax 7.5%", TRUTH["tax"]), ("Total", TRUTH["total"])]:
        d.text((1020, y), label, font=font(BOLD if label == "Total" else SANS, 42), fill=0)
        d.text((1320, y), value, font=font(BOLD if label == "Total" else SANS, 42), fill=0)
        y += 66
    # Small print: 20 px at 200 dpi is about 7 pt.
    d.text((140, 2020), TRUTH["small_print"], font=font(SANS, 20), fill=40)
    return img


def two_column() -> Image.Image:
    img = Image.new("L", (W, H), 255)
    d = ImageDraw.Draw(img)
    d.text((140, 140), "Field Notes, Issue 4", font=font(BOLD, 60), fill=0)
    left = ["L1. Pumps were checked on Monday.", "L2. Two seals showed wear.", "L3. Spares were ordered.",
            "L4. The north site stays open.", "L5. Next check is in May."]
    right = ["R1. Training starts on 6 April.", "R2. Bring safety boots.", "R3. Lunch is provided.",
             "R4. Parking is at gate B.", "R5. Questions go to the desk."]
    for i, (a, b) in enumerate(zip(left, right)):
        d.text((140, 320 + i * 90), a, font=font(SERIF, 44), fill=0)
        d.text((900, 320 + i * 90), b, font=font(SERIF, 44), fill=0)
    d.line((860, 300, 860, 780), fill=120, width=2)
    return img


def png(img: Image.Image) -> bytes:
    buf = io.BytesIO()
    img.save(buf, "PNG", optimize=False)
    return buf.getvalue()


def degraded(img: Image.Image) -> Image.Image:
    small = img.resize((int(W * 0.45), int(H * 0.45)), Image.Resampling.BILINEAR).filter(ImageFilter.GaussianBlur(1.1))
    rng = random.Random(202)
    px = small.load()
    for _ in range(9000):
        x, y = rng.randrange(small.width), rng.randrange(small.height)
        px[x, y] = max(0, min(255, px[x, y] + rng.choice((-90, 90))))
    return small


def mixed_pdf(scan: Image.Image) -> bytes:
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.utils import ImageReader
    from reportlab.pdfgen import canvas

    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=letter, invariant=1)
    c.setFont("Helvetica-Bold", 20)
    c.drawString(72, 720, "Maintenance summary (page 1, native text)")
    c.setFont("Helvetica", 12)
    for i, line in enumerate(["This page has a real text layer.", "Invoice INV-00123 is attached as a scan on page 2.",
                              "Page 3 is intentionally blank."]):
        c.drawString(72, 690 - i * 18, line)
    c.showPage()
    c.drawImage(ImageReader(scan.convert("RGB")), 0, 0, width=letter[0], height=letter[1])
    c.showPage()
    c.showPage()  # blank page 3
    c.save()
    return buf.getvalue()


def main() -> None:
    clean = invoice()
    files = {
        "invoice-clean.png": png(clean),
        "invoice-rot90.png": png(clean.rotate(-90, expand=True, fillcolor=255)),
        "invoice-degraded.png": png(degraded(clean)),
        "two-column.png": png(two_column()),
        "mixed.pdf": mixed_pdf(clean),
    }
    import hashlib

    record = {}
    for name, data in files.items():
        (HERE / name).write_bytes(data)
        record[name] = {"bytes": len(data), "sha256": hashlib.sha256(data).hexdigest()}
    (HERE / "truth.json").write_text(json.dumps({"label": "Synthetic. Invented company, people and numbers.", "truth": TRUTH, "files": record}, indent=2) + "\n")
    print(json.dumps(record, indent=2))


if __name__ == "__main__":
    main()
