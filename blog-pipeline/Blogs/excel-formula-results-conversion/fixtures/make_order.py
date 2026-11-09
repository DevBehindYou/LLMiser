#!/usr/bin/env python3
"""M03-S2 fixture: one synthetic order sheet in four states, to show what a
conversion reads from formula cells. All content invented.

Sheet "Order":
  rows 2-4  Item, Qty, Unit price, Amount (=Qty*Unit price)
  row 5     Total =SUM(D2:D4)
  row 6     Tax rate 0.075, Tax =ROUND(D5*B6,2)
  row 7     Grand total =D5+D6
  row 9     Price check =VLOOKUP("Gasket XL",A2:C4,3,FALSE)   -> #N/A
  row 10    Per unit =D2/B10 with B10 empty                     -> #DIV/0!
  row 11    Days since 1 Oct =TODAY()-DATE(2026,10,1)          -> depends on the save date

States:
  order-script.xlsx   written by openpyxl: formulas, no saved results
  order-saved.xlsx    the same file opened and saved by LibreOffice Calc
                      (headless), so every formula carries a saved result
  order-stale.xlsx    order-saved.xlsx with one input changed inside the file
                      (Gasket Qty 12 -> 20) and no recalculation, the way a
                      tool that writes values into a template can leave it
  order-resaved.xlsx  order-stale.xlsx opened and saved again by LibreOffice
                      Calc headless with default settings

  python make_order.py
"""

from __future__ import annotations

import hashlib
import json
import re
import shutil
import subprocess
import zipfile
from pathlib import Path

from openpyxl import Workbook

HERE = Path(__file__).resolve().parent


def build(path: Path) -> None:
    wb = Workbook()
    ws = wb.active
    ws.title = "Order"
    ws.append(["Item", "Qty", "Unit price", "Amount"])
    for i, (item, qty, price) in enumerate([("Gasket", 12, 10.5), ("Valve", 3, 1250), ("Seal kit", 1, 0.75)], start=2):
        ws.append([item, qty, price, f"=B{i}*C{i}"])
    ws["A5"], ws["D5"] = "Total", "=SUM(D2:D4)"
    ws["A6"], ws["B6"], ws["D6"] = "Tax", 0.075, "=ROUND(D5*B6,2)"
    ws["A7"], ws["D7"] = "Grand total", "=D5+D6"
    ws["A9"], ws["D9"] = "Price check", '=VLOOKUP("Gasket XL",A2:C4,3,FALSE)'
    ws["A10"], ws["D10"] = "Per unit", "=D2/B10"
    ws["A11"], ws["D11"] = "Days since 1 Oct", "=TODAY()-DATE(2026,10,1)"
    wb.save(path)


def lo_save(src: Path, dest: Path) -> None:
    tmp = HERE / "_lo"
    tmp.mkdir(exist_ok=True)
    work = tmp / "in" / src.name
    work.parent.mkdir(exist_ok=True)
    shutil.copy(src, work)
    subprocess.run(["soffice", "--headless", "--calc", "--convert-to", "xlsx", "--outdir", str(tmp), str(work)],
                   check=True, capture_output=True)
    shutil.move(tmp / src.name, dest)
    shutil.rmtree(tmp)


def stale(src: Path, dest: Path) -> None:
    """Change cell B2 (Gasket Qty) from 12 to 20 in the sheet XML only."""
    with zipfile.ZipFile(src) as zin, zipfile.ZipFile(dest, "w", zipfile.ZIP_DEFLATED) as zout:
        for info in zin.infolist():
            data = zin.read(info.filename)
            if info.filename == "xl/worksheets/sheet1.xml":
                text = data.decode("utf-8")
                new, n = re.subn(r'(<c r="B2"[^>]*><v>)12(</v>)', r"\g<1>20\g<2>", text)
                assert n == 1, "B2 not found"
                data = new.encode("utf-8")
            zout.writestr(info, data)


def main() -> None:
    script = HERE / "order-script.xlsx"
    build(script)
    lo_save(script, HERE / "order-saved.xlsx")
    stale(HERE / "order-saved.xlsx", HERE / "order-stale.xlsx")
    lo_save(HERE / "order-stale.xlsx", HERE / "order-resaved.xlsx")
    record = {}
    for name in ("order-script.xlsx", "order-saved.xlsx", "order-stale.xlsx", "order-resaved.xlsx"):
        data = (HERE / name).read_bytes()
        record[name] = {"bytes": len(data), "sha256": hashlib.sha256(data).hexdigest()}
    (HERE / "order-files.json").write_text(json.dumps({"label": "Synthetic order sheet in four states", "files": record}, indent=2) + "\n")
    print(json.dumps(record, indent=2))


if __name__ == "__main__":
    main()
