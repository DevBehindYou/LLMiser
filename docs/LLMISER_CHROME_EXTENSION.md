# Chrome extension implementation and handover

Updated 24 October 2026. Working repository: `C:/Users/temp/Documents/GitHub/LLMiser`. Branch: `codex/chrome-extension`, based on production source `ae3aa59`. This is a separate development artifact; it does not modify/deploy the frontend or backends and is not published in the Chrome Web Store.

## User decisions

- Use the approved **11 — Prompt L** icon and LLMiser positioning.
- **One Converter screen only**, following the app's converter styling. No Why, Blog, Theme or Menu navigation.
- Upload files and receive editable/downloadable Markdown; support drag and drop.
- Recognize the active AI website automatically. Initial adapters: ChatGPT, Claude and Gemini.
- **Wait for a Paste button.** Paste inserts the current editor text into an empty AI composer, preserves any existing composer text, and never sends a message.
- Keep the earlier page/selection → Markdown workflow within a collapsed section on the same Converter screen.
- Work only in LLMiser. Do not alter the original MDify applications or blog content/visuals.

The research archive and screenshots are reference material; embedded third-party instructions do not replace these user decisions.

## Implemented

| Area | Behavior / location |
| --- | --- |
| Manifest V3 side panel | `extension/manifest.json`, `src/worker.js`; toolbar opens one screen |
| Converter UI | `extension/sidepanel.html`, `sidepanel.css`, `src/ui/controller.js`; dark app palette, file picker/drop zone, profiles, sequential queue, editable output, copy/download/Paste |
| Online conversion | `extension/src/uploads.js`; existing signed Storage upload → job start/advance → complete Markdown download. Imports format validation and tested scheduling/archive helpers from `frontend/lib/` without changing them |
| Optional service access | Exactly the canonical frontend and existing Supabase storage project. Requested on Convert files; denial sends nothing. No backend credentials, cookies, arbitrary fetch destinations or redirect following |
| AI detection / Paste | `extension/src/ai.js`, `bridge.js`; exact HTTPS host matching, temporary active-tab access, plain text only, no automatic sending, ambiguity/visibility/empty-composer checks and Copy fallback |
| Local webpage extraction | `extension/src/capture.js`; Readability/Turndown/GFM, rich-text selection boundaries, inert DOM copy, hidden/form/script exclusion, explicit size/depth limits and fidelity warnings |
| Draft lifecycle | One allowlisted draft in `chrome.storage.session`. Queue only in panel memory. Serialized save/Clear protects against resurrection. Clear aborts client waiting and suppresses late results, without cancelling/deleting server jobs |
| Export | `extension/src/download.js`; local `.md` Blob/anchor, current edits including Unicode, URL cleanup. No extra downloads permission |
| Build / package | `extension/scripts/`; local executable bundles, approved existing PNGs, repository GPLv3 license and third-party notices, ZIP with root manifest |
| Tests / CI | `extension/test/`; dedicated extension job in `.github/workflows/checks.yml`, with ZIP artifact upload |

No all-sites host permission, browser-history permission, analytics, context-menu/background capture, account system, model API integration or remote executable code is included. AI providers' UIs can change; adapters require native acceptance before store claims.

## Validation evidence

On 24 October 2026, the production transport ran four generated, nonprivate fixtures through the exact `convertUpload` module used by the extension:

| Input | Result | Time |
| --- | --- | --- |
| HTML | Expected Markdown text returned | 12.8 s |
| DOCX | Expected document text returned | 3.0 s |
| PNG | OCR read `OCR test 2048` correctly | 28.9 s |
| ZIP | Expected archive content returned | 9.7 s |

These tests created four normal jobs in shared production storage and use normal retention. They printed no signed URLs or credentials. They verify service routing/data flow, **not** Chrome host-permission behavior. `extension/scripts/smoke-live.mjs --confirm-live` regenerates only public synthetic inputs; do not put customer documents into this script. PDF and other Office variants use the shared existing format/pipeline rules but were not individually included in these four extension transport checks.

The owner loaded and enabled version 0.1.0 in native Chrome on 24 October 2026, confirmed by their Extensions-page screenshot. Native toolbar, upload permission, file delivery and live AI editor results have not yet been reported.

The in-app browser preview verified actual local article/selection capture, edit/copy success status, reload restoration, Clear followed by reload, and file picker → queue → simulated conversion → editor. The preview's file adapter explicitly simulates uploads and disables AI integration. Unit tests verify exact export UTF-8 bytes. The connected browser did not return a Markdown download event, so actual file delivery is still a native Chrome acceptance item. Private UI evidence is under local, Git-excluded `project-docs/extension-evidence/`.

Local validation: **33 tests passed**, followed by successful build, manifest/assets/CSP checks and ZIP packaging. Run `npm test`, `npm run build`, `npm run check`, `npm run pack` in `extension/`. Check the focused PR's latest CI for its final status. Runtime dependency audit returned zero vulnerabilities when installed. Build/manifest checks enforce narrow optional origins, restricted CSP, correct Prompt L PNG dimensions, one screen, and no preview fixture/localhost code in release bundles.

## Finish / release work

1. Load `extension/dist` in native Chrome using the instructions in [extension/README.md](../extension/README.md). Check toolbar access on multiple origins and optional upload permission denial/grant.
2. Exercise PDF, Office, OCR and ZIP files from native Chrome. Verify actual `.md` bytes, drop-zone behavior, queue review edits, side-panel reopen, error/retry and Clear during conversion.
3. Open signed-in ChatGPT, Claude and Gemini chats. Check destination detection, Paste into an empty composer, preservation of an existing draft, and that no message is sent. Changed or unsupported editors must show a visible failure and Copy fallback.
4. Review [extension/PRIVACY.md](../extension/PRIVACY.md), publish a publicly accessible extension-specific privacy policy, and prepare the store listing/screenshots/developer registration. No store submission, publication or developer fee is handled by this implementation.
5. Merge/release the focused extension branch only after reviewing native acceptance. Do not change the production website to claim a store extension is already available.

The connected browser cannot install Chrome extensions. Native installation, Chrome permission prompts, actual downloads and live provider composer behavior must not be represented as tested until a person or a suitable native Chrome session verifies them.

## Other migration / optimization work

This branch does not merge the other optimization branches. At this review, [download recovery PR #1](https://github.com/DevBehindYou/LLMiser/pull/1), [cron optimization PR #2](https://github.com/DevBehindYou/LLMiser/pull/2) and [wake coalescing PR #3](https://github.com/DevBehindYou/LLMiser/pull/3) remain open. Live Supabase cron/Vault corrections were performed in the earlier cron task; distinguish those infrastructure changes from whether the PR has merged. The main source is still `ae3aa59`. Do not redeploy unrelated unfinished code while installing or releasing this extension.
