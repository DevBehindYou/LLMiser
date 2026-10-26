# LLMiser app localization

Released 26 October 2026 through `codex/app-localization` and PR #5. The owner authorized merging all open PRs and deployment; the release integrates recovery, cron source, wake coalescing and extension source. The original MDify repositories are unchanged. See [production release evidence](LLMISER_RELEASE_2026-10-26.md).

## User scope

The full web app supports English (US), German, Japanese, Spanish, Russian and **Simplified Chinese**. Converter controls, queues, reader/export labels, recents, help, consent, legal documents and controller UI have translated copy. Native language names appear in an accessible select in the app header, policy navigation and controller login/header. The narrow layout puts the selector on a separate header row.

**Blogs stay English.** This includes `/blog`, article routes and the in-app Blog dialog. Blog content, banners, figures, slugs, dates and generated article data were not edited. Uploaded text, Markdown output, filenames, code and raw diagnostic values are never sent through automatic translation. Selecting a UI language does not translate documents or change OCR recognition languages.

## Implementation map

| File or directory | Responsibility |
| --- | --- |
| `frontend/lib/i18n/core.js` | Six allowlisted locales; preference key; blog segment matching; owned-copy interpolation |
| `frontend/lib/i18n/messages/*.json` | Six complete dictionaries, currently 628 messages each |
| `frontend/components/i18n/LanguageProvider.js` | Root state, lazy imports, storage events, document language and display title |
| `frontend/components/i18n/I18nContext.js` | Pure context/hooks and English-only embedded blog scope |
| `frontend/components/i18n/LanguageSelector.js` | Native labelled selector, loading announcement and native language names |
| `frontend/components/HomeAbout.js`, `UseCaseContent.js` | Localizable visible page sections; server metadata and JSON-LD remain in their pages |
| `frontend/lib/models/adminFormat.js` | Locale-aware number/date/duration helpers with legacy defaults preserved |
| `frontend/scripts/check-i18n.mjs` | Checks dictionary key coverage, nonempty values and matching placeholders |
| `frontend/test/i18n.test.mjs`, `localizedComponents.test.mjs` | Core and component regressions, output preservation and blog isolation |

The app stores only the chosen code under `llmiser-language` in localStorage. Invalid values fall back to `en-US`. Storage failures leave the selector usable in memory. Cross-tab storage updates are handled. Non-English dictionaries load on demand from local bundles; imports are allowlisted and cancelled logically when an older request becomes stale. Load failures fall back to English. No new runtime dependency or external translation service was added.

English is the default server/hydration view; the saved choice is applied after hydration. There can be a short English/loading state on a fresh page load. The active interface sets the document language and a localized display title. Dates/counts use Intl where supported by the existing screens. CJK/Cyrillic system-font fallbacks improve legibility without downloading additional language fonts.

## Keep URLs and conversion contracts stable

This is interface localization, **not six indexed language sites**. Public paths, redirects, canonical URLs, metadata, sitemap, robots and server JSON-LD remain English and retain their existing migration behavior. No hreflang or locale URL is advertised. A future indexed multilingual-site project would need separate URLs, translated server metadata and a deliberate SEO plan.

UI profile labels may be translated, but API values stay `Standard`, `Clean`, `Compact` and `RAG-ready`. Job states, routing, polling, storage/retention decisions, IDs and server diagnostics retain their existing contracts. Only owned display copy passes through `uiText`; never translate the DOM, Markdown or arbitrary payloads.

The Privacy Policy adds the browser's language preference to its existing local-storage disclosure. The displayed update date is 26 October 2026. The integrated recovery PR advances the processing/consent version to `2026-10-21` for its saved-reference retrieval behavior. Localization preserves that version and adds the local interface-preference disclosure. All recovery disclosure paragraphs are translated; no new external translation service is involved.

## Editing translations

1. Mark owned UI text explicitly with `uiText('English phrase')` or `uiText('Template {name}', {name: value})`.
2. Add the same canonical English key to all six public JSON dictionaries. Preserve placeholders and do not translate code, emails, URLs or enum values.
3. Keep interpolated user values as parameters. Do not pass converted document content to `uiText`.
4. Run `npm run i18n:check`, lint and focused tests from `frontend`. The CI frontend job checks dictionaries too.
5. Verify the actual screen, keyboard label, long translations and blog isolation. Translation completeness checks do not certify linguistic accuracy; native-speaker review remains valuable.

The public JSON packs are the maintained translation source. One-time private generation scripts in this machine's ignored `project-docs/` are not required by the app, tests or CI and must not be rerun as migration tools against already localized files.

## Verification and remaining boundaries

- Full existing frontend suite: **226/226 passed**, including core i18n tests and reader regressions.
- Focused core/component suite: **9/9 passed** (the four component tests were added after the full-suite run).
- Dictionary coverage: all six packs have 628 messages and matching placeholders.
- Browser: all six languages switched visibly; reload preserved the selected language; translated help and English-only blog navigation were checked. A compact layout was inspected without horizontal document overflow. The browser preview constrained the actual viewport width, so this is not a claim of exhaustive phone-device coverage.
- No live conversion upload, operator login or infrastructure mutation was needed for this feature. Local conversion services are not configured; existing conversion regressions remain the validation for unchanged backend behavior.
- Integrated release checks: local lint/build passed; 37 focused i18n/component/reader/recovery/wake tests passed; release CI passed all 251 frontend tests and the other six jobs. Post-merge CI passed. Six dictionaries contain 628 messages each. The live app passed 40 HTTP checks and all six browser language checks. Authored translations have not been certified by native-language reviewers.

The public README was also rewritten for users, with existing desktop/mobile screenshots, a recorded language demo and a format/steps/FAQ guide. See [keyword research](README_KEYWORD_RESEARCH.md) for measured demand versus unmeasured keyword candidates. Extension source is integrated under the owner’s merge instruction; native acceptance and store release remain separate. Blogs remain unchanged. The cron source records the previously applied live changes; no live SQL is rerun by this release.
