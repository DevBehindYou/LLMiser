# M03-S2 QA log

Status: DRAFTED, READY_FOR_REVIEW. draft: true. Title: registry proposal kept.

| Command (2026-11-09) | Result |
| --- | --- |
| make_order.py, recalc_save.py, llmiser_local.py doc x5 | Five states converted |
| check-private.mjs excel-formula-results-conversion | PASS: 0 errors, 1,475 words, intro 73, H2 openers 38 to 41; warnings: sentence rhythm, draft flag |
| preview.mjs excel-formula-results-conversion | 0 geometry issues |

Distinctness: parent covers saved versus absent results in one paragraph; this support adds stale results, re-save and forced recalculation, NaN ambiguity, TODAY() and the reviewed-copy procedure. Product observations for the owner: Excel error values (#N/A, #DIV/0!) and empty cells all convert to "NaN"; numeric columns share decimal places (12.000 next to 0.075).
