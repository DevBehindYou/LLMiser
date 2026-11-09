#!/usr/bin/env python3
"""M02-S2 fixture: a synthetic parts receipt built to test number and
identifier fidelity in recognized text. All content invented.

The page is drawn at 200 dpi on a US Letter canvas (1700 x 2200 px), the
resolution LLMiser renders scanned PDF pages at. It carries the field types
that most often matter after recognition: leading zeros, identifiers that mix
the letter O with zero, decimals, thousands separators, a decimal comma, a
minus sign, percentages, dates in three formats and a time.

Outputs (deterministic):
  receipt-200.png        clean page, 200 dpi
  receipt-150.jpg        75% scale, JPEG quality 70 (a common office scan)
  receipt-fax.png        50% scale, black and white only (fax-like)
  receipt-photo.jpg      60% scale, slight blur, uneven light, JPEG quality 60
  receipt-truth.json     the exact expected string for every field
"""

from __future__ import annotations

import hashlib
import io
import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = Path(__file__).resolve().parent
SANS = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
W, H = 1700, 2200

# field id -> (label as printed, exact value as printed, kind)
HEADER = [
    ("receipt_no", "Receipt no:", "RCT-000418", "leading zeros"),
    ("account", "Account:", "0045-1170", "leading zero"),
    ("order", "Order:", "PO 10O5-B", "letter O inside digits"),
    ("reference", "Reference:", "O0-2207", "letter O then zero"),
    ("issued", "Issued:", "03/04/2026", "slashed date"),
    ("due", "Due:", "2026-04-17", "ISO date"),
    ("delivered", "Delivered:", "17.04.2026 09:30", "dotted date and time"),
]
ROWS = [
    ("Gasket 1/2 in", "12", "10.50", "126.00"),
    ("Valve, brass", "3", "1,250.00", "3,750.00"),
    ("Seal kit", "1", "0.75", "0.75"),
    ("Return credit", "1", "-12.40", "-12.40"),
]
TOTALS = [
    ("subtotal", "Subtotal", "3,864.35", "thousands separator"),
    ("tax", "Tax 7.5%", "289.83", "decimal"),
    ("total", "Total", "4,154.18", "thousands separator"),
    ("eur", "Paid in EUR", "1.250,00", "decimal comma"),
]
SMALL = ("terms", "Terms: net 30. Late fee 1.5% per month after 2026-05-17.", "small print, percent")


def f(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size)


def page() -> Image.Image:
    img = Image.new("L", (W, H), 255)
    d = ImageDraw.Draw(img)
    d.text((140, 140), "NORTHWIND PARTS DEPOT", font=f(BOLD, 60), fill=0)
    d.text((140, 225), "Synthetic receipt for OCR testing", font=f(SANS, 34), fill=60)
    y = 360
    for _, label, value, _ in HEADER:
        d.text((140, y), label, font=f(SANS, 42), fill=0)
        d.text((560, y), value, font=f(SANS, 42), fill=0)
        y += 66
    y += 50
    cols = [140, 820, 1020, 1320]
    for x, head in zip(cols, ["Item", "Qty", "Unit price", "Amount"]):
        d.text((x, y), head, font=f(BOLD, 40), fill=0)
    d.line((140, y + 58, 1560, y + 58), fill=0, width=3)
    y += 84
    for row in ROWS:
        for x, cell in zip(cols, row):
            d.text((x, y), cell, font=f(SANS, 40), fill=0)
        y += 68
    d.line((140, y + 4, 1560, y + 4), fill=0, width=2)
    y += 36
    for _, label, value, _ in TOTALS:
        bold = label == "Total"
        d.text((960, y), label, font=f(BOLD if bold else SANS, 40), fill=0)
        d.text((1320, y), value, font=f(BOLD if bold else SANS, 40), fill=0)
        y += 62
    d.text((140, 2020), SMALL[1], font=f(SANS, 22), fill=40)
    return img


def save_png(img: Image.Image) -> bytes:
    buf = io.BytesIO()
    img.save(buf, "PNG", optimize=False)
    return buf.getvalue()


def save_jpeg(img: Image.Image, q: int) -> bytes:
    buf = io.BytesIO()
    img.convert("RGB").save(buf, "JPEG", quality=q, subsampling=2)
    return buf.getvalue()


def office_150(img: Image.Image) -> bytes:
    return save_jpeg(img.resize((int(W * 0.75), int(H * 0.75)), Image.Resampling.BILINEAR), 70)


def fax(img: Image.Image) -> bytes:
    small = img.resize((W // 2, H // 2), Image.Resampling.BILINEAR)
    return save_png(small.point(lambda v: 255 if v > 150 else 0).convert("1"))


def photo(img: Image.Image) -> bytes:
    small = img.resize((int(W * 0.6), int(H * 0.6)), Image.Resampling.BILINEAR).filter(ImageFilter.GaussianBlur(0.9))
    # Uneven light: darken toward the lower right, as under a desk lamp.
    shade = Image.linear_gradient("L").resize(small.size).point(lambda v: int(v * 0.35))
    lit = Image.eval(small, lambda v: v)
    lit = Image.composite(Image.new("L", small.size, 0), lit, shade)
    return save_jpeg(lit, 60)


def truth() -> dict:
    fields = [{"id": i, "label": lab, "value": val, "kind": kind} for i, lab, val, kind in HEADER]
    for n, (item, qty, unit, amount) in enumerate(ROWS, 1):
        fields.append({"id": f"row{n}_qty", "label": item, "value": qty, "kind": "quantity"})
        fields.append({"id": f"row{n}_unit", "label": item, "value": unit, "kind": "unit price"})
        fields.append({"id": f"row{n}_amount", "label": item, "value": amount, "kind": "amount"})
    fields += [{"id": i, "label": lab, "value": val, "kind": kind} for i, lab, val, kind in TOTALS]
    fields.append({"id": SMALL[0], "label": "Terms", "value": SMALL[1], "kind": SMALL[2]})
    return {"label": "Synthetic. Invented company, accounts and amounts.", "fields": fields}


def main() -> None:
    img = page()
    files = {
        "receipt-200.png": save_png(img),
        "receipt-150.jpg": office_150(img),
        "receipt-fax.png": fax(img),
        "receipt-photo.jpg": photo(img),
    }
    record = {}
    for name, data in files.items():
        (HERE / name).write_bytes(data)
        record[name] = {"bytes": len(data), "sha256": hashlib.sha256(data).hexdigest()}
    out = truth()
    out["files"] = record
    (HERE / "receipt-truth.json").write_text(json.dumps(out, indent=2) + "\n")
    print(json.dumps(record, indent=2))


if __name__ == "__main__":
    main()
