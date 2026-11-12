// Shared web/extension quota protocol. Server responses alone authorize work.
export class QuotaClientError extends Error {
  constructor(data, status) {
    super(data.detail || 'Could not check file limits. Please try again.');
    this.code = data.code; this.status = status; this.quota = data;
  }
}
async function fetchQuota({ fetchImpl = fetch, origin = '', signal } = {}) {
  const response = await fetchImpl(`${origin}/api/quota`, { credentials: 'include', cache: 'no-store', redirect: 'error', signal });
  const data = await response.json();
  if (!response.ok) throw new QuotaClientError(data, response.status);
  if (typeof data.enabled !== 'boolean') throw new Error('Could not verify file limits.');
  return data;
}
export async function readQuota(options = {}) {
  // Serialize first-cookie bootstrap across same-origin tabs, where supported.
  if (typeof navigator !== 'undefined' && navigator.locks?.request) {
    return navigator.locks.request('llmiser-guest-bootstrap', () => fetchQuota(options));
  }
  return fetchQuota(options);
}
export async function prepareUploads(files, profile, { fetchImpl = fetch, origin = '', signal,
  requestId = crypto.randomUUID(), fileIds = files.map(() => crypto.randomUUID()) } = {}) {
  const quota = await readQuota({ fetchImpl, origin, signal });
  if (!quota.enabled) return { quota, reservations: files.map(() => null) };
  const manifest = files.map((file, index) => ({ file_id: fileIds[index], filename: file.name,
    size: file.size, content_type: file.type || null, profile }));
  const response = await fetchImpl(`${origin}/api/uploads/reserve`, { method: 'POST', credentials: 'include',
    cache: 'no-store', redirect: 'error', signal, headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ request_id: requestId, files: manifest }) });
  const result = await response.json();
  if (!response.ok) throw new QuotaClientError(result, response.status);
  // A policy change during preflight must not turn into an unmetered fallback.
  if (result.allowed !== true || result.files?.length !== files.length) throw new Error('File limits changed. Please retry the same selection.');
  return { quota: result.quota, reservations: fileIds.map(fileId => {
    const record = result.files.find(f => f.file_id === fileId);
    if (!record?.job_id) throw new Error('The batch reservation was incomplete.');
    return { request_id: requestId, file_id: fileId, job_id: record.job_id };
  }) };
}
