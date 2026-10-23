# LLMiser Chrome extension

Development build 0.1.0, 24 October 2026. **One Converter screen** using the approved Prompt L icon. This extension has not been published in the Chrome Web Store.

Choose or drop files → Convert files → review/edit Markdown → download `.md`, copy, or **Paste into ChatGPT / Claude / Gemini**. AI destination detection is automatic; pasting requires its own button and never sends the chat message. An existing composer draft is preserved. Local page/selection capture remains available in a collapsed section of the same screen. There are no Why, Blog, Theme, Menu, history or account screens.

## Build and install locally

Requires Node.js 22.13 or newer within the Node 22 release line and Chrome 116 or newer. From the repository root:

```powershell
Set-Location extension
npm ci --ignore-scripts --no-audit --no-fund
npm test
npm run build
npm run check
npm run pack
```

1. Open `chrome://extensions` in Chrome and enable Developer mode.
2. Choose **Load unpacked** and select `extension/dist` (the folder containing `manifest.json`). On this machine: `C:\Users\temp\Documents\GitHub\LLMiser\extension\dist`.
3. Pin LLMiser's Prompt L icon. Open an AI chat or a normal webpage and click the icon to open the Converter side panel.
4. Choose or drop files, choose a profile and click **Convert files**. Chrome asks for optional access to the LLMiser frontend and its storage host. Denying access sends no upload or job metadata.
5. Review a completed file. Edit the Markdown, then Download, Copy or Paste. For Paste, open ChatGPT, Claude or Gemini, click the toolbar icon on that tab to grant temporary access, and open an empty chat composer. Use Detect if the destination label has not updated. Press **Paste into [AI]** and review the composer before sending yourself.

The ZIP under `extension/artifacts/llmiser-chrome-0.1.0.zip` contains the same unpacked build, with `manifest.json` at its root. Extract it before Load unpacked. Rebuild and click Reload on Chrome's Extensions page after source changes; this clears Chrome session storage.

## File conversion

Uses the existing production Storage/job APIs and normal/OCR/archive backends; no server change or extension-specific credential is needed. The two optional network origins are exactly `https://llmiser.devbehindyou.com/*` and `https://ppmbqgecdbrezxedyeur.supabase.co/*`. No general website host access is requested. Page capture and AI paste use temporary `activeTab` access.

The shared format rules are imported from `frontend/lib/formats.js`: PDF, DOCX, PPTX, XLSX/XLS, EPUB, HTML, Markdown/text, CSV/TSV, JSON/XML, common images and ZIP. Up to 20 queue entries, documents/ZIP up to 15 MB each, images up to 10 MB each. Conversions run sequentially, with per-file status and errors. Standard, Clean, Compact and RAG-ready match the app. Scanned PDFs and ZIP processing use the existing server limits and scheduling. Multi-part archive Markdown is combined only after all required parts download successfully.

Selecting/dropping files does not upload them. Convert files uploads metadata and bytes to LLMiser's services. Failed items must be explicitly selected again to retry; an already uploaded job may still run, so do not repeatedly retry while a service is busy. Clear or closing the panel stops waiting and releases the local queue; it does **not** cancel/delete server jobs. Normal default 48-hour storage retention and documented administrative exceptions apply. The current draft is restored from session memory; the full multi-file queue is not restored. Edits are retained when reviewing different files while the panel stays open.

Results above 500,000 UTF-16 code units / 2 MB UTF-8 download budget are rejected visibly rather than truncated. Use the web app for larger outputs. This is an editor limit, separate from upload size limits. Token figures are rough character-based estimates, not provider tokenization or billing measurements.

## Local page capture and AI paste

Main article, page content and exact selected text are converted locally using Readability, Turndown and GFM. Forms, editables, scripts and hidden content are excluded; this is not guaranteed secret redaction. Selection capture fails visibly if nothing is selected. Links/tables/code/Unicode are retained where representable. Embedded frames, shadow DOM, Chrome internal pages, the Web Store and built-in PDF viewers are unsupported. Upload PDF files through the file picker instead.

AI recognition uses exact HTTPS hostnames for ChatGPT (`chatgpt.com`, `chat.openai.com`), Claude (`claude.ai`) and Gemini (`gemini.google.com`). Paste uses known composer selectors and plain text, with no model API calls or Send/Enter action. It refuses missing, ambiguous, hidden, disabled or nonempty editors. Provider UI changes may require adapter updates; Copy Markdown remains the fallback. Native Chrome acceptance against signed-in live AI editors is still pending.

Read [PRIVACY.md](PRIVACY.md) for local storage, upload destinations, clipboard/export and AI composer data handling. Inserting text into an AI composer exposes it to that site even before you send it. All code is bundled; the package includes the repository GPLv3 license and third-party notices.

## Verification and preview

`npm test` covers extraction, safe selection boundaries, output bounds, isolated Chrome calls, session races, exact export bytes, upload validation/destinations, archive assembly, drag/drop queuing, cancellation, AI recognition and composer preservation. `npm run check` checks MV3 permissions, restricted CSP, asset/icon dimensions, one screen and exclusion of the preview adapter. CI builds/tests/packages the extension independently and uploads the ZIP as an artifact.

`npm run preview` serves `http://127.0.0.1:3337` with the actual UI/extractor against a synthetic fixture. **File conversion is simulated in this preview and AI integration is disabled.** It does not test Chrome permissions, toolbar activation or provider editors. The development adapter and fixture are absent from the release ZIP.

An explicit production smoke test uploads four generated public fixtures (HTML, DOCX, PNG and ZIP), verifies their returned Markdown, and prints no signed URLs or credentials:

```powershell
# Also requires frontend dependencies for the synthetic PNG generator (sharp).
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/smoke-live.mjs --confirm-live
```

All 33 local tests, build, package checks and ZIP generation passed. These four real transport checks passed on 24 October 2026. Browser preview capture/edit/copy status, draft restore/Clear and file-picker queue flow also passed. The owner confirmed loading/enabling version 0.1.0 in native Chrome. Toolbar, upload permission and live AI-editor results remain pending. The connected in-app browser did not return a downloadable file event; actual file delivery remains a native Chrome acceptance item despite exact-byte export unit coverage.

Before publishing, test Load unpacked, toolbar activation on two origins, optional upload permission grant/denial, PDF/Office/OCR/ZIP conversion, actual `.md` download bytes, side-panel reopen, drag/drop, switching reviewed files, existing AI composer preservation and manual Paste on all three signed-in providers. Store listing, developer registration, hosted extension privacy policy, store screenshots and submission are separate unfinished release work.
