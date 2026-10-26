import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { download } from '../src/download.js';

test('download exports exact UTF-8 edits with a local filename and cleans up resources', async t => {
  const dom = new JSDOM('<!doctype html><body></body>');
  t.after(() => dom.window.close());
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'document');
  Object.defineProperty(globalThis, 'document', { value: dom.window.document, configurable: true });
  t.after(() => previous ? Object.defineProperty(globalThis, 'document', previous) : delete globalThis.document);
  let blob, timer, clicked = false;
  t.mock.method(URL, 'createObjectURL', value => { blob = value; return 'blob:local-export'; });
  const revoke = t.mock.method(URL, 'revokeObjectURL', () => {});
  t.mock.method(globalThis, 'setTimeout', (callback, delay) => { timer = { callback, delay }; });
  t.mock.method(dom.window.HTMLAnchorElement.prototype, 'click', function () {
    clicked = true;
    assert.equal(this.isConnected, true);
    assert.equal(this.download, '漢字.md');
    assert.equal(this.href, 'blob:local-export');
  });
  const text = '# Edited context\n\n漢字🙂 — useful detail.\n';
  download(text, '漢字.md');
  assert.equal(clicked, true);
  assert.equal(blob.type, 'text/markdown;charset=utf-8');
  assert.deepEqual(Buffer.from(await blob.arrayBuffer()), Buffer.from(text, 'utf8'));
  assert.equal(dom.window.document.querySelector('a'), null);
  assert.equal(timer.delay, 10_000);
  timer.callback();
  assert.deepEqual(revoke.mock.calls[0].arguments, ['blob:local-export']);
});
