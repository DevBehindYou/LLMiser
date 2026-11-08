# M06 research: prepare-csv-data-for-ai

Researched 2026-11-08. Same access limits as M01. Web search: Claude Code WebSearch tool, provider unspecified, US.

## Query observation

| Query | Observed result URLs (selection, returned order) | Observed intent |
| --- | --- | --- |
| `clean CSV before uploading to ChatGPT delimiter encoding UTF-8 header row tips` | dev.to/ali_zaib_randhawa/stop-uploading-your-csv-files-to-random-tools-...; theydo.com/help-center/.../how-to-clean-up-csv-files-for-ai; trendstackai.pages.dev/topics/csv-encoding-and-delimiter-fix.html; datastudios.org/post/can-chatgpt-analyze-csv-files-...; findanomaly.ai/recover-when-csv-upload-fails; developers.openai.com/ja-JP/use-cases/clean-messy-data; instanttexttools.pages.dev/guides/clean-csv-files-before-uploading | Practical CSV cleanup: delimiter mismatch, UTF-8 versus Windows-1252, BOM handling, one header row, sample test, row counts. Mostly tool vendors and help centers. |

Conclusion: the observed intent matches the seven-item outline. The fixture adds converter-specific facts the observed pages can't: LLMiser reads only commas, guesses encoding, handles a BOM correctly, and doesn't table-ize .tsv.

## Primary sources (read 2026-11-08)

- RFC 4180: rule 6 "Fields containing line breaks (CRLF), double quotes, and commas should be enclosed in double-quotes"; rule 7 doubled quotes; rule 3 optional header line that "should contain the same number of fields as the records" in the rest of the file.
- Python csv docs: "The excel class defines the usual properties of an Excel-generated CSV" (the default dialect; comma delimiter). Background for the comma-only behavior, not cited in prose.

## Product facts (233ac21)

- `backendN/app/csv_converter.py`: `csv.reader(source)` default dialect; first non-empty row is the header; rows padded to the widest row; charset detection when no charset is supplied; BOM stripped.
- `frontend/lib/formats.js`: csv and tsv accepted; 15 MB.
