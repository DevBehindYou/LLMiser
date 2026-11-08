// Visual spec for M10 "How to Read LLMiser's ZIP Index and Manifest".
// Render privately: node blog-pipeline/scripts/campaign/render-private.mjs llmiser-zip-index-manifest
// Data: fixtures/out/PROJECT_INDEX.md and manifest.json. Engine names of
// third-party tools are deliberately not shown (house rule).

import { B, art, banner, cards, decision, figure, note, panels } from '../../visuals/kit.mjs';

const bannerArt = () => {
  let out = art.box(650, 150, 110, 110, { fill: B.mist, r: 12 });
  for (let y = 158; y < 200; y += 10) out += `<rect x="699" y="${y}" width="12" height="6" rx="1" fill="${B.ink}"/>`;
  out += art.label(705, 240, '.zip', { size: 20, anchor: 'middle' });
  [['combined.md', 70, B.paper], ['PROJECT_INDEX.md', 170, '#fff4d6'], ['manifest.json', 270, B.paper]].forEach(([t, y, fill]) => {
    out += art.arrow(768, 205, 836, y + 22, { stroke: B.ink, sw: 3, head: 12 });
    out += art.box(842, y, 300, 46, { fill, r: 8 });
    out += art.label(858, y + 30, t, { size: 18 });
  });
  out += art.label(858, 250, '9 converted  7 skipped', { size: 14, fill: B.amberD, weight: 600 });
  return out;
};

export default {
  banner: banner({
    id: 'zipm-banner',
    kicker: 'ZIP RESULTS',
    hook: ['Every file,', 'accounted for.'],
    sub: 'reading the index and manifest',
    art: bannerArt,
  }),
  figures: {
    'three-outputs': figure({
      title: 'Three outputs per ZIP',
      subtitle: 'All three are listed under Original output files.',
      parts: [
        cards([
          { k: '.md', title: 'Combined Markdown', sub: 'each converted file under a ## heading with its path; numbered parts above 4 MB', s: 's1' },
          { k: 'idx', title: 'PROJECT_INDEX.md', sub: 'summary counts, folder tree, results table, skipped and failed table', s: 's2' },
          { k: '{ }', title: 'manifest.json', sub: 'the same inventory as data: source, limits, one record per entry, no contents', s: 's2' },
        ], { cols: 1, h: 96 }),
      ],
    }),
    'index-excerpt': figure({
      title: 'The index, in its own words',
      subtitle: 'PROJECT_INDEX.md from the synthetic archive (excerpt).',
      parts: [
        panels([
          {
            title: 'Summary',
            tag: '16 FOUND',
            s: 's1',
            lines: [
              { t: '- Files found: 16' },
              { t: '- Converted: 9' },
              { t: '- Text recognised in images: 2' },
              { t: '- Skipped: 7' },
              { t: '- Failed: 0' },
            ],
          },
          {
            title: 'Results (rows)',
            tag: 'BY PATH',
            s: 's2',
            lines: [
              { t: 'docs-bundle/docs/config.txt   Converted' },
              { t: 'docs-bundle/src/config.txt    Converted' },
              { t: 'archive/old.zip/notes.txt     Converted' },
              { t: '(unsafe) ../escape.txt        Skipped', k: 'head' },
              { t: 'readme.md (duplicate)         Skipped', k: 'head' },
            ],
          },
        ]),
        note('Converted 9 + skipped 7 + failed 0 = 16 found. Rows shortened; full paths in the original.'),
      ],
    }),
    'manifest-record': figure({
      title: 'One manifest record',
      subtitle: 'The entry for docs/config.txt, field by field.',
      parts: [
        panels([
          {
            title: 'manifest.json, nodes[]',
            tag: 'NO CONTENT',
            s: 's2',
            lines: [
              { t: '"path": "docs-bundle/docs/config.txt",' },
              { t: '"depth": 0,  "size": 41,' },
              { t: '"node_type": "TEXT_FILE",' },
              { t: '"classification": "DIRECT_TEXT",' },
              { t: '"status": "DONE",', k: 'head' },
              { t: '"engine": "direct",' },
              { t: '"skip_reason": null,  "language": null,' },
              { t: '"node_id": "c5cd7ac1-..."', k: 'dim' },
            ],
          },
        ]),
        note('For the duplicate readme.md, status is "SKIPPED" and skip_reason is "duplicate path".'),
      ],
    }),
    'missing-file-decision': figure({
      title: 'Where did that file go?',
      subtitle: 'Every entry is converted, skipped with a reason, or failed.',
      parts: [
        decision({
          start: { t: 'An expected file is missing' },
          question: 'In the skipped table?',
          yes: { t: 'Read the reason', sub: 'rename, move or unzip it', s: 's1' },
          no: { t: 'Search the tree', sub: 'then look for Failed', s: 's3' },
          after: { t: 'Converted but empty?', sub: 'open its ## path section' },
        }),
      ],
    }),
  },
};
