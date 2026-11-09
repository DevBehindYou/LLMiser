#!/usr/bin/env node
// Writes metadata.json and a links.json skeleton for one support article from
// intent-registry.json, so per-article work starts from the reserved values.
//
//   node blog-pipeline/scripts/campaign/scaffold-support.mjs M01-S1 [--force]
//
// Existing files are kept unless --force is given. Fields that need editorial
// work (description, excerpt, tags, secondary keywords, figures) are filled
// with the registry proposal or left empty for the writer to complete.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PIPELINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const registry = JSON.parse(fs.readFileSync(path.join(PIPELINE, 'intent-registry.json'), 'utf8'));
const byId = Object.fromEntries(registry.records.map((r) => [r.id, r]));
const [id, flag] = process.argv.slice(2);
const r = byId[id];
if (!r || r.campaign_role !== 'support') throw new Error(`Not a support ID: ${id}`);
const slug = r.canonical.split('/blog/')[1];
const parent = byId[r.parent_id];
const dir = path.join(PIPELINE, 'Blogs', slug);
fs.mkdirSync(path.join(dir, 'fixtures'), { recursive: true });
const today = new Date().toISOString().slice(0, 10);

const metadata = {
  id,
  role: 'support',
  title: r.title,
  title_selection: 'EDITORIAL_PROPOSAL (registry title kept unless qa.md records a change)',
  slug,
  canonical: r.canonical,
  canonical_status: 'RESERVED_NOT_LIVE',
  intent_key: r.intent_key,
  reader_task: r.intent,
  scope_exclusions: [r.excludes, `Parent ${r.parent_id} owns the full checklist or workflow`],
  primary_keyword: r.primary_keyword,
  secondary_keywords: [],
  keyword_metrics: 'UNMEASURED',
  description: r.description,
  description_change: null,
  excerpt: '',
  category: 'GUIDE',
  tags: [],
  listicle_count: null,
  parent_id: r.parent_id,
  nearest_ids: r.nearest_ids,
  author: 'DevBehindYou',
  draft_date: today,
  publication_date: null,
  draft: true,
  banner: `/blog/${slug}/banner.svg`,
  figures: [],
};
const links = {
  article: id,
  checked: today,
  in_draft: [
    { url: '/usecase', owner: 'USE', status: 'LIVE' },
    { url: '/', owner: 'HOME', status: 'LIVE', placement: 'CTA' },
  ],
  planned_when_released: [
    { target: r.parent_id, url: parent.canonical.replace('https://llmiser.devbehindyou.com', ''), status: 'UNPUBLISHED', placement: 'Intro or first section, link to the parent checklist', anchor: parent.title },
    ...r.nearest_ids.filter((n) => n !== r.parent_id && byId[n]).map((n) => ({ target: n, url: byId[n].canonical.replace('https://llmiser.devbehindyou.com', ''), status: byId[n].kind === 'existing' ? 'LIVE' : 'UNPUBLISHED', placement: 'Optional sibling link where genuinely useful' })),
  ],
};
for (const [name, obj] of [['metadata.json', metadata], ['links.json', links]]) {
  const file = path.join(dir, name);
  if (fs.existsSync(file) && flag !== '--force') continue;
  fs.writeFileSync(file, `${JSON.stringify(obj, null, 2)}\n`);
}
console.log(JSON.stringify({ id, slug, title: r.title, primary: r.primary_keyword, parent: `${r.parent_id} ${parent.title}`, description: r.description }, null, 1));
