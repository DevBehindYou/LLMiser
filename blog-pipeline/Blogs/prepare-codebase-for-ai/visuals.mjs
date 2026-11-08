// Visual spec for M01 "7 Things to Remove Before Sharing a Codebase With AI".
// Render privately: node blog-pipeline/scripts/campaign/render-private.mjs prepare-codebase-for-ai
// Every figure uses content from draft.md and the synthetic fixture run in fixtures/.

import { B, F, art, banner, cards, decision, figure, note } from '../../visuals/kit.mjs';
import { checklist, columns } from '../../visuals/campaign-parts.mjs';

const rows = [
  { t: 'src/invoice/', keep: true },
  { t: 'tests/', keep: true },
  { t: 'pyproject.toml', keep: true },
  { t: '.env', keep: false },
  { t: 'logs/app.log', keep: false },
  { t: 'node_modules/', keep: false },
  { t: 'backup.zip', keep: false },
];

const bannerArt = () => {
  let out = art.box(640, 50, 318, 300, { fill: B.paper });
  out += art.label(660, 84, 'invoice-tool/', { size: 20, fill: B.ink });
  rows.forEach((r, i) => {
    const y = 124 + i * 32;
    if (r.keep) out += `<rect x="664" y="${y - 14}" width="15" height="15" rx="2" fill="${B.amber}" stroke="${B.ink}" stroke-width="1.5"/>`;
    else out += `<path d="M664 ${y - 14}L679 ${y + 1}M679 ${y - 14}L664 ${y + 1}" stroke="${B.pink}" stroke-width="3" stroke-linecap="round"/>`;
    out += art.label(692, y, r.t, { size: 18, fill: r.keep ? B.ink : B.pink, weight: r.keep ? 700 : 500 });
    if (!r.keep) out += `<line x1="690" y1="${y - 6}" x2="${694 + r.t.length * 10.9}" y2="${y - 6}" stroke="${B.pink}" stroke-width="2"/>`;
  });
  out += art.arrow(968, 200, 1012, 200, { stroke: B.ink });
  out += art.box(1020, 96, 132, 210, { fill: B.mist });
  for (let y = 104; y < 150; y += 10) out += `<rect x="1080" y="${y}" width="12" height="6" rx="1" fill="${B.ink}"/>`;
  out += art.chip(1038, 172, 96, B.amber);
  out += art.chip(1038, 204, 96, B.amber);
  out += art.chip(1038, 236, 96, B.amber);
  out += art.label(1086, 292, 'sharing copy', { size: 15, anchor: 'middle' });
  return out;
};

export default {
  banner: banner({
    id: 'pcfa-banner',
    kicker: 'CODEBASE PREP',
    hook: ['Share the code,', 'not the .env.'],
    sub: '7 things to remove first',
    art: bannerArt,
  }),
  figures: {
    'seven-removals': figure({
      title: 'Seven things to take out',
      subtitle: 'Each removal, with the file that stood for it in our synthetic test project.',
      parts: [
        cards([
          { k: '01', title: 'Secrets and credentials', sub: '.env, id_ed25519, a renamed settings.local.yaml', s: 's3' },
          { k: '02', title: 'Private data and logs', sub: 'app log, customer CSV export, checkout screenshot', s: 's3' },
          { k: '03', title: 'Installed dependencies', sub: 'node_modules and .venv. Keep the lockfiles.', s: 's3' },
          { k: '04', title: 'Build output', sub: 'build/lib copy and a packaged dist wheel', s: 's3' },
          { k: '05', title: 'Caches and temp files', sub: '__pycache__, .pytest_cache, tmp/debug-notes.txt', s: 's3' },
          { k: '06', title: 'Large binaries', sub: 'a demo screen recording nobody asked about', s: 's3' },
          { k: '07', title: 'Duplicate or old copies', sub: 'totals_old.py, a "(copy)" file, a backup ZIP', s: 's3' },
          { k: '+', title: 'Keep these', sub: 'source, the failing test, manifests, lockfiles, README', s: 's1' },
        ], { cols: 2, h: 112 }),
      ],
    }),
    'keep-or-remove': figure({
      title: 'Keep it or leave it out?',
      subtitle: 'One question per file, asked against the task you are sharing for.',
      parts: [
        decision({
          start: { t: 'A file in the project' },
          question: 'Task works without it?',
          yes: { t: 'Leave it out', sub: 'deps, builds, caches, binaries, old copies', s: 's3' },
          no: { t: 'Keep it', sub: 'source, tests, manifests, lockfiles', s: 's1' },
          after: { t: 'Then scan it', sub: 'swap any secret for a placeholder' },
        }),
      ],
    }),
    'fixture-comparison': figure({
      title: 'What reached the Markdown',
      subtitle: 'Local run of LLMiser archive code on a synthetic project, 8 Nov 2026. All values are fake.',
      parts: [
        columns({
          left: {
            title: 'Original folder, 33 files',
            s: 's3',
            lines: [
              '# SKIPPED BY FILE NAME',
              '.env  .env.example',
              'id_ed25519',
              '# SKIPPED BY FOLDER NAME',
              '.git  .venv  node_modules',
              'build  dist  __pycache__',
              '# CONVERTED ANYWAY',
              '! settings.local.yaml',
              '! app-2026-11-02.log',
              '! customers-export.csv',
              '! tmp/debug-notes.txt',
              '! totals_old.py',
              '! totals (copy).py',
              '! backup ZIP settings',
            ],
          },
          right: {
            title: 'Reviewed copy, 13 files',
            s: 's1',
            lines: [
              '# CONVERTED',
              '+ src/invoice/totals.py',
              '+ src/invoice/cli.py',
              '+ tests/test_totals.py',
              '+ pyproject.toml',
              '+ requirements.lock',
              '+ web/package.json',
              '+ web/package-lock.json',
              '+ README, app.yaml, app.js',
              '# SKIPPED BY FILE NAME',
              '.env.example',
              '# FAKE VALUES IN OUTPUT',
              'none',
            ],
          },
        }),
        note('Fake values in the original Markdown: 4 credential lines, 2 customer rows and 3 more lines with email addresses.'),
      ],
    }),
    'final-check': figure({
      title: 'Before you send the copy',
      subtitle: 'A last pass on the sharing copy, then on the converted output.',
      parts: [
        checklist([
          { t: 'Run the tests inside the copy', sub: 'They pass, or fail for the reason you are asking about.' },
          { t: 'Search for key, token, password, secret and @' },
          { t: 'Keep one version of each file', sub: 'No _old, (copy) or backup ZIPs.' },
          { t: 'Read the skipped list after conversion', sub: 'Source the task needs should never be on it.' },
          { t: 'Stay under 15 MB and 2,000 files' },
        ]),
        note('Name rules and searches can miss a secret. Rotate any that leaked.', { s: 's3' }),
      ],
    }),
  },
};
