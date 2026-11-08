# Draft-to-publication gates

This pack creates local plans. Nothing here schedules external posts or makes drafts public. Later article work follows its active task authorization and the gates below.

## Before writing

- Reserve ID/owner in the registry. Inspect current repo state and published inventory.
- Review nearest intents and open review IDs. Capture actual SERP observations or mark unavailable; do not pretend a provider search was a localized Google audit.
- Record product fit and official sources. Use draft claims for anything not tested.
- Choose a reproducible, non-sensitive fixture. Never upload private customer data for a public demo.

## Before public files change

- Sources/claim ledger complete. Numbers are sourced or clearly illustrative.
- Original example tested; actual output and omissions saved privately.
- Metadata fits renderer and one owned intent. No fabricated author or dates.
- Banner + four useful figures reviewed in both themes and narrow view.
- Internal links target existing pages, or pages included in the same release. Proposed URLs are not live links.
- Reviewer confirms semantic boundaries. M03/M06 require the R04 boundary review; each support requires the R07/R08 reviews.
- Keep existing public articles unchanged unless their revision is part of the active assignment.

## Technical publication checklist

From repo root, use the real final slug:
```powershell
node blog-pipeline/scripts/validate-plan.mjs
node blog-pipeline/check.mjs frontend/content/blog/reserved-slug.md
```

From `frontend/`:
```powershell
npm run blog:index
npm run blog:check
node --test test/blog.test.mjs test/seo.test.mjs
npm run lint
npm run build
```

The template slug is not a runnable publication instruction. Fix errors; review warnings rather than suppressing the checker. Inspect rendered article, metadata, BlogPosting, canonical, shared OG image, sitemap, links and `llms.txt` guide list. The static article route must return 200 after deployment. Keep drafts out of generated public data.

Only public Markdown, approved SVGs, generated index and relevant discovery changes belong in a publication PR. Keep raw research, sources ledger, fixture outputs and this pipeline private. Inspect the diff and run the normal CI workflow. Existing user authorization for passing PR merges/deployment persists when implementing an assigned release; these checks do not create a new permission requirement.

## After publication

Record actual URL, revision, date, validation evidence and changed files. Verify live canonical/indexability, then prepare or finalize social variants. An owner-authorized social publisher verifies the destination and submits separately. Check Search Console/Bing when access exists; do not manufacture indexing confirmation.

Update the registry from PROPOSED to IMPLEMENTED only after files exist, and VERIFIED only for specifically recorded checks. Keep deployment/indexing/traffic status separate. Run plan validation after updating the source inventory. The `--preservation` baseline checks this planning task's untouched assets; after an authorized blog release, archive it and create a new dated baseline rather than silently overwriting history.
