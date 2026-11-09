# M03-S2 research: excel-formula-results-conversion

Researched 2026-11-09. Same access limits as M01 (named search engines blocked; metrics UNMEASURED). SERP capture PENDING (R05). One lookup with the unspecified-provider web search tool (restricted to support.microsoft.com) to find the Show Formulas page; the page itself was then fetched and read.

Reader question: what evidence shows whether formula results are current. Parent M03 reports saved results versus a script-written file (NaN). This support adds a stale state, a re-save test, a forced recalculation, error values, a TODAY() cell and the reviewed-copy procedure.

Sources read:
- Microsoft Support, "Show and print formulas" (fetched 2026-11-09, page date 2026-07-24): Ctrl+` and Formulas > Show Formulas.
- Microsoft Support, "Change formula recalculation, iteration, or precision in Excel" (fetched 2026-11-09, page date 2026-06-22): Manual mode turns on "Recalculate workbook before saving", which can be cleared; Ctrl+Alt+F9 checks dependent formulas and recalculates all formulas in all open workbooks.

Product facts: the sheet-wise Excel converter parses saved cell values (no recalculation path in backendN/app/excel_converter.py); confirmed by the stale run.

Boundary: never claim the converter recalculates; record the app and provenance of each saved state.
