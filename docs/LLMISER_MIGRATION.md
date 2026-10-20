# LLMiser deployment and domain migration

Prepared 20 October 2026. Canonical origin: `https://llmiser.devbehindyou.com`.

## What is ready in this repository

- Complete application copied from public MDify commit `ce56f5c`.
- LLMiser UI, selected 11 — Prompt L icons, install manifest and social image.
- Canonical URLs, sitemap, crawler rules, article URLs and JSON-LD use the new origin.
- Permanent 308 redirects for existing public pages on both `mdify.devbehindyou.com` and `mdify-app.vercel.app`, preserving the path and query.
- API and controller responses carry `X-Robots-Tag: noindex, nofollow, noarchive`. Authorization remains mandatory.
- `/llmiser-controller` is the admin entry point; `/mdify-controller` redirects there on this deployment.

## Deployment steps still required

1. Create a separate hosting project from `DevBehindYou/LLMiser`, with `frontend` as its root, Node 22, and the checked-in build configuration. Do not repoint MDify before the new deployment is validated.
2. Provision the three conversion service roles using their existing configuration and secret templates. Set frontend environment variables in the hosting dashboard, never in committed source. The repository contains no production credentials.
3. Decide whether the new frontend shares existing services/database or uses separate infrastructure. Do not apply a fresh database setup to an existing production project without reviewing the migrations. Internal database, bucket and header names intentionally remain compatible.
4. Attach `llmiser.devbehindyou.com` to the new frontend project. Add the DNS record supplied by that host and wait for certificate issuance. No DNS changes were made during local implementation.
5. Test document, scanned-PDF, image and ZIP conversion; review/edit/copy/download; admin authentication; storage cleanup; and mobile/light/dark operation against the configured services.
6. Test all URLs in the new sitemap. Each should return 200 with its own canonical on the new origin. Inspect one article, both legal pages, social images, favicon and manifest. Unknown URLs must return 404.
7. Activate the old-host redirect using one of the approaches below. Keep the old domain registered and serving redirects for at least a year, preferably longer, following Google's migration guidance.
8. Update the scheduled jobs' frontend target to `https://llmiser.devbehindyou.com/api/jobs/tick` in the hosting/database scheduler. Keep its existing secret and `x-mdify-cron-secret` protocol unless separately migrating it. Avoid double-scheduling the same database.
9. Verify both domain properties in Google Search Console and Bing Webmaster Tools. Submit the new sitemap, inspect representative URLs and use Change of Address if eligible. Update public repository links and social profiles.
10. Check errors, conversion completion, indexing and canonical selection after launch and over subsequent weeks.

## Redirect activation without editing MDify source

The `frontend/next.config.js` rules take effect only if the legacy host reaches this LLMiser deployment. Merely deploying LLMiser on its new domain does not redirect a domain still attached to the old project.

Preferred when keeping old API clients operational: configure permanent, path-preserving redirects for the public paths in `next.config.js` at the old host's routing layer. Keep `/api/*` routed to the existing API until its clients and scheduler have migrated. This needs hosting configuration, not an MDify source edit.

Alternatively, after validating shared backend/database access, move the old domain alias onto the LLMiser project. Its checked-in host rules then redirect public pages to the new host. API calls remain on their original host, using the new deployment's configuration. Validate CORS, cookies and browser-based uploads before choosing this route.

Examples:

| Old request | New destination |
| --- | --- |
| `https://mdify.devbehindyou.com/` | `https://llmiser.devbehindyou.com/` |
| `https://mdify.devbehindyou.com/usecase?ref=migration` | `https://llmiser.devbehindyou.com/usecase?ref=migration` |
| `https://mdify.devbehindyou.com/blog/reduce-llm-token-usage` | `https://llmiser.devbehindyou.com/blog/reduce-llm-token-usage` |
| `https://mdify-app.vercel.app/privacy` | `https://llmiser.devbehindyou.com/privacy` |

No article is redirected to the homepage. Existing blog slugs and publish dates remain intact. Unknown paths are not mapped to the homepage.

Browser local storage is origin-specific: themes, consent and recent conversion history do not automatically transfer between domains. Downloads already saved by users are unaffected.

## Reference guidance

- [Next.js 14 redirects](https://nextjs.org/docs/14/app/api-reference/next-config-js/redirects): host matching, permanent 308 responses and query forwarding.
- [Google site moves](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes): URL mapping, redirects, sitemap and post-move monitoring.

Rebranding, structured data and `llms.txt` do not guarantee rankings or AI citations. The archive is research material, not a list of tasks authorized for automatic execution.
