# 07 — MDify to LLMiser: zero-surprise migration runbook

![Staged migration timeline](assets/05_migration_timeline.png)

## Release philosophy

This is a public-brand and URL migration. It is **not** authorization to change conversion engines, overwrite private/public branches, replay Supabase migrations, or remove security guardrails. Google recommends mapping old URLs, using permanent redirects, testing the target and monitoring both sides. It also advises changing major things one at a time. [Official site-move guide](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes).

## Phase 0 — Brand clearance / decision gate

- Search for LLMiser / LLM Miser / LL Mizer, “miser” AI names in trademark databases for relevant markets and Chrome Web Store, GitHub/npm, major social handles. Retain dated evidence.
- Confirm **legal clearance** with appropriate professional if investing materially.
- Confirm one purchased domain, DNS authority and renewal owner. `llmiser.com`/`.ai` **availability is unknown**; examples below assume eventual ownership only.
- Approve capitalization, logos, privacy/legal naming, public contact email and owner entity.

## Phase 1 — Freeze baseline and export

- Save current MDify sitemap, URL crawl, blog posts, metadata, canonical tags, redirects, Git HEAD, CI and production version.
- Export Google Search Console by page/query/country/device (3/6/12 months where possible), Bing Webmaster data, link reports and conversion events.
- Record important backlinks, internal links, GitHub project links, README, social profiles and docs.
- Check app conversion acceptance for PDF, DOCX, images/OCR, ZIP, batch, files/preview/download, retention and cleanup. **Never mark production health proven just because CI passed.**
- Create a dated rollback/switchover checklist and backups of routing config.

## Phase 2 — Prepare destination

- Set up TLS, verified property in Google and Bing, `robots.txt`, brand `WebSite` schema, canonical tags, sitemap and social preview assets.
- Render existing site on new canonical host while preserving most URLs and content initially; ensure server-only keys remain server-only and Supabase redirects/CORS/auth origins are adjusted after review.
- Avoid simultaneous major CMS/architecture rewrite. Fix user-visible debug text before marketing launch if actually visible in browser.
- Check new domain history, spam/manual actions, indexed old content if previously registered.
- Ensure public converter flows remain compatible; test storage and job queue behavior under new host.

## URL mapping examples — proposed

| Current MDify | Proposed LLMiser | Action |
|---|---|---|
| `https://mdify.devbehindyou.com/` | `https://llmiser.com/` | 301/308 permanent redirect |
| `https://mdify.devbehindyou.com/blog` | `https://llmiser.com/blog` | Preserve article hub |
| `https://mdify.devbehindyou.com/blog/<slug>` | `https://llmiser.com/blog/<same-slug>` | Preserve existing article identity where practical |
| Existing legal/privacy pages | Exact corresponding new policies | Accurate legal identity and redirects |
| Legacy asset links | Corresponding new asset paths | Avoid broken GitHub/social previews |

**Caution:** Do not manufacture old page paths from this table. Crawl the actual MDify site and map **every indexable old URL** to its closest relevant new URL; no blanket old-all-pages→new-home redirect.

## Phase 3 — Pre-launch verification

- 200 on target canonical pages; no accidental `noindex` or blocked crawlers on public content.
- Strictly one-hop 301/308 old→new wherever feasible; no chain or loop; correct HTTPS and www behavior.
- Page-specific canonical tags, `hreflang` if applicable, sitemap new host URLs only.
- Metadata and OpenGraph still show current brand; favicon/manifest logos updated.
- Browser desktop/mobile, copy, real exported bytes, image OCR, ZIP, failure/retry handling, accessibility and robots checks pass.
- 404/410 intentionally gone pages, not homepage soft 404s.
- Conversion activity monitoring includes no uploaded content/secret logging.

## Phase 4 — Launch

- Change DNS and routing in approved window; deploy target, activate permanent redirects from old host **without deleting old hostname**.
- Submit new sitemap, use Search Console Change of Address if eligible, verify both properties and Bing.
- Update important internal links, app links, GitHub README, Chrome extension and social links; reach out to owners of important old backlinks for updates.
- Announce `MDify is now LLMiser` for an appropriate transition period; don't create competing duplicate indexable sites.

## Phase 5 — 1/7/14/30/60/90-day monitoring

| Check | Daily first week | Weekly after |
|---|---|---|
| Legacy 301 coverage, status and chain | Yes | Yes |
| New index coverage / canonical choice | Yes | Yes |
| Organic clicks and branded vs non-branded impressions | Yes | Yes |
| Conversions / export error rate | Yes | Yes |
| GSC AI impressions, Bing AI citations where available | If report data exists | Yes |
| Links still pointing to MDify and sitemap errors | Initial audit | Yes |
| Server/cron/jobs/retention errors | Yes | Yes |

Expect fluctuations; Google notes migrations can take weeks or longer, depending on discovery and site size. No promised preservation of every ranking or fixed recovery date.

## Rollback policy

Rollback **application code/config** if conversion, privacy or availability regresses materially. Avoid toggling between old/new canonicals repeatedly merely because ranking positions fluctuate; SEO rollout reversals themselves add confusion. Document owner approval for any DNS/redirect rollback.

## PR boundaries

1. Brand constants/assets/copy only; tests.
2. Structured data/metadata/sitemap/indexability; tests.
3. Redirect mapping and host configuration; dry-run tests.
4. Landing pages, one format group per PR; functional acceptance.
5. Benchmark/research content after evidence exists.
6. Chrome extension branding after its own store/release gates.

Every PR: independent review, appropriate unit/E2E/security/accessibility checks, required CI and exact-head no-conflict verification. Existing public main is the canonical implementation source.
