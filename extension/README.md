# LLMiser Chrome extension

Development build **0.2.0**, 24 October 2026. One file Converter screen in a **400 × 600 toolbar popup**, like a wallet extension, using the approved Prompt L icon. No side panel, page/selection capture, Why, Blog, Theme, Menu, history or account screens. This build is not published in the Chrome Web Store.

Choose or drop files → Convert files → review/edit Markdown → download `.md`, copy, or click **Paste into ChatGPT / Claude / Gemini**. AI-site detection is automatic; pasting requires its own button, preserves existing composer text and never sends a chat message.

## Build, install and update

Requires Node.js 22.13 or newer in the Node 22 line and Chrome 116 or newer. From the repository root:

```powershell
Set-Location extension
npm ci --ignore-scripts --no-audit --no-fund
npm test
npm run build
npm run check
npm run pack
```

Open `chrome://extensions`, enable Developer mode, choose Load unpacked and select `extension/dist` (the directory containing `manifest.json`). On this machine: `C:\Users\temp\Documents\GitHub\LLMiser\extension\dist`.

**Already loaded 0.1.0?** Close the old side panel, then click Reload (↻) on LLMiser's card at `chrome://extensions`. The card should show **0.2.0**. Click the pinned Prompt L toolbar icon to open the popup. No new unpacked path or reinstall is needed. Reload clears session drafts and recovery records, so export useful Markdown first.

The ZIP `extension/artifacts/llmiser-chrome-0.2.0.zip` contains this same build with `manifest.json` at its root; extract before Load unpacked.

## Use the Converter

1. Open an AI chat and click the Prompt L icon. Choose files or drag them onto the drop zone.
2. Choose Standard, Clean, Compact or RAG-ready and click Convert files. Allow optional access to LLMiser's frontend and storage project. Denial sends no file or job metadata.
3. Review a completed file and edit its Markdown. Copy or download the current text; use Review to switch files while the popup stays open.
4. For Paste, open an empty ChatGPT, Claude or Gemini composer and click Prompt L on that tab. Check the AI destination label and click Paste into [AI]. Review the composer and send the message yourself. Existing composer text is never overwritten; Copy is the fallback if the provider changes its UI.

Selecting/dropping does not upload. All file processing uses the existing production signed-upload/job APIs and normal/OCR/archive backends. No frontend/backend runtime code changes or extension-specific credentials are needed. Optional network origins are exactly `https://llmiser.devbehindyou.com/*` and `https://ppmbqgecdbrezxedyeur.supabase.co/*`; active-tab access is used only for AI detection/Paste.

Shared format validation comes from `frontend/lib/formats.js`: PDF, DOCX, PPTX, XLSX/XLS, EPUB, HTML, Markdown/text, CSV/TSV, JSON/XML, common images and ZIP. Maximum 20 queue entries; documents/ZIP up to 15 MB each and images up to 10 MB each. Conversion runs sequentially. Existing scanned-PDF/archive limits apply. Multi-part archive Markdown is shown only after all required parts download successfully. Results above 500,000 UTF-16 code units / a 2 MB UTF-8 download budget fail visibly rather than truncate; use the web app for larger outputs. Token figures are rough character-based estimates, not provider tokenization or billing.

## Popup lifecycle and recovery

Chrome closes toolbar popups when you click outside them; see the [Chrome popup documentation](https://developer.chrome.com/docs/extensions/develop/ui/add-popup). Keep this popup open while file bytes upload. After upload, reopening restores recovery records and offers **Resume files**, which starts/checks the same job ID and retrieves its result without creating a new upload. An interrupted upload can be checked through Resume; if bytes did not finish, choose that file again. Files still waiting locally must be selected again after closing.

One latest Markdown draft and up to 20 pending-job records are stored in Chrome session memory. File bytes and signed URLs are not retained in recovery records. The full completed-file review queue lives only in the open popup; export files you need. Clear removes local data and aborts client waiting; it does not cancel/delete server jobs. Uploaded files follow normal default 48-hour retention and documented administrative exceptions. Closing Chrome or disabling/updating/reloading the extension clears session storage. Read [PRIVACY.md](PRIVACY.md).

## Tests and release status

`npm test` covers file conversion, safe destinations, archive assembly, exact export bytes, drag/drop validation, cancellation/Clear, draft edits, AI recognition/Paste protection, and recovery across popup closure. `npm run check` enforces a popup action, no side-panel/background registration, narrow optional origins, CSP, icon dimensions, removal of page-capture code and the exact release-file allowlist. CI builds/tests/packages the extension and uploads the ZIP.

`npm run preview` serves a 400 × 600 UI frame at `http://127.0.0.1:3337`. **Preview file conversion is simulated; AI integration is disabled.** The adapter is absent from release bundles. This preview cannot verify actual toolbar placement, Chrome permission prompts, downloads or signed-in provider editors.

Explicit production smoke tests use generated, nonprivate fixtures only:

```powershell
# One real job: upload, interrupt, resume the original job without re-uploading.
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/smoke-recovery.mjs --confirm-live
# Four real jobs: HTML, DOCX, PNG OCR and ZIP. Requires frontend dependencies for sharp.
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/smoke-live.mjs --confirm-live
```

The original four transport checks passed on 24 October 2026. The new popup-recovery smoke also passed with only two recovery requests (start + result download). The owner loaded 0.1.0; native 0.2.0 popup activation, optional permission handling, actual `.md` delivery and live provider Paste still require user acceptance. No Chrome Web Store registration, public extension privacy-policy hosting, listing/screenshots or submission is complete. The package includes the repository GPLv3 license; no third-party runtime libraries remain after removal of page extraction.
