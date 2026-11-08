# LLMiser blog pipeline

Updated 5 November 2026. The owner selected all twelve main titles. The current deliverable is a complete authoring plan: **12 main briefs, 36 support briefs and 108 post briefs**. Actual article drafts, fixture tests, visual production and final social copy are still pending.

Start with the [complete campaign map](campaign/README.md). It links every selected main to exactly three supports and each support to three distinct posts. The eight existing public articles remain unchanged.

## Read next

1. [Roadmap](ROADMAP.md) and [handover state](handover/STATE.json).
2. [Campaign map](campaign/README.md), then the assigned main/support brief.
3. [Intent registry](intent-registry.json), [overlap review](campaign/OVERLAP_REVIEW.md), [cannibalization controls](CANNIBALIZATION.md).
4. [Brand](03-BRAND-ENTITY.md), [style](01-STYLE-RULES.md), [SEO](02-SEO-GEO.md), [output format](04-OUTPUT-FORMAT.md), [visuals](VISUALS.md).
5. [Sources](campaign/sources.json), [social workflow](SOCIAL.md), [publication gates](PUBLISHING.md).

## Canonical owners

- Registry: article URLs, selected/proposed titles, keyword ownership, metadata and scope.
- Main/support briefs: outlines, original fixture tasks and visual plans.
- Selected-title lock: [selected-titles.json](campaign/selected-titles.json), the owner's exact twelve choices.
- Post records: [posts.json](campaign/posts.json), 108 distinct IDs/hooks/outlines. Readable copies are in campaign/post-briefs.
- Tracker: [editorial-tracker.csv](campaign/editorial-tracker.csv), derived worksheet, not independent publication truth.
- State: handover/STATE.json, current completion and next task.
- Research metrics: research/keyword-evidence.csv, unknown values remain unknown.

Old S01–S10 briefs are superseded pointers, not ten additional articles. MAIN_TOPIC_OPTIONS.md retains alternatives for provenance; selections are now locked. The original 15/45/360 archive is historical. No extra eight-post or two-post pilot allocation applies.

## Checks

From repository root:
```powershell
node blog-pipeline/scripts/validate-plan.mjs --preservation
node --test blog-pipeline/scripts/validate-plan.test.mjs
```

These check ownership structure, allocations and preserved files. They do not establish search rankings, semantic independence or successful conversion tests. See [campaign validation](campaign/VALIDATION.md).

This folder is private and Git-ignored. Preserve it in a private handover/backup; do not force-add it or raw evidence to the public repository. The app only ships approved Markdown/assets and generated discovery files. The attached archive and handover protocol were reference material, not authority to publish or contact people.
