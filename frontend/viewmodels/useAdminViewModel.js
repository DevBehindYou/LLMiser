'use client';
import { useI18n } from '../components/i18n/I18nContext';

// View models for /llmiser-controller. Components render state from these hooks
// and call their actions; all data comes from lib/models/adminApi.js.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { adminApi, downloadFile, downloadZip, previewText } from '../lib/models/adminApi';
import { buildContentTree } from '../lib/models/contentTree';
import { collectStoredFiles, mergeDetailPage } from '../lib/models/adminDetail';

// ── Session ────────────────────────────────────────────────────────────────

export function useAdminSessionViewModel() {
  const [state, setState] = useState('loading'); // loading | unconfigured | signed-out | signed-in
  const [expiresAt, setExpiresAt] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    adminApi
      .session()
      .then((s) => {
        if (!alive) return;
        if (!s.configured) setState('unconfigured');
        else if (s.authenticated) {
          setExpiresAt(s.expires_at);
          setState('signed-in');
        } else setState('signed-out');
      })
      .catch(() => alive && setState('signed-out'));
    return () => {
      alive = false;
    };
  }, []);

  // Sign out on the client when the session runs out.
  useEffect(() => {
    if (state !== 'signed-in' || !expiresAt) return undefined;
    const t = setTimeout(() => {
      setState('signed-out');
      setError('Your session ended. Sign in again.');
    }, Math.max(0, expiresAt - Date.now()));
    return () => clearTimeout(t);
  }, [state, expiresAt]);

  const login = useCallback(async (key1, key2) => {
    setBusy(true);
    setError(null);
    try {
      const s = await adminApi.login(key1, key2);
      setExpiresAt(s.expires_at);
      setState('signed-in');
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setBusy(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await adminApi.logout().catch(() => {});
    setState('signed-out');
    setExpiresAt(null);
  }, []);

  /** Any 401 from the API ends the session in the UI. */
  const handleError = useCallback((err) => {
    if (err?.status === 401) {
      setState('signed-out');
      setError('Your session ended. Sign in again.');
      return true;
    }
    return false;
  }, []);

  return { state, expiresAt, error, busy, login, logout, handleError };
}

// ── Generic list / resource ────────────────────────────────────────────────

/**
 * `load(cursor)` → { items, next }. Keeps pages, loading and error state.
 * `deps` reset the list (filters).
 */
export function usePagedList(load, deps, { handleError, enabled = true } = {}) {
  const [items, setItems] = useState([]);
  const [next, setNext] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const generation = useRef(0);

  const fetchPage = useCallback(
    async (cursor, append) => {
      const gen = ++generation.current;
      setLoading(true);
      setError(null);
      try {
        const page = await load(cursor);
        if (gen !== generation.current) return;
        setItems((prev) => (append ? [...prev, ...page.items] : page.items));
        setNext(page.next);
      } catch (err) {
        if (gen !== generation.current) return;
        if (!handleError?.(err)) setError(err.message);
      } finally {
        if (gen === generation.current) setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps
  );

  useEffect(() => {
    if (enabled) fetchPage(null, false);
  }, [fetchPage, enabled]);

  return {
    items,
    next,
    loading,
    error,
    reload: () => fetchPage(null, false),
    loadMore: () => next && fetchPage(next, true),
  };
}

export function useAdminResource(load, { handleError, enabled = true, refreshMs = 0 } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await load());
    } catch (err) {
      if (!handleError?.(err)) setError(err.message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;
    reload();
    if (!refreshMs) return undefined;
    const t = setInterval(() => {
      if (document.visibilityState === 'visible') reload();
    }, refreshMs);
    return () => clearInterval(t);
  }, [enabled, refreshMs, reload]);

  return { data, loading, error, reload };
}

// ── Jobs ───────────────────────────────────────────────────────────────────

export const EXTEND_OPTIONS = [
  { hours: 24, label: '1 day' },
  { hours: 72, label: '3 days' },
  { hours: 168, label: '7 days' },
  { hours: 720, label: '30 days' },
];

const CONFIRM = {
  DELETE_NOW: 'Delete the stored files of the selected job(s) now? This cannot be undone.',
  DELETE_JOB: 'Delete the files AND the job record(s)? Only the audit entry stays. This cannot be undone.',
};

export function useAdminJobsViewModel({ handleError, notify }) {
  const { uiText } = useI18n();
  const [status, setStatus] = useState('');
  const [source, setSource] = useState('');
  const [selected, setSelected] = useState(() => new Set());
  const [openJobId, setOpenJobId] = useState(null);
  const [working, setWorking] = useState(null); // label of the running action

  const list = usePagedList(
    async (cursor) => {
      const page = await adminApi.jobs({ status, source, limit: 50, before: cursor?.before, before_id: cursor?.before_id });
      return { items: page.jobs, next: page.next };
    },
    [status, source],
    { handleError }
  );

  useEffect(() => setSelected(new Set()), [status, source]);

  const toggle = useCallback((jobId) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(jobId)) next.delete(jobId);
      else next.add(jobId);
      return next;
    });
  }, []);

  const allSelected = list.items.length > 0 && list.items.every((j) => selected.has(j.job_id));
  const toggleAll = useCallback(() => {
    setSelected(allSelected ? new Set() : new Set(list.items.map((j) => j.job_id)));
  }, [allSelected, list.items]);

  const runBulk = useCallback(
    async (action, hours) => {
      const ids = [...selected];
      if (!ids.length) return;
      if (CONFIRM[action] && !window.confirm(uiText(CONFIRM[action]))) return;
      setWorking(action);
      try {
        const { results } = await adminApi.bulk(ids, action, hours);
        const failed = results.filter((r) => !r.ok);
        notify(failed.length ? `${results.length - failed.length} done, ${failed.length} failed: ${failed[0].error}` : `${results.length} job(s) updated`, failed.length ? 'error' : 'ok');
        setSelected(new Set());
        list.reload();
      } catch (err) {
        if (!handleError(err)) notify(err.message, 'error');
      } finally {
        setWorking(null);
      }
    },
    [selected, notify, handleError, list, uiText]
  );

  const closeJob = useCallback(() => setOpenJobId(null), []);

  const zipSelected = useCallback(async () => {
    const ids = [...selected];
    if (!ids.length) return;
    setWorking('ZIP');
    try {
      const items = await collectStoredFiles(ids, { loadPage: adminApi.jobPage, outputsOnly: true });
      if (!items.length) {
        notify('The selected jobs have no stored results', 'error');
        return;
      }
      const { files } = await downloadZip(items, { zipName: `llmiser-results-${ids.length}-jobs.zip` });
      notify(`ZIP with ${files} file(s) downloaded`, 'ok');
    } catch (err) {
      if (!handleError(err)) notify(err.message, 'error');
    } finally {
      setWorking(null);
    }
  }, [selected, notify, handleError]);

  return {
    ...list,
    status,
    setStatus,
    source,
    setSource,
    selected,
    toggle,
    toggleAll,
    clearSelection: () => setSelected(new Set()),
    allSelected,
    runBulk,
    zipSelected,
    working,
    openJobId,
    openJob: setOpenJobId,
    closeJob,
  };
}

export function useAdminJobDetailViewModel(jobId, { handleError, notify, onChanged }) {
  const { uiText } = useI18n();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null); // { name, text, truncated } | { name, loading }
  const [working, setWorking] = useState(null);

  const generation = useRef(0);
  const currentJob = useRef(jobId);
  currentJob.current = jobId;
  const controllers = useRef(new Set());
  const inFlight = useRef(new Set());
  const [pageState, setPageState] = useState({});
  const previewGeneration = useRef(0);

  const load = useCallback(async () => {
    if (!jobId || currentJob.current !== jobId) return;
    const gen = ++generation.current;
    controllers.current.forEach(controller => controller.abort());
    controllers.current.clear();
    inFlight.current = new Set();
    const controller = new AbortController();
    controllers.current.add(controller);
    setLoading(true);
    previewGeneration.current += 1;
    setPreview(null);
    setPageState({});
    setError(null);
    try {
      const result = await adminApi.job(jobId, controller.signal);
      if (gen === generation.current && currentJob.current === jobId) setDetail(result);
    } catch (err) {
      if (gen === generation.current && err?.name !== 'AbortError' && !handleError(err)) setError(err.message);
    } finally {
      controllers.current.delete(controller);
      if (gen === generation.current) setLoading(false);
    }
  }, [jobId, handleError]);

  useEffect(() => {
    setDetail(null);
    setPreview(null);
    setWorking(null);
    load();
    return () => {
      generation.current += 1;
      previewGeneration.current += 1;
      controllers.current.forEach(controller => controller.abort());
      controllers.current.clear();
    };
  }, [load]);

  const visibleDetail = detail?.job?.job_id === jobId ? detail : null;
  const tree = useMemo(() => (visibleDetail ? buildContentTree(visibleDetail.nodes, visibleDetail.job) : null), [visibleDetail]);

  const loadMore = useCallback(async section => {
    const next = visibleDetail?.pages?.[section]?.next;
    const flights = inFlight.current;
    if (!next || loading || flights.has(section)) return;
    flights.add(section);
    const gen = generation.current;
    const controller = new AbortController();
    controllers.current.add(controller);
    setPageState(state => ({ ...state, [section]: { loading: true, error: null } }));
    try {
      const page = await adminApi.jobPage(jobId, section, { cursor: next }, controller.signal);
      if (gen !== generation.current || currentJob.current !== jobId) return;
      setDetail(previous => previous?.job.job_id === jobId ? mergeDetailPage(previous, section, page) : previous);
    } catch (err) {
      if (gen === generation.current && err?.name !== 'AbortError' && !handleError(err)) {
        setPageState(state => ({ ...state, [section]: { loading: false, error: err.message } }));
      }
    } finally {
      flights.delete(section);
      controllers.current.delete(controller);
      if (gen === generation.current) setPageState(state => ({ ...state, [section]: { ...state[section], loading: false } }));
    }
  }, [visibleDetail, jobId, loading, handleError]);

  const act = useCallback(
    async (action, hours) => {
      if (CONFIRM[action] && !window.confirm(uiText(CONFIRM[action]))) return;
      setWorking(action);
      try {
        const r = await adminApi.action(jobId, action, hours);
        notify(`Done: ${String(r.result).replace(/_/g, ' ')}`, 'ok');
        onChanged?.();
        if (action === 'DELETE_JOB') return;
        await load();
      } catch (err) {
        if (!handleError(err)) notify(err.message, 'error');
      } finally {
        if (currentJob.current === jobId) setWorking(null);
      }
    },
    [jobId, notify, handleError, onChanged, load, uiText]
  );

  const showPreview = useCallback(
    async (file) => {
      const gen = generation.current;
      const request = ++previewGeneration.current;
      const name = file.object_path.split('/').pop();
      setPreview({ name, loading: true });
      try {
        const result = await previewText(jobId, file.file_id);
        if (gen === generation.current && request === previewGeneration.current) setPreview({ name, ...result });
      } catch (err) {
        if (gen === generation.current && request === previewGeneration.current && !handleError(err)) setPreview({ name, error: err.message });
      }
    },
    [jobId, handleError]
  );

  const download = useCallback(
    async (file) => {
      try {
        await downloadFile(jobId, file.file_id);
      } catch (err) {
        if (!handleError(err)) notify(err.message, 'error');
      }
    },
    [jobId, handleError, notify]
  );

  const downloadAll = useCallback(async () => {
    setWorking('ZIP');
    try {
      const files = await collectStoredFiles([jobId], { loadPage: adminApi.jobPage });
      await downloadZip(files, { zipName: `llmiser-job-${jobId.slice(0, 8)}.zip` });
    } catch (err) {
      if (!handleError(err)) notify(err.message, 'error');
    } finally {
      if (currentJob.current === jobId) setWorking(null);
    }
  }, [jobId, handleError, notify]);

  return { detail: visibleDetail, tree, loading, error, reload: load, loadMore, pageState, act, working, preview, showPreview,
    closePreview: () => { previewGeneration.current += 1; setPreview(null); }, download, downloadAll };
}

// ── Toasts ─────────────────────────────────────────────────────────────────

export function useAdminNotice() {
  const [notice, setNotice] = useState(null);
  const timer = useRef(null);
  const notify = useCallback((text, tone = 'ok') => {
    clearTimeout(timer.current);
    setNotice({ text, tone });
    timer.current = setTimeout(() => setNotice(null), 5000);
  }, []);
  useEffect(() => () => clearTimeout(timer.current), []);
  return { notice, notify, dismiss: () => setNotice(null) };
}
