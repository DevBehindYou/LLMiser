import { draftRecord, pendingJobRecord } from './model.js';
import { UPLOAD_ORIGINS } from './uploads.js';
import { aiSite, pasteIntoComposer } from './ai.js';
export { convertUpload, resumeUpload } from './uploads.js';
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

export async function loadDraft() {
  await writes.catch(() => {});
  return draftRecord((await chrome.storage.session.get(DRAFT_KEY))[DRAFT_KEY]);
}
export const saveDraft = draft => serialize(() => chrome.storage.session.set({ [DRAFT_KEY]: draftRecord(draft) }));
const JOBS_KEY = 'llmiser-session-pending-v1';
const records = values => Array.isArray(values) ? values.map(pendingJobRecord).filter(Boolean).slice(0,20) : [];
export async function loadPendingJobs() {
  await writes.catch(() => {});
  return records((await chrome.storage.session.get(JOBS_KEY))[JOBS_KEY]);
}
export const savePendingJob = value => serialize(async () => {
  const record = pendingJobRecord(value);
  if (!record) throw new Error('Invalid recovery record');
  const jobs = records((await chrome.storage.session.get(JOBS_KEY))[JOBS_KEY]).filter(item => item.jobId !== record.jobId);
  if (jobs.length >= 20) throw new Error('Too many pending jobs');
  jobs.push(record);
  await chrome.storage.session.set({ [JOBS_KEY]: jobs });
});
export const removePendingJob = jobId => serialize(async () => {
  const jobs = records((await chrome.storage.session.get(JOBS_KEY))[JOBS_KEY]).filter(item => item.jobId !== jobId);
  await chrome.storage.session.set({ [JOBS_KEY]: jobs });
});
export const clearDraft = () => serialize(() => chrome.storage.session.remove([DRAFT_KEY, JOBS_KEY]));
export const copy = text => navigator.clipboard.writeText(text);
export { download } from './download.js';
