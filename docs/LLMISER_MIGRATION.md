# LLMiser deployment and domain migration

**21 October search update:** Change of Address is active in Google Search Console and the new sitemap was processed with 13 discovered pages. See [search migration status](LLMISER_SEARCH_MIGRATION.md), which supersedes older pending Search Console notes below. Keep old public redirects crawlable; do not block the whole legacy host in robots.txt.

Updated 21 October 2026. Canonical origin: `https://llmiser.devbehindyou.com`.

## What is ready in this repository

- Complete application copied from public MDify commit `ce56f5c`.
- LLMiser UI, selected 11 — Prompt L icons, install manifest and social image.
- Canonical URLs, sitemap, crawler rules, article URLs and JSON-LD use the new origin.
- Permanent 308 redirects for existing public pages on both `mdify.devbehindyou.com` and `mdify-app.vercel.app`, preserving the path and query.
- API and controller responses carry `X-Robots-Tag: noindex, nofollow, noarchive`. Authorization remains mandatory.
- `/llmiser-controller` is the admin entry point; `/mdify-controller` redirects there on this deployment.

## Deployment progress

- App and blogs are rebranded and committed. Local HEAD at the latest review: `3ed4ded`.
- Frontend is live at `https://llmiser.vercel.app`; direct public checks passed on 21 October.
- Six new backend services and HTML/PNG/ZIP storage conversions are reported verified by the deployment agent. They share the existing Supabase project, bucket, queue, cleanup and compatibility names; separate database provisioning is not pending.
- Local environment files now exist and are Git-excluded. Their URLs match the deployment report; secrets must stay private.
- The selected custom domain is now live with trusted HTTPS. Public DNS, all 13 canonical sitemap pages and tested legacy redirects were verified after the owner's changes; see [verification record](LLMISER_DOMAIN_VERIFICATION.md).
- Keep-warm Vault values and live tick target were not queried or changed in this review.

See [deployment review](LLMISER_DEPLOYMENT_REVIEW.md) for independent observations versus reported tests and [environment inventory](LLMISER_ENVIRONMENT.md) for service URLs. Do not recreate completed deployments or apply fresh database setup based on older instructions.

## Remaining cutover steps

1. Assigned agent: inspect and update only the two keep-warm Vault URL values, verify fresh completed O1/O2 results, and provide a screenshot. Follow the bounded task in the deployment review; leave other shared jobs unchanged.
2. **Completed by owner and verified:** custom-domain DNS and HTTPS work. Preserve the recorded DNS settings; no further domain creation is needed.
3. Test document, scanned PDF, image, ZIP, review/edit/export, authenticated admin and actual cleanup on the custom domain. Prior Vercel-origin HTML/PNG/ZIP tests do not establish all of these.
4. **Partially completed:** all 13 sitemap pages return 200 with matching canonicals; discovery files, manifest and both SVG icons also passed. Complete any remaining visual, favicon/social-image and intentional-404 acceptance checks as needed.
5. Inspect the live `mdify-jobs-tick` entry and update its existing single target to `https://llmiser.devbehindyou.com/api/jobs/tick` after the domain works. Preserve the Vault secret and `x-mdify-cron-secret` protocol. Verify a correlated scheduler POST outcome; the checked-in template alone is not live state.
6. **Public redirects active and tested:** old home/article paths redirect with 308, preserving the tested query; `/blog` reaches the correct page through an extra slash-normalization hop. Old `/api/health` remains on its origin. Audit remaining API/scheduler consumers before pausing or retiring services; this is not part of the warmup-only task.
7. Verify both search properties, submit the canonical sitemap, inspect representative URLs and use migration features where eligible. Monitor errors, indexing, canonical selection and conversion completion after launch.

The old host must continue serving redirects after cutover. Existing infrastructure names are compatibility contracts, not unfinished brand copy. No live change in this checklist was executed by the 21 October review.
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
