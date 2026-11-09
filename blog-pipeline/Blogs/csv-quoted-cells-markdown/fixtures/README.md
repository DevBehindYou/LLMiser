# M06-S1 fixture record

**Synthetic only.** Invented customers and notes. Generator: `make_quotes.py` (bytes written exactly, UTF-8, CRLF). Expected records and hashes: `quote-files.json`. Field counter: `row_widths.py` (report saved as `row-widths.txt`).

| File | SHA-256 (prefix) | Quoting |
| --- | --- | --- |
| rfc.csv | 1116d120c08b70b2 | RFC 4180: comma, doubled quotes, line break and pipe inside quoted cells |
| space-before.csv | 538e669ebaf70868 | Same with a space after each comma, before the opening quote |
| backslash.csv | ae5714a3405bef8c | Inner quotes escaped as \" |
| unclosed.csv | 6b8b3d3f28b2ee8a | Lee's note missing its closing quote |
| unquoted.csv | 8bd4f69494d0c7fe | No quoting |

## Runs (2026-11-09T08:43Z, revision ea2af54, application code identical to 8eb8c509)

`llmiser_local.py doc {file}.csv out-{file}`: LOCAL CODE-LEVEL RUNS of backendN NormalConverter with the repository's RowStreamingCsvConverter (markitdown 0.1.9 cell escaping), Standard profile.

## Expected versus observed

Expected for every file: 4 data rows, 3 columns, cells as in quote-files.json.

| File | Data rows | Columns | Observed |
| --- | --- | --- | --- |
| rfc | 4 | 3 | exact; line break became a space ("Line one Line two"); pipe escaped as `\|` |
| space-before | 5 | 4 | quote marks inside cells, notes split, "Line two\"" in Customer, empty fourth header |
| backslash | 4 | 4 | Morgan's note split into `Said \urgent\"` and ` twice"`; whole table gained a fourth column |
| unclosed | 3 | 4 | Lee's note swallowed Morgan's record ("Paid, then refunded,10.50 Morgan,Said ""urgent"""); Morgan has no row |
| unquoted | 5 | 4 | notes split; "Line two" in Customer |

Code: comma-only csv.reader with default dialect; table width is the widest record, shorter records padded with empty cells; cells escaped by the upstream helper (pipes to `\|`, CR/LF to a single space).

## Limits

Hand-written synthetic files, one table. Not a live production conversion.
