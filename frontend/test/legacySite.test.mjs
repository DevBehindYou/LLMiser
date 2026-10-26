import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { match } = require('next/dist/compiled/path-to-regexp');
const root = new URL('../../legacy-site/', import.meta.url);
const config = JSON.parse(fs.readFileSync(new URL('vercel.json', root), 'utf8'));
const html = fs.readFileSync(new URL('public/index.html', root), 'utf8');

test('legacy public paths keep permanent host-scoped redirects and exact captured paths', () => {
  assert.deepEqual(config.redirects.map(rule => rule.has[0].value).sort(), ['mdify-app.vercel.app','mdify.devbehindyou.com']);
  for (const rule of config.redirects) {
    assert.equal(rule.permanent, true);
    assert.equal(rule.destination, 'https://llmiser.devbehindyou.com/:path');
    const matches = match(rule.source);
    for (const pathname of ['/', '/blog', '/blog/markdown-vs-pdf-llm-tokens', '/privacy', '/usecase', '/robots.txt', '/unknown/path']) {
      const found = matches(pathname);
      assert.ok(found, pathname);
      assert.equal('/' + found.params.path, pathname);
    }
    for (const pathname of ['/api','/api/health','/api/jobs/tick','/api/admin/session','/API/uploads/create']) assert.equal(matches(pathname),false,pathname);
    assert.ok(matches('/apiculture'));
  }
});

test('legacy fallback publishes static assets only, without installing or building the old app', () => {
  assert.equal(config.framework, null);
  assert.equal(config.installCommand, '');
  assert.equal(config.buildCommand, '');
  assert.equal(config.outputDirectory, 'public');
  assert.deepEqual(fs.readdirSync(new URL('public/',root)).sort(), ['404.html','index.html','logo.svg','robots.txt','styles.css']);
  assert.equal(config.functions, undefined);
  assert.equal(fs.readFileSync(new URL('public/404.html',root),'utf8'),html);
  assert.doesNotMatch(html, /<script|<form|<input|\.env|SUPABASE|x-mdify/i);
});

test('fallback has an accessible LLMiser destination and noindex without blocking known-host redirect indexing', () => {
  assert.match(html, /<meta name="robots" content="noindex,follow">/);
  assert.match(html, /<link rel="canonical" href="https:\/\/llmiser\.devbehindyou\.com\/">/);
  assert.match(html, /aria-labelledby="title"/);
  assert.match(html, /href="https:\/\/llmiser\.devbehindyou\.com\/">Open LLMiser/);
  assert.doesNotMatch(html, /MDify|http-equiv="refresh"/i);
  const fallbackHeader = config.headers.find(rule => rule.missing);
  assert.deepEqual(fallbackHeader.missing.map(condition => condition.value).sort(), ['mdify-app.vercel.app','mdify.devbehindyou.com']);
  assert.ok(fallbackHeader.headers.some(header => header.key === 'X-Robots-Tag' && header.value.includes('noindex')));
  const apiHeader = config.headers.find(rule => rule.source === '/api/:path*');
  assert.ok(apiHeader.headers.some(header => header.key === 'X-Robots-Tag' && header.value.includes('noindex')));
});
