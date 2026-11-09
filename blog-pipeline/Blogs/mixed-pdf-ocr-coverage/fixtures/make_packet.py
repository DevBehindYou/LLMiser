#!/usr/bin/env python3
"""M02-S3 fixture: an eight-page synthetic returns packet that mixes the page
types a real scanned bundle tends to contain. All content invented.

  p1  text page (real text layer)
  p2  scanned page: full-page image, no text layer
  p3  intentionally blank, between a scan and a text page
  p4  text page
  p5  scanned page with a scanner stamp added as real text at the top
  p6  small photo of a receipt (about a fifth of the page), no text layer
  p7  text page that also carries an invisible second copy of its text,
      as some OCR tools leave behind when they process a page twice
  p8  intentionally blank, at the end

Each page's first and last lines are listed in packet-truth.json so they can
be searched for in the output. Deterministic (reportlab invariant mode).

  python make_packet.py  ->  packet.pdf, packet-truth.json
"""

from __future__ import annotations

import hashlib
import io
import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont
from reportlab.lib.pagesizes import letter
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas

HERE = Path(__file__).resolve().parent
SANS = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

P1 = ["Returns packet, April 2026", "Northwind Parts Depot sends this packet for order PO 1105.",
      "It holds a delivery note, inspection notes, a return form,", "a receipt photo and the approval.", "Questions go to the returns desk."]
P2 = ["DELIVERY NOTE DN-0417", "Delivered to: Field Depot 3", "Gasket 1/2 in      12", "Valve, brass        3",
      "Seal kit            1", "Received by: J. Rivera", "End of delivery note"]
P4 = ["Inspection notes", "Two valves showed casting marks.", "One gasket was the wrong size.", "The seal kit was complete.",
      "Inspector: K. Osei, 18 April 2026"]
STAMP = "Scanned 2026-04-18 09:14 by FrontDesk-02"
P5 = ["RETURN AUTHORIZATION RA-2207", "Return 2 valves, brass", "Return 1 gasket, 1/2 in", "Reason: damaged on arrival",
      "Credit to account 0045-1170", "Authorized by: M. Chen"]
P6 = ["PARTS COUNTER", "Receipt 88412", "Shipping label  4.80", "Packing tape    2.15", "TOTAL           6.95"]
P7 = ["Approval", "The return of 2 valves and 1 gasket is approved.", "Credit will post within 10 business days.",
      "Approved by: Returns desk, 19 April 2026"]


def drawn_page(lines: list[str], size=(1700, 2200), top=200) -> Image.Image:
    img = Image.new("L", size, 255)
    d = ImageDraw.Draw(img)
    y = top
    for i, ln in enumerate(lines):
        d.text((150, y), ln, font=ImageFont.truetype(BOLD if i == 0 else SANS, 58 if i == 0 else 44), fill=0)
        y += 110 if i == 0 else 78
    return img


def receipt_photo() -> Image.Image:
    img = Image.new("L", (700, 1000), 235)
    d = ImageDraw.Draw(img)
    d.rectangle((40, 40, 660, 960), fill=252)
    y = 90
    for i, ln in enumerate(P6):
        d.text((80, y), ln, font=ImageFont.truetype(BOLD if i == 0 else "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf", 40 if i == 0 else 34), fill=20)
        y += 90
    return img


def text_page(c: canvas.Canvas, lines: list[str]) -> None:
    c.setFont("Helvetica-Bold", 20)
    c.drawString(72, 700, lines[0])
    c.setFont("Helvetica", 13)
    for i, ln in enumerate(lines[1:]):
        c.drawString(72, 668 - i * 20, ln)


def build() -> bytes:
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=letter, invariant=1)
    W, H = letter
    text_page(c, P1); c.showPage()
    c.drawImage(ImageReader(drawn_page(P2).convert("RGB")), 0, 0, width=W, height=H); c.showPage()
    c.showPage()  # p3 blank
    text_page(c, P4); c.showPage()
    c.drawImage(ImageReader(drawn_page(P5, top=320).convert("RGB")), 0, 0, width=W, height=H)
    c.setFont("Helvetica", 9)
    c.drawString(72, H - 40, STAMP)  # scanner stamp as real text
    c.showPage()
    c.drawImage(ImageReader(receipt_photo().convert("RGB")), 180, 300, width=252, height=360)  # 3.5 x 5 in
    c.showPage()
    text_page(c, P7)
    t = c.beginText(72, 400)  # invisible second copy of the same text
    t.setTextRenderMode(3)
    t.setFont("Helvetica", 13)
    for ln in P7:
        t.textLine(ln)
    c.drawText(t)
    c.showPage()
    c.showPage()  # p8 blank
    c.save()
    return buf.getvalue()


def main() -> None:
    data = build()
    (HERE / "packet.pdf").write_bytes(data)
    truth = {
        "label": "Synthetic. Invented company, people and numbers.",
        "pages": [
            {"page": 1, "type": "text", "first": P1[0], "last": P1[-1]},
            {"page": 2, "type": "scan", "first": P2[0], "last": P2[-1]},
            {"page": 3, "type": "blank"},
            {"page": 4, "type": "text", "first": P4[0], "last": P4[-1]},
            {"page": 5, "type": "scan with text stamp", "stamp": STAMP, "first": P5[0], "last": P5[-1]},
            {"page": 6, "type": "small photo", "first": P6[0], "last": P6[-1], "image_area": "3.5 x 5 in of 8.5 x 11 in"},
            {"page": 7, "type": "text plus invisible copy", "first": P7[0], "last": P7[-1]},
            {"page": 8, "type": "blank"},
        ],
        "file": {"name": "packet.pdf", "bytes": len(data), "sha256": hashlib.sha256(data).hexdigest()},
    }
    (HERE / "packet-truth.json").write_text(json.dumps(truth, indent=2) + "\n")
    print(json.dumps(truth["file"], indent=2))


if __name__ == "__main__":
    main()
