> This is the historical validation record. See [current campaign validation](../campaign/VALIDATION.md) for the selected 12/36/108 plan.

# Planning-pack validation

Verified 4 November 2026 against source baseline `8eb8c5091e1b370ebf7ed9631621d07226960b7a` on main. Scope: private editorial workspace only.

| Check actually run | Result |
| --- | --- |
| `node blog-pipeline/scripts/validate-plan.mjs --preservation` | PASS: 20 owners, 8 existing articles, 10 briefs, 60 archive decisions |
| Preservation SHA-256 comparison | PASS: 60 files unchanged: 8 articles + content README, 48 SVGs, 3 existing checker/visual scripts |
| `node --test blog-pipeline/scripts/validate-plan.test.mjs` | PASS: 5 tests, including duplicate alias/intent, tracking canonical, false metric and invalid metadata/parent rejection |
| Active Markdown local-link scan | PASS: 31 documents, 78 relative links at scan time |
| Active Markdown encoding scan | PASS: no replacement or surrogate characters |
| `npm run blog:check` in frontend | PASS: published generated index remains current |
| `git status --short` and `git diff --stat` | Empty: no tracked app/blog changes |
| `git check-ignore` on README and registry | Confirms private pipeline stays ignored |

The validator reports the existing “LLM cost optimization” term overlap and six open reviews. Those are deliberate visible review items, not silently resolved. Structural uniqueness does not establish semantic or live-search uniqueness.

Not run or claimed: new document conversion tests, article/visual drafts, new public build/deployment, live SERP positions, Search Console/Bing account data, paid keyword exports, direct AI-answer audits or social publishing. No application build was needed for private documentation and standalone guardrail changes; the existing blog-index integrity check passed.

Historical guidance was copied before replacement to `../history/2026-11-04-before-roadmap/`. Input names and hashes are in [input-provenance.json](input-provenance.json). Existing article and visual hashes are in [preservation-baseline.json](preservation-baseline.json).

Next verification belongs to the S01 author: fresh source/intent research, actual fixture inspection and article/visual gates. Update only relevant records rather than regenerating this pack.
