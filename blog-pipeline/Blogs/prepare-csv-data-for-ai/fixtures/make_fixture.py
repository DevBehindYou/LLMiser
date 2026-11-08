#!/usr/bin/env python3
"""Synthetic M06 delimited files (all values invented).

  semicolon.csv     semicolon delimiter with decimal commas (a common regional export)
  quoted.csv        comma inside a quoted cell, an escaped quote, an embedded newline
  unquoted.csv      the same comma left unquoted
  legacy-1252.csv   accented names saved as Windows-1252 instead of UTF-8
  mojibake.csv      a UTF-8 file whose text was already misdecoded once (JosÃ©)
  no-header.csv     data rows with no header row
  ragged.csv        blank middle cell, missing last field, extra delimiter
  sample.tsv        tab-separated version of the clean data
"""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent

FILES: dict[str, bytes] = {
    "semicolon.csv": "Customer;Amount;City\nLee;10,50;Köln\nMorgan;1.250,00;Graz\n".encode("utf-8"),
    "quoted.csv": 'Customer,Note,Amount\nLee,"Paid, then refunded",10.50\nMorgan,"Said ""urgent""",1250.00\nKim,"Line one\nLine two",0.75\n'.encode("utf-8"),
    "unquoted.csv": "Customer,Note,Amount\nLee,Paid, then refunded,10.50\nMorgan,On time,1250.00\n".encode("utf-8"),
    "legacy-1252.csv": "Customer,City\nJosé Núñez,Málaga\nZoë Müller,Zürich\n".encode("cp1252"),
    "mojibake.csv": "Customer,City\nJosÃ© NÃºÃ±ez,MÃ¡laga\n".encode("utf-8"),
    "no-header.csv": "Lee,10.50,Open\nMorgan,1250.00,Hold\n".encode("utf-8"),
    "ragged.csv": "Customer,Amount,Status\nLee,,Open\nMorgan,1250.00\nKim,0.75,Open,extra\n".encode("utf-8"),
    "sample.tsv": "Customer\tAmount\tStatus\nLee\t10.50\tOpen\nMorgan\t1250.00\tHold\n".encode("utf-8"),
}


def main() -> None:
    record = {}
    for name, data in FILES.items():
        (HERE / name).write_bytes(data)
        record[name] = {"bytes": len(data), "sha256": hashlib.sha256(data).hexdigest()}
    (HERE / "inputs.json").write_text(json.dumps({"label": "Synthetic delimited files; invented names and amounts", "files": record}, indent=2, ensure_ascii=False) + "\n")
    print(len(record), "files")


if __name__ == "__main__":
    main()
