#!/usr/bin/env python3
"""Count the fields in every record of a CSV file, the way a strict comma
reader sees them, and flag records whose width differs from the header.

  python row_widths.py FILE.csv [FILE.csv ...]

Uses Python's csv module with its default settings (comma, double quote,
doubled quotes inside quoted fields). A record can span several lines when a
quoted field contains a line break, so records are counted, not lines.
"""

from __future__ import annotations

import csv
import sys


def check(path: str) -> list[str]:
    out = []
    with open(path, newline="", encoding="utf-8-sig") as fh:
        rows = list(csv.reader(fh))
    header = len(rows[0]) if rows else 0
    out.append(f"{path}: {len(rows)} records, header has {header} fields")
    for i, row in enumerate(rows[1:], start=2):
        if len(row) != header:
            out.append(f"  record {i}: {len(row)} fields  {row!r}")
    return out


if __name__ == "__main__":
    for p in sys.argv[1:]:
        print("\n".join(check(p)))
