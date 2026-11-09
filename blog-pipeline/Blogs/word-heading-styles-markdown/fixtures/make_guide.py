#!/usr/bin/env python3
"""M04-S1 fixture: a synthetic onboarding guide written twice.

guide-original.docx uses the habits real documents mix together:
  - the title in Word's Title style
  - Heading 1, 2 and 3 used properly in places
  - a bold 16 pt Normal paragraph posing as a heading
  - a custom style "Section Heading" based on Heading 2 (looks the same,
    inherits its outline level)
  - a Normal paragraph given outline level 1 by paragraph formatting
  - Heading 1 followed directly by Heading 3 (a skipped level)
  - a whole sentence styled Heading 3 for emphasis
  - an empty Heading 2 paragraph

guide-reviewed.docx is the same text with one consistent hierarchy:
Heading 1 for the title, Heading 2 for sections, Heading 3 for subsections,
Normal for body text and the emphasized sentence.

All content invented.

  python make_guide.py
"""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

from docx import Document
from docx.enum.style import WD_STYLE_TYPE
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Pt

HERE = Path(__file__).resolve().parent
BODY = "Synthetic sample text for a conversion test."

# (text, original style, reviewed style); "bold16" and "outline1" are formatting cases.
BLOCKS = [
    ("Northwind Onboarding Guide", "Title", "Heading 1"),
    ("Overview", "Heading 1", "Heading 2"),
    (BODY, "Normal", "Normal"),
    ("Before your first day", "Heading 2", "Heading 3"),
    (BODY, "Normal", "Normal"),
    ("Accounts and access", "bold16", "Heading 2"),
    (BODY, "Normal", "Normal"),
    ("Your first week", "Section Heading", "Heading 2"),
    (BODY, "Normal", "Normal"),
    ("Equipment", "Heading 3", "Heading 3"),
    (BODY, "Normal", "Normal"),
    ("Policies", "outline1", "Heading 2"),
    (BODY, "Normal", "Normal"),
    ("Contacts", "Heading 1", "Heading 2"),
    ("Helpdesk", "Heading 3", "Heading 3"),
    (BODY, "Normal", "Normal"),
    ("Badges must be worn at all times.", "Heading 3", "Normal"),
    ("", "Heading 2", None),
    ("Questions go to the onboarding desk.", "Normal", "Normal"),
]


def build(path: Path, column: int) -> None:
    doc = Document()
    custom = doc.styles.add_style("Section Heading", WD_STYLE_TYPE.PARAGRAPH)
    custom.base_style = doc.styles["Heading 2"]
    for block in BLOCKS:
        text, style = block[0], block[column]
        if style is None:
            continue
        if style == "bold16":
            p = doc.add_paragraph()
            run = p.add_run(text)
            run.bold = True
            run.font.size = Pt(16)
        elif style == "outline1":
            p = doc.add_paragraph(text)
            ppr = p._p.get_or_add_pPr()
            lvl = OxmlElement("w:outlineLvl")
            lvl.set(qn("w:val"), "0")  # outline level 1
            ppr.append(lvl)
        else:
            doc.add_paragraph(text, style=style)
    doc.core_properties.author = "Synthetic"
    doc.save(path)


def main() -> None:
    record = {}
    for name, column in (("guide-original.docx", 1), ("guide-reviewed.docx", 2)):
        p = HERE / name
        build(p, column)
        data = p.read_bytes()
        record[name] = {"bytes": len(data), "sha256": hashlib.sha256(data).hexdigest()}
    (HERE / "guide-files.json").write_text(json.dumps({"label": "Synthetic onboarding guide in two versions",
                                                       "blocks": BLOCKS, "files": record}, indent=2) + "\n")
    print(json.dumps(record, indent=2))


if __name__ == "__main__":
    main()
