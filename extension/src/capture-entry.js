import { captureDocument, CaptureError } from './capture.js';

// This name exists only in Chrome's isolated extension world. No messages
// or page-controlled callbacks are registered in the website's main world.
globalThis.__LLMISER_CAPTURE_V1__ = options => {
  try { return { ok: true, draft: captureDocument(document, options) }; }
  catch (error) { return { ok: false, error: error instanceof CaptureError ? error.message : 'Could not read this page. Try capturing a smaller selection.' }; }
};
