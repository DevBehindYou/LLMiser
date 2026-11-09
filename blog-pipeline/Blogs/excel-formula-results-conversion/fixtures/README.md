# M03-S2 fixture record

**Synthetic only.** Invented order lines. Generators: `make_order.py` (openpyxl, LibreOffice Calc headless saves, one XML-level input edit) and `recalc_save.py` (LibreOffice re-save with OOXMLRecalcMode 0, "always recalculate", in a throwaway profile). Hashes: `order-files.json`.

| File | SHA-256 (prefix) | State |
| --- | --- | --- |
| order-script.xlsx | dc23a4401c9b8190 | Written by openpyxl: formulas without saved results |
| order-saved.xlsx | c077d36b2141f54b | Saved by LibreOffice Calc: saved results present and current |
| order-stale.xlsx | 45b1e045d9feb7d6 | order-saved.xlsx with B2 (Gasket Qty) changed 12 to 20 in sheet1.xml, saved results untouched |
| order-resaved.xlsx | 86f04eea822ab905 | order-stale.xlsx re-saved by LibreOffice Calc with default settings |
| order-recalculated.xlsx | f7c61fbca35008ce | order-stale.xlsx re-saved by LibreOffice Calc set to recalculate on load |

Formulas: D2:D4 =B*C, D5 =SUM(D2:D4), D6 =ROUND(D5*B6,2), D7 =D5+D6, D9 =VLOOKUP("Gasket XL",A2:C4,3,FALSE) (#N/A), D10 =D2/B10 with B10 empty (#DIV/0!), D11 =TODAY()-DATE(2026,10,1) (39 on 2026-11-09). Row 8 is empty.

## Runs (2026-11-09T08:12Z, revision 088bc83, application code identical to 8eb8c509)

`scripts/campaign/llmiser_local.py doc order-{state}.xlsx out-{state}`: LOCAL CODE-LEVEL RUNS of backendN NormalConverter (sheet-wise Excel converter), markitdown 0.1.9, Standard profile.

## Expected versus observed

| State | Gasket Qty | Amount D2 | Total | Tax | Grand total | #N/A, #DIV/0!, empty row | Days since |
| --- | --- | --- | --- | --- | --- | --- | --- |
| script | 12.000 | NaN | NaN | NaN | NaN | NaN | NaN |
| saved | 12.000 | 126.00 | 3876.75 | 290.76 | 4167.51 | NaN | 39.00 |
| stale | 20.000 | 126.00 | 3876.75 | 290.76 | 4167.51 | NaN | 39.00 |
| resaved (defaults) | 20.000 | 126.00 | 3876.75 | 290.76 | 4167.51 | NaN | 39.00 |
| recalculated | 20.000 | 210.00 | 3960.75 | 297.06 | 4257.81 | NaN | 39.00 |

Expected for a current file with Qty 20: 210.00 / 3960.75 / 297.06 / 4257.81 (matches the recalculated state). Quantities print with three decimals in every state, the same as the 0.075 tax rate in column B.

## Limits

LibreOffice Calc (headless, default profile) did the app saves, not Microsoft Excel; Excel's behavior on re-save was not tested and the article does not claim it. The stale state was made by editing the file directly, as a template-filling tool might; it is labeled as constructed. Not a live production conversion.
