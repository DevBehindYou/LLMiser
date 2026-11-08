# M03 QA log

Status: DRAFTED, READY_FOR_REVIEW. draft: true. Not published.

| Command (2026-11-08) | Result |
| --- | --- |
| render-private.mjs excel-data-checks-for-ai | banner + 4 figures |
| check-private.mjs excel-data-checks-for-ai | PASS after fixing 8 semicolons in two alt texts and one long sentence. 1,727 words, intro 81, H2 openers 27 to 40, 7 of 7 items |
| preview.mjs excel-data-checks-for-ai | 0 geometry issues; one subtext fix |

Remaining warning: one rhythm warning (three similar-length sentences in "What the test workbook held"), kept.

## Editorial review

- Exact selected title, 7 items, M06 boundary respected (CSV only as a tested workaround).
- C14 is PARTIAL: colors, comments and pictures were not separately tested; wording says they "don't come through as cell values", which follows from the value-only path. Owner may ask for a fixture.
- Research: M03-specific SERP capture still pending (logged in research.md).

## Product observation for the owner

LLMiser's Excel conversion drops leading zeros from text-stored ID columns when every value in the column looks numeric (pandas type inference in `excel_converter.py`). ZIP codes and account numbers are exposed. CSV conversion of the same data keeps them. Reported for a possible fix (for example reading cells as stored text); not changed here.
