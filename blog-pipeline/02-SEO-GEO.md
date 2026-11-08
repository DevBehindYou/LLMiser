# SEO and answer-engine rules

Updated 4 November 2026. Authority for assignments: `intent-registry.json`. Authority for metrics: `research/keyword-evidence.csv`. Research limitations and source links: [research/RESEARCH.md](research/RESEARCH.md).

## Corrected evidence

The previous version attributed a keyword-volume table to Google Keyword Planner on 28 September. Its raw export is not present here and conflicts with the later research account of available access. It is **UNVERIFIED historical material**, preserved in `history/2026-11-04-before-roadmap/02-SEO-GEO.md`, and excluded from prioritization. “LOW” advertiser competition would not mean low organic difficulty anyway.

The 26 October Semrush report for “pdf to markdown” is inherited evidence from `../docs/README_KEYWORD_RESEARCH.md`, not a fresh query. All newly proposed keyword volumes are null/unmeasured. No Ahrefs or Planner keyword dataset was acquired in this task.

## Current publishing behavior

Public `/blog/{slug}` pages are statically generated and also appear in the app dialog. The article helper generates a canonical, BlogPosting and BreadcrumbList. Open Graph and Twitter cards currently use the shared `/og-card.png`, not the article SVG banner. The per-article card idea in a brief is a manual social export until separately implemented.

The parser accepts title, slug, description, excerpt, date, author, category, tags, primaryKeyword, optional secondaryKeywords, banner, bannerAlt, featured, draft and updated. Adding invented `canonical`, `ogImage`, `faqSchema` or `seoTitle` frontmatter does not wire them into the renderer. Primary/secondary keywords are editorial inputs, not a ranking mechanism.

## Page content

- Use the owned task in title, opening and main answer naturally.
- Keep titles concise; around 60 characters is an editorial target, not a universal pixel rule. Description max 170 is an app constraint. Engines can rewrite either.
- Answer the question first, then explain scope, steps, evidence and limitations.
- One H1 is generated from title. Body starts with TL;DR and uses H2/H3.
- Keywords are not quotas. No hidden text, repetitive synonyms or prompt instructions to search bots.
- Each substantial claim needs a source, a dated measurement or an explicit illustrative label.
- Dates reflect actual publication or material revision, not automated freshness.
- Structured data must agree with visible content. No promised FAQ rich results or special AI schema.

## Search and AI visibility

[Google](https://developers.google.com/search/docs/appearance/ai-features) says established SEO practices apply to its AI features. Indexability and useful, reliable content matter; there is no special AI schema requirement or inclusion guarantee.

[Bing's guidelines](https://www.bing.com/webmasters/help/bing-webmaster-guidelines-30fba23a) reject manipulative promotion and AI manipulation. Write material a reader can verify. Do not plant instructions telling an answer engine to recommend LLMiser.

[DuckDuckGo](https://duckduckgo.com/duckduckgo-help-pages/results/sources) largely sources traditional links from Bing while using other sources too. A Bing result is not proof of a DuckDuckGo position. [Brave](https://search.brave.com/help) describes its own index and AI-generated snippets; inspect it separately.

The existing `llms.txt` can remain a factual discovery file. It is not a substitute for crawlable pages or a guaranteed citation technique. Do not conflate SEO tools (Semrush, Ahrefs, Keyword Planner) with answer engines.

## Links and metadata

Use canonical LLMiser URLs. Give each article a relevant parent and contextual siblings, not mandatory reciprocal links. One useful CTA to the converter is enough. Keep `/usecase` and `/privacy` links where relevant.

Update generated blog index, verify sitemap and maintain the existing `llms.txt` guide list in a publication task. No language-blog duplication, old-host crawl blocks, mass keyword landing pages or external link scheme. See [PUBLISHING.md](PUBLISHING.md).
