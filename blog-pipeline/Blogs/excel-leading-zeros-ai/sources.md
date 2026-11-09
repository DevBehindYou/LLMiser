# M03-S1 source ledger

| ID | Source | Type | Evidence | Used for |
| --- | --- | --- | --- | --- |
| S-MS-ZEROS | https://support.microsoft.com/en-us/excel/keeping-leading-zeros-and-large-numbers | Vendor documentation (linked) | 15 significant digits; Text format or apostrophe | C07 |
| S-MS-CSV | https://support.microsoft.com/en-us/excel/get-started/import-or-export-text-txt-or-csv-files | Vendor documentation (linked) | Only the current worksheet is saved; import wizard to preserve leading zeros | C08 |
| S-CODE-XLSX | `backendN/app/excel_converter.py` | Repository code | Default per-sheet parsing | C05 |
| F-M03S1 | fixtures/out-ids-xlsx, out-ids-export-csv | LOCAL CODE-LEVEL RUN | Ten-column comparison, two routes | C01 to C04, C06 |
