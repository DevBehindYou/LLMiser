#!/usr/bin/env python3
"""M03-S3 fixture: a small sales sheet with two-level merged headers and
merged row labels, plus two hand-flattened sharing copies. All content
invented.

  sales-grouped.xlsx  original: Region and Channel merged over two header
                      rows, "Q1 2026" and "Q2 2026" merged over three
                      columns each, units in the second header row, and each
                      Region merged over its two channel rows
  sales-flat.xlsx     sharing copy: one header row with the group and unit
                      in every label, Region filled into every row
  sales-long.xlsx     sharing copy: one row per region, channel and quarter

Every file is re-saved by LibreOffice Calc headless so it looks like an
app-saved workbook.

  python make_sales.py
"""

from __future__ import annotations

import hashlib
import json
import shutil
import subprocess
from pathlib import Path

from openpyxl import Workbook

HERE = Path(__file__).resolve().parent
QUARTERS = ["Q1 2026", "Q2 2026"]
MEASURES = ["Units", "Revenue (USD)", "Weight (kg)"]
DATA = [
    ("North", "Retail", [120, 1260.00, 54.0], [135, 1417.50, 60.8]),
    ("North", "Wholesale", [400, 3800.00, 180.0], [380, 3610.00, 171.0]),
    ("South", "Retail", [90, 945.00, 40.5], [110, 1155.00, 49.5]),
    ("South", "Wholesale", [250, 2375.00, 112.5], [300, 2850.00, 135.0]),
]


def grouped(path: Path) -> None:
    wb = Workbook()
    ws = wb.active
    ws.title = "Sales"
    ws["A1"], ws["B1"], ws["C1"], ws["F1"] = "Region", "Channel", "Q1 2026", "Q2 2026"
    for i, m in enumerate(MEASURES * 2):
        ws.cell(2, 3 + i, m)
    ws.merge_cells("A1:A2")
    ws.merge_cells("B1:B2")
    ws.merge_cells("C1:E1")
    ws.merge_cells("F1:H1")
    for r, (region, channel, q1, q2) in enumerate(DATA, start=3):
        ws.cell(r, 1, region if r % 2 == 1 else None)
        ws.cell(r, 2, channel)
        for i, v in enumerate(q1 + q2):
            ws.cell(r, 3 + i, v)
    ws.merge_cells("A3:A4")
    ws.merge_cells("A5:A6")
    wb.save(path)


def flat(path: Path) -> None:
    wb = Workbook()
    ws = wb.active
    ws.title = "Sales"
    ws.append(["Region", "Channel"] + [f"{q} {m}" for q in QUARTERS for m in MEASURES])
    for region, channel, q1, q2 in DATA:
        ws.append([region, channel] + q1 + q2)
    wb.save(path)


def long(path: Path) -> None:
    wb = Workbook()
    ws = wb.active
    ws.title = "Sales"
    ws.append(["Region", "Channel", "Quarter"] + MEASURES)
    for region, channel, q1, q2 in DATA:
        for q, vals in zip(QUARTERS, (q1, q2)):
            ws.append([region, channel, q] + vals)
    wb.save(path)


def lo_save(path: Path) -> None:
    tmp = HERE / "_lo"
    (tmp / "in").mkdir(parents=True, exist_ok=True)
    shutil.move(path, tmp / "in" / path.name)
    subprocess.run(["soffice", "--headless", "--calc", "--convert-to", "xlsx", "--outdir", str(tmp), str(tmp / "in" / path.name)],
                   check=True, capture_output=True)
    shutil.move(tmp / path.name, path)
    shutil.rmtree(tmp)


def main() -> None:
    record = {}
    for name, fn in (("sales-grouped.xlsx", grouped), ("sales-flat.xlsx", flat), ("sales-long.xlsx", long)):
        p = HERE / name
        fn(p)
        lo_save(p)
        data = p.read_bytes()
        record[name] = {"bytes": len(data), "sha256": hashlib.sha256(data).hexdigest()}
    (HERE / "sales-files.json").write_text(json.dumps({"label": "Synthetic sales sheet: original and two sharing copies",
                                                       "data": DATA, "files": record}, indent=2) + "\n")
    print(json.dumps(record, indent=2))


if __name__ == "__main__":
    main()
