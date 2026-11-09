# M03-S3 research: merged-excel-headers-markdown

Researched 2026-11-09. Same access limits as M01 (named search engines blocked; metrics UNMEASURED). SERP capture PENDING (R05).

Reader question: how to make multi-level spreadsheet labels unambiguous. Parent M03 covers merged data cells and blank rows (NaN, NaT) and mentions that only one header row survives. This support adds a two-level header fixture, two flattened copies and a value-by-value meaning check.

Background: GitHub Flavored Markdown tables have exactly one header row (read for M05/M06 via github.github.com/gfm). Product facts: the sheet-wise Excel converter parses each sheet with the first row as header (backendN/app/excel_converter.py, default `workbook.parse`), so a header cell left empty by a merge gets a placeholder name ("Unnamed: N", N counted from zero, observed).

Boundary: no automatic merged-cell repair claimed; manual flattening checked against the original values.
