import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import POSTS from '../lib/blogPosts.generated.json' with { type: 'json' };
import { SITE_URL, siteJsonLd } from '../lib/siteContent.js';
import { articleMetadata, articleJsonLd } from '../lib/articleSeo.mjs';
import sitemap from '../app/sitemap.js';
import robots from '../app/robots.js';
test('every published article has a unique canonical, complete metadata and sitemap/AI discovery',()=>{
 assert.equal(SITE_URL,'https://llmiser.devbehindyou.com'); assert.equal(POSTS.length,8);
 const urls=new Set(sitemap().map(x=>x.url));assert.equal(urls.size,13);
 const llms=fs.readFileSync(new URL('../public/llms.txt',import.meta.url),'utf8');
 for(const post of POSTS){
  const url=SITE_URL+'/blog/'+post.id;const meta=articleMetadata(post);const graph=articleJsonLd(post)['@graph'];
  assert.ok(urls.has(url));assert.ok(llms.includes(url));assert.equal(meta.alternates.canonical,url);assert.equal(meta.openGraph.url,url);
  assert.match(post.publishedAt,/^\d{4}-\d{2}-\d{2}$/);assert.ok(meta.description.length>30);
  assert.equal(graph[0].mainEntityOfPage,url);assert.equal(graph[0].datePublished,post.publishedAt);assert.equal(graph[1].itemListElement[2].item,url);
 }
 assert.equal(robots().sitemap,SITE_URL+'/sitemap.xml');assert.doesNotMatch(JSON.stringify(siteJsonLd())+llms,/mdify-app.vercel.app/);
});
test('public aliases consolidate directly without redirecting the API or previews', async () => {
  const { default: config } = await import('../next.config.js');
  const redirects = await config.redirects();
  const hosts = ['mdify.devbehindyou.com', 'mdify-app.vercel.app', 'llmiser.vercel.app'];
  for (const host of hosts) {
    for (const source of ['/', '/usecase', '/privacy', '/terms', '/blog', '/blog/:path*', '/sitemap.xml', '/robots.txt', '/llms.txt', '/apple-touch-icon.png', '/llmiser-icon.png']) {
      const rule = redirects.find(r => r.source === source && r.has?.[0].value === host);
      assert.ok(rule, host + source);
      assert.equal(rule.destination, SITE_URL + source);
      assert.equal(rule.permanent, true);
    }
    const rules = redirects.filter(r => r.has?.[0].value === host);
    assert.ok(rules.findIndex(r => r.source === '/blog') < rules.findIndex(r => r.source === '/blog/:path*'), 'blog index avoids a trailing-slash hop');
  }
  for (const rule of redirects.filter(r => r.has)) {
    assert.ok(hosts.includes(rule.has[0].value));
    assert.ok(!rule.source.startsWith('/api'));
    assert.notEqual(rule.source, '/:path*', 'unknown URLs must retain real 404 responses');
    assert.ok(!rule.has.some(h => h.value === 'llmiser.devbehindyou.com'));
  }
  const admin = redirects.find(r => r.source === '/mdify-controller');
  assert.equal(admin.destination, '/llmiser-controller');
  const headers = await config.headers();
  assert.ok(headers.some(r => r.source === '/api/:path*' && r.headers.some(h => h.key === 'X-Robots-Tag' && h.value.includes('noindex'))));
  for (const rule of robots().rules) {
    assert.ok(!rule.disallow.includes('/'), 'Google must crawl permanent redirects');
  }
});

test('install icons use the approved Prompt L kit', () => {
  // project-docs/ is private (kept out of Git), so the byte comparison runs only
  // in a checkout that has the brand kit. The manifest checks always run.
  const kit = new URL('../../project-docs/brand/llmiser/', import.meta.url);
  if (fs.existsSync(kit)) {
    for (const theme of ['dark', 'light']) {
      assert.deepEqual(fs.readFileSync(new URL('../public/llmiser-icon-' + theme + '.svg', import.meta.url)), fs.readFileSync(new URL('svg/llmiser-icon-' + theme + '.svg', kit)));
    }
  }
  for (const theme of ['dark', 'light']) assert.ok(fs.existsSync(new URL('../public/llmiser-icon-' + theme + '.svg', import.meta.url)));
  const manifest = JSON.parse(fs.readFileSync(new URL('../public/site.webmanifest', import.meta.url), 'utf8'));
  assert.equal(manifest.name, 'LLMiser'); assert.equal(manifest.start_url, '/');
  for (const icon of manifest.icons) assert.ok(fs.existsSync(new URL('../public' + icon.src, import.meta.url)));
});
