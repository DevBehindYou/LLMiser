#!/usr/bin/env python3
"""M04-S3 fixture: a synthetic leave policy draft with pending review work,
and the reviewed sharing copy made from it. All content invented, all
changes harmless.

leave-draft.docx (tracked changes by "Reviewer A", comments by "Reviewer B"):
  C1  replacement "5" -> "10" days            comment: approved by HR on 2 Nov
  C2  inserted sentence about 31 March expiry  comment: pending legal review
  C3  deleted sentence "Managers may approve exceptions."   (pending, no comment)
  H1  a run formatted as hidden text: "Internal: figures not final."

leave-shared.docx: the reviewed sharing copy, no revisions or comments:
  C1 accepted, C2 rejected, C3 rejected, the pending C2 turned into a plain
  sentence, the hidden note removed.

views.json records the expected text of three views of the draft: every
change rejected, every change accepted, and the decided sharing view.

  python make_policy.py
"""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

from docx import Document
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

HERE = Path(__file__).resolve().parent
DATE = "2026-11-02T09:00:00Z"
_ids = iter(range(10, 100))


def run_el(text: str, deleted: bool = False, hidden: bool = False):
    r = OxmlElement("w:r")
    if hidden:
        rpr = OxmlElement("w:rPr")
        rpr.append(OxmlElement("w:vanish"))
        r.append(rpr)
    t = OxmlElement("w:delText" if deleted else "w:t")
    t.set(qn("xml:space"), "preserve")
    t.text = text
    r.append(t)
    return r


def tracked(p, kind: str, text: str) -> None:
    el = OxmlElement("w:ins" if kind == "ins" else "w:del")
    el.set(qn("w:id"), str(next(_ids)))
    el.set(qn("w:author"), "Reviewer A")
    el.set(qn("w:date"), DATE)
    el.append(run_el(text, deleted=(kind == "del")))
    p._p.append(el)


def draft(path: Path) -> None:
    doc = Document()
    doc.add_heading("Leave Carry-Over Policy", level=1)
    p1 = doc.add_paragraph()
    p1.add_run("Staff may carry over up to ")
    tracked(p1, "del", "5")
    tracked(p1, "ins", "10")
    r_tail = p1.add_run(" days of leave into the next year.")
    tracked(p1, "ins", " Unused days expire on 31 March.")
    p2 = doc.add_paragraph()
    tracked(p2, "del", "Managers may approve exceptions.")
    p3 = doc.add_paragraph("Requests go through the HR portal.")
    p3._p.append(run_el(" Internal: figures not final.", hidden=True))
    # Comments anchored to the visible runs.
    doc.add_comment(p1.runs[0], text="Approved by HR on 2 Nov for the change to 10 days.", author="Reviewer B", initials="RB")
    doc.add_comment(r_tail, text="The 31 March expiry is pending legal review. Do not publish yet.", author="Reviewer B", initials="RB")
    doc.save(path)


def shared(path: Path) -> None:
    doc = Document()
    doc.add_heading("Leave Carry-Over Policy", level=1)
    doc.add_paragraph("Staff may carry over up to 10 days of leave into the next year.")
    doc.add_paragraph("Managers may approve exceptions.")
    doc.add_paragraph("Requests go through the HR portal.")
    doc.add_paragraph("A proposed rule that unused days expire on 31 March is under legal review and is not in effect.")
    doc.save(path)


VIEWS = {
    "all_rejected": ["Staff may carry over up to 5 days of leave into the next year.",
                     "Managers may approve exceptions.", "Requests go through the HR portal."],
    "all_accepted": ["Staff may carry over up to 10 days of leave into the next year. Unused days expire on 31 March.",
                     "Requests go through the HR portal."],
    "decided": ["Staff may carry over up to 10 days of leave into the next year.", "Managers may approve exceptions.",
                "Requests go through the HR portal.",
                "A proposed rule that unused days expire on 31 March is under legal review and is not in effect."],
}


def main() -> None:
    record = {}
    for name, fn in (("leave-draft.docx", draft), ("leave-shared.docx", shared)):
        p = HERE / name
        fn(p)
        data = p.read_bytes()
        record[name] = {"bytes": len(data), "sha256": hashlib.sha256(data).hexdigest()}
    (HERE / "views.json").write_text(json.dumps({"label": "Synthetic leave policy; expected text per view", "views": VIEWS,
                                                 "hidden_text": "Internal: figures not final.", "files": record}, indent=2) + "\n")
    print(json.dumps(record, indent=2))


if __name__ == "__main__":
    main()
