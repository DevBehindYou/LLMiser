# LLMiser — brand, SEO and AI-search growth dossier

**Prepared:** 18 October 2026 · **Status:** strategic recommendation; *LLMiser is not yet a confirmed/cleared brand or registered domain*.  
**Predecessor:** [MDify](https://mdify.devbehindyou.com/) by DevBehindYou.  
**Audience:** founder, designers, developers, SEO leads, content team, and coding agents.

![LLMiser positioning: document conversion, AI context quality, token-cost transparency](assets/01_positioning.png)

## Executive decision

**Recommended brand:** **LLMiser** (pronounced *L-L-Miser*). **Tagline:** *Make Every Token Count.*

**Product definition:** A free, AI-ready document-to-Markdown converter that helps users turn PDFs, Office files, images, and ZIP projects into useful, structured input for AI assistants and RAG workflows. The planned Chrome extension will convert webpages and selections locally. **The current product is not a general-purpose model proxy, prompt compressor, or guaranteed LLM bill reducer.**

**H1:** `Turn Documents into AI-Ready Markdown.`  
**Proof-oriented subheading:** `Convert PDFs, Word files, spreadsheets, images and ZIP projects into structured Markdown for AI assistants and RAG workflows. Measure token impact before making cost claims.`

**Brand success criterion:** users can reliably convert content, understand document quality and its limitations, and return for repeated use—not merely see rankings for the new brand.

## What's inside

| File | What it answers |
|---|---|
| [01 — Brand strategy](01_BRAND_STRATEGY.md) | Vision, mission, positioning, audience, messaging, tone, claim boundaries |
| [02 — Market and community evidence](02_MARKET_INTELLIGENCE.md) | Google/Bing, Reddit, Quora limits, GitHub, research literature |
| [03 — Keyword research](03_KEYWORD_RESEARCH.md) | Clusters, priority, intent, target pages, monthly-volume collection |
| [04 — Competitor and gap analysis](04_COMPETITOR_GAP_ANALYSIS.md) | Competitor capabilities, search surface and evidence-based gaps |
| [05 — SEO site architecture](05_SEO_INFORMATION_ARCHITECTURE.md) | Slugs, H1, titles, metadata, on-page specs, internal links |
| [06 — GEO / AI search](06_GEO_AI_SEARCH.md) | Google AI, ChatGPT, Bing/Copilot, grounding and measurement |
| [07 — Migration runbook](07_REBRANDING_MIGRATION.md) | Safe domain/brand change and SEO migration |
| [08 — Content calendar](08_CONTENT_CALENDAR.md) | Six-month topic/publishing roadmap and briefs |
| [09 — Metrics](09_MEASUREMENT_SCORECARD.md) | Definitions, realistic KPIs, experiments and export protocols |
| [10 — Execution prompt](10_AGENT_MASTER_PROMPT.md) | Full, reusable Codex/developer prompt |
| [11 — Sources and limitations](11_SOURCE_REGISTER.md) | Linked primary sources and evidence quality |
| [12 — Competitor DR register](12_COMPETITOR_DR_REGISTER.md) | Competitor domains and DR/traffic blanks awaiting verified export |
| [13 — Visual identity](13_BRAND_STYLE_GUIDE.md) | Name usage, voice, colors, accessibility and assets |
| [14 — UX and CRO](14_CRO_UI_UX.md) | Product funnel, conversion-page UX, measurement |
| [15 — Risks and claim policy](15_LEGAL_AND_CLAIMS.md) | Trademarks, user data, claims, migration and publication risks |

Visual files in [`assets/`](assets/) are included in the Markdown documents and embedded into the companion DOCX.

## Evidence conventions (read before using any table)

- **Observed**: confirmed in a linked public page at research time, or in MDify's user-provided handover.
- **Community signal**: Reddit user report or request; directional only, not statistically representative.
- **Inference / proposed**: strategic hypothesis, recommended positioning, page or feature.
- **Not verified**: no accessible first-party data; do not convert into a fabricated metric.
- **Monthly volume, Keyword Difficulty, Ahrefs Domain Rating, and competitor traffic:** **not independently verified**. They are explicitly left as `—` pending Google Keyword Planner/Ahrefs/Semrush exports, geography and date selection.

## Scope and constraints

Use the publicly released MDify implementation as the migration baseline. Keep the current conversion flows, Supabase and specialized N/O/Z backends, user-facing privacy/retention rules (48 hours subject to documented KEEP/EXTEND semantics), and review/CI gates. The uploaded 18 October 2026 handover describes newer PRs and diverged private/public repositories; **verify current Git HEAD and deploy state before touching code**. The new brand/domain decision does not authorize a risky backend refactor.

## Sequence

1. Conduct domain, app-store name and trademark clearance; get explicit owner sign-off.
2. Export 3–6 months of MDify Search Console data, current sitemap, all URL paths and page-wise conversions.
3. Buy/verify destination domain (illustrative URL `https://llmiser.com`, **not confirmed available**).
4. Build the same functioning web app with updated names, structured data and URL mapping; complete tests.
5. Perform domain move with server-side 301/308 redirects and monitor both properties.
6. Publish prioritized conversion pages; then publish original RAG/token research and the validated extension.

**Suggested initial goals:** protect MDify's existing conversions and organic traffic, establish branded search impressions, grow successful downloads, and generate attributable AI-search citations. No guaranteed rankings or traffic targets.
