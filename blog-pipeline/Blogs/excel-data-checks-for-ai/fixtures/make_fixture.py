#!/usr/bin/env python3
"""Synthetic M03 workbook (all values invented).

Builds field-orders-src.xlsx with openpyxl, then lets LibreOffice (headless)
open and save it as field-orders.xlsx so formula cells carry cached results,
as they do after a spreadsheet app saves a file. The converted file is the
fixture; the -src file documents what was typed.

Sheets, in order:
  Read me   units and conventions that the data sheet does not repeat
  Orders    IDs as text and as formatted numbers, a long ID after Excel's
            15-digit rounding, a date, currency and percent formats,
            formulas, a vertically merged Region cell, a chart
  Q3 old    a hidden sheet with superseded amounts
"""

from __future__ import annotations

import datetime as dt
import hashlib
import json
import shutil
import subprocess
from pathlib import Path

from openpyxl import Workbook
from openpyxl.chart import BarChart, Reference

HERE = Path(__file__).resolve().parent


def build(path: Path) -> None:
    wb = Workbook()
    readme = wb.active
    readme.title = "Read me"
    readme["A1"] = "Field orders workbook (synthetic sample)"
    readme["A2"] = "Amounts are USD. Weight is in kg. Dates are month/day/year."
    readme["A3"] = "Rows marked Hold are not invoiced yet."

    ws = wb.create_sheet("Orders")
    headers = ["Customer ID", "Region", "Order date", "Qty", "Unit price", "Amount", "Weight", "Status"]
    ws.append(headers)
    rows = [
        ["00123", "North", dt.date(2026, 3, 4), 12, 10.5, "=D2*E2", 4.2, "Open"],
        [123, None, dt.date(2026, 3, 9), 3, 1250, "=D3*E3", 18.75, "Hold"],
        [4012345678901230000, "South", dt.date(2026, 4, 1), 1, 0.75, "=D4*E4", 0.3, "Open"],
    ]
    for r in rows:
        ws.append(r)
    ws["A6"] = "Total"
    ws["F6"] = "=SUM(F2:F4)"
    ws["A7"] = "Tax rate"
    ws["B7"] = 0.075
    ws["B7"].number_format = "0.0%"
    ws.merge_cells("B2:B3")  # North covers two rows
    ws["A3"].number_format = "00000"  # numeric 123 displays as 00123
    ws["A4"].number_format = "0"  # long ID as Excel would hold it after 15-digit rounding
    for row in range(2, 5):
        ws[f"C{row}"].number_format = "mm/dd/yyyy"
        ws[f"E{row}"].number_format = "$#,##0.00"
        ws[f"F{row}"].number_format = "$#,##0.00"
    ws["F6"].number_format = "$#,##0.00"
    chart = BarChart()
    chart.title = "Amount by order"
    chart.add_data(Reference(ws, min_col=6, min_row=1, max_row=4), titles_from_data=True)
    ws.add_chart(chart, "J2")

    old = wb.create_sheet("Q3 old")
    old.append(["Customer ID", "Amount"])
    old.append(["00123", 98.0])
    old.append(["00123", 1400.0])
    old.sheet_state = "hidden"
    wb.save(path)


def main() -> None:
    src = HERE / "field-orders-src.xlsx"
    build(src)
    outdir = HERE / "lo-out"
    outdir.mkdir(exist_ok=True)
    subprocess.run(["soffice", "--headless", "--calc", "--convert-to", "xlsx", "--outdir", str(outdir), str(src)],
                   check=True, capture_output=True)
    shutil.move(str(outdir / src.name), HERE / "field-orders.xlsx")
    outdir.rmdir()
    record = {}
    for name in ("field-orders-src.xlsx", "field-orders.xlsx"):
        data = (HERE / name).read_bytes()
        record[name] = {"bytes": len(data), "sha256": hashlib.sha256(data).hexdigest()}
    (HERE / "inputs.json").write_text(json.dumps({"label": "Synthetic workbook; LibreOffice saved field-orders.xlsx with cached formula results.", "files": record}, indent=2) + "\n")
    print(json.dumps(record, indent=2))


if __name__ == "__main__":
    main()
