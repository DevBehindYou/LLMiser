// Public copy, SEO files and structured data (lib/siteContent.js, app/robots.js,
// app/sitemap.js, public/llms.txt, README.md).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FAQS, DESCRIPTION, HOME_TITLE, SITE_URL, faqJsonLd, siteJsonLd } from '../lib/siteContent.js';
import robots from '../app/robots.js';
import sitemap from '../app/sitemap.js';

const FRONTEND = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => fs.readFileSync(path.resolve(FRONTEND, rel), 'utf8');

// Owner's rule: public pages describe features, not the engines or hosting
// behind them. Only the Terms and Privacy Policy credit the open-source engines.
const PUBLIC_COPY = [
  '../README.md',
  'public/llms.txt',
  'app/layout.js',
  'app/usecase/page.js',
  'app/usecase/UseCaseClient.js',
  'components/converter/LandingWorkspace.js',
  'components/converter/MobileWorkspace.js',
  'components/LLMiserFooter.js',
  'components/MarkdownSkeleton.js',
  'lib/models/sessionRepository.js',
  'lib/siteContent.js',
];

test('public copy names no conversion engine or backend service', () => {
  for (const file of PUBLIC_COPY) {
    const text = read(file);
    for (const pattern of [/markitdown/i, /tesseract/i, /supabase/i, /Render Free|render\.com|onrender/i, /110K/]) {
      assert.doesNotMatch(text, pattern, `${file} mentions ${pattern}`);
    }
  }
  assert.doesNotMatch(JSON.stringify(siteJsonLd()), /MarkItDown|Tesseract|Supabase/);
});

test('positioning is accurate and avoids blanket savings claims', () => {
  assert.match(HOME_TITLE, /LLM Cost Optimizer/);
  assert.match(DESCRIPTION, /LLM cost optimizer/);
  assert.equal(SITE_URL, 'https://llmiser.devbehindyou.com');
  for (const file of PUBLIC_COPY) assert.doesNotMatch(read(file), /70% (?:fewer|less)|(?:costs|tokens) by 70%|guaranteed savings/i, file);
});

test('FAQ structured data matches the visible FAQ', () => {
  const data = faqJsonLd();
  assert.equal(data['@type'], 'FAQPage');
  assert.deepEqual(data.mainEntity.map((q) => q.name), FAQS.map((f) => f.q));
  for (const { q, a } of FAQS) {
    assert.ok(!/[—;]/.test(q + a), `no em dash or semicolon: ${q}`);
    const words = a.split(/\s+/).length;
    assert.ok(words >= 30 && words <= 70, `${q}: ${words} words`);
  }
});

test('crawlers may read public pages, never the admin or the API', () => {
  const { rules, sitemap: map } = robots();
  for (const rule of rules) {
    assert.ok(rule.disallow.includes('/mdify-controller') && rule.disallow.includes('/llmiser-controller') && rule.disallow.includes('/api/'));
  }
  const agents = rules.flatMap((r) => [].concat(r.userAgent));
  for (const bot of ['GPTBot', 'OAI-SearchBot', 'PerplexityBot', 'ClaudeBot', 'Google-Extended']) assert.ok(agents.includes(bot), bot);
  assert.ok(map.endsWith('/sitemap.xml'));
  const urls = sitemap().map((e) => e.url);
  assert.ok(urls.every((u) => u.startsWith('https://llmiser.devbehindyou.com')));
  assert.ok(!urls.some((u) => u.includes('controller')));
});

test('site structured data describes a free web app', () => {
  const graph = siteJsonLd()['@graph'];
  const app = graph.find((n) => n['@type'] === 'WebApplication');
  assert.equal(app.offers.price, '0');
  assert.equal(app.isAccessibleForFree, true);
  assert.ok(graph.some((n) => n['@type'] === 'WebSite') && graph.some((n) => n['@type'] === 'Organization'));
});
