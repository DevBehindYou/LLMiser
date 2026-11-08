import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { validateRegistry, validateCampaign } from './validate-plan.mjs';
const original = JSON.parse(fs.readFileSync(new URL('../intent-registry.json', import.meta.url), 'utf8'));
const changed = fn => { const copy = structuredClone(original); fn(copy); return validateRegistry(copy); };
const readCampaign = name => JSON.parse(fs.readFileSync(new URL(`../campaign/${name}.json`, import.meta.url), 'utf8'));
const campaignChanged = fn => {
  const inputs = [structuredClone(original), readCampaign('manifest'), readCampaign('posts'), readCampaign('selected-titles')];
  fn(...inputs);
  return validateCampaign(...inputs);
};

test('selected campaign satisfies cardinality and readable brief checks', () => {
  assert.deepEqual(campaignChanged(() => {}), []);
});
test('detects a missing post and incomplete support allocation', () => {
  const errors = campaignChanged((r, m, p) => p.posts.pop());
  assert.ok(errors.some(e => e.includes('108 unique')));
  assert.ok(errors.some(e => e.includes('exactly 3 posts')));
});
test('preserves the user-selected title', () => {
  assert.ok(campaignChanged(r => { r.records.find(x => x.id === 'M01').title = 'Different title'; }).some(e => e.includes('selected title changed')));
});
test('detects moving a support to the wrong cluster', () => {
  assert.ok(campaignChanged(r => { r.records.find(x => x.id === 'M01-S1').parent_id = 'M02'; }).some(e => e.includes('exactly 3 supports')));
});
test('rejects posts linked to the wrong article', () => {
  assert.ok(campaignChanged((r, m, p) => { p.posts[0].canonical_destination = 'https://example.com'; }).some(e => e.includes('destination must match')));
});

test('current registry satisfies structural and ownership checks', () => {
  assert.deepEqual(validateRegistry(original), []);
});
test('normalizes aliases and rejects another owner claiming the same phrase', () => {
  assert.ok(changed(r => { r.records.at(-1).reserved_aliases.push(' PDF-to-MARKDOWN '); }).some(e => e.includes('duplicate keyword')));
});
test('rejects duplicate intent even when title and primary keyword differ', () => {
  assert.ok(changed(r => { r.records.at(-1).intent_key = r.records.at(-2).intent_key; }).some(e => e.includes('duplicate intent')));
});
test('rejects tracking canonical and unsupported measured claim', () => {
  const errors = changed(r => { r.records.at(-1).canonical += '?utm_source=x'; r.records.at(-1).volume = 1000; });
  assert.ok(errors.some(e => e.includes('invalid canonical')));
  assert.ok(errors.some(e => e.includes('unmeasured metrics')));
});
test('rejects bad metadata and orphan parent', () => {
  const errors = changed(r => { r.records.at(-1).description = 'x'.repeat(171); r.records.at(-1).parent_id = 'absent'; });
  assert.ok(errors.some(e => e.includes('description')));
  assert.ok(errors.some(e => e.includes('invalid parent')));
});
