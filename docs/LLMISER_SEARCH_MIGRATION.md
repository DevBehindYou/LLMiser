# Google search migration — 21 October 2026

Canonical site: `https://llmiser.devbehindyou.com`. This record supersedes earlier handover notes that Search Console setup is unverified.

## Actions completed

- Added the `llmiser.devbehindyou.com` Domain property in Google Search Console. Existing DNS ownership auto-verified it; no DNS verification records were changed.
- Submitted `https://llmiser.devbehindyou.com/sitemap.xml`. Google reports **Sitemap processed successfully**, with **13 discovered pages**. An initial transient “Couldn't fetch” resolved to success.
- Added and auto-verified the URL-prefix property `https://mdify.devbehindyou.com/`.
- Submitted **Change of Address** from that old HTTPS property to the LLMiser Domain property. Google passed redirect/ownership validation and confirmed **This site is currently moving**, started **21 October 2026**.
- Inspected the canonical homepage. Google's stored index initially reported “URL is unknown to Google.” Requested indexing; Google confirmed **Indexing requested** and added it to a priority crawl queue. Do not repeatedly resubmit the same URL. Sitemap success and the move request are confirmed; actual indexing is still Google's subsequent work.
- The initial attempt using the old Domain property could not fetch `http://mdify.devbehindyou.com/`. The HTTPS-specific property passed and the move is active; do not submit a duplicate move merely because the Domain-property screen differs.
- Published redirect cleanup in commit `e3d563c`: exact `/blog` rule avoids an extra slash hop; public pages/discovery assets on `llmiser.vercel.app` consolidate to the custom domain; all install-icon paths are covered. APIs and controller routes keep their existing behavior.
- Fixed `mdify-app.vercel.app` in the first Vercel account (`devbehindyous-projects-369/mdify-app`) using a published CDN routing rule named **LLMiser legacy alias migration**, ID `4596df62-c4ac-4acb-9d51-b969c1e30dc3`. It matches path pattern `/:path*` with exact host `mdify-app.vercel.app`, status **308**, destination **`https://llmiser.devbehindyou.com/:path`**. The destination uses `:path` without a star in this CDN editor; `:path*` produced a literal trailing star and was immediately corrected and reverified.
- Changed that alias from its earlier domain-level redirect to **Production**, allowing the CDN rule to execute. Verified home, blog index, article with query and robots redirect directly to the exact new URLs. No MDify source files were edited. The first account's old custom-domain entry shows “Verification Required”; the working custom domain is served by the second account. No DNS was changed.

Browser evidence is stored privately under `project-docs/migration-evidence/` on this machine. Do not publish account/session information or credentials.

## Indexing policy

Keep permanent, path-preserving redirects on old public URLs. Keep those redirects crawlable so Google can replace old search results and transfer signals to LLMiser. **Do not add `Disallow: /`**, remove old DNS, return blanket 410 responses, redirect every unknown URL to the homepage, or add `noindex` to LLMiser's public pages. Missing content should retain a real 404. API/controller responses already carry `X-Robots-Tag: noindex, nofollow, noarchive`.

The sitemap, HTML canonicals, Open Graph URLs, article structured data and `llms.txt` identify the new custom origin. There are 13 published sitemap pages, including eight articles. The blog text and visuals were not edited in this task. MDify and MDify-Pro source checkouts were not changed.

Google's Removals tool is not a migration tool: its documentation explicitly advises against using it to move content or select a canonical version. No removal request was submitted. Search results may retain old URLs while Google recrawls; an accepted Change of Address is not proof that every old URL has already disappeared.

## Validation and remaining work

- Focused migration/SEO tests: **8 passed**.
- Production build: passed on Next.js 14.2.35.
- ESLint: no warnings/errors. Run host dependencies if the restricted shell falsely reports ESLint missing.
- Built-app HTTP smoke test: **190 checks passed**, covering all 13 pages on three public alias hosts, preserved queries, direct blog-index destination, canonical tags, private-route headers, real 404 responses and install assets.
- GitHub CI for `e3d563c`: all six jobs passed (frontend, three backends, edge and PostgreSQL).
- **Production verified:** Vercel deployment `BDbmUAUvvUHXETu2tkW1oRrKDnnb` in `albedo-projects/llmiser`, commit `e3d563c`, Ready / Production, 21 October 2026 at approximately 20:10 Asia/Calcutta. The automatic deployment arrived after a delay; no duplicate manual deployment was submitted.
- **Live HTTP smoke test: 190 checks passed** against `https://llmiser.devbehindyou.com` and each alias's actual DNS/TLS/hosting. All 13 pages return 200 with exact self-canonicals; old/custom/Vercel public URLs redirect directly with queries preserved; private-route headers, 404s and assets pass. The previous extra `/blog` hop is fixed.
- Reproduce locally with `node scripts/check-rebrand.mjs http://localhost:3101`, or against production with `node scripts/check-rebrand.mjs https://llmiser.devbehindyou.com` from `frontend/`. The live mode uses actual alias origins; the local mode simulates aliases through Host headers. Both are read-only HTTP GET checks.
- Hosting rollback for the first account: restore `mdify-app.vercel.app` to its original domain-level 308 redirect to `mdify.devbehindyou.com`, then disable the named CDN rule and publish. This preserves the working two-hop route. Prefer keeping the verified direct route. Never delete either working custom-domain mapping as part of this rollback.
- Keep redirects for at least one year (through **21 October 2027**), preferably indefinitely for old links.
- In Search Console, monitor both properties: old URLs should become “Page with redirect”; new URLs should use the new Google-selected canonical. Confirm representative home/article pages after Google recrawls. No exact removal date or ranking outcome is guaranteed.
- Existing keep-warm Vault work, tick cron cutover, custom-domain conversion acceptance and old backend retirement remain separate operational tasks. Do not retire workers solely because the public redirect works.

## Official guidance

- [Google site moves](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes)
- [Change of Address](https://support.google.com/webmasters/answer/9370220)
- [Removals: when not to use it](https://support.google.com/webmasters/answer/9689846)
- [Noindex requires crawl access](https://developers.google.com/search/docs/crawling-indexing/block-indexing)
- [Next.js 14 redirects](https://nextjs.org/docs/14/app/api-reference/next-config-js/redirects)
