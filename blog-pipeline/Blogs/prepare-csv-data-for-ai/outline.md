# M06 outline (final, as drafted 2026-11-08)

Title (owner-selected, exact): 7 Ways to Prepare Cleaner CSV Data for AI
1. TL;DR, intro (76 words)
2. H2 How LLMiser reads a CSV (figure csv-pipeline)
3. H2 1. Identify the delimiter (semicolon split; .tsv raw text)
4. H2 2. Quote separators inside cells (RFC 4180; figure quoting-comparison)
5. H2 3. Check text encoding (figure encoding-results)
6. H2 4. Give columns meaningful headers
7. H2 5. Make units and data types explicit (CSV keeps zeros, cross-reference to the workbook test)
8. H2 6. Inspect missing fields and row shape
9. H2 7. Test a small conversion sample (figure csv-checklist, /usecase, E08)
10. FAQ (6), CTA
Exclusions: workbook semantics (M03); S1/S2/S3 deep dives.
