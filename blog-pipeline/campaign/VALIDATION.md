# Selected campaign validation

Verified 5 November 2026. Scope: private planning artifacts, not article performance or production conversion behavior.

| Check | Result |
| --- | --- |
| Plan validator with --preservation | PASS: 58 owners, 48 planned article briefs, 60 historical archive decisions |
| Campaign hierarchy | PASS: 12 mains, 36 supports, 108 individual post briefs; exactly 3 children at each requested level |
| Exact selected titles | PASS: all 12 match the user's choices; 39–53 characters |
| Category allocation | PASS: 6 listicles, 4 product guides, 2 miscellaneous AI topics |
| Metadata and ownership | PASS: canonical URL, title, primary keyword and explicit alias uniqueness; descriptions at most 170 characters |
| Regression tests | PASS: 10/10, including removed post, changed selected title, reparented support and wrong destination |
| Preservation | PASS: 60 existing article/asset/tool SHA-256 hashes unchanged |
| Existing blog index | PASS: npm run blog:check |
| Editorial tracker | PASS: 156 unique asset rows, existing brief paths and no published URL claims |
| Source references | PASS: every post source ID resolves in sources.json |
| Active Markdown links | PASS: relative file targets exist in campaign, handovers and active entry documents |
| Git state | No tracked changes; private blog-pipeline remains ignored |

The original ten S-series briefs are preserved in history and point to current owners. Historical research retains its original dates and limitations.

## Limits and remaining review

These results verify planning structure and preservation. They do not establish search volume, ranking, indexing, model citations, final draft quality, original fixture outcomes, accessibility of future visuals, or zero future keyword cannibalization. R01–R08 remain open where semantic or search evidence is required. No live conversion, new article publication or social posting was performed.

The 108 post briefs have individual hooks, outlines, evidence requirements and visual plans. They are not finished platform copy. The 48 articles have briefs, not completed prose. Named-engine query links are generated research aids, not executed SERP observations.

Next: M01 research and a safe toy codebase fixture, followed by drafting within the selected seven-item outline. See ../handover/NEXT_AGENT.md.
