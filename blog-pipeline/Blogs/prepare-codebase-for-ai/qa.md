# M01 QA log

Draft: `draft.md` dated 2026-11-08, draft: true. Status: DRAFTED, READY_FOR_REVIEW for editorial review. Not published, not indexed, no live conversion.

## Commands and results (2026-11-08, from the repository root)

| Command | Result |
| --- | --- |
| `node blog-pipeline/scripts/campaign/render-private.mjs prepare-codebase-for-ai` | banner 1200x400 and 4 figures written to Blogs/prepare-codebase-for-ai/visuals/, inspectSvg clean |
| `node blog-pipeline/scripts/campaign/check-private.mjs prepare-codebase-for-ai` | PASS (private adapter), 0 errors. 1,985 words by the app counter, intro 100 words, H2 openers 33 to 38 words, 7 of 7 numbered items, 7 links (3 external) |
| `node blog-pipeline/scripts/campaign/preview.mjs prepare-codebase-for-ai` | 5 SVGs, 0 geometry issues after two fixes, all three brand fonts loaded |
| Fixture runs | See fixtures/README.md: test fails for the planted bug, archive and OCR runs recorded with hashes |
| `grep -n "FAKE\|example.com\|203.0.113" fixtures/out-original/combined.md` | 9 matching lines: 4 credential lines (one from the nested backup), 2 customer rows, 3 more email lines. Same grep on out-sharing: 0 |

The adapter runs the pipeline's own checkArticle and the app's collectVisuals and inspectSvg. It only resolves visuals from the private staging folder. It is not production validation: blog:index, blog:check, lint, build and rendered-route checks belong to a release task.

## Remaining warnings and decisions

- "Description does not contain the primary keyword": the registry phrase "prepare codebase for AI" reads ungrammatically in a sentence. The description says "Prepare a codebase for AI review". Kept for readability. Owner may override.
- "draft: true": intended for a private draft.
- Primary keyword intent is mixed in the single observation available (research.md). Kept as reserved. Revisit with Search Console data after release (R05, R08).

## Editorial review

- Exact selected title: yes. Seven numbered items: yes.
- No em dashes, no prose semicolons, no banned vocabulary (checker).
- Claims: every LLMiser behavior claim maps to code (claims.json VERIFIED_CODE) or the local fixture run (VERIFIED_LOCAL_RUN). No savings percentages, no secret-detection or deletion promises.
- Overlap: M10 boundary respected (one short paragraph on the skipped list, no field explanations). Supports S1/S2/S3 own the detailed procedures, and their links wait in links.json.
- Unsupported aside removed during QA ("record paths and usernames").
- Limit wording corrected during QA: 100 MB unpacked is an entry-conversion stop, not an upload rejection.

## Campaign-wide observation found while building QA tooling

The published E08 figure `frontend/public/blog/document-to-llm-pipeline/naive-vs-pipeline.svg` has two sub-labels ("every page, every time" and "drop headers, footers") that spill past their boxes. Detected by the new preview geometry check and visible in its render. Not edited: the existing articles are out of scope for this assignment. Logged for the owner.
