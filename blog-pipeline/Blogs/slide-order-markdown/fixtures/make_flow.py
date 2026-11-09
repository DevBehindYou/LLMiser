#!/usr/bin/env python3
"""M05-S3 fixture: a synthetic troubleshooting deck whose meaning depends on
slide order. All content invented.

flow-original.pptx (PowerPoint sections "Diagnosis" and "Resolution")
  1 title slide        "Fix the Login Error (synthetic sample)"
  2 section header     "Diagnosis" (no body text)
  3 "Symptoms"         a "Step 1 of 3" text box placed ABOVE the title
  4 "Symptoms"         repeated title, continues slide 3
  5 "Cause"            "Step 2 of 3" text box above the title
  6 (no title placeholder) a large "Fix" text box used as the title, "Step 3
                       of 3" above it, and a sentence that points back: "As
                       the previous slide shows, timing is the cause."

flow-reviewed.pptx: the same content with unique titles that carry the step,
real title placeholders, the section divider's description in its title, and
the backward reference written out.

flow-reviewed-first-attempt.pptx (kept, built by an earlier version of this
script): the divider description typed into the Section Header layout's text
placeholder, which converted above the heading.

  python make_flow.py
"""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

from lxml import etree
from pptx import Presentation
from pptx.util import Inches, Pt

HERE = Path(__file__).resolve().parent
P = "http://schemas.openxmlformats.org/presentationml/2006/main"
P14 = "http://schemas.microsoft.com/office/powerpoint/2010/main"


def textbox(slide, text, top, size=16, left=0.6, width=8.8, height=0.5):
    box = slide.shapes.add_textbox(Inches(left), Inches(top), Inches(width), Inches(height))
    box.text_frame.text = text
    box.text_frame.paragraphs[0].runs[0].font.size = Pt(size)
    return box


def body(slide, lines):
    tf = slide.placeholders[1].text_frame
    tf.text = lines[0]
    for ln in lines[1:]:
        tf.add_paragraph().text = ln


def add_sections(prs, groups):
    """groups: [(name, [slide index, ...]), ...] written as a p14:sectionLst extension."""
    pres = prs.part._element
    ext_lst = pres.find(f"{{{P}}}extLst")
    if ext_lst is None:
        ext_lst = etree.SubElement(pres, f"{{{P}}}extLst")
    ext = etree.SubElement(ext_lst, f"{{{P}}}ext", uri="{521415D9-36F7-43E2-AB2F-B90AF26B5E84}")
    sec_lst = etree.SubElement(ext, f"{{{P14}}}sectionLst", nsmap={"p14": P14})
    ids = [s.slide_id for s in prs.slides]
    for i, (name, idxs) in enumerate(groups):
        sec = etree.SubElement(sec_lst, f"{{{P14}}}section", name=name, id="{%08d-0000-4000-8000-000000000000}" % (i + 1))
        lst = etree.SubElement(sec, f"{{{P14}}}sldIdLst")
        for k in idxs:
            etree.SubElement(lst, f"{{{P14}}}sldId", id=str(ids[k]))


def build(path: Path, reviewed: bool) -> None:
    prs = Presentation()
    s = prs.slides.add_slide(prs.slide_layouts[0])
    s.shapes.title.text = "Fix the Login Error (synthetic sample)"
    s.placeholders[1].text = "Support team walkthrough"

    s = prs.slides.add_slide(prs.slide_layouts[2])  # section header
    # The Section Header layout's text placeholder sits above its title, so a
    # description typed there converts before the heading. The reviewed copy
    # puts the description in the title instead and leaves the text box empty.
    s.shapes.title.text = "Diagnosis" if not reviewed else "Diagnosis: steps 1 and 2 find the cause"

    s = prs.slides.add_slide(prs.slide_layouts[1])
    if reviewed:
        s.shapes.title.text = "Step 1: Symptoms of error 4012"
    else:
        s.shapes.title.text = "Symptoms"
        textbox(s, "Step 1 of 3", top=0.1, size=14)
    body(s, ["Users see error 4012 after entering a password.", "The error appears within two seconds."])

    s = prs.slides.add_slide(prs.slide_layouts[1])
    s.shapes.title.text = "Step 1, continued: Mobile app only" if reviewed else "Symptoms"
    body(s, ["It happens only on the mobile app.", "The web sign-in works for the same users."])

    s = prs.slides.add_slide(prs.slide_layouts[1])
    if reviewed:
        s.shapes.title.text = "Step 2: Cause"
    else:
        s.shapes.title.text = "Cause"
        textbox(s, "Step 2 of 3", top=0.1, size=14)
    body(s, ["The session token expires before the second request."])

    if reviewed:
        s = prs.slides.add_slide(prs.slide_layouts[1])
        s.shapes.title.text = "Step 3: Fix"
        body(s, ["Refresh the token before the second request.",
                 "Because the token expires early (step 2), refreshing it removes error 4012."])
    else:
        s = prs.slides.add_slide(prs.slide_layouts[6])  # blank layout, no title placeholder
        textbox(s, "Step 3 of 3", top=0.1, size=14)
        textbox(s, "Fix", top=0.5, size=40, height=1.0)
        textbox(s, "Refresh the token before the second request.", top=1.8, size=20)
        textbox(s, "As the previous slide shows, timing is the cause.", top=2.5, size=20)

    add_sections(prs, [("Diagnosis", [0, 1, 2, 3, 4]), ("Resolution", [5])])
    prs.save(path)


def main() -> None:
    record = {}
    for name, reviewed in (("flow-original.pptx", False), ("flow-reviewed.pptx", True)):
        build(HERE / name, reviewed)
        data = (HERE / name).read_bytes()
        record[name] = {"bytes": len(data), "sha256": hashlib.sha256(data).hexdigest()}
    (HERE / "flow-files.json").write_text(json.dumps({"label": "Synthetic troubleshooting deck, original and reviewed",
                                                      "sections": {"Diagnosis": [1, 2, 3, 4, 5], "Resolution": [6]},
                                                      "files": record}, indent=2) + "\n")
    print(json.dumps(record, indent=2))


if __name__ == "__main__":
    main()
