#!/usr/bin/env python3
"""M03-S1 fixture: a workbook whose columns separate identifiers from
quantities in the ways spreadsheets usually do. All content invented.

Sheet "Customers", one column per case (four data rows):
  Account         text, digits only, leading zeros
  Account_blank   the same text IDs with one blank cell
  SKU             text, digits and letters mixed in one column
  Formatted       numbers 123, 456 ... shown as 00123 by the number format 00000
  Text_formula    =TEXT(Formatted,"00000"), a text result
  Member_16         16-digit IDs stored as text
  Ref_20          20-digit IDs stored as text
  Phone           text with spaces, starting with 0
  Qty             whole numbers (a quantity)
  Unit_price      decimals with a currency format

openpyxl writes ids-src.xlsx; LibreOffice headless re-saves it as ids.xlsx so
the TEXT formulas carry cached results, as a file saved by a spreadsheet app
would. LibreOffice also exports ids-export.csv (values as displayed).

  python make_ids.py
"""

from __future__ import annotations

import hashlib
import json
import shutil
import subprocess
from pathlib import Path

from openpyxl import Workbook

HERE = Path(__file__).resolve().parent

ROWS = [
    # Account, Account_blank, SKU, Formatted, Member_16, Ref_20, Phone, Qty, Unit_price
    ["00123", "00123", "00123", 123, "9900123400005678", "99001234000056780001", "0412 555 018", 12, 10.5],
    ["00456", None, "A-0456", 456, "0099123400005679", "00991234000056790002", "0412 555 027", 3, 1250],
    ["01789", "01789", "01789", 1789, "9900123400005680", "99001234000056800003", "0412 555 036", 1, 0.75],
    ["10001", "10001", "B-1001", 10001, "9900123400005681", "99001234000056810004", "0412 555 045", 40, 2.4],
]
HEAD = ["Account", "Account_blank", "SKU", "Formatted", "Text_formula", "Member_16", "Ref_20", "Phone", "Qty", "Unit_price"]


def build(path: Path) -> None:
    wb = Workbook()
    ws = wb.active
    ws.title = "Customers"
    ws.append(HEAD)
    for i, r in enumerate(ROWS, start=2):
        acc, acc_b, sku, fmt, card, ref, phone, qty, price = r
        ws.append([acc, acc_b, sku, fmt, f'=TEXT(D{i},"00000")', card, ref, phone, qty, price])
        ws.cell(i, 4).number_format = "00000"
        ws.cell(i, 10).number_format = '"$"#,##0.00'
        for c in (1, 2, 3, 6, 7, 8):
            ws.cell(i, c).number_format = "@"  # Text format, as when a column is set to Text
    wb.save(path)


def main() -> None:
    src = HERE / "ids-src.xlsx"
    build(src)
    tmp = HERE / "_lo"
    tmp.mkdir(exist_ok=True)
    subprocess.run(["soffice", "--headless", "--calc", "--convert-to", "xlsx", "--outdir", str(tmp), str(src)],
                   check=True, capture_output=True)
    shutil.move(tmp / "ids-src.xlsx", HERE / "ids.xlsx")
    subprocess.run(["soffice", "--headless", "--calc", "--convert-to", "csv:Text - txt - csv (StarCalc):44,34,76,1",
                    "--outdir", str(tmp), str(HERE / "ids.xlsx")], check=True, capture_output=True)
    shutil.move(tmp / "ids.csv", HERE / "ids-export.csv")
    tmp.rmdir()
    record = {p.name: {"bytes": p.stat().st_size, "sha256": hashlib.sha256(p.read_bytes()).hexdigest()}
              for p in (src, HERE / "ids.xlsx", HERE / "ids-export.csv")}
    (HERE / "ids-truth.json").write_text(json.dumps({"label": "Synthetic. Invented IDs and amounts.", "headers": HEAD,
                                                     "rows": ROWS, "files": record}, indent=2) + "\n")
    print(json.dumps(record, indent=2))


if __name__ == "__main__":
    main()
