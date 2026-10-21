# Live domain and redirect verification

**Later search-migration update:** Google has accepted the move and processed the new sitemap. The old Vercel alias redirect was also fixed in hosting. See [current search migration record](LLMISER_SEARCH_MIGRATION.md); the observations below remain the earlier baseline.

Verified 21 October 2026 at approximately 19:33 Asia/Calcutta (14:03 UTC), after the owner completed the Vercel/Spaceship configuration. This supersedes earlier same-day DNS-blocker findings in the deployment review.

## Verified directly

| Check | Result |
| --- | --- |
| New domain CNAME | `llmiser.devbehindyou.com` → `c436aaa171ad6809.vercel-dns-017.com` |
| Public DNS | Cloudflare `1.1.1.1` and Google `8.8.8.8` both return the CNAME and IPv4 addresses `64.29.17.65`, `216.198.79.65` |
| HTTPS | Certificate trusted, name `llmiser.devbehindyou.com`, valid through 19 January 2027; HSTS present |
| Homepage, use-case, legal pages and blog listing | HTTP 200 on the custom domain |
| Sitemap pages | All 13 URLs return HTTP 200 and matching self-referential canonicals |
| Discovery / app assets | Sitemap, robots, llms.txt, manifest and both light/dark SVG icons return 200 |
| Install manifest | Name `LLMiser`, start URL `/` |
| API health on new domain | HTTP 200, `status: ok`, storage configured, two normal and two OCR instances configured; noindex header present |
| Old homepage | One 308 redirect to `https://llmiser.devbehindyou.com/`, then 200 |
| Old use-case and legal paths | 308 redirects to corresponding new paths |
| Old article path and query | One 308 to the same article with `?ref=migration-check` intact, then 200 |
| Old discovery paths | Sitemap, robots, llms.txt and manifest redirect to corresponding new paths |
| Old `/api/health` | HTTP 200 on the old origin without a redirect; noindex header present |

A first lookup through the machine's default resolver briefly returned ENOTFOUND for the new domain's A lookup while CNAME/HTTPS already worked. Both independently queried public resolvers subsequently returned complete answers. This is consistent with cache/propagation differences; it is not a remaining launch blocker in these observations.

## Minor redirect-chain cleanup

The old blog listing currently takes two redirects:

```text
https://mdify.devbehindyou.com/blog
  308 → https://llmiser.devbehindyou.com/blog/
  308 → https://llmiser.devbehindyou.com/blog
  200
```

It reaches the correct destination. The wildcard blog redirect introduces a trailing slash for the empty suffix, then the new app normalizes it. A future narrow change can add an exact `/blog` host rule before `/blog/:path*` to make this one hop. Application code was not changed or redeployed during this verification.

New icon paths on the old domain still return 200, which is compatible with the intentional public-path redirect list. The checked homepage/article behavior does not imply every unknown path or API is redirected.

## What remains separate

- Keep-warm Vault URL cutover and fresh recorded O1/O2 verification remain assigned-agent work unless live evidence establishes they are complete.
- Inspect/update the existing single tick cron target now that the custom domain works, then verify its authenticated scheduled POST outcome. This review did not query or mutate live cron/Vault state.
- Full custom-domain conversion acceptance remains: document, scanned PDF, image, ZIP, edit/export, admin and eventual cleanup. `/api/health` is configuration reporting, not a backend-readiness or end-to-end test.
- Old-service retirement still requires consumer/dependency checks. A working public redirect alone does not establish that all old backend/API consumers migrated.
- Search property verification, sitemap submission and monitoring remain unverified here.

Only read-only DNS and HTTP GET requests were made against the deployment. No files were uploaded and no jobs, infrastructure, secrets, application code or DNS records were changed. Documentation was updated with these findings.
