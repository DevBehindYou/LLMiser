# M03 source ledger

| ID | Source | Type | Checked passage or evidence | Used for |
| --- | --- | --- | --- | --- |
| S-MS-ZEROS | [Microsoft Support: Keeping leading zeros and large numbers](https://support.microsoft.com/en-us/excel/keeping-leading-zeros-and-large-numbers) (campaign SRC-EXCEL), retrieved 2026-11-08 | Official documentation | "Excel has a maximum precision of 15 significant digits ... any numbers past the 15th digit are rounded down to zero ... you must use a text format." | C06 |
| S-CODE-XLSX | `backendN/app/excel_converter.py` | Repository code | Per-sheet loop over `workbook.sheet_names`, `## {name}` heading, `frame.to_html(index=False)` | C01, C02 |
| S-CODE-CSV | `backendN/app/csv_converter.py` | Repository code | `csv.reader` rows as strings | C08 |
| S-CODE-FORMATS | `frontend/lib/formats.js` | Repository code | xlsx and xls in NORMAL_EXTENSIONS; 15 MB | FAQ 6 |
| F-M03 | fixtures/ (README.md), local runs 2026-11-08 | Original fixture, LOCAL CODE-LEVEL RUN | outputs in out/, out-src/, probe-text-ids/ | C02 to C05, C07 to C14 |
