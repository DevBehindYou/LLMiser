#!/usr/bin/env python3
"""Copy on-disk production counts into handover/STATE.json and
campaign/manifest.json, and set the next action.

  python3 scripts/campaign/sync_state.py NEXT_ID "next action text" [--date YYYY-MM-DD]

Counts are taken from `node scripts/campaign/status.mjs build` output, which
counts files on disk, so the state never claims more than exists.
"""

from __future__ import annotations

import datetime
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def main() -> None:
    next_id, action = sys.argv[1], sys.argv[2]
    date = sys.argv[sys.argv.index("--date") + 1] if "--date" in sys.argv else datetime.date.today().isoformat()
    out = subprocess.run(["node", str(ROOT / "scripts/campaign/status.mjs"), "build"], capture_output=True, text=True, check=True).stdout
    m = re.search(r"mains (\d+)/\d+, supports (\d+)/\d+, posts (\d+)/\d+", out)
    v = re.search(r"banners (\d+)/\d+, figures (\d+) .*?rendered previews (\d+)/\d+", out)
    mains, supports, posts = map(int, m.groups())
    banners, figures, previews = map(int, v.groups())

    state_path = ROOT / "handover/STATE.json"
    state = json.loads(state_path.read_text())
    state["updated"] = date
    prod = state["campaign"]["production"]
    prod.update({"mains_drafted": mains, "supports_drafted": supports, "posts_written": posts,
                 "banners": banners, "figures": figures, "rendered_previews": previews})
    state["campaign"]["article_drafts_completed"] = mains + supports
    entry = f"../campaign/support-briefs/{next_id}.md" if re.match(r"M\d\d-S\d$", next_id) else "../campaign/CONTINUATION.md"
    state["next"] = {"id": next_id, "action": action, "entry": entry}
    state_path.write_text(json.dumps(state, indent=2, ensure_ascii=False) + "\n")

    man_path = ROOT / "campaign/manifest.json"
    man = json.loads(man_path.read_text())
    man["content_drafts_completed"] = mains + supports + posts
    man_path.write_text(json.dumps(man, indent=2, ensure_ascii=False) + "\n")
    print(out.strip().splitlines()[-2], "| next:", next_id)


if __name__ == "__main__":
    main()
