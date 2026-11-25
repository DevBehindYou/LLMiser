import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const layout = fs.readFileSync(new URL('../app/layout.js', import.meta.url), 'utf8');
const source = layout.match(/__html: `(window\.llmiserUmamiBeforeSend[\s\S]*?)`/)[1];
const context = vm.createContext({ window: {}, URL, location: { origin: 'https://llmiser.devbehindyou.com' } });
vm.runInContext(source, context);
const filter = context.window.llmiserUmamiBeforeSend;

test('Umami excludes controller views and private URL parameters', () => {
  for (const url of ['/llmiser-controller', '/llmiser-controller/jobs?job=private']) assert.equal(filter('event', { url }), false);
  const payload = filter('event', { url: '/blog?job=private#private', referrer: 'https://example.com/path?token=private#private', title: 'Blog' });
  assert.equal(payload.url, '/blog');
  assert.equal(payload.referrer, 'https://example.com/path');
  assert.equal(payload.title, 'Blog');
  assert.equal(filter('event', { url: 'http://[' }), false);
});
