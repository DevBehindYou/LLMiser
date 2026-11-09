#!/usr/bin/env python3
"""M04-S3: which view of the draft does each converted output match?
Compares the body paragraphs of out-draft and out-shared with the three
expected views in views.json, and checks for comment and hidden text.
Writes view-results.json.

  python compare_views.py
"""

from __future__ import annotations

import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
VIEWS = json.loads((HERE / "views.json").read_text())
COMMENTS = ["Approved by HR on 2 Nov", "pending legal review. Do not publish"]


def body(md: str) -> list[str]:
    paras = [p.strip() for p in md.split("\n\n") if p.strip()]
    return [p for p in paras if not p.startswith("#") and not p.startswith(">")]


def main() -> None:
    out = {"label": "View comparison of LOCAL CODE-LEVEL RUN outputs", "outputs": {}}
    for name in ("draft", "shared"):
        md = next((HERE / f"out-{name}").glob("*.md")).read_text()
        paras = body(md)
        hidden = VIEWS["hidden_text"]
        visible = [p.replace(" " + hidden, "") for p in paras]
        out["outputs"][name] = {
            "paragraphs": paras,
            "matches_view_exactly": [v for v, text in VIEWS["views"].items() if text == paras],
            "matches_view_ignoring_hidden_text": [v for v, text in VIEWS["views"].items() if text == visible],
            "hidden_text_present": hidden in md,
            "comment_text_present": any(c in md for c in COMMENTS),
        }
    (HERE / "view-results.json").write_text(json.dumps(out, indent=2) + "\n")
    print(json.dumps(out, indent=2))


if __name__ == "__main__":
    main()
