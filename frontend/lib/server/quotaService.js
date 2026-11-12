import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { maxFileSizeFor, poolForExtension, splitFileName, PROFILES } from '../formats.js';
import { getPoolConfig } from './dispatcher.js';
import { inputPath, sourceTypeFor, storageBudgetBytes } from './jobService.js';

export const GUEST_COOKIE = '__Host-llmiser_guest';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PROFILE = { Standard: 'standard', Clean: 'clean', Compact: 'compact', 'RAG-ready': 'rag_ready' };
export class QuotaError extends Error {
  constructor(code, status, detail, quota = null) { super(detail); Object.assign(this, { code, status, quota }); }
}
const unavailable = () => new QuotaError('QUOTA_UNAVAILABLE', 503, 'File limits are temporarily unavailable. Please try again shortly.');
const secret = env => {
  if (!env.QUOTA_GUEST_SECRET || env.QUOTA_GUEST_SECRET.length < 32) throw unavailable();
  return env.QUOTA_GUEST_SECRET;
};
const digest = (value, env) => createHmac('sha256', secret(env)).update(value).digest('hex');
export function issueGuest(env = process.env) {
  const nonce = randomBytes(32).toString('hex');
  return `${nonce}.${digest(`cookie:${nonce}`, env)}`;
}
export function guestSubject(request, env = process.env) {
  const token = request.headers.get('cookie')?.split(';').map(s => s.trim()).find(s => s.startsWith(`${GUEST_COOKIE}=`))?.slice(GUEST_COOKIE.length + 1);
  if (!token || !/^[a-f0-9]{64}\.[a-f0-9]{64}$/.test(token)) return null;
  const [nonce, signature] = token.split('.');
  if (!timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(digest(`cookie:${nonce}`, env), 'hex'))) return null;
  return digest(`subject:${nonce}`, env);
}
export function guestCookie(token) {
  return `${GUEST_COOKIE}=${token}; Path=/; Max-Age=7776000; Secure; HttpOnly; SameSite=Lax`;
}
export function assertQuotaOrigin(request) {
  const origin = request.headers.get('origin');
  const appOrigin = new URL(request.url).origin;
  if (origin && origin !== appOrigin && !/^chrome-extension:\/\/[a-p]{32}$/.test(origin)) {
    throw new QuotaError('ORIGIN_NOT_ALLOWED', 403, 'Open LLMiser to start this conversion.');
  }
  if (request.headers.get('sec-fetch-site') === 'cross-site' && !origin?.startsWith('chrome-extension://')) {
    throw new QuotaError('ORIGIN_NOT_ALLOWED', 403, 'Open LLMiser to start this conversion.');
  }
}
export async function quotaPolicy(db) {
  let policy;
  try { policy = await db.rpc('quota_policy', {}); } catch { throw unavailable(); }
  if (typeof policy?.enabled !== 'boolean') throw unavailable();
  return policy;
}
export function requireGuest(request, env = process.env) {
  assertQuotaOrigin(request);
  const subject = guestSubject(request, env);
  if (!subject) throw new QuotaError('GUEST_IDENTITY_REQUIRED', 428, 'Enable cookies for LLMiser and retry. Update the extension if you use it.');
  return subject;
}
export function normalizedManifest(files, env = process.env) {
  if (!Array.isArray(files) || files.length < 1 || files.length > 20) throw new QuotaError('INVALID_BATCH', 400, 'Choose between 1 and 20 files.');
  const seen = new Set();
  return files.map(file => {
    const fileId = typeof file?.file_id === 'string' ? file.file_id.toLowerCase() : '';
    if (!UUID.test(fileId) || seen.has(fileId)) throw new QuotaError('INVALID_BATCH', 400, 'Each file needs a unique identifier.');
    seen.add(fileId);
    const { base, ext } = splitFileName(String(file.filename || ''));
    const pool = poolForExtension(ext);
    if (!pool || !base || !Number.isSafeInteger(file.size) || file.size <= 0 || file.size > maxFileSizeFor(ext) || !PROFILES.includes(file.profile)) {
      throw new QuotaError('INVALID_FILE', 400, 'Check file types, sizes and the selected profile.');
    }
    if (!getPoolConfig(env)[pool].length) throw new QuotaError('BACKEND_UNAVAILABLE', 503, 'This conversion type is temporarily unavailable.');
    return { file_id: fileId, filename: base, extension: ext, size: file.size,
      content_type: typeof file.content_type === 'string' ? file.content_type.slice(0, 200) : null,
      profile: PROFILE[file.profile], source_type: sourceTypeFor(ext), workload_type: pool.toUpperCase() };
  }).sort((a, b) => a.file_id.localeCompare(b.file_id));
}
function accepted(result) {
  if (result?.allowed === true) return result;
  const code = result?.code;
  if (code === 'DAILY_FILE_LIMIT') throw new QuotaError(code, 429, 'This batch exceeds your remaining file limit. Remove files and try again.', result);
  if (code === 'IDEMPOTENCY_CONFLICT') throw new QuotaError(code, 409, 'This request identifier was already used for different files.');
  if (['QUOTA_RESERVATION_EXPIRED', 'UPLOAD_WINDOW_EXPIRED', 'RESULT_EXPIRED'].includes(code)) throw new QuotaError(code, 410, 'This upload reservation expired. Choose the files again.');
  if (code === 'QUOTA_RESERVATION_REQUIRED') throw new QuotaError(code, 428, 'Refresh LLMiser or update the extension before uploading.');
  if (code === 'BATCH_CAPACITY') throw new QuotaError(code, 503, 'LLMiser is handling many files. No files in this batch were admitted. Try again shortly.');
  throw unavailable();
}
export async function reserveBatch(db, request, input, env = process.env) {
  const subject = requireGuest(request, env);
  if (!UUID.test(input?.request_id || '')) throw new QuotaError('INVALID_BATCH', 400, 'A stable request identifier is required.');
  const files = normalizedManifest(input.files, env);
  return accepted(await db.rpc('reserve_quota_batch', { p_subject_hash: subject, p_request_id: input.request_id,
    p_files: files, p_bucket: db.bucket, p_budget_bytes: storageBudgetBytes(env) }));
}
export async function quotaUpload(db, request, input, env = process.env) {
  const subject = requireGuest(request, env);
  if (!UUID.test(input?.request_id || '') || !UUID.test(input?.file_id || '')) throw new QuotaError('QUOTA_RESERVATION_REQUIRED', 428, 'Reserve the selected batch before uploading.');
  const job = accepted(await db.rpc('quota_upload', { p_subject_hash: subject, p_request_id: input.request_id, p_file_id: input.file_id }));
  const path = inputPath(job.job_id, job.extension);
  if (job.upload_required === false) return { job_id: job.job_id, status: job.status, object_path: path, upload_url: null };
  if (job.upload_required !== true) throw unavailable();
  const upload = await db.signedUploadUrl(path);
  return { job_id: job.job_id, status: job.status, object_path: path, upload_url: upload.url };
}
export function quotaResponse(error) {
  if (!(error instanceof QuotaError)) return null;
  const headers = { 'Cache-Control': 'no-store' };
  const retryAt = error.quota?.requestedAvailableAt;
  if (retryAt) headers['Retry-After'] = String(Math.max(1, Math.ceil((Date.parse(retryAt) - Date.parse(error.quota.serverTime)) / 1000)));
  return Response.json({ ...(error.quota || {}), code: error.code, detail: error.message }, { status: error.status, headers });
}
