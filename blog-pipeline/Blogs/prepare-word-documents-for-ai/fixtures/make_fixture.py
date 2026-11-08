#!/usr/bin/env python3
"""Synthetic M04 Word document (all content invented): refund-policy.docx.

Contains, on purpose:
  - real Heading 1 and Heading 2 styles, and one "fake" heading typed as bold
    18 pt Normal text
  - a numbered list with nested bullets, and a second list whose numbering
    restarts at 1
  - a table with a horizontally merged header cell
  - a tracked change (14 days deleted, 30 days inserted) and a comment
  - an image with alt text, a footer line and a "see Figure 1 above" reference
"""

from __future__ import annotations

import copy
import hashlib
import io
import json
from pathlib import Path

from docx import Document
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Pt
from PIL import Image, ImageDraw

HERE = Path(__file__).resolve().parent


def tracked_replacement(paragraph, before: str, deleted: str, inserted: str, after: str) -> None:
    """Appends: before + <w:del>deleted</w:del> + <w:ins>inserted</w:ins> + after."""
    paragraph.add_run(before)
    p = paragraph._p
    dele = OxmlElement("w:del")
    dele.set(qn("w:id"), "1")
    dele.set(qn("w:author"), "Reviewer A")
    dele.set(qn("w:date"), "2026-11-01T10:00:00Z")
    r = OxmlElement("w:r")
    dt = OxmlElement("w:delText")
    dt.set(qn("xml:space"), "preserve")
    dt.text = deleted
    r.append(dt)
    dele.append(r)
    p.append(dele)
    ins = OxmlElement("w:ins")
    ins.set(qn("w:id"), "2")
    ins.set(qn("w:author"), "Reviewer A")
    ins.set(qn("w:date"), "2026-11-01T10:00:00Z")
    r2 = OxmlElement("w:r")
    t = OxmlElement("w:t")
    t.set(qn("xml:space"), "preserve")
    t.text = inserted
    r2.append(t)
    ins.append(r2)
    p.append(ins)
    paragraph.add_run(after)


def chart_png() -> bytes:
    img = Image.new("RGB", (600, 260), "white")
    d = ImageDraw.Draw(img)
    for i, h in enumerate([120, 170, 90]):
        d.rectangle((80 + i * 160, 220 - h, 180 + i * 160, 220), fill=(180, 83, 9))
    buf = io.BytesIO()
    img.save(buf, "PNG")
    return buf.getvalue()


def main() -> None:
    doc = Document()
    doc.add_heading("Refund Policy (synthetic sample)", level=1)
    doc.add_paragraph("This sample policy exists only to test document conversion.")

    doc.add_heading("Eligibility", level=2)
    p = doc.add_paragraph()
    tracked_replacement(p, "Customers can request a refund within ", "14 days", "30 days", " of delivery.")
    doc.add_comment(p.runs[0], text="Legal has not approved the 30-day change yet.", author="Reviewer A", initials="RA")

    fake = doc.add_paragraph()
    run = fake.add_run("Exceptions")
    run.bold = True
    run.font.size = Pt(18)

    doc.add_paragraph("Final-sale items", style="List Number")
    doc.add_paragraph("Clearance labels", style="List Bullet 2")
    doc.add_paragraph("Bundles opened in store", style="List Bullet 2")
    doc.add_paragraph("Gift cards", style="List Number")
    doc.add_paragraph("Digital downloads", style="List Number")

    doc.add_heading("How to request a refund", level=2)
    steps = ["Find the order number", "Fill in the request form", "Wait for the confirmation email"]
    for s in steps:
        doc.add_paragraph(s, style="List Number 2")

    doc.add_heading("Refund amounts", level=2)
    table = doc.add_table(rows=3, cols=3)
    table.style = "Table Grid"
    hdr = table.rows[0].cells
    hdr[0].text = "Item condition"
    merged = hdr[1].merge(hdr[2])
    merged.text = "Refund"
    row1 = table.rows[1].cells
    row1[0].text = "Unopened"
    row1[1].text = "100%"
    row1[2].text = "within 30 days"
    row2 = table.rows[2].cells
    row2[0].text = "Opened"
    row2[1].text = "80%"
    row2[2].text = "within 14 days"

    doc.add_heading("Refunds by month", level=2)
    doc.add_picture(io.BytesIO(chart_png()))
    pic = doc.inline_shapes[-1]
    pic._inline.docPr.set("descr", "Bar chart: refunds were highest in February.")
    doc.add_paragraph("Figure 1. Refund requests per month.")
    doc.add_paragraph("As Figure 1 above shows, February needs more support staff.")

    footer = doc.sections[0].footer.paragraphs[0]
    footer.text = "CONFIDENTIAL draft v3, not for customers"

    buf = io.BytesIO()
    doc.save(buf)
    data = buf.getvalue()
    (HERE / "refund-policy.docx").write_bytes(data)
    (HERE / "inputs.json").write_text(json.dumps({"label": "Synthetic Word document", "refund-policy.docx": {"bytes": len(data), "sha256": hashlib.sha256(data).hexdigest()}}, indent=2) + "\n")
    print(hashlib.sha256(data).hexdigest())


if __name__ == "__main__":
    main()
