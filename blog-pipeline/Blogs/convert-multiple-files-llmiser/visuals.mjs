// Visual spec for M07 "How to Convert Multiple Files With LLMiser".
// Render privately: node blog-pipeline/scripts/campaign/render-private.mjs convert-multiple-files-llmiser
// Data: fixtures/queue-plan.json and fixtures/out/*/run.json.

import { B, art, banner, decision, figure, flow, note } from '../../visuals/kit.mjs';
import { compare, markLegend, tree } from '../../visuals/campaign-parts.mjs';

const rows = [
  ['refund-policy.docx', true],
  ['q3-review.pptx', true],
  ['quoted.csv', true],
  ['invoice-clean.png', true],
  ['invoice-tool-sharing.zip', true],
  ['mislabeled-report.pdf', false],
];

const bannerArt = () => {
  let out = art.box(646, 46, 500, 306, { fill: '#ffffff', r: 14 });
  rows.forEach(([name, ok], i) => {
    const y = 66 + i * 46;
    out += `<rect x="664" y="${y}" width="464" height="38" rx="8" fill="${ok ? '#f7f6f1' : B.rose}" stroke="${ok ? '#d9d6cc' : B.pink}" stroke-width="1.5"/>`;
    out += art.label(680, y + 26, name, { size: 16, weight: 500 });
    if (ok) out += `<path d="M1090 ${y + 20}L1098 ${y + 28}L1112 ${y + 11}" fill="none" stroke="${B.amberD}" stroke-width="3.5" stroke-linecap="round"/>`;
    else out += art.label(1112, y + 26, 'retry', { size: 16, anchor: 'end', fill: B.pink });
  });
  return out;
};

export default {
  banner: banner({
    id: 'batch-banner',
    kicker: 'BATCH GUIDE',
    hook: ['One batch,', 'many outcomes.'],
    sub: 'up to 20 files, each its own job',
    art: bannerArt,
  }),
  figures: {
    'batch-flow': figure({
      title: 'A batch, step by step',
      subtitle: 'Each file moves through these steps as its own job.',
      parts: [
        flow([
          { t: 'Choose files', sub: 'formats and limits' },
          { t: 'Add them', sub: 'picker or drop' },
          { t: 'Convert all', sub: 'profile set, two at a time' },
          { t: 'Read each status', sub: 'done or failed', s: 's1' },
          { t: 'Review results', sub: 'one per file' },
          { t: 'Fix failures', sub: 'retry or remove', s: 's3' },
        ], { cols: 3, boxH: 86 }),
      ],
    }),
    'queue-intake': figure({
      title: '27 files selected, 20 added',
      subtitle: 'What the queue code did when the files were added.',
      parts: [
        tree([
          { t: '20 files', mark: 'keep', note: 'ADDED' },
          { t: 'old-memo.doc', mark: 'skip', note: 'UNSUPPORTED FORMAT' },
          { t: 'empty.txt', mark: 'skip', note: 'FILE IS EMPTY' },
          { t: 'annual-report.pdf, 16 MB', mark: 'skip', note: 'OVER 15 MB' },
          { t: 'photo.jpg, 11 MB', mark: 'skip', note: 'IMAGE OVER 10 MB' },
          { t: 'policy.docx, again', mark: 'skip', note: 'ALREADY QUEUED' },
          { t: '2 more files', mark: 'skip', note: 'QUEUE FULL' },
        ], { title: 'Queue intake, local run' }),
        markLegend(['keep', 'skip']),
        note('The notice gave counts only: 4 skipped as unsupported or too large, 1 already queued, 2 over the limit.'),
      ],
    }),
    'batch-outcomes': figure({
      title: 'Six files, six outcomes',
      subtitle: 'A mixed batch through LLMiser conversion code, local run.',
      parts: [
        compare({
          headers: ['FILE', 'ROUTE', 'OUTCOME'],
          widths: [230, 140, 182],
          size: 12.5,
          rows: [
            { label: 'refund-policy.docx', cells: [{ t: 'document' }, { t: 'done', ok: true }] },
            { label: 'q3-review.pptx', cells: [{ t: 'document' }, { t: 'done', ok: true }] },
            { label: 'quoted.csv', cells: [{ t: 'document' }, { t: 'done', ok: true }] },
            { label: 'invoice-clean.png', cells: [{ t: 'recognition' }, { t: 'done', ok: true }] },
            { label: 'invoice-tool-sharing.zip', cells: [{ t: 'archive' }, { t: 'done, 1 result', ok: true }] },
            { label: 'mislabeled-report.pdf', cells: [{ t: 'document' }, { t: 'failed', ok: false }] },
          ],
        }),
        note('The failure read "File content does not match the .pdf extension". The other five were not affected.'),
      ],
    }),
    'failure-decision': figure({
      title: 'Did every file finish?',
      subtitle: 'A finished batch is not the same as a successful one.',
      parts: [
        decision({
          start: { t: 'The batch has finished' },
          question: 'Every file marked done?',
          yes: { t: 'Review each result', sub: 'one Markdown per file', s: 's1' },
          no: { t: 'Read the failed row', sub: 'its message names the cause', s: 's3' },
          after: { t: 'Fix, then retry', sub: 'or remove the file' },
        }),
      ],
    }),
  },
};
