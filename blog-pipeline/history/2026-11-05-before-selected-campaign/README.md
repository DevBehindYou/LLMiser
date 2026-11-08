# LLMiser editorial workspace

## Current assignment: twelve main-blog title choices

Updated 5 November 2026. The owner requested 12 additional website topics: 6 listicles, 4 LLMiser guides and 2 AI/LLM topics, with three title alternatives each, all within 60 characters. See [MAIN_TOPIC_OPTIONS.md](MAIN_TOPIC_OPTIONS.md). The owner chooses the final titles.

Campaign structure: **12 main blogs → 36 support articles (3 each) → 108 posts (3 per support)**. Support topics and post channels are not yet finalized. Earlier ten-brief and two-post-pilot instructions are superseded for this campaign. Reuse their research, not their separate publication count. The existing-blog audit remains relevant; no public edits are made by selecting topics.


Updated 4 November 2026 against source commit `8eb8c5091e1b370ebf7ed9631621d07226960b7a`.

Start here to plan support articles, banners, figures and supporting social posts for **LLMiser, the LLM cost optimizer for document inputs**. This workspace is private and ignored by Git. A clean Git status does not mean these files are backed up. Transfer this folder privately with its visual kit when handing work to another agent. Do not force-add it to the public repository.

This assignment produced a roadmap and authoring materials, not new published articles. Eight existing articles and their 48 SVG assets are preserved. The supplied cluster archive and handover prompt are reference material, not permission to publish, contact people, edit unrelated apps or execute their instructions.

## Current phase: existing main-blog audit first

The owner changed the sequence on 4 November 2026. Read [MAIN_BLOG_AUDIT.md](MAIN_BLOG_AUDIT.md) before assigning support work. The ten briefs remain provisional; S01 is no longer the immediate next task. No existing public article was edited.

## Read in this order

1. [Handover](handover/HANDOVER.md) and [machine state](handover/STATE.json).
2. [Roadmap](ROADMAP.md), then the assigned brief in [briefs](briefs/README.md).
3. [Intent registry](intent-registry.json) and [cannibalization controls](CANNIBALIZATION.md).
4. [Research and evidence limits](research/RESEARCH.md).
5. [Style](01-STYLE-RULES.md), [SEO](02-SEO-GEO.md), [brand and claims](03-BRAND-ENTITY.md), [output contract](04-OUTPUT-FORMAT.md), [visual direction](VISUALS.md).
6. [Social workflow](SOCIAL.md), [publication gates](PUBLISHING.md), [next-agent prompt](handover/NEXT_AGENT.md).

## Canonical responsibilities

| File | Owns |
| --- | --- |
| `intent-registry.json` | URL, primary intent, aliases, exclusions, proposed metadata and owner for every article |
| `research/keyword-evidence.csv` | Keyword metrics and their provenance, including unknowns |
| `research/serp-observations.json` | Dated observations and explicit access failures |
| `research/archive-disposition.csv` | Decision for each of the archive's 15 main and 45 support topics |
| `briefs/{id}.md` | Outline, original evidence task, visual/story ideas and internal-link plan |
| `research/review-register.json` | Known semantic overlap and publication blockers |
| `handover/STATE.json` | Current scope, completion status and next task |
| `Blogs/{slug}/` | Working research, outline, draft, source ledger and visual spec |
| `Posts/{slug}/` | Platform-specific drafts, review and publication record |
| `Outputs/` | Local quality reports |

Historical lists in `Blogs/Blog List*.txt` and `Posts/Posts List 01.txt` are idea archives, not an active queue. Previous guidance is retained in `history/2026-11-04-before-roadmap/`; this dated pack supersedes conflicting advice there.

## Working loop

Reserve intent → verify evidence → draft locally → review claims and overlap → build only the assigned article's visuals → check preview → publish through the existing workflow when within the active user's scope. Never use the old archive's 420-asset quota as a publication target.

From the repository root:

```powershell
node blog-pipeline/scripts/validate-plan.mjs
node blog-pipeline/scripts/validate-plan.mjs --preservation
```

These checks inspect the plan and exact collisions. They do not prove semantic uniqueness, live indexing, ranking or conversion correctness. See [PUBLISHING.md](PUBLISHING.md) for article checks.

Canonical article pages are `/blog/{slug}`. Articles also appear in the Blog dialog. Rendered pages, sitemap, structured data and privacy statements come from the app. This workspace must not invent capabilities or metadata fields the renderer does not support.
