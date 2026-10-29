import { deleteClaimedFiles } from '../../../supabase/functions/cleanup-expired-jobs/cleanup.mjs';
// Server-only: data and actions behind /llmiser-controller. Every function takes
// the database client (lib/server/supabaseRest.js) so tests run it against the
// real migrations on PGlite. Routes check the admin session first
// (./adminRoute.js); every action that changes something is written to
// audit_logs.

import { getPoolConfig } from './dispatcher.js';
import { storageBudgetBytes } from './jobService.js';

export const ADMIN_URL_TTL_S = 600;
export const BULK_LIMIT = 100;
export const PROCESS_TIMEOUT_MS = 8_000;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const JOB_STATUSES = new Set([
  'UPLOADING', 'QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCEL_REQUESTED', 'CANCELLED', 'DELETING', 'DELETED',
  'CLEANUP_ERROR',
]);
const SOURCE_TYPES = new Set(['DOCUMENT', 'IMAGE', 'PDF', 'ARCHIVE']);
const ACTIVE = new Set(['UPLOADING', 'QUEUED', 'PROCESSING', 'CANCEL_REQUESTED']);

export class AdminError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = 'AdminError';
    this.status = status;
  }
}

export function assertJobId(jobId) {
  if (!UUID.test(String(jobId || ''))) throw new AdminError('Unknown job', 404);
  return String(jobId).toLowerCase();
}

function isoOrNull(value) {
  if (!value) return null;
  const t = Date.parse(value);
  if (Number.isNaN(t)) throw new AdminError('Bad cursor');
  return new Date(t).toISOString();
}

// ── Audit ──────────────────────────────────────────────────────────────────

export function audit(db, session, action, { jobId = null, targetType = jobId ? 'job' : null, details = {} } = {}) {
  return db.insert('audit_logs', {
    actor_type: 'ADMIN',
    actor_id: session?.sid ? `session:${session.sid.slice(0, 8)}` : 'admin',
    action,
    target_type: targetType,
    target_id: jobId,
    job_id: jobId,
    details,
  });
}

// ── Read ───────────────────────────────────────────────────────────────────

export async function overview(db, { env = process.env } = {}) {
  const [kpis, used] = await Promise.all([
    db.rpc('get_admin_kpis', {}),
    db.rpc('storage_usage_bytes', { p_bucket: db.bucket }).catch(() => null),
  ]);
  return {
    kpis,
    storage: { used_bytes: used === null ? null : Number(used), budget_bytes: storageBudgetBytes(env) },
  };
}

export async function listJobs(db, { limit = 50, before = null, beforeId = null, status = null, source = null } = {}) {
  if (status && !JOB_STATUSES.has(status)) throw new AdminError('Unknown status filter');
  if (source && !SOURCE_TYPES.has(source)) throw new AdminError('Unknown source filter');
  if (beforeId && !UUID.test(beforeId)) throw new AdminError('Bad cursor');
  const n = Math.min(Math.max(Number.parseInt(limit, 10) || 50, 1), 200);
  const rows = await db.rpc('admin_list_jobs', {
    p_limit: n,
    p_before: isoOrNull(before),
    p_before_id: beforeId || null,
    p_status: status || null,
    p_source: source || null,
  });
  const jobs = Array.isArray(rows) ? rows : [];
  const last = jobs[jobs.length - 1];
  return { jobs, next: jobs.length === n && last ? { before: last.created_at, before_id: last.job_id } : null };
}

export const DETAIL_PAGE_SIZE = 50;
export const DETAIL_MAX_PAGE_SIZE = 100;
const DETAIL_SECTIONS = {
  files: { table: 'file_objects', id: 'file_id', key: 'created_at', select: 'file_id,kind,object_path,extension,mime_type,size_bytes,storage_status,created_at,deleted_at' },
  nodes: { table: 'content_nodes', id: 'node_id', key: 'sequence_index', select: 'node_id,parent_node_id,node_type,classification,logical_path,page_from,page_to,sequence_index,archive_depth,size_bytes,status,skip_reason,engine,backend_instance,duration_ms,created_at,completed_at' },
  items: { table: 'work_items', id: 'work_item_id', key: 'created_at', select: 'work_item_id,node_id,task_type,pool,status,is_root,is_final,sequence_index,attempt_count,max_attempts,assigned_backend,error_code,error_message,duration_ms,created_at,claimed_at,completed_at' },
  events: { table: 'job_events', id: 'event_id', key: 'created_at', select: 'event_id,event_type,status,stage,backend_role,backend_instance,message,created_at' },
};
const JOB_DETAIL_FIELDS = 'job_id,original_filename,source_type,source_extension,profile,status,stage,progress,created_at,completed_at,processing_ms,backend_instance,engine,items_total,items_done,items_failed,items_skipped,error_code,error_message,warnings,files_deleted_at,retention_mode,retention_extended_until,auto_delete_at,cleanup_state,cleanup_last_error';

function detailLimit(limit = DETAIL_PAGE_SIZE) {
  if (!/^\d{1,3}$/.test(String(limit)) || Number(limit) < 1) throw new AdminError('Invalid page size');
  return Math.min(Number(limit), DETAIL_MAX_PAGE_SIZE);
}

function pageCursor(cursor, jobId, section, filter) {
  if (cursor === null || cursor === undefined) return null;
  if (typeof cursor !== 'string' || !/^[\w-]{1,512}$/.test(cursor)) throw new AdminError('Bad cursor');
  let value;
  try { value = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8')); } catch { throw new AdminError('Bad cursor'); }
  if (value?.v !== 1 || value.job !== jobId || value.section !== section || value.filter !== filter || !UUID.test(String(value.id || ''))) throw new AdminError('Bad cursor');
  if (section === 'nodes') {
    if (!Number.isInteger(value.key) || value.key < -2147483648 || value.key > 2147483647) throw new AdminError('Bad cursor');
  } else if (typeof value.key !== 'string'
      || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|[+-]\d{2}:\d{2})$/.test(value.key)
      || !Number.isFinite(Date.parse(value.key))) throw new AdminError('Bad cursor');
  return value;
}

function encodePageCursor(job, section, row, config, filter) {
  // Preserve PostgreSQL microseconds; Date.toISOString would round them away.
  return Buffer.from(JSON.stringify({ v: 1, job, section, filter, key: row[config.key], id: row[config.id] })).toString('base64url');
}

export async function jobDetailPage(db, jobId, section, { limit, cursor = null, stored = null, kind = null, jobKnown = false } = {}) {
  const id = assertJobId(jobId);
  const config = DETAIL_SECTIONS[section];
  if (!Object.hasOwn(DETAIL_SECTIONS, section)) throw new AdminError('Unknown detail section');
  const n = detailLimit(limit);
  if (stored !== null && stored !== '1') throw new AdminError('Unknown file filter');
  if (kind !== null && !['INPUT', 'OUTPUT', 'EXPORT', 'PREVIEW'].includes(kind)) throw new AdminError('Unknown file filter');
  if (section !== 'files' && (stored !== null || kind !== null)) throw new AdminError('Unknown file filter');
  const filter = `${stored || ''}:${kind || ''}`;
  const after = pageCursor(cursor, id, section, filter);
  if (!jobKnown && !(await db.select('jobs', { job_id: `eq.${id}`, select: 'job_id', limit: '1' }))?.length) throw new AdminError('Unknown job', 404);
  const base = { job_id: `eq.${id}`, ...(stored ? { storage_status: 'eq.ACTIVE' } : {}), ...(kind ? { kind: `eq.${kind}` } : {}) };
  const filters = { ...base, select: config.select, order: `${config.key}.asc,${config.id}.asc`, limit: String(n) };
  if (after) filters.or = `(${config.key}.gt.${after.key},and(${config.key}.eq.${after.key},${config.id}.gt.${after.id}))`;
  const [page, total, active] = await Promise.all([
    db.selectPage(config.table, filters),
    after ? db.count(config.table, { ...base, select: config.id, limit: '1' }) : null,
    section === 'files' ? db.count('file_objects', { job_id: `eq.${id}`, storage_status: 'eq.ACTIVE', select: 'file_id', limit: '1' }) : null,
  ]);
  if (page.rows.length > n || !Number.isSafeInteger(page.total) || page.total < page.rows.length) throw new AdminError('Invalid page response', 502);
  const last = page.rows.at(-1);
  return { section, rows: page.rows, total: total ?? page.total,
    next: last && page.total > page.rows.length ? encodePageCursor(id, section, last, config, filter) : null,
    ...(section === 'files' ? { active_total: active } : {}),
  };
}

export async function jobDetail(db, jobId) {
  const id = assertJobId(jobId);
  const jobs = await db.select('jobs', { job_id: `eq.${id}`, select: JOB_DETAIL_FIELDS, limit: '1' });
  if (!jobs?.[0]) throw new AdminError('Unknown job', 404);
  const sections = Object.keys(DETAIL_SECTIONS);
  const pages = await Promise.all(sections.map(section => jobDetailPage(db, id, section, { jobKnown: true })));
  return { job: jobs[0], ...Object.fromEntries(pages.map(page => [page.section, page.rows])),
    pages: Object.fromEntries(pages.map(({ rows, section, ...page }) => [section, page])) };
}

const FILE_STATUSES = new Set(['PENDING', 'ACTIVE', 'DELETE_PENDING', 'DELETED', 'ERROR']);

export async function listFiles(db, { limit = 100, before = null, beforeId = null, status = 'ACTIVE' } = {}) {
  if (status && !FILE_STATUSES.has(status)) throw new AdminError('Unknown status filter');
  if (beforeId && !UUID.test(beforeId)) throw new AdminError('Bad cursor');
  const n = Math.min(Math.max(Number.parseInt(limit, 10) || 100, 1), 200);
  const files = await db.rpc('admin_list_files', {
    p_limit: n,
    p_before: isoOrNull(before),
    p_before_id: beforeId || null,
    p_status: status || null,
  });
  const list = Array.isArray(files) ? files : [];
  const last = list[list.length - 1];
  return { files: list, next: list.length === n && last ? { before: last.created_at, before_id: last.file_id } : null };
}

export async function listAudit(db, { limit = 100, before = null, beforeId = null } = {}) {
  if (beforeId && !UUID.test(beforeId)) throw new AdminError('Bad cursor');
  const n = Math.min(Math.max(Number.parseInt(limit, 10) || 100, 1), 200);
  const entries = await db.rpc('admin_list_audit', { p_limit: n, p_before: isoOrNull(before), p_before_id: beforeId || null });
  const list = Array.isArray(entries) ? entries : [];
  const last = list[list.length - 1];
  return { entries: list, next: list.length === n && last ? { before: last.created_at, before_id: last.audit_id } : null };
}

/**
 * Readiness of every backend instance: instance name, host, state and time.
 * Full URLs stay on the server.
 */
export async function processes({ pools = getPoolConfig(), fetchImpl = fetch, timeoutMs = PROCESS_TIMEOUT_MS } = {}) {
  const checks = Object.entries(pools).flatMap(([pool, urls]) =>
    urls.map(async (url, i) => {
      const started = Date.now();
      const label = `${{ normal: 'N', ocr: 'O', archive: 'Z' }[pool] || '?'}${i + 1}`;
      let host = '';
      try {
        host = new URL(url).host;
      } catch {
        host = 'invalid URL';
      }
      try {
        const res = await fetchImpl(`${url}/api/v1/ready`, { cache: 'no-store', signal: AbortSignal.timeout(timeoutMs) });
        const body = await res.json().catch(() => ({}));
        return {
          pool,
          label,
          host,
          state: res.ok ? 'ready' : 'not_ready',
          http_status: res.status,
          instance: body.instance || null,
          engine: body.engine || null,
          detail: typeof body.detail === 'string' ? body.detail.slice(0, 200) : null,
          storage_configured: body.storage_configured ?? null,
          ms: Date.now() - started,
        };
      } catch (err) {
        return { pool, label, host, state: err?.name === 'TimeoutError' ? 'timeout' : 'unreachable', ms: Date.now() - started };
      }
    })
  );
  return { instances: await Promise.all(checks), checked_at: new Date().toISOString() };
}

// ── Files ──────────────────────────────────────────────────────────────────

/**
 * Short-lived signed link to one of the job's registered files. Only paths
 * recorded in file_objects for this job (and still stored) can be signed.
 */
export async function signFile(db, session, jobId, fileId, { purpose = 'download' } = {}) {
  const id = assertJobId(jobId);
  if (!UUID.test(String(fileId || ''))) throw new AdminError('Unknown file', 404);
  const rows = await db.select('file_objects', {
    job_id: `eq.${id}`,
    file_id: `eq.${fileId}`,
    select: 'file_id,kind,object_path,storage_status',
  });
  const file = rows?.[0];
  if (!file) throw new AdminError('Unknown file', 404);
  if (file.storage_status !== 'ACTIVE') throw new AdminError('This file is no longer stored', 410);
  // Stored names are generic (source.pdf, result.md); the job prefix keeps
  // downloads from different jobs apart.
  const downloadName = `${id.slice(0, 8)}-${file.object_path.split('/').pop()}`;
  const url = await db.signedDownloadUrl(file.object_path, ADMIN_URL_TTL_S, purpose === 'download' ? downloadName : undefined);
  if (purpose === 'download') {
    await audit(db, session, 'ADMIN_FILE_DOWNLOAD', { jobId: id, details: { file_id: file.file_id, kind: file.kind } });
  }
  return { url, name: downloadName, kind: file.kind, expires_in: ADMIN_URL_TTL_S };
}

// ── Retention and deletion ─────────────────────────────────────────────────

/** Claims the cleanup lease before Storage removal and records completion last. */
export async function purgeJobFiles(db, jobId) {
  const id = assertJobId(jobId);
  const job = await db.rpc('claim_job_cleanup', { p_job_id: id });
  if (!job?.cleanup_token) throw new AdminError('Cleanup is already running or the job is not due', 409);
  const args = { p_job_id: id, p_token: job.cleanup_token };
  try {
    const files = ((await db.select('file_objects', { job_id: `eq.${id}`, select: 'object_path,storage_status' })) || [])
      .filter(f => f.storage_status !== 'DELETED');
    const removed = await deleteClaimedFiles({ job, files,
      guard: () => db.rpc('begin_job_cleanup', args),
      list: (prefix, options) => db.listObjects(prefix, options),
      remove: paths => db.removeObjects(paths),
    });
    if (!await db.rpc('finish_job_cleanup', args)) throw new Error('Cleanup lease lost');
    return { removed };
  } catch {
    await db.rpc('fail_job_cleanup', args);
    throw new AdminError('Some files could not be deleted; cleanup will retry', 502);
  }
}

export async function setRetention(db, session, jobId, mode, hours = null) {
  const id = assertJobId(jobId);
  if (!['KEEP', 'EXTEND', 'AUTO'].includes(mode)) throw new AdminError('Unknown retention action');
  const h = mode === 'EXTEND' ? Number.parseInt(hours, 10) : null;
  if (mode === 'EXTEND' && !(h >= 1 && h <= 24 * 90)) throw new AdminError('Extend by 1 hour to 90 days');
  const result = await db.rpc('admin_set_retention', { p_job_id: id, p_mode: mode, p_hours: h });
  if (result === 'not_found') throw new AdminError('Unknown job', 404);
  if (result === 'files_deleted') throw new AdminError('Files for this job are already deleted', 409);
  if (result === 'cleanup_in_progress') throw new AdminError('Cleanup has started; retention can no longer change', 409);
  await audit(db, session, `ADMIN_RETENTION_${mode}`, { jobId: id, details: h ? { hours: h } : {} });
  return { job_id: id, result };
}

/** DELETE_NOW: running jobs are cancelled first; finished jobs lose their files at once. */
export async function deleteNow(db, session, jobId) {
  const id = assertJobId(jobId);
  const result = await db.rpc('request_delete_now', { p_job_id: id });
  if (result === 'not_found') throw new AdminError('Unknown job', 404);
  if (result === 'cleanup_in_progress') throw new AdminError('Cleanup is already running', 409);
  let removed = null;
  if (result === 'due_now') ({ removed } = await purgeJobFiles(db, id));
  await audit(db, session, 'ADMIN_DELETE_NOW', { jobId: id, details: { result, removed } });
  return { job_id: id, result: result === 'due_now' ? 'deleted' : result, removed };
}

/** Deletes the files, then the job's rows. The audit entry outlives the job. */
export async function deleteJob(db, session, jobId) {
  const id = assertJobId(jobId);
  const rows = await db.select('jobs', { job_id: `eq.${id}`, select: 'status,files_deleted_at' });
  const job = rows?.[0];
  if (!job) throw new AdminError('Unknown job', 404);
  if (ACTIVE.has(job.status)) throw new AdminError('Cancel the job first (Delete now), then delete it', 409);
  if (!job.files_deleted_at) {
    const result = await db.rpc('request_delete_now', { p_job_id: id });
    if (result !== 'due_now') throw new AdminError('Cleanup is already running', 409);
  }
  const { removed } = job.files_deleted_at ? { removed: 0 } : await purgeJobFiles(db, id);
  await db.remove('jobs', { job_id: `eq.${id}` });
  await audit(db, session, 'ADMIN_DELETE_JOB', { jobId: id, details: { removed } });
  return { job_id: id, result: 'job_deleted', removed };
}

export async function retryCleanup(db, session, jobId) {
  const id = assertJobId(jobId);
  const result = await db.rpc('admin_retry_cleanup', { p_job_id: id });
  if (result !== 'ok') throw new AdminError('Cleanup is not stuck for this job', 409);
  await audit(db, session, 'ADMIN_RETRY_CLEANUP', { jobId: id });
  return { job_id: id, result };
}

const ACTIONS = {
  KEEP: (db, s, id) => setRetention(db, s, id, 'KEEP'),
  EXTEND: (db, s, id, opts) => setRetention(db, s, id, 'EXTEND', opts.hours),
  AUTO: (db, s, id) => setRetention(db, s, id, 'AUTO'),
  DELETE_NOW: deleteNow,
  DELETE_JOB: deleteJob,
  RETRY_CLEANUP: retryCleanup,
};

export const ACTION_NAMES = Object.keys(ACTIONS);

export async function runAction(db, session, jobId, action, opts = {}) {
  const fn = ACTIONS[action];
  if (!fn) throw new AdminError('Unknown action');
  return fn(db, session, jobId, opts);
}

/** One action on many jobs, one after another; each job reports its own outcome. */
export async function bulkAction(db, session, jobIds, action, opts = {}) {
  if (!ACTIONS[action]) throw new AdminError('Unknown action');
  if (!Array.isArray(jobIds) || !jobIds.length) throw new AdminError('Select at least one job');
  if (jobIds.length > BULK_LIMIT) throw new AdminError(`At most ${BULK_LIMIT} jobs at once`);
  const results = [];
  for (const jobId of [...new Set(jobIds)]) {
    try {
      results.push({ job_id: jobId, ok: true, ...(await runAction(db, session, jobId, action, opts)) });
    } catch (err) {
      results.push({ job_id: jobId, ok: false, error: err instanceof AdminError ? err.message : 'Failed' });
    }
  }
  await audit(db, session, 'ADMIN_BULK', {
    targetType: 'jobs',
    details: { action, count: results.length, failed: results.filter((r) => !r.ok).length },
  });
  return { action, results };
}
