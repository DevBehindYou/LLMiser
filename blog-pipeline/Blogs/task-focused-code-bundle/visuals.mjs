// Visual spec for M01-S3 "Build a Task-Focused Code Bundle With Tests".
// Data: fixtures/bundles.json, pytest runs and out-*/run.json.

import { B, art, banner, figure, flow, note } from '../../visuals/kit.mjs';
import { checklist, compare, markLegend, tree } from '../../visuals/campaign-parts.mjs';

const node = (x, y, t, keep) => art.box(x, y, 168, 42, { fill: keep ? '#fde7c2' : '#f1f0ec', stroke: keep ? B.amberD : '#b9b6ad', r: 8, sw: 2 })
  + art.label(x + 84, y + 27, t, { size: 15, anchor: 'middle', fill: keep ? B.ink : '#8a8a92' });

const bannerArt = () => {
  let out = '';
  out += node(660, 60, 'test_fines.py', true);
  out += art.arrow(744, 104, 744, 136, { stroke: B.ink, sw: 3, head: 10 });
  out += node(660, 140, 'fines.py', true);
  out += art.arrow(720, 184, 700, 218, { stroke: B.ink, sw: 3, head: 10 });
  out += art.arrow(770, 184, 800, 218, { stroke: B.ink, sw: 3, head: 10 });
  out += node(640, 222, 'calendar.py', true);
  out += node(760, 270, 'config.py', true);
  out += `<rect x="636" y="50" width="300" height="270" rx="16" fill="none" stroke="${B.amberD}" stroke-width="2.5" stroke-dasharray="8 6"/>`;
  out += node(970, 90, 'report.py', false);
  out += node(970, 160, 'emailer.py', false);
  out += node(970, 230, 'history.md', false);
  return out;
};

export default {
  banner: banner({
    id: 'bndl-banner',
    kicker: 'CODE BUNDLE',
    hook: ['Start from the', 'failing test.'],
    sub: 'trace it, then prove it',
    art: bannerArt,
  }),
  figures: {
    'bundle-flow': figure({
      title: 'Test outward, then prove it',
      subtitle: 'The same test chooses the files and checks the bundle.',
      parts: [
        flow([
          { t: 'Name the question', sub: 'one sentence' },
          { t: 'Failing test', sub: 'find or write it', s: 's1' },
          { t: 'Trace imports', sub: 'your code only' },
          { t: 'Add manifest', sub: 'and data files' },
          { t: 'Run it in the bundle', sub: 'right failure?', s: 's1' },
        ], { cols: 3, boxH: 88 }),
      ],
    }),
    'import-trace': figure({
      title: 'Six of ten files',
      subtitle: 'Traced from tests/test_fines.py in the synthetic project.',
      parts: [
        tree([
          { t: 'tests/test_fines.py', mark: 'keep', note: 'START' },
          { t: 'fines/fines.py', d: 1, mark: 'keep', note: 'late_fee' },
          { t: 'fines/calendar.py', d: 2, mark: 'keep', note: 'the bug' },
          { t: 'fines/config.py', d: 2, mark: 'keep', note: 'rate, holidays' },
          { t: 'pyproject.toml, __init__.py', mark: 'keep', note: 'added' },
          { t: 'fines/report.py', mark: 'skip', note: 'NOT REACHED' },
          { t: 'fines/emailer.py', mark: 'skip', note: 'NOT REACHED' },
          { t: 'tests/test_report.py', mark: 'skip', note: 'NOT REACHED' },
          { t: 'docs/history.md', mark: 'skip', note: 'NOT REACHED' },
        ], { title: 'Import trace' }),
        markLegend(['keep', 'skip']),
      ],
    }),
    'bundle-results': figure({
      title: 'Run the test in each bundle',
      subtitle: 'Local pytest runs on the synthetic project.',
      parts: [
        compare({
          headers: ['BUNDLE', 'FILES', 'TEST RESULT'],
          widths: [172, 90, 290],
          size: 12.5,
          rows: [
            { label: 'Incomplete', cells: [{ t: '4' }, { t: 'module missing', ok: false }] },
            { label: 'Traced', cells: [{ t: '6' }, { t: 'assert 0.0 == 0.25', ok: true }] },
            { label: 'Whole project', cells: [{ t: '10' }, { t: 'same failure', ok: true }] },
          ],
        }),
        note('Converted text: 164 words traced, 367 for the whole project.'),
      ],
    }),
    'bundle-checklist': figure({
      title: 'Before you share the bundle',
      subtitle: 'The test is the proof.',
      parts: [
        checklist([
          { t: 'One question, in one sentence' },
          { t: 'A failing test that shows it' },
          { t: 'Every imported project file included' },
          { t: 'Data files and settings added or described' },
          { t: 'Test run inside the bundle' },
          { t: 'The failure matches the question' },
        ]),
        note('Import traces miss runtime data, settings and dynamic imports.', { s: 's3' }),
      ],
    }),
  },
};
