import { startUploadedJob, waitForJob, fetchResultMarkdown } from '../../frontend/lib/models/conversionService.js';
import { PROFILES, validateUpload } from '../../frontend/lib/formats.js';
import { MAX_MARKDOWN, pendingJobRecord } from './model.js';

export const APP_ORIGIN = 'https://llmiser.devbehindyou.com';
export const STORAGE_ORIGIN = 'https://ppmbqgecdbrezxedyeur.supabase.co';
export const UPLOAD_ORIGINS = [`${APP_ORIGIN}/*`, `${STORAGE_ORIGIN}/*`];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const BUCKET = 'mdify-pro-files'; // Existing production compatibility contract.

export function signedStorageUrl(value, jobId, upload = false) {
  let url;
  try { url = new URL(value); } catch { throw new Error('The converter returned an invalid storage link.'); }
  const prefix = `/storage/v1/object/${upload ? 'upload/sign' : 'sign'}/${BUCKET}/jobs/${jobId}/${upload ? 'input/' : 'output/'}`;
  if (!UUID.test(jobId) || url.origin !== STORAGE_ORIGIN || url.username || url.password || url.hash ||
      !url.pathname.startsWith(prefix) || !url.searchParams.get('token')) {
    throw new Error('The converter returned an unexpected storage destination. No file was sent there.');
  }
  return url.href;
}

async function boundedText(response, maxBytes) {
  const reader = response.body?.getReader();
  if (!reader) return '';
  const decoder = new TextDecoder();
  let bytes = 0, text = '';
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > maxBytes) {
        await reader.cancel();
        throw new Error('This result is too large for the extension editor. Use the LLMiser web app for this file.');
      }
      text += decoder.decode(value, { stream: true });
    }
    return text + decoder.decode();
  } finally { reader.releaseLock(); }
}

// No cookies, authorization keys, arbitrary URLs or redirects. The permission
// is optional; it is requested only by the Convert files button in the popup.
export const convertUpload = (file, profile, options) => runConversion(file, profile, options);
export async function resumeUpload(checkpoint, options) {
  const record = pendingJobRecord(checkpoint);
  if (!record) throw new Error('The saved conversion cannot be resumed. Choose the file again.');
  return runConversion({ name: record.filename }, null, options, record);
}
async function runConversion(file, profile, { signal, onProgress, onCheckpoint, fetchImpl = fetch,
  sleepImpl, now } = {}, resumeJob = null) {
  if (!resumeJob) {
    const invalid = validateUpload(file);
    if (invalid) throw new Error(invalid);
    if (!PROFILES.includes(profile)) throw new Error('Choose a conversion profile.');
  }
  const send = async (url, init = {}) => {
    const controller = new AbortController();
    const abort = () => controller.abort();
    signal?.addEventListener('abort', abort, { once: true });
    if (signal?.aborted) controller.abort();
    const timer = setTimeout(abort, 300_000);
    try {
      const response = await fetchImpl(url, { ...init, signal: controller.signal,
        credentials: 'omit', redirect: 'error', cache: 'no-store', referrerPolicy: 'no-referrer' });
      // Keep the timeout active while reading the body, not just the headers.
      const limit = new URL(url).origin === APP_ORIGIN ? 512_000 : 2_000_000;
      const text = await boundedText(response, limit);
      return new Response([204,205,304].includes(response.status) ? null : text, { status: response.status, headers: response.headers });
    } finally { clearTimeout(timer); signal?.removeEventListener('abort', abort); }
  };
  let job = resumeJob ? { job_id: resumeJob.jobId } : null;
  if (!resumeJob) {
    const created = await send(`${APP_ORIGIN}/api/uploads/create`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: file.name, size: file.size, content_type: file.type || null, profile }),
    });
    job = await created.json().catch(() => ({}));
    if (!created.ok) throw new Error(String(job.detail || `Could not start upload (${created.status}).`).slice(0, 400));
    if (!UUID.test(job.job_id || '')) throw new Error('The converter returned an invalid job. Please retry.');
    const uploadUrl = signedStorageUrl(job.upload_url, job.job_id, true);
    await onCheckpoint?.({ jobId: job.job_id, filename: file.name, phase: 'uploading' });
    const form = new FormData(); form.append('cacheControl', '3600'); form.append('', file);
    onProgress?.('Uploading…');
    const uploaded = await send(uploadUrl, { method: 'PUT', body: form });
    if (!uploaded.ok) throw new Error(`Upload failed (${uploaded.status}). Please retry.`);
    await onCheckpoint?.({ jobId: job.job_id, filename: file.name, phase: 'processing' });
  }
  const apiFetch = (url, init) => {
    if (![ `/api/jobs/${job.job_id}/start`, `/api/jobs/${job.job_id}/advance` ].includes(url)) {
      throw new Error('Unexpected conversion endpoint.');
    }
    return send(`${APP_ORIGIN}${url}`, init);
  };
  onProgress?.('Converting…');
  const first = await startUploadedJob(job.job_id, { signal, fetchImpl: apiFetch, sleepImpl, now });
  const status = await waitForJob(job.job_id, first, { signal, fetchImpl: apiFetch, sleepImpl, now,
    onProgress: percent => onProgress?.(`Converting… ${percent}%`) });
  if (status.status !== 'COMPLETED') throw new Error(String(status.detail || status.error?.message || 'Conversion failed.').slice(0, 400));
  const result = status.result || {};
  let totalBytes = 0;
  const content = await fetchResultMarkdown(result, { sourceType: status.source_type, signal,
    fetchImpl: async url => {
      const response = await send(signedStorageUrl(url, job.job_id));
      const text = await response.text(); totalBytes += new TextEncoder().encode(text).length;
      if (totalBytes > 2_000_000) throw new Error('This result is too large for the extension. Use the web app for this file.');
      return new Response(text, { status: response.status });
    } });
  if (!content.trim()) throw new Error('The conversion returned no readable text.');
  if (content.length > MAX_MARKDOWN) throw new Error('This result is too large for the extension editor. Use the web app for this file.');
  return { markdown: content, title: file.name, mode: 'file', capturedAt: new Date().toISOString(),
    warnings: [...(Array.isArray(result.warnings) ? result.warnings : []), ...(result.warning ? [result.warning] : [])] };
}
