#!/usr/bin/env node
// Private renderer for campaign drafts.
//
//   node blog-pipeline/scripts/campaign/render-private.mjs {slug} [{slug} ...]
//
// Imports Blogs/{slug}/visuals.mjs (same spec shape as visuals/build.mjs:
// { banner, figures: { name: svg } }), validates every SVG with the app's own
// inspectSvg and writes ONLY to Blogs/{slug}/visuals/. It never touches
// frontend/public. Stale SVGs are removed from that private folder only.
// There is deliberately no --all option.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { inspectSvg, SLUG_PATTERN } from '../../../frontend/lib/blog.mjs';

const PIPELINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

export async function renderPrivate(slug) {
  if (!SLUG_PATTERN.test(slug)) throw new Error(`Not a slug: ${slug}`);
  const specFile = path.join(PIPELINE, 'Blogs', slug, 'visuals.mjs');
  if (!fs.existsSync(specFile)) throw new Error(`Missing Blogs/${slug}/visuals.mjs`);
  const spec = (await import(`${pathToFileURL(specFile).href}?t=${Date.now()}`)).default;
  const files = { ...(spec.banner ? { banner: spec.banner } : {}), ...spec.figures };
  const outDir = path.join(PIPELINE, 'Blogs', slug, 'visuals');
  fs.mkdirSync(outDir, { recursive: true });
  const written = [];
  for (const [name, svg] of Object.entries(files)) {
    if (!SLUG_PATTERN.test(name)) throw new Error(`${slug}: figure name "${name}" must be lowercase words joined by hyphens`);
    const { problems, width, height } = inspectSvg(svg);
    if (problems.length) throw new Error(`${slug}/${name}.svg: ${problems.join(', ')}`);
    fs.writeFileSync(path.join(outDir, `${name}.svg`), svg);
    written.push({ name, width, height, bytes: Buffer.byteLength(svg) });
  }
  const keep = new Set(written.map((w) => `${w.name}.svg`));
  for (const old of fs.readdirSync(outDir)) if (old.endsWith('.svg') && !keep.has(old)) fs.rmSync(path.join(outDir, old));
  return written;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const slugs = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  if (!slugs.length) {
    console.error('Usage: node blog-pipeline/scripts/campaign/render-private.mjs {slug} [...]');
    process.exitCode = 2;
  } else {
    for (const slug of slugs) {
      try {
        const out = await renderPrivate(slug);
        console.log(`${slug}: ${out.map((o) => `${o.name} ${o.width}x${o.height}`).join(', ')} -> Blogs/${slug}/visuals/`);
      } catch (err) {
        console.error(err.message);
        process.exitCode = 1;
      }
    }
  }
}
