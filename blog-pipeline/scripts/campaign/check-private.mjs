#!/usr/bin/env node
// Private QA adapter for campaign drafts.
//
//   node blog-pipeline/scripts/campaign/check-private.mjs {slug} [{slug} ...]
//
// Runs the pipeline's own checkArticle (check.mjs: the app parser, figure
// rules, punctuation, banned vocabulary, brand and capability rules) on
// Blogs/{slug}/draft.md. The only difference from a public check is where
// visuals are resolved: check.mjs looks in frontend/public, but private drafts
// stage their SVGs in Blogs/{slug}/visuals/. The adapter drops the
// "does not exist in public/" errors and re-runs the app's collectVisuals
// (same inspectSvg safety rules) against a temporary public root whose
// blog/{slug} points at the staged folder. A PASS here is a private-draft
// result, never production validation.
//
// It adds campaign contract checks from the master prompt: intro length,
// H2 opening answers, listicle count, exact selected main titles, links to
// unpublished pages, keyword bolding, risky capability wording and US spelling.
// The report is written to Blogs/{slug}/check-private.txt.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkArticle } from '../../check.mjs';
import { collectVisuals } from '../../../frontend/scripts/build-blog-index.mjs';
import { parseFrontmatter } from '../../../frontend/lib/blog.mjs';

const PIPELINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const REPO = path.resolve(PIPELINE, '..');

const words = (s) => s.split(/\s+/).filter(Boolean).length;
const stripMd = (s) => s.replace(/!\[[^\]]*\]\([^)]*\)/g, ' ').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/[*_`>#|]/g, ' ');

function publishedSlugs() {
  const dir = path.join(REPO, 'frontend', 'content', 'blog');
  return new Set(fs.readdirSync(dir).filter((f) => f.endsWith('.md') && f !== 'README.md').filter((f) => {
    try {
      return parseFrontmatter(fs.readFileSync(path.join(dir, f), 'utf8')).data.draft !== true;
    } catch {
      return false;
    }
  }).map((f) => f.replace(/\.md$/, '')));
}

const RISKY = [
  [/\bunlimited\b/i, 'never call limits unlimited'],
  [/\bbrowser[- ]only\b|\bnever leaves? your (device|computer|browser)\b|\bruns? (entirely )?in your browser\b/i, 'conversion uploads files to a service'],
  [/\bdelete[sd]? (immediately|instantly|right away)\b/i, 'no immediate deletion promise'],
  [/\bguarantee[ds]?\b/i, 'check every guarantee'],
  [/\b(detects?|scans? for|finds?|catches) (all |every )?(secrets|credentials|api keys)\b/i, 'LLMiser does not scan content for secrets'],
  [/\b(removes?|strips?|blocks?|neutrali[sz]es?) (the )?prompt injections?\b/i, 'LLMiser does not remove prompt injection'],
  [/\bsaves? \d+\s?%|\b\d+\s?% (fewer|less|cheaper|savings)\b/i, 'savings percentages need a measured source'],
  [/\bexact token count|\bbilled tokens\b/i, 'token counts are estimates'],
  [/\b(multilingual|translat(e|es|ion)) (OCR|text recognition)?/i, 'OCR is configured for English; no translation'],
];
const BRITISH = /\b(organis(e|ed|es|ing|ation)|colour|behaviour|analys(e|ed|ing)|optimis(e|ed|ing|ation)|centre|favourite|prioritis(e|ed|ing)|summaris(e|ed|ing)|recognis(e|ed|es|ing)|normalis(e|ed|ing)|catalogue|travelled|labelled|modelling|licence)\b/i;

export function contractChecks(slug, source, meta) {
  const errors = [];
  const warnings = [];
  const info = [];
  let data = {};
  let body = '';
  try {
    ({ data, body } = parseFrontmatter(source));
  } catch (err) {
    errors.push(`Frontmatter: ${err.message}`);
    return { errors, warnings, info };
  }
  const prose = body.replace(/^(```|~~~)[\s\S]*?^\1\s*$/gm, ' ');

  // Exact titles and metadata alignment.
  if (meta) {
    if (meta.title && data.title !== meta.title) errors.push(`Title differs from metadata.json ("${data.title}" vs "${meta.title}")`);
    if (meta.role === 'main') {
      const selected = JSON.parse(fs.readFileSync(path.join(PIPELINE, 'campaign', 'selected-titles.json'), 'utf8'));
      const list = selected.titles || selected.selected || selected;
      const want = Array.isArray(list) ? (list.find((t) => t.id === meta.id) || {}).title : list[meta.id];
      if (want && data.title !== want) errors.push(`Main title is not the owner's exact selected title: "${want}"`);
    }
    if (meta.slug && data.slug !== meta.slug) errors.push(`Slug differs from reservation ${meta.slug}`);
    if (meta.primary_keyword && data.primaryKeyword !== meta.primary_keyword) errors.push('primaryKeyword differs from the registry reservation');
  }
  if (data.draft !== true) errors.push('Private campaign drafts must keep draft: true');

  // Intro under 120 words.
  const afterTldr = body.replace(/^\n*\*\*TL;DR:?\*\*[^\n]*\n/, '');
  const intro = afterTldr.split(/^## /m)[0];
  const introWords = words(stripMd(intro));
  info.push(`Intro: ${introWords} words`);
  if (introWords >= 120) errors.push(`Intro is ${introWords} words (must be under 120)`);

  // H2 opening answers of roughly 25 to 40 words.
  const sections = prose.split(/^## /m).slice(1);
  const openings = [];
  for (const sec of sections) {
    const heading = sec.split('\n')[0].trim();
    if (/^Frequently Asked Questions/.test(heading)) continue;
    const paras = sec.split('\n').slice(1).join('\n').split(/\n\s*\n/).map((p) => p.trim()).filter((p) => p && !/^!\[/.test(p) && !/^###/.test(p) && !/^\|/.test(p) && !/^[-*] /.test(p));
    const first = paras[0] || '';
    const n = words(stripMd(first));
    openings.push(`${n}`);
    if (n < 22 || n > 44) warnings.push(`H2 "${heading.slice(0, 50)}" opens with ${n} words (target 25 to 40)`);
  }
  info.push(`H2 opening word counts: ${openings.join(', ')}`);

  // Listicle count.
  if (meta && meta.listicle_count) {
    const items = (body.match(/^## \d+\. /gm) || []).length;
    info.push(`Numbered items: ${items} of ${meta.listicle_count}`);
    if (items !== meta.listicle_count) errors.push(`Listicle has ${items} numbered H2 items, title promises ${meta.listicle_count}`);
  }

  // Links: no public links to unpublished campaign pages.
  const live = publishedSlugs();
  const links = [...body.matchAll(/\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)].map((m) => m[1]).filter((u) => !/\.svg$/.test(u));
  for (const url of links) {
    const m = /^(?:https:\/\/llmiser\.devbehindyou\.com)?\/blog\/([a-z0-9-]+)\/?$/.exec(url);
    if (m && !live.has(m[1])) errors.push(`Link to unpublished article /blog/${m[1]} (keep it in links.json until released)`);
    if (/^https?:\/\//.test(url) && /utm_/.test(url)) errors.push(`Tracking parameters in ${url}`);
  }
  info.push(`Links: ${links.length} (${links.filter((u) => /^https?:/.test(u)).length} external)`);

  // Keyword bolding.
  if (data.primaryKeyword) {
    // Natural articles may sit between keyword words ("prepare a codebase for AI").
    const kwRe = new RegExp(String(data.primaryKeyword).trim().split(/\s+/).map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('\\s+(?:(?:a|an|the|your|my|their)\\s+)?'), 'i');
    const bolded = [...body.matchAll(/\*\*([^*]+)\*\*/g)].map((m) => m[1]);
    if (!bolded.some((b) => kwRe.test(b))) warnings.push(`Primary keyword "${data.primaryKeyword}" is never bolded`);
    const count = bolded.filter((b) => kwRe.test(b)).length;
    if (count > 1) warnings.push(`Primary keyword bolded ${count} times (first natural use only)`);
  }

  // Risky capability wording and US English.
  const visible = stripMd(prose);
  for (const [re, why] of RISKY) {
    const hit = re.exec(visible);
    if (hit) warnings.push(`Review wording "${hit[0]}": ${why}`);
  }
  const brit = BRITISH.exec(visible + ' ' + (data.description || '') + ' ' + (data.excerpt || ''));
  if (brit) errors.push(`British spelling "${brit[0]}" (use US English)`);
  return { errors, warnings, info };
}

export function checkPrivate(slug) {
  const dir = path.join(PIPELINE, 'Blogs', slug);
  const source = fs.readFileSync(path.join(dir, 'draft.md'), 'utf8');
  const metaFile = path.join(dir, 'metadata.json');
  const meta = fs.existsSync(metaFile) ? JSON.parse(fs.readFileSync(metaFile, 'utf8')) : null;
  const result = checkArticle(`${slug}.md`, source);
  result.errors = result.errors.filter((e) => !/^Visual: \S+ does not exist in public\/$/.test(e));
  if (result.post) {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'llmiser-private-'));
    fs.mkdirSync(path.join(tmp, 'blog'));
    fs.symlinkSync(path.join(dir, 'visuals'), path.join(tmp, 'blog', slug), 'dir');
    const { errors: staged } = collectVisuals(result.post, tmp);
    result.errors.push(...staged.map((e) => e.replace(/^content\/blog\/[^:]+: /, 'Staged visual: ').replace('in public/', `in Blogs/${slug}/visuals/`)));
    fs.rmSync(tmp, { recursive: true, force: true });
  }
  const extra = contractChecks(slug, source, meta);
  const errors = [...result.errors, ...extra.errors];
  const warnings = [...result.warnings, ...extra.warnings];
  const lines = [
    `LLMiser PRIVATE draft check (adapter; staged visuals, not production validation): Blogs/${slug}/draft.md`,
    `Date: ${new Date().toISOString()}`,
    `Words (app wordCount): ${result.words}${result.post ? `, read time ${result.post.readTime}` : ''}`,
    ...extra.info.map((i) => `Info: ${i}`),
    '',
    `Errors (${errors.length}):`,
    ...(errors.length ? errors.map((e) => `  x ${e}`) : ['  none']),
    '',
    `Warnings (${warnings.length}):`,
    ...(warnings.length ? warnings.map((w) => `  ! ${w}`) : ['  none']),
    '',
    errors.length ? 'RESULT: FAIL' : 'RESULT: PASS (private draft adapter)',
  ];
  const text = `${lines.join('\n')}\n`;
  fs.writeFileSync(path.join(dir, 'check-private.txt'), text);
  return { text, errors, warnings, words: result.words };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  let failed = 0;
  for (const slug of process.argv.slice(2)) {
    const { text, errors } = checkPrivate(slug);
    process.stdout.write(text);
    if (errors.length) failed += 1;
  }
  process.exitCode = failed ? 1 : 0;
}
