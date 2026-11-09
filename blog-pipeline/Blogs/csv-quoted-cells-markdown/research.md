# M06-S1 research: csv-quoted-cells-markdown

Researched 2026-11-09. Same access limits as M01 (named search engines blocked; metrics UNMEASURED). SERP capture PENDING (R05).

Reader question: how to verify that quoted separators remain inside a cell. Parent M06 compares one quoted and one unquoted file. This support adds three realistic quoting mistakes (space before quote, backslash escapes, an unclosed quote), the pipe escape, the line-break rule, the width-padding signal and a field-count script.

Sources read:
- RFC 4180 (read for M06, www.rfc-editor.org): fields containing commas, double quotes or line breaks are enclosed in double quotes; a double quote inside is escaped by another double quote.

Product facts (backendN/app/csv_converter.py at ea2af54): comma-only csv.reader, width = widest record with padding, upstream `_escape_table_cell` for pipes and line breaks.

Boundary: delimiter detection and encoding are parent and sibling topics (M06, M06-S2).
