#!/usr/bin/env python3
"""M04-S2 fixture: a synthetic equipment-return procedure with the list
habits Word documents mix together. All content invented.

steps-original.docx
  Part A  a real multilevel list (one list, levels 0 to 2, as Word builds it
          when you press Tab): 1. / a. / bullet
          then a Normal "Note" paragraph, then step 3 continuing the SAME list
  Part B  a second list that restarts at 1 (new list instance, start override)
  Part C  style-based levels: List Number items with List Bullet 2 children
          (each style carries its own list, the way some templates do it)

steps-reviewed.docx: the same words repaired:
  - the note folded into step 2's text, so step 3 continues the list
  - Part C rebuilt as a real multilevel list (numbered level 0, bullet level 1)

steps-skip-level.docx: Part C only, as a real list whose bullets were
indented two levels at once (level 0 item, then level 2 items).

python-docx default template plus numbering XML written directly.

  python make_lists.py
"""

from __future__ import annotations

import copy
import hashlib
import json
from pathlib import Path

from docx import Document
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

HERE = Path(__file__).resolve().parent

ABSTRACT = f"""<w:abstractNum {nsdecls('w')} w:abstractNumId="90">
  <w:multiLevelType w:val="multilevel"/>
  <w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="decimal"/><w:lvlText w:val="%1."/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="720" w:hanging="360"/></w:pPr></w:lvl>
  <w:lvl w:ilvl="1"><w:start w:val="1"/><w:numFmt w:val="lowerLetter"/><w:lvlText w:val="%2."/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="1440" w:hanging="360"/></w:pPr></w:lvl>
  <w:lvl w:ilvl="2"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="•"/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="2160" w:hanging="360"/></w:pPr></w:lvl>
</w:abstractNum>"""


ABSTRACT_BULLETS = f"""<w:abstractNum {nsdecls('w')} w:abstractNumId="93">
  <w:multiLevelType w:val="multilevel"/>
  <w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="decimal"/><w:lvlText w:val="%1."/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="720" w:hanging="360"/></w:pPr></w:lvl>
  <w:lvl w:ilvl="1"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="\u2022"/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="1440" w:hanging="360"/></w:pPr></w:lvl>
</w:abstractNum>"""


def add_numbering(doc: Document) -> None:
    numbering = doc.part.numbering_part.element
    abstract = parse_xml(ABSTRACT)
    # abstractNum elements must come before num elements.
    first_num = numbering.find("{http://schemas.openxmlformats.org/wordprocessingml/2006/main}num")
    for ab in (abstract, parse_xml(ABSTRACT_BULLETS)):
        if first_num is not None:
            first_num.addprevious(ab)
        else:
            numbering.append(ab)
    numbering.append(parse_xml(f'<w:num {nsdecls("w")} w:numId="90"><w:abstractNumId w:val="90"/></w:num>'))
    numbering.append(parse_xml(
        f'<w:num {nsdecls("w")} w:numId="91"><w:abstractNumId w:val="90"/>'
        '<w:lvlOverride w:ilvl="0"><w:startOverride w:val="1"/></w:lvlOverride></w:num>'))
    numbering.append(parse_xml(
        f'<w:num {nsdecls("w")} w:numId="92"><w:abstractNumId w:val="90"/>'
        '<w:lvlOverride w:ilvl="0"><w:startOverride w:val="1"/></w:lvlOverride></w:num>'))
    numbering.append(parse_xml(f'<w:num {nsdecls("w")} w:numId="93"><w:abstractNumId w:val="93"/></w:num>'))


def item(doc: Document, text: str, num_id: int, level: int) -> None:
    p = doc.add_paragraph(text, style="List Paragraph")
    ppr = p._p.get_or_add_pPr()
    ppr.append(parse_xml(f'<w:numPr {nsdecls("w")}><w:ilvl w:val="{level}"/><w:numId w:val="{num_id}"/></w:numPr>'))


def part_a(doc: Document, note_inside: bool) -> None:
    doc.add_heading("Return your equipment", level=2)
    item(doc, "Pack the device", 90, 0)
    item(doc, "Remove the SIM card", 90, 1)
    item(doc, "Wipe personal files", 90, 1)
    item(doc, "Photos", 90, 2)
    item(doc, "Downloads", 90, 2)
    if note_inside:
        item(doc, "Print the return label. Labels expire after 7 days.", 90, 0)
    else:
        item(doc, "Print the return label", 90, 0)
        doc.add_paragraph("Note: labels expire after 7 days.")
    item(doc, "Drop off the parcel", 90, 0)


def part_b(doc: Document) -> None:
    doc.add_heading("After drop-off", level=2)
    item(doc, "Check the confirmation email", 91, 0)
    item(doc, "Keep the receipt", 91, 0)


def part_c(doc: Document, real_levels: bool) -> None:
    doc.add_heading("Items we can't take back", level=2)
    if real_levels == "skip":
        item(doc, "Final-sale items", 92, 0)
        item(doc, "Clearance labels", 92, 2)
        item(doc, "Opened bundles", 92, 2)
        item(doc, "Gift cards", 92, 0)
    elif real_levels:
        item(doc, "Final-sale items", 93, 0)
        item(doc, "Clearance labels", 93, 1)
        item(doc, "Opened bundles", 93, 1)
        item(doc, "Gift cards", 93, 0)
    else:
        doc.add_paragraph("Final-sale items", style="List Number")
        doc.add_paragraph("Clearance labels", style="List Bullet 2")
        doc.add_paragraph("Opened bundles", style="List Bullet 2")
        doc.add_paragraph("Gift cards", style="List Number")


def build(path: Path, reviewed) -> None:
    doc = Document()
    add_numbering(doc)
    doc.add_heading("Equipment Return Steps", level=1)
    if reviewed == "skip":
        part_c(doc, real_levels="skip")
    else:
        part_a(doc, note_inside=reviewed)
        part_b(doc)
        part_c(doc, real_levels=reviewed)
    doc.save(path)


def main() -> None:
    record = {}
    for name, reviewed in (("steps-original.docx", False), ("steps-reviewed.docx", True), ("steps-skip-level.docx", "skip")):
        p = HERE / name
        build(p, reviewed)
        data = p.read_bytes()
        record[name] = {"bytes": len(data), "sha256": hashlib.sha256(data).hexdigest()}
    (HERE / "steps-files.json").write_text(json.dumps({"label": "Synthetic equipment-return steps, original and reviewed", "files": record}, indent=2) + "\n")
    print(json.dumps(record, indent=2))


if __name__ == "__main__":
    main()
