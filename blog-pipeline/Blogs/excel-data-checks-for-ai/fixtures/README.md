# M03 fixture record (shared with M03-S1, S2, S3)

**Synthetic only.** Invented customers, IDs and amounts. Generator: `make_fixture.py` (openpyxl, then LibreOffice headless save so formulas carry cached results).

| File | SHA-256 | Note |
| --- | --- | --- |
| field-orders-src.xlsx | 28fcb41cd71310aa0c27e8168be284f6c6551d82276add38575760394b2012f3 | As typed by openpyxl: formulas without cached results |
| field-orders.xlsx | fa0ba90c0ef1f146fd9241909dcae09123132650061ebf2cc1e6261a9a9bec8f | Saved by LibreOffice: cached results present, sheets Read me / Orders / Q3 old (hidden) |
| probe-text-ids/text-ids.xlsx | cf19c21f69cd79ae551e67504960417bca97b5965413c28ea38dda26d2cc3f9c | Account and Zip stored as text with leading zeros |
| probe-text-ids/text-ids.csv | 183c3f5a99ab07606bf59a8c2db55b98986eff3e16dbe4150de0fef488d8176d | Same data as CSV (identical to the LibreOffice CSV export of the xlsx) |

## Runs (2026-11-08, local code-level runs of backendN NormalConverter with markitdown 0.1.9 and the repository's sheet-wise Excel converter)

| Input | Output | Observed |
| --- | --- | --- |
| field-orders.xlsx | out/field-orders.Standard.md | Three `##` sheet sections in workbook order, hidden Q3 old included. Read me title became the only header. Orders: text "00123" kept (mixed column), number 123 with format 00000 output as 123, long ID shown by Excel as 4012345678901230000 output as 4012345678901230080, dates as 2026-03-04, Qty 12.0, $1,250.00 as 1250.00, cached Amount values 126.00 / 3750.00 / 0.75, Total 3876.75, merged Region second row NaN, blank row NaN/NaT, tax rate 0.075, chart absent. Q3 old IDs "00123" (text) output as 123 |
| field-orders-src.xlsx | out-src/ | Same, except every formula cell (Amount column and Total) is NaN |
| probe-text-ids/text-ids.xlsx | probe-text-ids/out-xlsx/ | All-text Account and Zip columns lost leading zeros: 123, 456, 1789 and 2134, 7030, 10001 |
| probe-text-ids/text-ids.csv | probe-text-ids/out-csv/ | Zeros kept: 00123, 02134 |

## Interpretation and limits

- The all-text column loss follows from pandas `read_excel` type inference in the sheet-wise converter (`backendN/app/excel_converter.py` calls `workbook.parse(sheet_name=name)` with defaults). A column mixing text and numbers stays text.
- The long-ID digits differ because the stored double is printed through float64 formatting.
- LibreOffice 7.x saved the fixture, not Microsoft Excel. Cached-value behavior is the same file feature, but this is not an Excel-saved file.
- Not a live production conversion.
