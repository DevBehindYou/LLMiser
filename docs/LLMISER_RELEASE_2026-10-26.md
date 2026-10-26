# LLMiser release — 26 October 2026

## Released work

The owner explicitly requested merging the open PRs and deploying. [PR #5](https://github.com/DevBehindYou/LLMiser/pull/5) merged at 21:40 Asia/Calcutta, retaining the merge ancestry of PRs #1–#4. GitHub marked all five PRs merged. Initial integrated production revision: `4a9ac2e4846a825e3af25063e8c470c7c71d81dc`.

**Final follow-up:** [PR #6](https://github.com/DevBehindYou/LLMiser/pull/6) merged at 22:07 Asia/Calcutta and deployed `aa0635433bf520bfddc6edb796c14a74430e64f8`. All 252 frontend tests, all other PR checks and the post-merge workflow passed. All five Vercel statuses succeeded. Corrected German preview labels were observed in production; normal/OCR/archive readiness remained 2/2 each. The working tree was synchronized to clean `main`.

- Six web-app interface languages: English (US), German, Japanese, Spanish, Russian and Simplified Chinese. There are 628 messages in every dictionary.
- Download recovery without repeating a completed conversion; localized recovery/export controls and the updated saved-reference privacy disclosure. Consent version `2026-10-21` is preserved.
- Backend wake-request coalescing, with its tested configuration and completion-based cache behavior.
- Cron optimization source corresponding to the earlier live cutover. No live SQL was rerun during this release.
- Chrome extension source (single Converter popup, uploads and manual AI Paste). This does **not** publish an extension to the Chrome Web Store.
- A user-facing README with existing desktop/mobile screenshots, an actual six-language demo, conversion steps, supported formats, profile guidance, privacy information and FAQs. [Keyword evidence](README_KEYWORD_RESEARCH.md) separates measured estimates from candidate phrases.

Blogs, article visuals, slugs, canonical URLs and migration redirects are unchanged. Uploaded content is not automatically translated. Original MDify repositories were not edited.

## Validation evidence

| Check | Result |
| --- | --- |
| Local integrated production build | Passed, including static generation and lint |
| Local focused reader/recovery/wake/language tests | 37 passed |
| Release PR frontend suite | 251 passed; 0 failed |
| Release PR lint/dictionaries/generated SQL/blog index/build | Passed |
| Backend N/O/Z, PostgreSQL, edge and extension CI | All passed |
| Post-merge main CI | All seven jobs passed |
| Vercel frontend and four API deployment statuses | All successful |
| Production HTTP checks | 40 passed at 21:43 Asia/Calcutta |
| Canonical sitemap pages | 13 available with canonical links |
| Old MDify origins and Vercel aliases | Tested home, usecase, legal, blog index and article redirects point directly to LLMiser |
| API indexing/security | Tested API routes return noindex; unauthenticated admin overview returns 401 |
| Wake readiness | Normal 2/2, OCR 2/2, archive 2/2 |
| Browser language checks | All six switched visibly; document language/title followed selection; no horizontal page overflow at tested desktop width |
| Saved language | Preserved after reload and restored after returning from the English blog |
| Blog isolation | English heading, `lang=en-US`, no language selector |
| Policies/controller | German policy and controller login rendered; no admin credentials entered |

CI evidence: [release PR run](https://github.com/DevBehindYou/LLMiser/actions/runs/40355961064), [post-merge run](https://github.com/DevBehindYou/LLMiser/actions/runs/40356498876). Initial production deployment: [Vercel](https://vercel.com/albedo-projects/llmiser/BPh8dwtKn4dpJfU6whFLYGvuf7MZ). The canonical app is [llmiser.devbehindyou.com](https://llmiser.devbehindyou.com).

The HTTP script initially used GET for `/api/wake`, which correctly returned 405; its documented POST method returned 200 and the readiness results above. This was a smoke-script correction, not an app failure.

Live visual review found three remaining display bindings: preview mode labels/tooltips, the mobile theme name and retention-extension labels. The accompanying follow-up connects them to the existing translations and adds a regression covering all preview labels in every language. Mode IDs, theme values and retention actions are unchanged.

## Remaining work and limits

- Native Chrome acceptance of extension 0.2.0, optional permission prompts, real signed-in AI composer Paste and store publication remain pending. Merged source is not a published extension.
- Translations are complete by key and placeholder checks; native-language review remains useful. Phone-device coverage is not exhaustive.
- This is interface localization, not separate indexed language URLs or document translation. OCR recognition languages remain a server configuration.
- No new live conversion upload, signed-in controller operation, cleanup/retention mutation or production SQL change was performed in this release verification. Existing conversion/recovery tests passed; the report does not claim a new end-to-end production upload.
- Old-service retirement and continued search migration monitoring remain separate tasks.

Raw HTTP results, local generation scripts and screenshots are retained privately under ignored `project-docs/localization-evidence/`. They contain no uploaded private documents or credentials and are not required to build the app.
