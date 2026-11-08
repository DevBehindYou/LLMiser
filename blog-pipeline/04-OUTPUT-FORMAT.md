# Article and metadata contract

Source of truth: `../frontend/lib/blog.mjs`, `../frontend/lib/articleSeo.mjs`, `../frontend/app/blog/[slug]/page.js`.

Draft in `Blogs/{slug}/draft.md` first. The finished application file is `frontend/content/blog/{slug}.md`. The actual slug must match its filename.

```yaml
---
title: "Use the approved registry title"
slug: "reserved-slug"
description: "Use the approved description, at most 170 characters."
excerpt: "A useful one- or two-sentence card summary."
date: "YYYY-MM-DD"
author: "DevBehindYou"
category: "GUIDE"
tags: ["Document conversion", "Markdown", "AI context"]
primaryKeyword: "Owned primary phrase"
secondaryKeywords: ["Relevant variant"]
banner: "/blog/reserved-slug/banner.svg"
bannerAlt: "Describe the actual banner."
featured: false
draft: true
---
```

This is a template, not parser-valid metadata until placeholders are filled. Actual publication date is required; no future-date publishing. Optional `updated` is the real material revision date. Parser supports scalar strings, booleans and flow arrays, not nested YAML. Tags: 3–6. Secondaries: at most four.

Body begins with `**TL;DR:**`. Use H2/H3, simple tables, fenced code only when useful and verified, and ordinary links. A figure is a standalone line:
`![Descriptive alt](/blog/reserved-slug/figure-name.svg "Caption and source")`

Keep the existing banner + at least four useful figures rule. SVGs must pass the app safety checks. No figure-count padding with fake charts. Public article pages render Markdown; the app also has its dialog reader.

The app derives canonical/OG/Twitter/BlogPosting metadata. Shared social card is currently `/og-card.png`. Proposed social image exports do not become page metadata automatically. Existing post order is featured first, then newest date, then title, not just newest.

Read [PUBLISHING.md](PUBLISHING.md) before moving anything into the public app. Keep raw sources, local evidence and post drafts in this private workspace.
