#!/usr/bin/env python3
"""M06-S1 fixture: one small synthetic table written five ways, to see which
quoting habits keep separators inside their cell. All content invented.

Every file is meant to hold the same 4 records of 3 fields:
  Customer | Note | Amount

  rfc.csv             RFC 4180 quoting: a comma, a doubled quote, a line
                      break and a pipe character inside quoted cells
  space-before.csv    the same, but with a space after each comma, before
                      the opening quote (common in hand-edited files)
  backslash.csv       inner quotes escaped as \\" instead of doubled
  unclosed.csv        one note missing its closing quote
  unquoted.csv        no quoting at all

Bytes are written exactly as listed, UTF-8, CRLF line ends.

  python make_quotes.py
"""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent

EXPECTED = [
    ["Customer", "Note", "Amount"],
    ["Lee", "Paid, then refunded", "10.50"],
    ["Morgan", 'Said "urgent", twice', "1250.00"],
    ["Kim", "Line one\nLine two", "0.75"],
    ["Ada", "Plan A|B", "42.00"],
]

FILES = {
    "rfc.csv": [
        'Customer,Note,Amount',
        'Lee,"Paid, then refunded",10.50',
        'Morgan,"Said ""urgent"", twice",1250.00',
        'Kim,"Line one\nLine two",0.75',
        'Ada,"Plan A|B",42.00',
    ],
    "space-before.csv": [
        'Customer, Note, Amount',
        'Lee, "Paid, then refunded", 10.50',
        'Morgan, "Said ""urgent"", twice", 1250.00',
        'Kim, "Line one\nLine two", 0.75',
        'Ada, "Plan A|B", 42.00',
    ],
    "backslash.csv": [
        'Customer,Note,Amount',
        'Lee,"Paid, then refunded",10.50',
        'Morgan,"Said \\"urgent\\", twice",1250.00',
        'Kim,"Line one\nLine two",0.75',
        'Ada,"Plan A|B",42.00',
    ],
    "unclosed.csv": [
        'Customer,Note,Amount',
        'Lee,"Paid, then refunded,10.50',
        'Morgan,"Said ""urgent"", twice",1250.00',
        'Kim,"Line one\nLine two",0.75',
        'Ada,"Plan A|B",42.00',
    ],
    "unquoted.csv": [
        'Customer,Note,Amount',
        'Lee,Paid, then refunded,10.50',
        'Morgan,Said "urgent", twice,1250.00',
        'Kim,Line one\nLine two,0.75',
        'Ada,Plan A|B,42.00',
    ],
}


def main() -> None:
    record = {}
    for name, lines in FILES.items():
        data = ("\r\n".join(lines) + "\r\n").encode("utf-8")
        (HERE / name).write_bytes(data)
        record[name] = {"bytes": len(data), "sha256": hashlib.sha256(data).hexdigest()}
    (HERE / "quote-files.json").write_text(json.dumps({"label": "Synthetic 4-record table in five quoting styles",
                                                       "expected_records": EXPECTED, "files": record}, indent=2) + "\n")
    print(json.dumps(record, indent=2))


if __name__ == "__main__":
    main()
