#!/usr/bin/env node
// Rendered visual QA for a private campaign draft.
//
//   node blog-pipeline/scripts/campaign/preview.mjs {slug} [{slug} ...]
//
// Draws the banner and every figure referenced by Blogs/{slug}/draft.md the
// way the article page does (inline SVG on the page background, caption in
// --muted below) in two 375px phone columns: dark and light theme tokens
// copied from frontend/app/globals.css, fonts from frontend/app/fonts.css.
// It then measures every <text> element in the browser and reports:
//   - text outside the SVG viewBox,
//   - text overflowing the smallest box drawn around it,
//   - text overlapping other text,
//   - banner text outside the clipped illustration card.
// Writes Blogs/{slug}/visuals/preview/contact-375.jpg (both themes side by
// side, device scale 2) and Blogs/{slug}/visuals/preview/geometry.json. A
// person still has to look at the image: measurements do not judge clarity.

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { figureRefs, parseFrontmatter, splitTldr } from '../../../frontend/lib/blog.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const PIPELINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const REPO = path.resolve(PIPELINE, '..');

function themeBlocks() {
  const css = fs.readFileSync(path.join(REPO, 'frontend', 'app', 'globals.css'), 'utf8');
  const dark = /:root,\s*:root\[data-theme="dark"\]\s*\{([\s\S]*?)\n\}/.exec(css)[1];
  const light = /:root\[data-theme="light"\]\s*\{([\s\S]*?)\n\}/.exec(css)[1];
  return { dark, light };
}

function fontsCss() {
  const css = fs.readFileSync(path.join(REPO, 'frontend', 'app', 'fonts.css'), 'utf8');
  return css.replace(/url\(\/fonts\//g, `url(${pathToFileURL(path.join(REPO, 'frontend', 'public', 'fonts')).href}/`);
}

const escHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export async function preview(slug, browser) {
  const dir = path.join(PIPELINE, 'Blogs', slug);
  const { data, body } = parseFrontmatter(fs.readFileSync(path.join(dir, 'draft.md'), 'utf8'));
  const { content } = splitTldr(body);
  const items = [];
  if (data.banner) items.push({ src: data.banner, alt: data.bannerAlt, caption: '', banner: true });
  items.push(...figureRefs(content).map((f) => ({ ...f, banner: false })));
  const svgFor = (src) => fs.readFileSync(path.join(dir, 'visuals', path.basename(src)), 'utf8');
  const { dark, light } = themeBlocks();
  const column = (theme) => `<section class="col ${theme}"><div class="label">${theme} · 375px</div>${items.map((it, i) => `
    <figure data-i="${i}" class="${it.banner ? 'banner' : ''}"><div class="blog-visual">${svgFor(it.src)}</div>${it.caption ? `<figcaption>${escHtml(it.caption)}</figcaption>` : ''}</figure>`).join('')}</section>`;
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>${fontsCss()}
    .dark{${dark}} .light{${light}}
    body{margin:0;display:flex;gap:12px;background:#777;font-family:var(--font-inter),Inter,sans-serif}
    .col{width:375px;box-sizing:border-box;padding:12px 16px 24px;background:var(--bg);color:var(--text)}
    .label{font:12px monospace;color:var(--faint);margin-bottom:8px}
    figure{margin:0 0 20px} figure.banner .blog-visual{border-radius:12px;overflow:hidden}
    .blog-visual svg{display:block;width:100%;height:auto}
    figcaption{font-size:14px;line-height:1.4;margin-top:8px;color:var(--muted)}
  </style></head><body>${column('dark')}${column('light')}</body></html>`;
  const page = await browser.newPage({ viewport: { width: 375 * 2 + 12, height: 800 }, deviceScaleFactor: 2 });
  const htmlFile = path.join(dir, 'visuals', 'preview', 'preview.html');
  fs.mkdirSync(path.dirname(htmlFile), { recursive: true });
  fs.writeFileSync(htmlFile, html);
  await page.goto(pathToFileURL(htmlFile).href);
  await page.evaluate(() => document.fonts.ready);
  const fontsLoaded = await page.evaluate(() => [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family));
  const geometry = await page.evaluate((names) => {
    const out = [];
    document.querySelectorAll('.col.dark figure').forEach((fig, idx) => {
      const svg = fig.querySelector('svg');
      const vb = svg.viewBox.baseVal;
      const sr = svg.getBoundingClientRect();
      const k = vb.width / sr.width;
      const box = (el) => {
        const r = el.getBoundingClientRect();
        return { x: (r.left - sr.left) * k, y: (r.top - sr.top) * k, w: r.width * k, h: r.height * k };
      };
      const texts = [...svg.querySelectorAll('text')].map((t) => ({ t: t.textContent, b: box(t), clipped: !!t.closest('g[clip-path]') }));
      const rects = [...svg.querySelectorAll('rect')].map(box).filter((b) => b.w * b.h < vb.width * vb.height * 0.6 && b.w > 20 && b.h > 14);
      const issues = [];
      const tol = 1.5;
      for (const { t, b, clipped } of texts) {
        if (!t.trim()) continue;
        if (b.x < -tol || b.y < -tol || b.x + b.w > vb.width + tol || b.y + b.h > vb.height + tol) issues.push(`outside viewBox: "${t}"`);
        if (clipped && vb.width === 1200 && (b.x < 612 - tol || b.x + b.w > 1176 + tol || b.y < 28 - tol || b.y + b.h > 372 + tol)) issues.push(`outside banner card: "${t}"`);
        const cx = b.x + b.w / 2;
        const cy = b.y + b.h / 2;
        const holders = rects.filter((r) => cx > r.x && cx < r.x + r.w && cy > r.y && cy < r.y + r.h).sort((a, c) => a.w * a.h - c.w * c.h);
        const r = holders[0];
        if (r && (b.x < r.x - tol || b.x + b.w > r.x + r.w + tol)) issues.push(`overflows its box horizontally: "${t}"`);
        // Text whose baseline sits just below a box it belongs to (wrapped sub-lines spilling out).
        const near = rects.filter((q) => cx > q.x && cx < q.x + q.w && b.y > q.y && b.y < q.y + q.h && b.y + b.h * 0.78 > q.y + q.h - 3);
        if (near.length) issues.push(`spills below its box: "${t}"`);
      }
      for (let i = 0; i < texts.length; i += 1) {
        for (let j = i + 1; j < texts.length; j += 1) {
          const a = texts[i].b;
          const c = texts[j].b;
          const ix = Math.min(a.x + a.w, c.x + c.w) - Math.max(a.x, c.x);
          const iy = Math.min(a.y + a.h, c.y + c.h) - Math.max(a.y, c.y);
          if (ix > 2 && iy > 0.45 * Math.min(a.h, c.h) && texts[i].t.trim() && texts[j].t.trim()) issues.push(`text overlap: "${texts[i].t}" / "${texts[j].t}"`);
        }
      }
      out.push({ figure: names[idx], viewBox: [vb.width, vb.height], renderedWidthPx: Math.round(sr.width), minFontPxAt375: Math.min(...[...svg.querySelectorAll('text')].map((t) => parseFloat(getComputedStyle(t).fontSize) / k)).toFixed(1), texts: texts.length, issues });
    });
    return out;
  }, items.map((it) => path.basename(it.src)));
  const shot = path.join(dir, 'visuals', 'preview', 'contact-375.jpg');
  await page.screenshot({ path: shot, fullPage: true, type: 'jpeg', quality: 62 });
  await page.close();
  fs.rmSync(htmlFile);
  const record = { slug, date: new Date().toISOString(), viewport: '2 x 375px columns, deviceScaleFactor 2', themes: ['dark', 'light'], fontsLoaded: [...new Set(fontsLoaded)], figures: geometry };
  fs.writeFileSync(path.join(dir, 'visuals', 'preview', 'geometry.json'), `${JSON.stringify(record, null, 2)}\n`);
  return record;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const browser = await chromium.launch();
  let bad = 0;
  for (const slug of process.argv.slice(2)) {
    const rec = await preview(slug, browser);
    for (const f of rec.figures) {
      console.log(`${slug}/${f.figure}: ${f.renderedWidthPx}px wide, min text ${f.minFontPxAt375}px, ${f.issues.length ? f.issues.join(' | ') : 'no geometry issues'}`);
      if (f.issues.length) bad += 1;
    }
    console.log(`fonts: ${rec.fontsLoaded.join(', ')}`);
  }
  await browser.close();
  process.exitCode = bad ? 1 : 0;
}
