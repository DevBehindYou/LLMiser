// Visual spec for M06 "7 Ways to Prepare Cleaner CSV Data for AI".
// Render privately: node blog-pipeline/scripts/campaign/render-private.mjs prepare-csv-data-for-ai
// Outputs come from fixtures/out-*/.

import { B, art, banner, figure, flow, note } from '../../visuals/kit.mjs';
import { checklist, columns, compare } from '../../visuals/campaign-parts.mjs';

const bannerArt = () => {
  let out = art.box(640, 54, 512, 132, { fill: '#ffffff', r: 12 });
  out += art.label(660, 92, 'Lee;10,50;Köln', { size: 24 });
  out += `<line x1="780" y1="102" x2="780" y2="168" stroke="${B.pink}" stroke-width="3" stroke-dasharray="6 5"/>`;
  out += art.box(660, 120, 116, 44, { fill: B.rose, stroke: B.pink, r: 8 });
  out += art.label(718, 150, 'Lee;10', { size: 19, anchor: 'middle' });
  out += art.box(786, 120, 140, 44, { fill: B.rose, stroke: B.pink, r: 8 });
  out += art.label(856, 150, '50;Köln', { size: 19, anchor: 'middle' });
  out += `<path d="M946 128L966 148M966 128L946 148" stroke="${B.pink}" stroke-width="4" stroke-linecap="round"/>`;
  out += art.label(978, 148, 'split at the comma', { size: 15, weight: 600 });
  out += art.box(640, 210, 512, 140, { fill: '#ffffff', r: 12 });
  out += art.label(660, 246, 'Lee,10.50,Köln', { size: 24 });
  ['Lee', '10.50', 'Köln'].forEach((t, i) => {
    out += art.box(660 + i * 128, 268, 118, 44, { fill: '#fde7c2', stroke: B.amberD, r: 8 });
    out += art.label(719 + i * 128, 298, t, { size: 19, anchor: 'middle' });
  });
  out += art.label(838, 336, 'three cells, as intended', { size: 15, weight: 600, anchor: 'middle' });
  return out;
};

export default {
  banner: banner({
    id: 'csvp-banner',
    kicker: 'CSV PREP',
    hook: ['One delimiter.', 'One encoding.'],
    sub: '7 fixes before a CSV meets AI',
    art: bannerArt,
  }),
  figures: {
    'csv-pipeline': figure({
      title: 'How a CSV becomes a table',
      subtitle: 'Five steps in the converter, and what breaks at each one.',
      parts: [
        flow([
          { t: 'Guess encoding', sub: 'legacy pages misread' },
          { t: 'Split at commas', sub: 'semicolons ignored', s: 's3' },
          { t: 'First row = header', sub: 'no header? data lost' },
          { t: 'Pad to widest row', sub: 'extra field adds column', s: 's3' },
          { t: 'Write the table', sub: 'one Markdown table', s: 's1' },
        ], { cols: 3, boxH: 88 }),
        note('Based on LLMiser\'s CSV converter code. Tab-separated .tsv files skipped this path in our test.'),
      ],
    }),
    'quoting-comparison': figure({
      title: 'Quoted versus unquoted',
      subtitle: 'The same row, with and without quotes around the note.',
      parts: [
        columns({
          left: {
            title: 'Quoted',
            s: 's1',
            lines: ['# SOURCE', 'Lee,"Paid, then refunded",10.50', '# CUSTOMER', '+ Lee', '# NOTE', '+ Paid, then refunded', '# AMOUNT', '+ 10.50', '# FOURTH COLUMN', 'none'],
          },
          right: {
            title: 'Unquoted',
            s: 's3',
            lines: ['# SOURCE', 'Lee,Paid, then refunded,10.50', '# CUSTOMER', 'Lee', '# NOTE', '! Paid', '# AMOUNT', '! then refunded', '# FOURTH COLUMN', '! 10.50 (no header)'],
          },
        }),
        note('Local run of LLMiser\'s CSV conversion on synthetic files, 8 Nov 2026.'),
      ],
    }),
    'encoding-results': figure({
      title: 'Same names, three encodings',
      subtitle: 'Only UTF-8 came through intact.',
      parts: [
        compare({
          headers: ['SAVED AS', 'IN THE FILE', 'IN THE TABLE'],
          widths: [150, 180, 222],
          rows: [
            { label: 'UTF-8', cells: [{ t: 'José Núñez' }, { t: 'José Núñez', ok: true }] },
            { label: 'UTF-8 + BOM', cells: [{ t: 'Zoë Müller' }, { t: 'Zoë Müller', ok: true }] },
            { label: 'Windows-1252', cells: [{ t: 'José Núñez' }, { t: 'Josķ N·±ez', ok: false }] },
            { label: 'Windows-1252', cells: [{ t: 'Zürich' }, { t: 'Z³rich', ok: false }] },
            { label: 'Already garbled', cells: [{ t: 'JosÃ©' }, { t: 'Jos + Korean text', ok: false }] },
          ],
        }),
        note('The encoding is guessed from the bytes. Save as UTF-8 and the guess has nothing to get wrong.'),
      ],
    }),
    'csv-checklist': figure({
      title: 'Before the full conversion',
      subtitle: 'Check a 20-row sample against the source file.',
      parts: [
        checklist([
          { t: 'Commas separate the fields' },
          { t: 'Cells with commas, quotes or line breaks are quoted' },
          { t: 'The file is saved as UTF-8' },
          { t: 'One clear header row names every column' },
          { t: 'Units and date formats are in the headers' },
          { t: 'Every row has as many fields as the header' },
          { t: 'A 20-row sample converted correctly' },
        ]),
        note('Tab-separated .tsv files came out as raw text, not a table, in our test.', { s: 's3' }),
      ],
    }),
  },
};
