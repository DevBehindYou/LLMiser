import { test } from 'node:test';
import assert from 'node:assert/strict';
import { recordPixelView } from '../lib/pageViews.js';

const production = 'https://llmiser.devbehindyou.com';

test('only public production views load the Umami pixel', async (t) => {
  const request = t.mock.method(globalThis, 'fetch', async () => {});
  for (const path of ['/llmiser-controller', '/llmiser-controller/jobs', '/mdify-controller', null]) {
    await recordPixelView(production, path);
  }
  await recordPixelView('https://llmiser.vercel.app', '/');
  assert.equal(request.mock.callCount(), 0);

  for (const path of ['/', '/blog', '/']) await recordPixelView(production, path);
  assert.equal(request.mock.callCount(), 3);
  for (const call of request.mock.calls) {
    assert.deepEqual(call.arguments, ['https://um2.us/p/Q0Svc620L', {
      mode: 'no-cors', credentials: 'omit', referrerPolicy: 'no-referrer', cache: 'no-store',
    }]);
  }
});

test('a blocked pixel request is harmless', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => { throw new TypeError('Blocked'); });
  await recordPixelView(production, '/');
});
