#!/usr/bin/env python3
"""Synthetic M05 deck (all content invented): q3-review.pptx.

Slides:
  1 Title slide
  2 Section slide "Results" (title only)
  3 "Results" again (repeated title): nested bullets + speaker notes with a caveat
  4 Native column chart (Quarterly signups, units: thousands) with axis titles,
    no notes
  5 Image-only slide: a picture of a chart with alt text, no text boxes
  6 Table slide with a units footnote in a separate text box
  7 Two text boxes placed so the right one is added before the left one
  8 Hidden slide with superseded numbers
Saved twice: q3-review.pptx (python-pptx), and the same file is the fixture.
"""

from __future__ import annotations

import hashlib
import io
import json
from pathlib import Path

from PIL import Image, ImageDraw
from pptx import Presentation
from pptx.chart.data import CategoryChartData
from pptx.enum.chart import XL_CHART_TYPE
from pptx.util import Inches, Pt

HERE = Path(__file__).resolve().parent


def bar_png() -> bytes:
    img = Image.new("RGB", (640, 360), "white")
    d = ImageDraw.Draw(img)
    for i, h in enumerate([90, 140, 220, 180]):
        d.rectangle((70 + i * 140, 320 - h, 160 + i * 140, 320), fill=(109, 95, 208))
    d.text((70, 20), "Churn by region (picture only)", fill="black")
    buf = io.BytesIO()
    img.save(buf, "PNG")
    return buf.getvalue()


def main() -> None:
    prs = Presentation()
    title_layout, title_only, title_content, blank = prs.slide_layouts[0], prs.slide_layouts[5], prs.slide_layouts[1], prs.slide_layouts[6]

    s1 = prs.slides.add_slide(title_layout)
    s1.shapes.title.text = "Q3 Review (synthetic sample)"
    s1.placeholders[1].text = "Field Services team"

    s2 = prs.slides.add_slide(title_only)
    s2.shapes.title.text = "Results"

    s3 = prs.slides.add_slide(title_content)
    s3.shapes.title.text = "Results"
    body = s3.placeholders[1].text_frame
    body.text = "Signups grew in every month"
    for text, level in [("Strongest in September", 1), ("Driven by the referral pilot", 2), ("Support tickets fell 12%", 0)]:
        p = body.add_paragraph()
        p.text = text
        p.level = level
    s3.notes_slide.notes_text_frame.text = "Caveat: September includes 400 test accounts. Exclude them before quoting growth."

    s4 = prs.slides.add_slide(title_only)
    s4.shapes.title.text = "Quarterly signups"
    data = CategoryChartData()
    data.categories = ["July", "August", "September"]
    data.add_series("Signups (thousands)", (4.2, 5.1, 7.8))
    gframe = s4.shapes.add_chart(XL_CHART_TYPE.COLUMN_CLUSTERED, Inches(1), Inches(1.6), Inches(8), Inches(4.8), data)
    chart = gframe.chart
    chart.has_title = True
    chart.chart_title.text_frame.text = "Signups per month (thousands)"
    chart.category_axis.has_title = True
    chart.category_axis.axis_title.text_frame.text = "Month"
    chart.value_axis.has_title = True
    chart.value_axis.axis_title.text_frame.text = "Signups (thousands)"

    s5 = prs.slides.add_slide(blank)
    pic = s5.shapes.add_picture(io.BytesIO(bar_png()), Inches(1), Inches(1), width=Inches(8))
    pic._element.nvPicPr.cNvPr.set("descr", "Bar chart of churn by region, highest in the West")

    s6 = prs.slides.add_slide(title_only)
    s6.shapes.title.text = "Support costs"
    tbl = s6.shapes.add_table(3, 3, Inches(1), Inches(1.8), Inches(8), Inches(1.5)).table
    for r, row in enumerate([["Region", "Tickets", "Cost"], ["North", "1,240", "18.6"], ["South", "980", "14.7"]]):
        for c, val in enumerate(row):
            tbl.cell(r, c).text = val
    note = s6.shapes.add_textbox(Inches(1), Inches(3.6), Inches(8), Inches(0.5)).text_frame
    note.text = "Cost in USD thousands."

    s7 = prs.slides.add_slide(title_only)
    s7.shapes.title.text = "Before and after"
    right = s7.shapes.add_textbox(Inches(5.2), Inches(2), Inches(4), Inches(1)).text_frame
    right.text = "After: 2-day response"
    left = s7.shapes.add_textbox(Inches(0.8), Inches(2), Inches(4), Inches(1)).text_frame
    left.text = "Before: 5-day response"

    s8 = prs.slides.add_slide(title_content)
    s8.shapes.title.text = "Draft numbers (old)"
    s8.placeholders[1].text_frame.text = "Signups 3.1k in September"
    s8._element.set("show", "0")

    for slide in prs.slides:
        for shape in slide.shapes:
            if shape.has_text_frame:
                for p in shape.text_frame.paragraphs:
                    for r in p.runs:
                        r.font.size = r.font.size or Pt(20)
    buf = io.BytesIO()
    prs.save(buf)
    data_bytes = buf.getvalue()
    (HERE / "q3-review.pptx").write_bytes(data_bytes)
    (HERE / "inputs.json").write_text(json.dumps({"label": "Synthetic deck", "q3-review.pptx": {"bytes": len(data_bytes), "sha256": hashlib.sha256(data_bytes).hexdigest()}}, indent=2) + "\n")
    print(hashlib.sha256(data_bytes).hexdigest())


if __name__ == "__main__":
    main()
