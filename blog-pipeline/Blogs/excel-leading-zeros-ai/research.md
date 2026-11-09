# M03-S1 research: excel-leading-zeros-ai

Researched 2026-11-09. Same access limits as M01 (named search engines blocked; metrics UNMEASURED). SERP capture PENDING (R05).

Reader question: how to distinguish identifiers from numeric quantities. Parent M03 reports the ZIP-code column, the formatted number and the 19-digit rounding inside a seven-check list. This support adds the identifier-versus-quantity sort, the formula bar inspection, a ten-column storage matrix (including a TEXT formula, a blank cell and 16 and 20-digit text IDs) and a tested CSV route.

Sources read:
- Microsoft Support, "Keeping leading zeros and large numbers" (read for M03, 2026-11-08): Excel keeps 15 significant digits; format as Text before typing or prefix an apostrophe.
- Microsoft Support, "Import or export text (.txt or .csv) files" (fetched 2026-11-09, page date 2026-06-25): Save As text saves only the current worksheet, repeat per sheet; the Import Text Wizard can convert a column of numbers with leading zeros to text to preserve them.

Product facts (backendN/app/excel_converter.py at 4b16c07): sheet-wise conversion with default parsing; output tables via HTML then Markdown.

Boundary: formatting versus stored values; no claim that conversion restores digits lost at entry.
