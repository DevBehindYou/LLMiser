#!/usr/bin/env python3
"""Fetch a source page as plain text and print passages that match patterns.

  python fetch_source.py URL PATTERN [PATTERN ...] [--context 1] [--cache DIR]

The full page text is cached outside the repository (default: $SOURCE_CACHE or
/tmp/llmiser-source-cache) so third-party page text is not committed. Only
short quoted passages belong in Blogs/{slug}/sources.md. Output starts with
the final URL, HTTP status, retrieval time and the page <title>.
"""

from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import html
import os
import re
import subprocess
import sys
from pathlib import Path


def to_text(raw: str) -> str:
    raw = re.sub(r"(?is)<(script|style|noscript|svg|nav|footer|header)\b.*?</\1>", " ", raw)
    raw = re.sub(r"(?i)<br\s*/?>|</(p|div|li|h[1-6]|tr|pre|section|article|dd|dt|td|th)>", "\n", raw)
    raw = re.sub(r"(?s)<[^>]+>", " ", raw)
    text = html.unescape(raw)
    lines = [re.sub(r"[ \t ]+", " ", ln).strip() for ln in text.splitlines()]
    return "\n".join(ln for ln in lines if ln)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("url")
    ap.add_argument("patterns", nargs="*")
    ap.add_argument("--context", type=int, default=0)
    ap.add_argument("--cache", default=os.environ.get("SOURCE_CACHE", "/tmp/llmiser-source-cache"))
    ap.add_argument("--max", type=int, default=6, help="max hits per pattern")
    args = ap.parse_args()
    cache = Path(args.cache)
    cache.mkdir(parents=True, exist_ok=True)
    key = hashlib.sha256(args.url.encode()).hexdigest()[:16]
    raw_file = cache / f"{key}.html"
    meta = cache / f"{key}.meta"
    if not raw_file.exists():
        out = subprocess.run(["curl", "-sSL", "--max-time", "40", "-A", "Mozilla/5.0 (LLMiser editorial source check)",
                              "-o", str(raw_file), "-w", "%{http_code} %{url_effective}", args.url], capture_output=True, text=True)
        meta.write_text(f"{out.stdout}\n{dt.datetime.now(dt.timezone.utc).isoformat(timespec='seconds')}\n")
    status, _, final = meta.read_text().splitlines()[0].partition(" ")
    when = meta.read_text().splitlines()[1]
    raw = raw_file.read_text(errors="replace")
    title = re.search(r"(?is)<title[^>]*>(.*?)</title>", raw)
    text = to_text(raw)
    print(f"URL: {final}\nHTTP: {status}\nRetrieved: {when}\nTitle: {html.unescape(title.group(1).strip()) if title else '?'}")
    dates = re.findall(r"(?i)(?:last updated|updated|modified|published)[^\n]{0,60}?(\d{4}-\d{2}-\d{2}|\w+ \d{1,2}, \d{4}|\d{1,2} \w+ \d{4})", raw)
    if dates:
        print(f"Dates seen: {sorted(set(dates))[:4]}")
    lines = text.splitlines()
    for pat in args.patterns:
        rx = re.compile(pat, re.I)
        hits = [i for i, ln in enumerate(lines) if rx.search(ln)][: args.max]
        print(f"\n--- /{pat}/ : {len(hits)} hit(s)")
        for i in hits:
            seg = lines[max(0, i - args.context): i + args.context + 1]
            print("  > " + " | ".join(s[:400] for s in seg))
    return 0


if __name__ == "__main__":
    sys.exit(main())
