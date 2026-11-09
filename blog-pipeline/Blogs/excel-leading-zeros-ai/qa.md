# M03-S1 QA log

Status: DRAFTED, READY_FOR_REVIEW. draft: true. Title: registry proposal kept.

| Command (2026-11-09) | Result |
| --- | --- |
| make_ids.py, llmiser_local.py doc (xlsx and csv) | Ten columns compared through two routes |
| check-private.mjs excel-leading-zeros-ai | PASS: 0 errors, 1,591 words, intro 85, H2 openers 30 to 37; warnings: long sentences, draft flag |
| preview.mjs excel-leading-zeros-ai | 0 geometry issues |

Keyword: the registry phrase "Excel leading zeros AI" is used as "the Excel leading zeros AI models need" in the intro and description, which reads naturally and satisfies the bolding check.

Safety: first fixture draft used published test card numbers for the 16-digit column; replaced with invented member IDs before any run was recorded.

Distinctness: parent lists leading zeros as one of seven checks; this support adds the storage matrix, the blank-cell effect, the formula bar method and the CSV route with its cautions. Product observation for the owner: Text-formatted digit-only columns lose zeros and a single blank turns IDs into decimals with "NaN" (default type inference in the Excel converter).
