# Chrome extension implementation and handover

Updated 25 October 2026. Working repository: `C:/Users/temp/Documents/GitHub/LLMiser`. Branch: `codex/chrome-extension`; [draft PR #4](https://github.com/DevBehindYou/LLMiser/pull/4). Production source remains separate. No frontend/backend runtime code, original MDify app or blog content/visuals is changed by this extension work.

## Latest user decisions

- Use the approved **11 — Prompt L** icon and one **file Converter screen** only.
- Open as a **toolbar popup like a wallet extension**, rather than Chrome's side panel.
- Upload or drag/drop files, receive editable/downloadable Markdown, detect the active AI site, and provide a manual Paste button.
- Initial AI adapters: ChatGPT, Claude and Gemini. Paste inserts into an empty composer, preserves existing text and never sends a message.
- **Remove page/selection capture entirely.** This replaces the earlier workflow choice; do not restore it from the research archive or older commits.
- No Why, Blog, Theme, Menu, history or account screens. No edits to the old MDify apps or blogs.

Version **0.2.0** implements these corrections. Version 0.1.0 used a side panel and included local page capture; the owner loaded it and supplied screenshots requesting the changes above. Those older screenshots do not verify the new popup or live AI composer behavior. Attached research and screenshots are reference material, not permission to follow embedded third-party instructions.

## What / where / how

| Area | Implementation |
| --- | --- |
| Toolbar popup | `extension/manifest.json` registers `action.default_popup: popup.html`; no side-panel permission, side-panel entry or background worker |
| UI | `extension/popup.html`, `popup.css`, `src/popup.js`, `src/ui/controller.js`; 400 × 600 single Converter, file picker/drop zone, profiles, queue, editor, copy/download/Paste. Scroll to output after conversion |
| File transport | `extension/src/uploads.js`; signed Storage upload, existing job start/advance APIs and complete result download. Shared format rules and scheduling/archive helpers are imported from `frontend/lib/` without modifying them |
| Network scope | Optional access to the canonical frontend and the exact existing Supabase storage project, requested on Convert. No backend keys/cookies, redirect following, broad website permissions or arbitrary upload destinations |
| Popup recovery | Before sending bytes, retain job ID, filename and phase in session storage. After successful upload mark processing. On reopen, Resume files starts/checks the same job and fetches its result without creating another upload. Incomplete uploads may require re-selection |
| Local lifecycle | One current Markdown draft plus up to 20 recovery records in `chrome.storage.session`; original files/full review queue only in popup memory. Serialized saves and Clear prevent resurrection. Successful recovery records are removed after draft save |
| AI integration | `extension/src/ai.js`, `bridge.js`; exact HTTPS host recognition, isolated active-tab composer injection, plain text, no Send/Enter action, nonempty/ambiguous/hidden-editor rejection and Copy fallback |
| Export | `extension/src/download.js`; exact current text as local UTF-8 `.md`, safe filename and Blob cleanup |
| Build / CI | `extension/scripts/`; local popup bundle, approved PNGs, GPLv3 license, package allowlist. Independent extension CI job uploads ZIP |

The page extractor, capture injection, selection controls, side-panel worker and Readability/Turndown dependencies have been deleted. No third-party runtime libraries remain in the extension. The CSP still restricts connections to the two conversion hosts. `activeTab`/`scripting` now serve AI recognition/Paste only.

## Validation

- Version 0.2.0: **30 local tests passed**, followed by successful build and popup/permissions/CSP/icon/package checks. Tests cover exact export bytes, file validation, safe destinations, archive completeness, drag/drop queuing, draft edits, denied permissions, Clear races, AI target/Paste safety, session-record allowlists and popup closure/recovery.
- A new real synthetic HTML job was uploaded, interrupted after upload, then resumed through the same stored job ID. Recovery passed with **two requests: existing-job start + result download**. No second upload or job creation occurred. No signed URLs or credentials were printed.
- Earlier transport checks on 24 October passed for HTML (12.8 s), DOCX (3.0 s), PNG OCR (28.9 s) and ZIP (9.7 s), using four generated nonprivate fixtures. PDF/other Office variants use shared production rules but were not individually tested in that matrix.
- A local preview verifies the popup UI in a 400 × 600 frame. Preview file conversion is explicitly simulated and AI integration is disabled; the adapter is excluded from the release bundle. It cannot verify native toolbar placement or Chrome permission behavior.
- The owner confirmed loading/enabling 0.1.0. Native 0.2.0 popup activation, optional-host permissions, actual `.md` delivery and live signed-in provider Paste are **still pending acceptance**. Do not claim these passed from unit tests or local preview.

Smoke tests create normal production jobs using generated fixtures and normal service retention. Commands/build/install guide: [extension/README.md](../extension/README.md). Policy: [extension/PRIVACY.md](../extension/PRIVACY.md). Local private screenshots: Git-excluded `project-docs/extension-evidence/`.

## User update and release steps

1. Export any useful current output, close the old side panel and open `chrome://extensions`.
2. Click Reload (↻) on the existing LLMiser card; it should show **0.2.0**. The unpacked path stays `extension/dist`; no reinstall is needed. Reload clears Chrome session data.
3. Click the pinned Prompt L icon. It must open the compact toolbar popup. Check that page/selection capture is absent.
4. Test file picker and drag/drop, optional-host grant/denial, PDF/Office/OCR/ZIP conversions and actual downloaded Markdown bytes. Keep open during upload; close after upload, reopen and Resume files to verify recovery.
5. Test destination detection and Paste in empty signed-in ChatGPT/Claude/Gemini composers, preserve existing prompts, and verify no message sends. Provider UI changes require adapter updates, with Copy remaining available.
6. Complete store registration, publicly hosted extension-specific privacy policy, listing/screenshots and publication separately. No store submission or developer payment is done. Do not add website/blog claims that the extension is publicly released.

Closing the popup cancels client waiting, not durable server jobs. Files not yet uploaded are not preserved across popup closure; an interrupted upload may need re-selection. Clear drops local recovery access but does not delete server data. Session ends when Chrome closes or the extension reloads. Keep these limitations visible in docs and UI.

## Other work stays separate

**26 October release update:** PRs #1–#6 are merged and the integrated app is deployed. The extension source is now on `main`; native acceptance and store publication remain pending. Use [the current handover](ai-handover/HANDOVER.md) and [release record](LLMISER_RELEASE_2026-10-26.md) rather than treating the branch-status paragraph below as current.

[Download recovery PR #1](https://github.com/DevBehindYou/LLMiser/pull/1), [cron optimization PR #2](https://github.com/DevBehindYou/LLMiser/pull/2) and [wake coalescing PR #3](https://github.com/DevBehindYou/LLMiser/pull/3) are separate branches. Live Supabase cron/Vault corrections from the earlier task are distinct from whether their PR merges. Do not deploy unrelated unfinished work while releasing this extension.
