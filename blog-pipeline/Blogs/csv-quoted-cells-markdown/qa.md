# M06-S1 QA log

Status: DRAFTED, READY_FOR_REVIEW. draft: true. Title: registry proposal kept.

| Command (2026-11-09) | Result |
| --- | --- |
| make_quotes.py, row_widths.py, llmiser_local.py doc x5 | Five files converted and counted |
| check-private.mjs csv-quoted-cells-markdown | PASS after removing one banned phrase ("not only"): 0 errors, about 1,500 words, intro 78, H2 openers 37 to 39 |
| preview.mjs csv-quoted-cells-markdown | 0 geometry issues |

Distinctness: parent compares quoted with unquoted; this support covers three subtler quoting failures, the empty-column signal, row counts, line breaks, pipes and a field-count script. Product observation for the owner: a single malformed record widens the whole converted table with an unnamed column, and an unclosed quote silently merges records.
