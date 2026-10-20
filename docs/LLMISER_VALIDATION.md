# LLMiser validation — 20 October 2026

## Passed

- Final production build: Next.js 14.2.35 compiled, linted and generated all 19 static outputs successfully. Home: 16.9 kB route payload / 128 kB first-load JavaScript. Use-case page: 734 B route payload / 108 kB first-load JavaScript. These are current build figures, not a measured before/after performance claim.
- ESLint: no warnings or errors.
- Existing frontend regression suite: 218 of 221 passed on the initial run. Two Git-history fixture tests were blocked by sandbox permissions and passed when rerun outside the sandbox. One SEO copy test incorrectly matched a CSS `80%` width as a savings claim. The assertion was narrowed to actual savings language, and the SEO/migration tests passed on focused rerun. All 221 test cases therefore passed across the initial run and focused reruns.
- Focused SEO/migration checks: 8 of 8 passed, including the new origin, all article canonical URLs, structured data, both legacy host mappings, private-route headers and exact approved icon bytes.
- Blog index consistency: passed without regenerating or editing article data.
- Combined database setup consistency: passed.
- HTTP smoke check against the final production server: **88 checks passed across 13 public pages**. Verified self-referential canonicals; both legacy hosts' 308 redirects with paths/query strings preserved; preview/API behavior; old controller alias; admin/API noindex headers; 404 for unknown routes; sitemap/robots; brand files and every manifest icon.
- Visual checks: desktop at 1440 × 1000 and mobile at 390 × 844, in dark and light themes. Phone document width was 385 px within a 390 px viewport, with no horizontal overflow. One homepage H1. Favicon switched to the matching light/dark Prompt L asset. No browser runtime errors were reported.
- All 58 article Markdown, generated article-data and illustration files match public MDify byte for byte. SHA-256 records are saved in `blog-preservation.json`.
- MDify source repository remained clean. MDify-Pro's pre-existing local documentation and brand changes were not modified.
- Only `.env.example` files were copied. No deployment credentials were copied.
- Backend Python source comparison confirmed changes are limited to branding strings in five files. Conversion algorithms, API contracts and database migrations remain unchanged.

## Reproduce

From `frontend`, with Node.js 22 and installed dependencies:

```sh
npm test
npm run lint
npm run blog:check
npm run sql:check
npm run build
npm start -- -p 3101
node scripts/check-rebrand.mjs http://localhost:3101
```

Some checks need host-level permissions in the Codex Windows sandbox: fixture tests create temporary Git repositories, the production build downloads its existing fonts, and HTTP smoke checks connect to localhost. Normal CI runs these without those sandbox restrictions.

## Not verified locally

No production environment was configured or deployed. Live normal/OCR/ZIP conversions, storage lifecycle, DNS, TLS, domain alias ownership, scheduler activation, old-host redirects at the real edge and search indexing require the configured hosting environment. Python backend test suites and external PostgreSQL/edge-function integration checks were not rerun for this branding-only backend change.

No new ranking, token-saving percentage or AI-citation outcome is claimed.

## Previews

- [Desktop preview](llmiser-desktop.jpg)
- [Mobile preview](llmiser-mobile.jpg)
- [Deployment and migration steps](LLMISER_MIGRATION.md)

## Documentation handover follow-up — 20 October 2026

The subsequent documentation-only request added an agent entry point, technical handover, progress tracker and copyable blog-agent prompt. It did not rewrite articles, generated article data, SVG assets or application code. The checks above remain evidence for the app-rebrand phase, not evidence for the pending blog rebrand. The next agent must validate its own edits and record them in the progress tracker and a new content report.
