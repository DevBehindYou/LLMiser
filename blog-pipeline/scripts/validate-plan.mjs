// Local editorial guardrail. Never publishes, mutates app files or queries engines.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { parseFrontmatter } from '../../frontend/lib/blog.mjs';

const PIPELINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPO = path.resolve(PIPELINE, '..');
const read = name => JSON.parse(fs.readFileSync(path.join(PIPELINE, name), 'utf8'));
const normalized = value => String(value).normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const digest = name => crypto.createHash('sha256').update(fs.readFileSync(name)).digest('hex');

export function validateRegistry(registry) {
  const errors = [];
  const seen = new Map();
  const ids = new Set((registry.records || []).map(record => record.id));
  function unique(kind, value, id) {
    const key = `${kind}:${normalized(value)}`;
    if (!normalized(value)) { errors.push(`${id}: missing ${kind}`); return; }
    if (seen.has(key)) errors.push(`${id}: duplicate ${kind} owned by ${seen.get(key)}: ${value}`);
    else seen.set(key, id);
  }
  for (const record of registry.records || []) {
    const { id } = record;
    unique('id', id, id);
    unique('canonical', record.canonical, id);
    unique('intent', record.intent_key, id);
    unique('keyword', record.primary_keyword, id);
    for (const alias of record.reserved_aliases || []) unique('keyword', alias, id);
    if (!record.intent?.trim()) errors.push(`${id}: missing reader task`);
    if (!['product', 'existing', 'planned'].includes(record.kind)) errors.push(`${id}: invalid kind`);
    if (!['PROPOSED', 'PARTIAL', 'IMPLEMENTED', 'VERIFIED', 'IMPLEMENTED_UNTESTED'].includes(record.status)) errors.push(`${id}: invalid status`);
    try {
      const url = new URL(record.canonical);
      if (url.origin !== registry.origin || url.search || url.hash) errors.push(`${id}: invalid canonical origin or tracking`);
      if (record.kind !== 'product' && !/^\/blog\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(url.pathname)) errors.push(`${id}: invalid article slug`);
    } catch { errors.push(`${id}: invalid canonical URL`); }
    if (record.kind !== 'product') {
      unique('title', record.title, id);
      if (!record.description?.trim() || record.description.length > 170) errors.push(`${id}: description missing or over 170 characters`);
    }
    if (record.kind === 'planned') {
      if (!record.excludes?.trim()) errors.push(`${id}: missing intent boundary`);
      if (!record.brief || !fs.existsSync(path.resolve(PIPELINE, record.brief))) errors.push(`${id}: missing brief`);
      if (!ids.has(record.parent_id) || record.parent_id === id) errors.push(`${id}: invalid parent`);
      for (const near of record.nearest_ids || []) if (!ids.has(near) || near === id) errors.push(`${id}: invalid nearest owner ${near}`);
      if (record.measurement_status === 'UNMEASURED' && (record.volume !== null || record.difficulty !== null)) errors.push(`${id}: unmeasured metrics must be null`);
    }
  }
  if (!registry.records?.length) errors.push('Empty registry');
  return errors;
}

export function validateCampaign(registry, manifest, postsData, selected) {
  const errors = [];
  const mains = registry.records.filter(r => r.campaign_role === 'main');
  const supports = registry.records.filter(r => r.campaign_role === 'support');
  const posts = postsData.posts;
  const sameIds = (actual, expected) => actual.length === expected.length && new Set(actual).size === actual.length && actual.every(id => expected.includes(id));
  for (const [label, records, ids, count] of [['main', mains, manifest.main_ids, 12], ['support', supports, manifest.support_ids, 36], ['post', posts, manifest.post_ids, 108]]) {
    if (records.length !== count || !sameIds(records.map(r => r.id), ids)) errors.push(`Campaign ${label} IDs/count must match ${count} unique entries`);
  }
  if (!sameIds(Object.keys(selected.titles), manifest.main_ids)) errors.push('Selected title IDs do not match mains');
  for (const main of mains) {
    if (main.title !== selected.titles[main.id] || main.title_selection !== 'USER_SELECTED') errors.push(`${main.id}: selected title changed`);
    if ([...main.title].length > 60) errors.push(`${main.id}: main title exceeds 60 characters`);
    if (supports.filter(s => s.parent_id === main.id).length !== 3) errors.push(`${main.id}: must have exactly 3 supports`);
    if (manifest.categories[main.id] === 'listicle' && Number(main.title.match(/^\d+/)?.[0]) !== manifest.listicle_item_counts[main.id]) errors.push(`${main.id}: listicle count mismatch`);
  }
  for (const [category, count] of [['listicle', 6], ['product', 4], ['misc', 2]]) {
    if (Object.values(manifest.categories).filter(c => c === category).length !== count) errors.push(`Campaign category ${category} must contain ${count} mains`);
  }
  for (const support of supports) {
    if (!mains.some(m => m.id === support.parent_id)) errors.push(`${support.id}: support parent is not a main`);
    if (posts.filter(p => p.support_id === support.id).length !== 3) errors.push(`${support.id}: must have exactly 3 posts`);
  }
  const hooks = new Set();
  const utms = new Set();
  for (const post of posts) {
    const parent = supports.find(s => s.id === post.support_id);
    if (!parent || parent.parent_id !== post.main_id) errors.push(`${post.id}: incorrect post parent`);
    if (!parent || post.canonical_destination !== parent.canonical) errors.push(`${post.id}: destination must match support canonical`);
    if (!post.hook?.trim() || hooks.has(normalized(post.hook))) errors.push(`${post.id}: empty or duplicate hook`);
    hooks.add(normalized(post.hook));
    if (!post.utm_content || utms.has(post.utm_content)) errors.push(`${post.id}: empty or duplicate tracking ID`);
    utms.add(post.utm_content);
    if (!post.evidence_required || !post.source_refs?.length || post.beats?.length !== 3) errors.push(`${post.id}: incomplete evidence or outline`);
    const file = path.resolve(PIPELINE, post.brief || '__missing__');
    if (!fs.existsSync(file)) errors.push(`${post.id}: missing post brief`);
    else {
      const readable = fs.readFileSync(file, 'utf8');
      if (!readable.includes(post.id) || !readable.includes(post.hook)) errors.push(`${post.id}: readable post brief drift`);
    }
  }
  for (const [key, count] of Object.entries({ main_count: 12, support_count: 36, post_count: 108, supports_per_main: 3, posts_per_support: 3 })) {
    if (manifest[key] !== count) errors.push(`Campaign manifest ${key} must be ${count}`);
  }
  return errors;
}

function main() {
  const registry = read('intent-registry.json');
  const errors = validateRegistry(registry);
  errors.push(...validateCampaign(registry, read('campaign/manifest.json'), read('campaign/posts.json'), read('campaign/selected-titles.json')));
  console.log('Campaign: checked 12 selected mains, 36 support briefs and 108 post briefs.');
  const warnings = [];
  const existing = registry.records.filter(r => r.kind === 'existing');
  const contentDir = path.join(REPO, 'frontend/content/blog');
  const actual = fs.readdirSync(contentDir).filter(name => name.endsWith('.md') && name !== 'README.md');
  const mapped = new Set(existing.map(r => path.basename(r.source)));
  for (const name of actual) if (!mapped.has(name)) errors.push(`Unmapped source article: ${name}`);
  for (const record of existing) {
    const file = path.resolve(REPO, record.source);
    if (!fs.existsSync(file)) { errors.push(`${record.id}: source missing`); continue; }
    const { data } = parseFrontmatter(fs.readFileSync(file, 'utf8'));
    if (record.source_sha256 !== digest(file)) errors.push(`${record.id}: source changed; review and update inventory evidence`);
    if (data.title !== record.title || data.description !== record.description || data.primaryKeyword !== record.primary_keyword || registry.origin + '/blog/' + data.slug !== record.canonical) errors.push(`${record.id}: metadata inventory drift`);
  }
  // Observed secondary overlap is a review signal, not an ownership error.
  const termPages = new Map();
  for (const record of existing) for (const term of [record.primary_keyword, ...(record.observed_secondary_keywords || [])]) {
    const key = normalized(term);
    if (!termPages.has(key)) termPages.set(key, new Set());
    termPages.get(key).add(record.id);
  }
  for (const [term, owners] of termPages) if (owners.size > 1) warnings.push(`Observed term overlap: ${term} (${[...owners].join(', ')})`);
  const reviews = read('research/review-register.json');
  for (const review of reviews.issues) if (review.status !== 'RESOLVED') warnings.push(`${review.id}: ${review.title}`);
  const dispositions = fs.readFileSync(path.join(PIPELINE, 'research/archive-disposition.csv'), 'utf8').trim().split(/\r?\n/).slice(1);
  const archiveIds = dispositions.map(line => line.split(',')[0]);
  const expected = Array.from({ length: 15 }, (_, i) => `C${i + 1}`).flatMap(id => [id, ...[1, 2, 3].map(n => `${id}-S${n}`)]);
  if (archiveIds.length !== 60 || new Set(archiveIds).size !== 60 || expected.some(id => !archiveIds.includes(id))) errors.push('Archive map must contain all 15 mains and 45 supports once');
  if (process.argv.includes('--preservation')) {
    const baseline = read('research/preservation-baseline.json');
    for (const [relative, hash] of Object.entries(baseline.files)) {
      const file = path.resolve(REPO, relative);
      if (!fs.existsSync(file) || digest(file) !== hash) errors.push(`Preservation baseline changed: ${relative}`);
    }
    console.log(`Preservation: checked ${Object.keys(baseline.files).length} source/asset/tool hashes.`);
  }
  console.log(`Plan: ${registry.records.length} owners; ${existing.length} existing articles; ${registry.records.filter(r => r.kind === 'planned').length} proposed briefs; ${archiveIds.length} archive decisions.`);
  for (const warning of warnings) console.log(`REVIEW: ${warning}`);
  for (const error of errors) console.error(`ERROR: ${error}`);
  console.log(errors.length ? `FAIL: ${errors.length} error(s).` : 'PASS: structural/exact-ownership checks only; semantic and live search reviews remain required.');
  process.exitCode = errors.length ? 1 : 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
