#!/usr/bin/env node
// Campaign production ledger.
//
//   node blog-pipeline/scripts/campaign/status.mjs set ID key=value [key=value ...]
//   node blog-pipeline/scripts/campaign/status.mjs build
//
// campaign/production-status.json holds one record per assigned ID (12 mains,
// 36 supports, 108 posts) with separate fields: writing, fixture, visual_qa,
// publication, indexing. Writing statuses: NOT_STARTED, RESEARCHING, DRAFTED,
// QA_PENDING, READY_FOR_REVIEW, BLOCKED_EVIDENCE. `build` regenerates
// campaign/editorial-tracker.csv (156 rows, original columns first) and prints
// counts derived from files that actually exist, not from the ledger alone.
// It never changes intent-registry.json statuses.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PIPELINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const LEDGER = path.join(PIPELINE, 'campaign', 'production-status.json');
const TRACKER = path.join(PIPELINE, 'campaign', 'editorial-tracker.csv');
const WRITING = ['NOT_STARTED', 'RESEARCHING', 'DRAFTED', 'QA_PENDING', 'READY_FOR_REVIEW', 'BLOCKED_EVIDENCE'];

const read = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));

function slugMap() {
  const registry = read(path.join(PIPELINE, 'intent-registry.json'));
  const map = {};
  for (const r of registry.records) if (r.kind === 'planned') map[r.id] = { slug: r.canonical.split('/blog/')[1], title: r.title, parent: r.parent_id, canonical: r.canonical, role: r.campaign_role };
  return map;
}

function load() {
  if (fs.existsSync(LEDGER)) return read(LEDGER);
  const manifest = read(path.join(PIPELINE, 'campaign', 'manifest.json'));
  const map = slugMap();
  const ids = {};
  const blank = { writing: 'NOT_STARTED', fixture: 'NOT_STARTED', visual_qa: 'NOT_STARTED', publication: 'NOT_PUBLISHED', indexing: 'NOT_INDEXED', notes: '' };
  for (const id of [...manifest.main_ids, ...manifest.support_ids]) ids[id] = { type: map[id].role, slug: map[id].slug, ...blank };
  for (const id of manifest.post_ids) ids[id] = { type: 'post', support: id.slice(0, 6), ...blank, fixture: 'N/A', posting: 'DRAFT_NOT_POSTED' };
  return { updated: null, note: 'Private production ledger. Separate fields: writing, fixture, visual_qa, publication, indexing. Registry statuses stay PROPOSED until a real release.', ids };
}

function save(ledger) {
  ledger.updated = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(LEDGER, `${JSON.stringify(ledger, null, 1)}\n`);
}

function articleFiles(slug) {
  const dir = path.join(PIPELINE, 'Blogs', slug);
  const need = ['research.md', 'sources.md', 'metadata.json', 'outline.md', 'draft.md', 'claims.json', 'links.json', 'visuals.mjs', 'visual-ledger.md', 'qa.md'];
  const missing = need.filter((f) => !fs.existsSync(path.join(dir, f)));
  const svgs = fs.existsSync(path.join(dir, 'visuals')) ? fs.readdirSync(path.join(dir, 'visuals')).filter((f) => f.endsWith('.svg')) : [];
  return { missing, banner: svgs.includes('banner.svg'), figures: svgs.filter((f) => f !== 'banner.svg').length, preview: fs.existsSync(path.join(dir, 'visuals', 'preview', 'contact-375.jpg')) };
}

function postFile(id, supportSlug) {
  return fs.existsSync(path.join(PIPELINE, 'Posts', supportSlug, `${id}.md`));
}

function build() {
  const ledger = load();
  const map = slugMap();
  const old = fs.readFileSync(TRACKER, 'utf8').trim().split(/\r?\n/);
  const header = old[0].split(',');
  const extra = ['writing', 'fixture', 'visual_qa', 'publication', 'indexing', 'draft_path'];
  const baseCols = header.filter((h) => !extra.includes(h));
  const rows = [];
  const parseLine = (line) => {
    const out = [];
    let cur = '';
    let q = false;
    for (let i = 0; i < line.length; i += 1) {
      const ch = line[i];
      if (q) {
        if (ch === '"' && line[i + 1] === '"') { cur += '"'; i += 1; } else if (ch === '"') q = false; else cur += ch;
      } else if (ch === '"') q = true; else if (ch === ',') { out.push(cur); cur = ''; } else cur += ch;
    }
    out.push(cur);
    return out;
  };
  const csv = (v) => (/[",\n]/.test(String(v ?? '')) ? `"${String(v).replace(/"/g, '""')}"` : String(v ?? ''));
  const counts = { mains: 0, supports: 0, posts: 0, banners: 0, figures: 0, previews: 0, incomplete: [] };
  for (const line of old.slice(1)) {
    const cells = parseLine(line);
    const rec = Object.fromEntries(header.map((h, i) => [h, cells[i]]));
    const id = rec.id;
    const st = ledger.ids[id] || {};
    let draftPath = '';
    if (st.type === 'post') {
      const supportSlug = map[id.slice(0, 6)].slug;
      if (postFile(id, supportSlug)) { draftPath = `Posts/${supportSlug}/${id}.md`; counts.posts += 1; }
    } else if (map[id]) {
      const f = articleFiles(map[id].slug);
      if (fs.existsSync(path.join(PIPELINE, 'Blogs', map[id].slug, 'draft.md'))) {
        draftPath = `Blogs/${map[id].slug}/draft.md`;
        if (map[id].role === 'main') counts.mains += 1; else counts.supports += 1;
        if (f.missing.length) counts.incomplete.push(`${id}: missing ${f.missing.join(', ')}`);
      }
      if (f.banner) counts.banners += 1;
      counts.figures += f.figures;
      if (f.preview) counts.previews += 1;
    }
    if (st.writing && st.writing !== 'NOT_STARTED') rec.status = st.writing;
    rows.push([...baseCols.map((h) => rec[h]), st.writing, st.fixture, st.visual_qa, st.publication, st.indexing, draftPath]);
  }
  fs.writeFileSync(TRACKER, `${[[...baseCols, ...extra].join(','), ...rows.map((r) => r.map(csv).join(','))].join('\n')}\n`);
  save(ledger);
  console.log(`Tracker rows: ${rows.length}`);
  console.log(`Drafts on disk: mains ${counts.mains}/12, supports ${counts.supports}/36, posts ${counts.posts}/108`);
  console.log(`Visual files: banners ${counts.banners}/48, figures ${counts.figures} (minimum 192), rendered previews ${counts.previews}/48`);
  if (counts.incomplete.length) console.log(`Incomplete article folders:\n  ${counts.incomplete.join('\n  ')}`);
  return counts;
}

const [cmd, id, ...pairs] = process.argv.slice(2);
if (cmd === 'set') {
  const ledger = load();
  if (!ledger.ids[id]) throw new Error(`Unknown ID ${id}`);
  for (const pair of pairs) {
    const [k, ...v] = pair.split('=');
    const value = v.join('=');
    if (k === 'writing' && !WRITING.includes(value)) throw new Error(`writing must be one of ${WRITING.join(', ')}`);
    ledger.ids[id][k] = value;
  }
  save(ledger);
  console.log(`${id}: ${JSON.stringify(ledger.ids[id])}`);
} else if (cmd === 'build') {
  build();
} else {
  console.error('Usage: status.mjs set ID key=value ... | status.mjs build');
  process.exitCode = 2;
}
