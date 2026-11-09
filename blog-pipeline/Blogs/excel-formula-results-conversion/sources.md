# M03-S2 source ledger

| ID | Source | Type | Evidence | Used for |
| --- | --- | --- | --- | --- |
| S-MS-SHOWF | https://support.microsoft.com/en-us/excel/show-and-print-formulas | Vendor documentation (linked) | Ctrl+` and Show Formulas | C01 |
| S-MS-RECALC | https://support.microsoft.com/en-us/excel/change-formula-recalculation-iteration-or-precision-in-excel | Vendor documentation (linked) | Manual mode, Recalculate before saving, Ctrl+Alt+F9 | C04, C05 |
| S-CODE-XLSX | `backendN/app/excel_converter.py` | Repository code | Parses saved values, no recalculation | C02 |
| F-M03S2 | fixtures/out-script, out-saved, out-stale, out-resaved, out-recalculated | LOCAL CODE-LEVEL RUN | Five-state comparison | C02, C03, C06 to C08 |
