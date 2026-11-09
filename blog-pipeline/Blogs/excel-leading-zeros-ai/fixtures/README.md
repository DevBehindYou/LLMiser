# M03-S1 fixture record

**Synthetic only.** Invented account, member and reference numbers (no payment-card or provider formats), phone numbers in an invented 0412 555 0xx pattern. Generator: `make_ids.py` (openpyxl, then LibreOffice Calc headless re-save so the TEXT formulas carry cached results, then LibreOffice CSV export). Expected values: `ids-truth.json`.

| File | SHA-256 | Note |
| --- | --- | --- |
| ids-src.xlsx | see ids-truth.json | As written by openpyxl (formulas without cached results) |
| ids.xlsx | see ids-truth.json | Re-saved by LibreOffice Calc: the converted input |
| ids-export.csv | see ids-truth.json | LibreOffice CSV export of ids.xlsx (filter options 44,34,76,1: comma, double quote, UTF-8, values as displayed) |

Sheet "Customers": Account (Text format, digits only), Account_blank (same with one blank), SKU (digits and letters), Formatted (numbers with format 00000), Text_formula (=TEXT(D,"00000")), Member_16 and Ref_20 (text), Phone (text with spaces), Qty (numbers), Unit_price (numbers, currency format).

## Runs (2026-11-09T08:06Z, revision 4b16c07, application code identical to 8eb8c509)

`scripts/campaign/llmiser_local.py doc ids.xlsx out-ids-xlsx` and `doc ids-export.csv out-ids-export-csv`: LOCAL CODE-LEVEL RUNS of backendN NormalConverter (repository sheet-wise Excel converter, CSV converter) with markitdown 0.1.9, Standard profile. Outputs `out-ids-xlsx/ids.Standard.md` (SHA-256 89762a06...) and `out-ids-export-csv/ids-export.Standard.md` (SHA-256 36dfbbcc...).

## Expected versus observed

| Column | In the sheet | Workbook route | CSV route |
| --- | --- | --- | --- |
| Account | 00123, 00456, 01789, 10001 (text) | 123, 456, 1789, 10001 | 00123, 00456, 01789, 10001 |
| Account_blank | 00123, blank, 01789, 10001 | 123.0, NaN, 1789.0, 10001.0 | 00123, empty, 01789, 10001 |
| SKU | 00123, A-0456, 01789, B-1001 | unchanged | unchanged |
| Formatted | 123 shown as 00123 | 123, 456, 1789, 10001 | 00123, 00456, 01789, 10001 |
| Text_formula | "00123" (cached text) | 123, 456, 1789, 10001 | 00123 ... |
| Member_16 | 0099123400005679 and three 99... IDs | 99123400005679; others exact | all exact |
| Ref_20 | 00991234000056790002 and three 99... IDs | 991234000056790002; others exact | all exact |
| Phone | 0412 555 018 ... | unchanged | unchanged |
| Qty | 12, 3, 1, 40 | unchanged | unchanged |
| Unit_price | $10.50, $1,250.00 ... | 10.50, 1250.00, 0.75, 2.40 | $10.50, $1,250.00 ... |

Interpretation: the Excel converter parses each sheet with default type inference (`workbook.parse(sheet_name=name)` in `backendN/app/excel_converter.py`). A column whose filled cells all look numeric is read as numbers regardless of the cell's Text format; one blank makes the column floating point (".0", "NaN"). A column with any non-numeric value stays text.

## Limits

One synthetic workbook, saved and exported by LibreOffice Calc, not Microsoft Excel. Whether Excel's CSV export writes formatted values the same way was not tested; the article says so. Not a live production conversion.
