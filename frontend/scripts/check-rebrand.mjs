// Smoke-test the built application, including real HTTP redirect behavior.
// Usage: node scripts/check-rebrand.mjs http://localhost:3101
// Live: node scripts/check-rebrand.mjs https://llmiser.devbehindyou.com
import assert from 'node:assert/strict';
import http from 'node:http';
import https from 'node:https';
const base = new URL(process.argv[2] || 'http://localhost:3101');
const canonical = 'https://llmiser.devbehindyou.com';
let checks = 0;
function request(path, host) {
  // Local tests simulate aliases with Host; live checks must use each host's
  // actual DNS/TLS/hosting configuration instead of only the canonical server.
  const liveAlias = host && base.protocol === 'https:';
  const url = new URL(path, liveAlias ? 'https://' + host : base);
  return new Promise((resolve, reject) => {
    const req = (url.protocol === 'https:' ? https : http).get(url, { headers: host && !liveAlias ? { Host: host } : {} }, res => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks).toString('utf8') }));
    });
    req.setTimeout(15000, () => req.destroy(new Error('Request timed out')));
    req.on('error', reject);
  });
}
function check(condition, message) { assert.ok(condition, message); checks++; }
const map = await request('/sitemap.xml');
check(map.status === 200, 'sitemap is available');
const urls = [...map.body.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
check(urls.length >= 13 && new Set(urls).size === urls.length, 'sitemap has unique public URLs');
for (const url of urls) {
  check(url.startsWith(canonical), 'canonical sitemap origin: ' + url);
  const route = new URL(url).pathname;
  const page = await request(route);
  check(page.status === 200, 'public page: ' + route);
  check(page.body.includes('rel="canonical" href="' + url + '"'), 'self canonical: ' + route);
}
for (const host of ['mdify.devbehindyou.com', 'mdify-app.vercel.app', 'llmiser.vercel.app']) {
  for (const route of [...urls.map(url => new URL(url).pathname), '/sitemap.xml', '/robots.txt', '/llms.txt', '/favicon-32.png', '/icon-maskable-512.png', '/llmiser-icon-dark.svg', '/llmiser-icon.png', '/apple-touch-icon.png']) {
    const response = await request(route + '?ref=rebrand', host);
    check(response.status === 308, host + route + ' permanent redirect');
    check(response.headers.location === canonical + route + '?ref=rebrand', host + route + ' preserves path/query');
  }
}
const local = await request('/?ref=rebrand');
check(local.status === 200, 'preview origin stays local');
check((local.body.match(/<h1\b/g) || []).length === 1, 'one homepage h1');
check(local.body.includes('An LLM cost optimizer for your document workflow'), 'server-rendered positioning');
check(local.body.includes('Does converting PDF to Markdown always save tokens?'), 'server-rendered FAQ');
const api = await request('/api/health', 'mdify.devbehindyou.com');
check(![301, 302, 307, 308].includes(api.status), 'API remains on original host');
check(api.headers['x-robots-tag']?.includes('noindex'), 'API noindex header');
const admin = await request('/llmiser-controller');
check(admin.status === 200 && admin.body.includes('<title>Controller | LLMiser</title>'), 'rebranded controller');
check(admin.headers['x-robots-tag']?.includes('noindex'), 'controller noindex header');
const alias = await request('/mdify-controller');
check(alias.status === 308 && alias.headers.location === '/llmiser-controller', 'legacy controller alias');
const missing = await request('/unpublished-rebrand-page');
check(missing.status === 404, 'unknown paths return 404');
const robots = await request('/robots.txt');
check(robots.body.includes(canonical + '/sitemap.xml'), 'robots names new sitemap');
check(robots.body.includes('Disallow: /api/') && robots.body.includes('Disallow: /llmiser-controller'), 'robots excludes private routes');
for (const route of ['/favicon.ico', '/favicon.svg', '/llmiser-icon-dark.svg', '/llmiser-icon-light.svg', '/apple-touch-icon.png', '/og-card.png', '/llms.txt']) {
  check((await request(route)).status === 200, 'brand/discovery asset: ' + route);
}
const manifest = JSON.parse((await request('/site.webmanifest')).body);
check(manifest.name === 'LLMiser' && manifest.start_url === '/', 'install manifest identity');
for (const icon of manifest.icons) check((await request(icon.src)).status === 200, 'install icon: ' + icon.src);
console.log(JSON.stringify({ result: 'passed', checks, publicPages: urls.length, base: base.origin }, null, 2));
