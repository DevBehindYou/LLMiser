# M10 QA log

Status: DRAFTED, READY_FOR_REVIEW. draft: true. Not published.

| Command (2026-11-08) | Result |
| --- | --- |
| render-private.mjs llmiser-zip-index-manifest | banner + 4 figures |
| check-private.mjs llmiser-zip-index-manifest | PASS after fixing a quoted British spelling (product label paraphrased) and one long sentence. 1,468 words, intro 87, H2 openers 31 to 40 |
| preview.mjs llmiser-zip-index-manifest | 0 geometry issues |

Editorial review: exact title. A mistaken internal link (sharing-copy advice pointed at the E08 pipeline guide) was removed; the M01 link waits in links.json. Engine-name values in the real index and manifest are not reproduced (house rule).

## Product observations for the owner

- PROJECT_INDEX.md counts an image with no recognised text as converted and includes it in "Text recognised in images".
- Case-insensitive duplicates are dropped even when content differs (README.md versus readme.md).
- The index and manifest values, and the Standard source note for ZIP results ("LLMiser Archive + ..."), expose third-party engine names to users, which the blog rules avoid. Owner may decide whether that matters.
- Product labels use British spelling ("recognised") while the blog standard is US English.
