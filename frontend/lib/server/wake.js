// Server-only: wakes every backend instance when someone opens LLMiser.
//
// O1/O2 run on Render Free, which sleeps after 15 idle minutes and needs
// about a minute to start again. Any request starts the wake-up, so a short
// health ping per instance is enough; the ping does not wait for the full
// start. Concurrent requests in this server process share a wake operation;
// completed results are cached briefly. Separate serverless instances still
// have independent caches; shared admission remains the cross-instance bound.

import { getPoolConfig } from './dispatcher.js';

export const WAKE_PING_TIMEOUT_MS = 8_000;
export const WAKE_CACHE_MS = 10_000;

let cache = null; // { key, at, result }
const inFlight = new Map();
let latestRun = null;

async function ping(url, fetchImpl, timeoutMs) {
  try {
    const res = await fetchImpl(`${url}/api/v1/health`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(timeoutMs),
    });
    return res.ok;
  } catch {
    return false; // asleep, starting or down: the request still triggers a wake-up
  }
}

/**
 * Pings every configured instance in parallel.
 * Returns { pools: { normal: { ready, total }, ocr: {...}, archive: {...} }, all_ready, cached }
 * with counts only: backend URLs never leave the server.
 */
export async function wakeBackends({
  pools = getPoolConfig(),
  fetchImpl = fetch,
  timeoutMs = WAKE_PING_TIMEOUT_MS,
  now = Date.now,
} = {}) {
  // Numeric timestamps remain supported for existing callers/tests. The
  // default clock measures the TTL from completion, including cold starts.
  const clock = typeof now === 'function' ? now : () => now;
  const entries = Object.entries(pools).filter(([, urls]) => urls.length > 0);
  const key = JSON.stringify([entries, timeoutMs]);
  const at = clock();
  if (cache?.key === key && at >= cache.at && at - cache.at < WAKE_CACHE_MS) {
    return { ...cache.result, cached: true };
  }
  const pending = inFlight.get(key);
  if (pending) return { ...await pending.promise, cached: true };

  const run = { promise: null };
  latestRun = run;
  inFlight.set(key, run);
  run.promise = (async () => {
    const results = await Promise.all(
      entries.map(async ([name, urls]) => {
        const oks = await Promise.all(urls.map((url) => ping(url, fetchImpl, timeoutMs)));
        return [name, { ready: oks.filter(Boolean).length, total: urls.length }];
      })
    );
    const result = {
      pools: Object.fromEntries(results),
      all_ready: results.every(([, p]) => p.ready === p.total),
    };
    // An older configuration finishing late must not evict the newer cache.
    if (latestRun === run) cache = { key, at: clock(), result };
    return result;
  })();
  try {
    return { ...await run.promise, cached: false };
  } finally {
    if (inFlight.get(key) === run) inFlight.delete(key);
  }
}

/** Test hook. */
export function resetWakeCacheForTests() {
  cache = null;
  inFlight.clear();
  latestRun = null;
}
