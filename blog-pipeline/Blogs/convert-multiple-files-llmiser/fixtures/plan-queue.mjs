#!/usr/bin/env node
// M07 fixture, part 1: what the real queue planner does with an awkward file
// selection. Imports frontend/lib/models/queueModel.js planAddFiles (the same
// function the converter calls when files are dropped) with file-like objects
// carrying only name and size. The notice text reproduces describeSkipped in
// viewmodels/useConverterViewModel.js line for line (that helper is not exported).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { planAddFiles } from '../../../../frontend/lib/models/queueModel.js';
import { MAX_QUEUE_FILES } from '../../../../frontend/lib/formats.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const MB = 1024 * 1024;

function describeSkipped({ rejected, duplicates, overflow }) {
  const parts = [];
  if (rejected.length === 1) parts.push(`Skipped "${rejected[0].name}" — ${rejected[0].reason}`);
  if (rejected.length > 1) parts.push(`Skipped ${rejected.length} files — unsupported or too large`);
  if (duplicates) parts.push(`${duplicates} already in queue`);
  if (overflow) parts.push(`Queue limit is ${MAX_QUEUE_FILES} — ${overflow} not added`);
  return parts.join(' · ');
}

let n = 0;
const makeId = () => `item-${(n += 1)}`;
const files = [
  { name: 'policy.docx', size: 38 * 1024 },
  { name: 'q3-review.pptx', size: 47 * 1024 },
  { name: 'orders.csv', size: 2 * 1024 },
  { name: 'scan.png', size: 64 * 1024 },
  { name: 'repo.zip', size: 3 * 1024 },
  { name: 'old-memo.doc', size: 20 * 1024 },
  { name: 'empty.txt', size: 0 },
  { name: 'annual-report.pdf', size: 16 * MB },
  { name: 'photo.jpg', size: 11 * MB },
  { name: 'policy.docx', size: 38 * 1024 },
  ...Array.from({ length: 17 }, (_, i) => ({ name: `notes-${String(i + 1).padStart(2, '0')}.md`, size: 1024 })),
];

const first = planAddFiles({ items: [] }, files, { makeId });
const result = {
  label: 'LOCAL CODE-LEVEL RUN of frontend/lib/models/queueModel.js planAddFiles; file-like objects, no upload',
  date: new Date().toISOString(),
  selected: files.length,
  accepted: first.accepted.map((a) => a.name),
  rejected: first.rejected,
  duplicates: first.duplicates,
  overflow: first.overflow,
  notice: describeSkipped(first),
  limits: { MAX_QUEUE_FILES },
};
fs.writeFileSync(path.join(HERE, 'queue-plan.json'), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ accepted: result.accepted.length, rejected: result.rejected, duplicates: result.duplicates, overflow: result.overflow, notice: result.notice }, null, 2));
