import { test } from 'node:test';
import assert from 'node:assert/strict';
import { snapshotWithPendingEdits } from '../lib/models/editorExport.js';

const first = { id: 'a', content: '# Previous', filename: 'same.md', outputs: [{ name: 'part-1.md' }] };
const second = { id: 'b', content: 'Other result', filename: 'same.md' };
const snapshot = { activeResult: first, results: [first, second], onNotice() {} };

test('an immediate export reads current Unicode text before owner state commits', () => {
  const committed = [];
  let pending = { docId: 'a', content: '# 最新 🙂', revision: 1, commit: () => committed.push('a') };
  const take = () => { const edit = pending; pending = null; return edit; };
  const current = snapshotWithPendingEdits(snapshot, [take]);
  assert.equal(current.activeResult.content, '# 最新 🙂');
  assert.equal(current.results[0].content, current.activeResult.content);
  assert.equal(current.results[0].outputs, first.outputs);
  assert.equal(current.results[1], second);
  assert.deepEqual(committed, ['a']);
  assert.equal(pending, null);
  assert.equal(first.content, '# Previous');
});

test('cleared text is a real edit and remains in both single and batch export snapshots', () => {
  const current = snapshotWithPendingEdits(snapshot, [() => ({ docId: 'a', content: '', revision: 2, commit() {} })]);
  assert.equal(current.activeResult.content, '');
  assert.equal(current.results[0].content, '');
  assert.equal(current.results.length, 2);
});

test('responsive readers drain before committing and the newest edit wins regardless of registration order', () => {
  const calls = [];
  const reader = (content, revision) => () => {
    calls.push(`take ${revision}`);
    return { docId: 'a', content, revision, commit: () => calls.push(`commit ${revision}`) };
  };
  const current = snapshotWithPendingEdits(snapshot, [reader('Newest', 9), reader('Older', 3)]);
  assert.deepEqual(calls, ['take 9', 'take 3', 'commit 3', 'commit 9']);
  assert.equal(current.activeResult.content, 'Newest');
  assert.equal(current.results[0].content, 'Newest');
});

test('edits retain document identity across a selection change', () => {
  const current = snapshotWithPendingEdits({ ...snapshot, activeResult: second }, [() => ({ docId: 'a', content: 'Edited A', revision: 1, commit() {} })]);
  assert.equal(current.activeResult, second);
  assert.equal(current.results[0].content, 'Edited A');
  assert.equal(current.results[1].content, 'Other result');
});

test('idle readers preserve the existing snapshot without allocations or commits', () => {
  assert.equal(snapshotWithPendingEdits(snapshot, [() => null]), snapshot);
});
