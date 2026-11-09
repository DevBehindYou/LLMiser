// Visual spec for M06-S1 "Handle Commas and Quotes Inside CSV Cells".
// Data: fixtures/quote-files.json, row-widths.txt, out-*/ *.Standard.md.

import { B, art, banner, figure, note, panels } from '../../visuals/kit.mjs';
import { checklist, compare } from '../../visuals/campaign-parts.mjs';

const bannerArt = () => {
  let out = '';
  out += art.label(656, 84, 'SOURCE LINE', { size: 14, fill: '#8a8a92' });
  out += art.box(648, 98, 504, 62, { fill: '#ffffff', r: 10 });
  const src = 'Lee, "Paid, then refunded", 10.50';
  out += art.label(666, 138, src, { size: 18 });
  // Highlight the space before the opening quote (index 4) and before 10.50 (index 27).
  for (const k of [4, 27]) out += `<rect x="${666 + k * 10.8 - 1}" y="118" width="12.8" height="28" rx="3" fill="${B.amber}" fill-opacity="0.45"/>`;
  out += art.arrow(900, 170, 900, 204, { sw: 2.5, head: 10 });
  out += art.label(656, 232, 'CONVERTED ROW', { size: 14, fill: '#8a8a92' });
  out += art.box(648, 246, 504, 92, { fill: '#ffffff', r: 10 });
  out += art.label(666, 282, '| Lee |  "Paid |  then refunded"', { size: 17, fill: B.pink });
  out += art.label(666, 314, '|  10.50 |', { size: 17, fill: B.pink });
  out += art.label(800, 314, 'extra column', { size: 14, fill: '#8a8a92' });
  return out;
};

export default {
  banner: banner({
    id: 'quote-banner',
    kicker: 'CSV QUOTING',
    hook: ['One space broke', 'every cell.'],
    sub: 'one table, five quoting styles',
    art: bannerArt,
  }),
  figures: {
    'quoting-styles': figure({
      title: 'Five ways to write one row',
      subtitle: 'A sample line from each test file.',
      parts: [
        compare({
          headers: ['STYLE', 'SAMPLE LINE'],
          widths: [168, 384],
          size: 12,
          rows: [
            { label: 'Standard (RFC 4180)', cells: [{ t: 'Lee,"Paid, then refunded",10.50' }] },
            { label: 'Space before quote', cells: [{ t: 'Lee, "Paid, then refunded", 10.50', u: [4, 27] }] },
            { label: 'Backslash escape', cells: [{ t: 'Morgan,"Said \\"urgent\\", twice",1250.00', u: [13, 21] }] },
            { label: 'Unclosed quote', cells: [{ t: 'Lee,"Paid, then refunded,10.50' }] },
            { label: 'No quoting', cells: [{ t: 'Lee,Paid, then refunded,10.50' }] },
          ],
        }),
        note('Underlines mark the characters that break the quoting.'),
      ],
    }),
    'quote-results': figure({
      title: 'Rows and columns after conversion',
      subtitle: 'Expected: 4 data rows, 3 columns.',
      parts: [
        compare({
          headers: ['FILE', 'EXPECTED', 'ROWS', 'COLUMNS', 'PROBLEM'],
          widths: [140, 92, 80, 100, 140],
          size: 12,
          rows: [
            { label: 'Standard', cells: [{ t: '4 x 3' }, { t: '4', ok: true }, { t: '3', ok: true }, { t: 'none', ok: true }] },
            { label: 'Space before', cells: [{ t: '4 x 3' }, { t: '5', ok: false }, { t: '4', ok: false }, { t: 'quotes shown', ok: false }] },
            { label: 'Backslash', cells: [{ t: '4 x 3' }, { t: '4', ok: true }, { t: '4', ok: false }, { t: 'note split', ok: false }] },
            { label: 'Unclosed', cells: [{ t: '4 x 3' }, { t: '3', ok: false }, { t: '4', ok: false }, { t: 'rows merged', ok: false }] },
            { label: 'No quoting', cells: [{ t: '4 x 3' }, { t: '5', ok: false }, { t: '4', ok: false }, { t: 'notes split', ok: false }] },
          ],
        }),
        note('Local run of LLMiser\'s CSV conversion, 9 November 2026.'),
      ],
    }),
    'broken-tables': figure({
      title: 'What the broken files became',
      subtitle: 'Converted text, long lines wrapped.',
      parts: [
        panels([
          {
            title: 'Space before quote',
            tag: '5 ROWS, 4 COLUMNS',
            s: 's3',
            lines: [
              { t: '| Customer |  Note |  Amount |  |', k: 'dim' },
              { t: '| Lee |  "Paid |  then refunded" |  10.50 |' },
              { t: '| Kim |  "Line one |  |  |' },
              { t: '| Line two" |  0.75 |  |  |' },
            ],
          },
          {
            title: 'Unclosed quote',
            tag: '3 ROWS',
            s: 's3',
            lines: [
              { t: '| Customer | Note | Amount |  |', k: 'dim' },
              { t: '| Lee | Paid, then refunded,10.50 Morgan,' },
              { t: '    Said ""urgent"" |  twice" | 1250.00 |' },
              { t: '| Kim | Line one Line two | 0.75 |  |' },
            ],
          },
        ]),
        note('Both headers end in an empty column. Morgan has no row in the second.'),
      ],
    }),
    'quoting-checklist': figure({
      title: 'Quoting pass',
      subtitle: 'Before you convert a CSV file.',
      parts: [
        checklist([
          { t: 'File read in a plain text editor' },
          { t: 'Quote is the first character of each quoted field' },
          { t: 'Quotes inside a cell are doubled' },
          { t: 'Every opening quote is closed' },
          { t: 'Converted header has no empty last column' },
          { t: 'Data row count matches the source' },
          { t: 'Line breaks in cells replaced where they matter' },
        ]),
        note('Comma-separated files only. One synthetic table.', { s: 's3' }),
      ],
    }),
  },
};
