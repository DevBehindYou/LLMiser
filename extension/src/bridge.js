import { draftRecord } from './model.js';
import { UPLOAD_ORIGINS } from './uploads.js';
import { aiSite, pasteIntoComposer } from './ai.js';
export { convertUpload } from './uploads.js';
export const authorizeUploads = () => chrome.permissions.request({ origins: UPLOAD_ORIGINS });
export async function detectAI() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return aiSite(tab?.url);
}
export function onTargetChange(callback) {
  const changed = () => callback();
  chrome.tabs.onActivated.addListener(changed);
  chrome.tabs.onUpdated.addListener(changed);
  return () => { chrome.tabs.onActivated.removeListener(changed); chrome.tabs.onUpdated.removeListener(changed); };
}
export async function paste(text) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const site = aiSite(tab?.url);
  if (!tab?.id || !site) throw new Error('Open ChatGPT, Claude or Gemini, then click the LLMiser toolbar icon on that tab.');
  let frames;
  try {
    frames = await chrome.scripting.executeScript({ target: { tabId: tab.id }, world: 'ISOLATED',
      func: pasteIntoComposer, args: [{ site: site.id, text }] });
  } catch { throw new Error('Click the LLMiser toolbar icon on the AI tab to grant access, then try Paste again.'); }
  const result = frames.find(frame => frame.frameId === 0)?.result;
  if (!result?.ok) throw new Error(result?.error || 'Could not paste. Use Copy Markdown and paste into the chat.');
  return site.label;
}

const DRAFT_KEY = 'llmiser-session-draft-v1';
let writes = Promise.resolve();
const serialize = operation => {
  writes = writes.catch(() => {}).then(operation);
  return writes;
};

export async function capture(options) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) throw new Error('Open a webpage, then click the LLMiser toolbar icon.');
  if (tab.url && (!/^https?:\/\//.test(tab.url) || /^https:\/\/(chromewebstore\.google\.com|chrome\.google\.com\/webstore)/.test(tab.url))) {
    throw new Error('Chrome internal pages, the Web Store and the built-in PDF viewer cannot be captured. Open a normal webpage.');
  }
  let result;
  try {
    const injected = await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['capture.js'], world: 'ISOLATED' });
    const documentId = injected.find(frame => frame.frameId === 0)?.documentId;
    if (!documentId) throw new Error('Page changed');
    const frames = await chrome.scripting.executeScript({
      target: { tabId: tab.id, documentIds: [documentId] }, world: 'ISOLATED',
      func: opts => globalThis.__LLMISER_CAPTURE_V1__(opts), args: [options],
    });
    result = frames[0]?.result;
  } catch {
    throw new Error('Chrome could not read this page. Click the toolbar icon again to grant access, then retry. Internal pages, PDF viewers and embedded frames are not supported.');
  }
  if (!result?.ok) throw new Error(result?.error || 'No result was returned. Try again after the page loads.');
  const draft = draftRecord(result.draft);
  if (!draft) throw new Error('The captured result is too large or invalid. Select a smaller section.');
  return draft;
}

export async function loadDraft() {
  await writes.catch(() => {});
  return draftRecord((await chrome.storage.session.get(DRAFT_KEY))[DRAFT_KEY]);
}
export const saveDraft = draft => serialize(() => chrome.storage.session.set({ [DRAFT_KEY]: draftRecord(draft) }));
export const clearDraft = () => serialize(() => chrome.storage.session.remove(DRAFT_KEY));
export const copy = text => navigator.clipboard.writeText(text);
export { download } from './download.js';
