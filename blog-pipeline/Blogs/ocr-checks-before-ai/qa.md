# M02 QA log

Status: DRAFTED, READY_FOR_REVIEW. draft: true. Not published, not indexed, no live conversion.

| Command (2026-11-08) | Result |
| --- | --- |
| `render-private.mjs ocr-checks-before-ai` | banner + 4 figures, inspectSvg clean |
| `check-private.mjs ocr-checks-before-ai` | PASS (private adapter): 0 errors, 1,991 words, intro 83 words, H2 openers 32 to 39 words, 9 of 9 items |
| `preview.mjs ocr-checks-before-ai` | 0 geometry issues; three rounds of visual fixes recorded in visual-ledger.md |
| Fixture runs | fixtures/README.md (5 inputs, 5 runs, hashes and expected versus observed) |

Remaining warnings: one rhythm warning caused by the quoted "40. 50" splitting a sentence in the checker (artifact, kept); draft: true (intended).

## Editorial review

- Exact selected title, 9 numbered items.
- No external links: all factual claims rest on LLMiser code or the local fixture. Engine documentation is background only (house rule against naming engines).
- No accuracy rates, no claim that LLMiser corrects text. Rotation result reported as one sample.
- Handwriting and non-English claims were softened during QA to "not tested" and "configured for English printed text".
- E06/E07 boundary: no cost or format-comparison claims.

## Product observation for the owner

In a PDF that mixes scanned and text pages, a blank page that ends up in its own native run adds "_No extractable text found in this document._" to the merged output (code path: `pdf_tasks.analyze` converts the run, `NormalConverter.convert` returns the placeholder, `merge` appends it). Readers can mistake it for a whole-file failure. Reported here and as a suggested follow-up task. Not changed: app code is out of scope.
