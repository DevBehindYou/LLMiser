#!/usr/bin/env python3
"""M05-S1 fixture: a synthetic pricing update deck whose most important
caveat lives in the speaker notes. All content invented.

pricing-update.pptx
  1 "Pricing Update (synthetic sample)"   title slide, no notes
  2 "New plan prices"                      bullets; notes with three paragraphs,
                                           the last two typed as bullet points
  3 "Customer impact"                      bullets, no notes at all
  4 "Rollout"                              bullets; notes pane opened but only
                                           spaces typed

pricing-update-reviewed.pptx
  the caveat that matters moved onto slide 2 as its own bullet, the internal
  reminder removed from the notes, slide 3 given a one-line note

Also exported with LibreOffice headless to pricing-update.pdf (default
settings: slides only, the PDF people often share instead of the deck) and
to pricing-update-notes-pages.pdf (ExportOnlyNotesPages: one notes page per
slide, like printing Notes Pages).

  python make_deck.py
"""

from __future__ import annotations

import hashlib
import json
import shutil
import subprocess
from pathlib import Path

from pptx import Presentation

HERE = Path(__file__).resolve().parent

NOTES_2 = [
    "New prices take effect on 1 March.",
    "Existing customers keep their current price until renewal.",
    "Do not quote Team pricing to schools yet. Education terms are still being negotiated.",
]


def bullets(slide, lines):
    body = slide.placeholders[1].text_frame
    body.text = lines[0]
    for ln in lines[1:]:
        body.add_paragraph().text = ln


def build(path: Path, reviewed: bool) -> None:
    prs = Presentation()
    s1 = prs.slides.add_slide(prs.slide_layouts[0])
    s1.shapes.title.text = "Pricing Update (synthetic sample)"
    s1.placeholders[1].text = "Sales team briefing"

    s2 = prs.slides.add_slide(prs.slide_layouts[1])
    s2.shapes.title.text = "New plan prices"
    lines = ["Starter: $12 per user per month", "Team: $30 per user per month"]
    if reviewed:
        lines += ["Starts 1 March. Existing customers keep their price until renewal.",
                  "Team pricing for schools is not final yet."]
    bullets(s2, lines)
    tf = s2.notes_slide.notes_text_frame
    if reviewed:
        tf.text = "Education terms are being negotiated. Check before quoting schools."
    else:
        tf.text = NOTES_2[0]
        for ln in NOTES_2[1:]:
            p = tf.add_paragraph()
            p.text = ln
            p.level = 1  # typed as an indented bullet in the notes pane

    s3 = prs.slides.add_slide(prs.slide_layouts[1])
    s3.shapes.title.text = "Customer impact"
    bullets(s3, ["About 60% of accounts pay less", "Team accounts above 50 users pay more"])
    if reviewed:
        s3.notes_slide.notes_text_frame.text = "Percentages from the synthetic account sample, February."

    s4 = prs.slides.add_slide(prs.slide_layouts[1])
    s4.shapes.title.text = "Rollout"
    bullets(s4, ["Email customers on 15 February", "Update the pricing page on 1 March"])
    if not reviewed:
        s4.notes_slide.notes_text_frame.text = "   "
    prs.save(path)


def main() -> None:
    record = {}
    for name, reviewed in (("pricing-update.pptx", False), ("pricing-update-reviewed.pptx", True)):
        build(HERE / name, reviewed)
    tmp = HERE / "_lo"
    tmp.mkdir(exist_ok=True)
    subprocess.run(["soffice", "--headless", "--convert-to", "pdf", "--outdir", str(tmp), str(HERE / "pricing-update.pptx")],
                   check=True, capture_output=True)
    shutil.move(tmp / "pricing-update.pdf", HERE / "pricing-update.pdf")
    notes_filter = ('pdf:impress_pdf_Export:{"ExportNotesPages":{"type":"boolean","value":"true"},'
                    '"ExportOnlyNotesPages":{"type":"boolean","value":"true"}}')
    subprocess.run(["soffice", "--headless", "--convert-to", notes_filter, "--outdir", str(tmp), str(HERE / "pricing-update.pptx")],
                   check=True, capture_output=True)
    shutil.move(tmp / "pricing-update.pdf", HERE / "pricing-update-notes-pages.pdf")
    tmp.rmdir()
    for name in ("pricing-update.pptx", "pricing-update-reviewed.pptx", "pricing-update.pdf", "pricing-update-notes-pages.pdf"):
        data = (HERE / name).read_bytes()
        record[name] = {"bytes": len(data), "sha256": hashlib.sha256(data).hexdigest()}
    (HERE / "deck-files.json").write_text(json.dumps({"label": "Synthetic pricing deck; notes on slide 2 only, whitespace notes on slide 4",
                                                      "notes_slide_2": NOTES_2, "files": record}, indent=2) + "\n")
    print(json.dumps(record, indent=2))


if __name__ == "__main__":
    main()
