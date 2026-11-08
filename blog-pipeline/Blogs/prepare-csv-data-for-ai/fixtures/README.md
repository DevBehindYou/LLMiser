# M06 fixture record (shared with M06-S1, S2, S3)

**Synthetic only.** Invented names, cities and amounts. Generator: `make_fixture.py` (utf8.csv and utf8-bom.csv added in a second step; hashes in inputs.json).

| File | SHA-256 |
| --- | --- |
| semicolon.csv | 9f0dc5ac672b02a56c6d45a3a7ade3c3c5adb4fa58a2fdad48edac6e34107535 |
| quoted.csv | 8e99a2738608ae0908a840929bb64b4043d02265376b6981bac9e5fd686e83d2 |
| unquoted.csv | 5961dcaca4a9e32e79c94a5c90197ae09dbf55c24234895dcdcfc489d4b4c774 |
| legacy-1252.csv | ee9200f8e23f5ad59f9ef877edf8b63d3fee1560233cc33ceae29a9c179e8285 |
| mojibake.csv | 23b7203dd4f16f3932f9cecc93650f23f0f2d1fdac8595a1084f8983549d8b82 |
| no-header.csv | 770d0d769f74c59732017447a5d7da37f43ff27cec1220c2247548a9471c05ad |
| ragged.csv | a9488aa98e957c13da679740276039f6ea7c27d1e9df290d547679476c287751 |
| sample.tsv | 3d797604913a081f163a873b9af873cdf8d14aa214d84586537604daa91bfac0 |
| utf8.csv | 938d0e4184ad3c3ba8000ba2271d412c3bfd8a280a45626bd41174740c641173 |
| utf8-bom.csv | 81dea53707c9996d8d7a1149119ae0c0f3785a342cfcc5c64d0ba61aa1326102 |

## Runs (2026-11-08, local code-level runs of backendN NormalConverter with the repository's row-streaming CSV converter, markitdown 0.1.9)

| Input | Observed output |
| --- | --- |
| semicolon.csv | Two columns: header cell "Customer;Amount;City" plus an empty one; rows "Lee;10" / "50;Köln" |
| quoted.csv | Correct: "Paid, then refunded" in one cell, Said "urgent", embedded newline joined as "Line one Line two" |
| unquoted.csv | Four columns, empty fourth header; Lee row: Paid / " then refunded" / 10.50 |
| legacy-1252.csv | Misdecoded: "Josķ N·±ez", "Mßlaga", "Zoļ M³ller", "Z³rich" |
| mojibake.csv | Valid UTF-8 containing "JosÃ©" detected as another encoding: "Jos횄짤 N횄쨘횄짹ez" |
| utf8.csv, utf8-bom.csv | Correct: "José Núñez", "Zürich" |
| no-header.csv | First record became the header (Lee / 10.50 / Open) |
| ragged.csv | Blank middle cell blank; short row padded; extra field added an unnamed fourth column |
| sample.tsv | Raw tab-separated text, not a Markdown table |

Encoding detection uses the charset detector bundled with MarkItDown (`from_bytes(...).best()`) when no charset is supplied. Limits: local runs, one file per case. Not a live production conversion.
