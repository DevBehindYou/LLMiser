import { test } from 'node:test';
import assert from 'node:assert/strict';
import { convertFile, retrieveResult, resetTransportForTests } from '../lib/models/conversionService.js';
import { getRecentSessions, saveRecentSession, clearAllRecentSessions } from '../lib/models/sessionRepository.js';
import { initialQueueState, queueReducer, selectConvertible } from '../lib/models/queueModel.js';

const id = '123e4567-e89b-42d3-a456-426614174000';
const result = {
  filename: 'project.md', original_name: 'project.zip', download_url: 'https://storage.test/expired?token=secret',
  outputs: [
    { name: 'project-part-001.md', url: 'https://storage.test/old-1?token=secret' },
    { name: 'project-part-002.md', url: 'https://storage.test/old-2?token=secret' },
    { name: 'PROJECT_INDEX.md', url: 'https://storage.test/index?token=secret' },
    { name: 'manifest.json', url: 'https://storage.test/manifest?token=secret' },
  ],
};
const fresh = { ...result, download_url: 'https://storage.test/fresh-1', outputs: result.outputs.map((o, i) => ({ ...o, url: `https://storage.test/fresh-${i + 1}` })) };
const first = '# Project\n\n```python\nprint("漢';
const last = '# Project (part 2 of 2)\n\n字🙂")\n```\n';
const expected = first + '字🙂")\n```\n';
const session = { ...result, job_id: id, source_type: 'ARCHIVE', id: 'browser-item', profile: 'RAG-ready' };

class MemoryStorage {
  data = new Map();
  constructor(quota = Infinity) { this.quota = quota; }
  getItem(key) { return this.data.get(key) || null; }
  setItem(key, value) { if (value.length > this.quota) throw new Error('quota'); this.data.set(key, value); }
  removeItem(key) { this.data.delete(key); }
}

test('failed final download retains the completed job before touching output bytes', async t => {
  resetTransportForTests(); t.after(resetTransportForTests);
  let retained;
  t.mock.method(globalThis, 'fetch', async url => {
    if (url === '/api/uploads/create') return Response.json({ job_id: id, upload_url: 'https://storage.test/upload' });
    if (url === 'https://storage.test/upload') return new Response('');
    if (url === `/api/jobs/${id}/start`) return Response.json({ status: 'COMPLETED', source_type: 'ARCHIVE', result });
    assert.equal(retained.job_id, id, 'identity is retained before download failure');
    return new Response('expired', { status: 403 });
  });
  await assert.rejects(convertFile(new File(['fixture'], 'project.zip'), 'Standard', {
    onResultReady: value => { retained = value; },
  }), err => err.status === 403);
  assert.equal(retained.source_type, 'ARCHIVE');
  assert.equal(retained.outputs.length, 4);
});

test('retry re-signs every part without uploading or running conversion and preserves exact bytes', async () => {
  const calls = [];
  const recovered = await retrieveResult(id, { fetchImpl: async (url, init) => {
    calls.push(url); assert.ok(!init?.method || init.method === 'GET');
    if (url === `/api/jobs/${id}/download`) {
      assert.equal(init.cache, 'no-store');
      return Response.json({ job_id: id, source_type: 'ARCHIVE', result: fresh });
    }
    if (url === fresh.outputs[0].url) return new Response(first);
    if (url === fresh.outputs[1].url) return new Response(last);
    assert.fail('Unexpected upload, processing or stale URL: ' + url);
  } });
  assert.equal(recovered.content, expected);
  assert.equal(recovered.job_id, id);
  assert.deepEqual(calls, [`/api/jobs/${id}/download`, fresh.outputs[0].url, fresh.outputs[1].url]);
  assert.equal(recovered.outputs.length, 4);
});

test('an interrupted second part stays failed; the next retry retrieves the whole result', async () => {
  let attempt = 0;
  const fetchImpl = async url => {
    if (url.endsWith('/download')) { attempt++; return Response.json({ source_type: 'ARCHIVE', result: fresh }); }
    if (url.endsWith('fresh-1')) return new Response(first);
    if (attempt === 1) throw new TypeError('offline');
    return new Response(last);
  };
  await assert.rejects(retrieveResult(id, { fetchImpl }), err => err.network === true);
  assert.equal((await retrieveResult(id, { fetchImpl })).content, expected);
});

test('deleted and missing jobs give an explicit recovery action, never an automatic reconversion', async () => {
  for (const status of [410, 404]) {
    let calls = 0;
    await assert.rejects(retrieveResult(id, { fetchImpl: async url => {
      calls++; assert.equal(url, `/api/jobs/${id}/download`);
      return Response.json({ detail: 'gone' }, { status });
    } }), err => err.status === status && /Remove this entry/.test(err.message));
    assert.equal(calls, 1);
  }
});

test('a failed or aborted recovery never returns empty successful Markdown', async () => {
  await assert.rejects(retrieveResult(id, { fetchImpl: async () => Response.json({ download_url: 'legacy only' }) }), err => err.status === 409);
  await assert.rejects(retrieveResult(id, { fetchImpl: async () => { throw new TypeError('offline'); } }), err => err.network === true);
  const controller = new AbortController(); controller.abort();
  await assert.rejects(retrieveResult(id, { signal: controller.signal, fetchImpl: async (_url, options) => options.signal.throwIfAborted() }), err => err.name === 'AbortError');
});

test('history preserves recovery after restart, without signed URLs, raw paths or secrets', () => {
  globalThis.localStorage = new MemoryStorage();
  saveRecentSession({ ...session, path: 'private/path', secret: 'not-for-history' });
  const serialized = globalThis.localStorage.getItem('llmiser_recent_sessions_v1');
  assert.doesNotMatch(serialized, /https:|token=|secret|private\/path/);
  const [restored] = getRecentSessions();
  assert.equal(restored.job_id, id); assert.equal(restored.content, undefined);
  assert.equal(restored.outputs.length, 4);
  let state = queueReducer(initialQueueState, { type: 'sessionLoaded', session: restored });
  assert.equal(state.results.length, 0, 'missing bytes are not an empty successful result');
  assert.equal(state.items[0].file, null);
  assert.equal(state.items[0].recovery.job_id, id);
  assert.equal(selectConvertible(state).length, 1);
  state = queueReducer(state, { type: 'jobSucceeded', id: restored.id, result: { ...fresh, content: expected, job_id: id } });
  assert.equal(state.results[0].content, expected); assert.equal(state.items[0].status, 'done');
  clearAllRecentSessions(); assert.deepEqual(getRecentSessions(), []);
});

test('cached empty edits and legacy sessions still reopen without a network request', () => {
  globalThis.localStorage = new MemoryStorage();
  saveRecentSession({ ...session, content: '' });
  const state = queueReducer(initialQueueState, { type: 'sessionLoaded', session: getRecentSessions()[0] });
  assert.equal(state.results[0].content, ''); assert.equal(state.results[0].job_id, id);
  assert.equal(state.results[0].outputs.length, 4); assert.equal(selectConvertible(state).length, 0);
  globalThis.localStorage = new MemoryStorage();
  globalThis.localStorage.setItem('markdify_recent_sessions_v1', JSON.stringify([{ id: 'legacy', content: '原文', filename: 'old.md' }]));
  assert.equal(getRecentSessions()[0].content, '原文');
});

test('large completed results fall back to recoverable metadata when the browser cache is full', () => {
  globalThis.localStorage = new MemoryStorage(1800);
  const saved = saveRecentSession({ ...session, content: 'large'.repeat(4000) });
  assert.equal(saved.length, 1); assert.equal(saved[0].content, undefined); assert.equal(saved[0].job_id, id);
  assert.doesNotMatch(globalThis.localStorage.getItem('llmiser_recent_sessions_v1'), /token=|https:/);
});

test('queue failures keep identity, while removal and late completion cannot resurrect it', () => {
  const item = { id: 'browser-item', name: 'project.zip', file: {}, status: 'converting' };
  let state = { ...initialQueueState, items: [item] };
  state = queueReducer(state, { type: 'resultRetained', id: item.id, result: session, profile: 'RAG-ready' });
  state = queueReducer(state, { type: 'jobFailed', id: item.id, message: 'download failed' });
  assert.equal(state.items[0].recovery.job_id, id);
  assert.equal(state.items[0].recovery.profile, 'RAG-ready');
  state = queueReducer(state, { type: 'itemRemoved', id: item.id });
  assert.deepEqual(queueReducer(state, { type: 'resultRetained', id: item.id, result: session }), initialQueueState);
});
