#!/usr/bin/env node
// Builds the banner and figures of one or more articles.
//
//   node blog-pipeline/visuals/build.mjs {slug} [{slug} ...]
//   node blog-pipeline/visuals/build.mjs --all
//
// Each article keeps its visual spec in Blogs/{slug}/visuals.mjs, which
// default-exports { banner: '<svg...>', figures: { name: '<svg...>' } }
// built with ./kit.mjs. The files are written to
// frontend/public/blog/{slug}/{name}.svg (the banner as banner.svg). Files in
// that folder that the spec no longer produces are removed. Every file is
// checked with the same inspectSvg the app's blog index uses.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { inspectSvg, SLUG_PATTERN } from '../../frontend/lib/blog.mjs';

const PIPELINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPO = path.resolve(PIPELINE, '..');
const OUT_ROOT = path.join(REPO, 'frontend', 'public', 'blog');

async function buildOne(slug) {
  if (!SLUG_PATTERN.test(slug)) throw new Error(`Not a slug: ${slug}`);
  const specFile = path.join(PIPELINE, 'Blogs', slug, 'visuals.mjs');
  if (!fs.existsSync(specFile)) throw new Error(`Missing ${path.relative(REPO, specFile)}`);
  const spec = (await import(pathToFileURL(specFile).href)).default;
  const files = { ...(spec.banner ? { banner: spec.banner } : {}), ...spec.figures };
  const outDir = path.join(OUT_ROOT, slug);
  fs.mkdirSync(outDir, { recursive: true });
  const written = new Set();
  for (const [name, svg] of Object.entries(files)) {
    if (!SLUG_PATTERN.test(name)) throw new Error(`${slug}: figure name "${name}" must be lowercase words joined by hyphens`);
    const { problems } = inspectSvg(svg);
    if (problems.length) throw new Error(`${slug}/${name}.svg: ${problems.join(', ')}`);
    fs.writeFileSync(path.join(outDir, `${name}.svg`), svg);
    written.add(`${name}.svg`);
  }
  for (const old of fs.readdirSync(outDir)) {
    if (old.endsWith('.svg') && !written.has(old)) fs.rmSync(path.join(outDir, old));
  }
  const figureCount = Object.keys(spec.figures || {}).length;
  console.log(`${slug}: ${spec.banner ? 'banner + ' : ''}${figureCount} figure(s) -> frontend/public/blog/${slug}/`);
}

async function main(argv) {
  let slugs = argv.filter((a) => !a.startsWith('--'));
  if (argv.includes('--all')) {
    slugs = fs.readdirSync(path.join(PIPELINE, 'Blogs')).filter((d) => fs.existsSync(path.join(PIPELINE, 'Blogs', d, 'visuals.mjs')));
  }
  if (!slugs.length) {
    console.error('Usage: node blog-pipeline/visuals/build.mjs {slug} [...] | --all');
    return 2;
  }
  for (const slug of slugs) await buildOne(slug);
  return 0;
}

main(process.argv.slice(2)).then(
  (code) => {
    process.exitCode = code;
  },
  (err) => {
    console.error(err.message);
    process.exitCode = 1;
  }
);
