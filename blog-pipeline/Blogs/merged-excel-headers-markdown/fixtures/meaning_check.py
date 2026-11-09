#!/usr/bin/env python3
"""M03-S3: for every value cell in each converted table, can a reader name
its region, channel, quarter and measure (with unit) from that cell's own row
and its column header alone? Reads out-*/sales-*.Standard.md, writes
meaning-results.json.

  python meaning_check.py
"""

from __future__ import annotations

import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
QUARTERS = ["Q1 2026", "Q2 2026"]
MEASURES = ["Units", "Revenue (USD)", "Weight (kg)"]
REGIONS = ["North", "South"]
CHANNELS = ["Retail", "Wholesale"]


def table(md: str) -> tuple[list[str], list[list[str]]]:
    rows = [ln for ln in md.splitlines() if ln.startswith("|")]
    cells = [[c.strip() for c in ln.strip("|").split("|")] for ln in rows]
    return cells[0], cells[2:]


def check(name: str) -> dict:
    md = next((HERE / f"out-{name}").glob("*.md")).read_text()
    head, body = table(md)
    total = labeled = 0
    missing = {"region": 0, "channel": 0, "quarter": 0, "measure": 0}
    examples = []
    for row in body:
        region = next((c for c in row if c in REGIONS), None)
        channel = next((c for c in row if c in CHANNELS), None)
        row_quarter = next((c for c in row if c in QUARTERS), None)
        for j, cell in enumerate(row):
            if cell == "NaN":
                continue  # an empty cell, not a value
            try:
                float(cell)
            except ValueError:
                continue
            total += 1
            h = head[j]
            quarter = row_quarter or next((q for q in QUARTERS if q in h), None)
            measure = next((m for m in MEASURES if m in h), None)
            parts = {"region": region, "channel": channel, "quarter": quarter, "measure": measure}
            for k, v in parts.items():
                if v is None:
                    missing[k] += 1
            if all(parts.values()):
                labeled += 1
            if cell in ("1417.5", "3800", "3800.0"):
                examples.append({"value": cell, "header": h, "row": row[:3], "recovered": parts})
    return {"value_cells": total, "fully_labeled": labeled, "missing": missing, "header": head, "examples": examples}


def main() -> None:
    out = {"label": "Meaning check on LOCAL CODE-LEVEL RUN outputs", "tables": {n: check(n) for n in ("grouped", "flat", "long")}}
    (HERE / "meaning-results.json").write_text(json.dumps(out, indent=2) + "\n")
    for n, r in out["tables"].items():
        print(n, r["value_cells"], "cells,", r["fully_labeled"], "fully labeled; missing", r["missing"])
        for e in r["examples"]:
            print("   ", e)


if __name__ == "__main__":
    main()
