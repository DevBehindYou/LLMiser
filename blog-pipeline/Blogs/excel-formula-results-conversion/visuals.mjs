// Visual spec for M03-S2 "Check Excel Formula Results Before Conversion".
// Data: fixtures/order-files.json, out-*/order-*.Standard.md.

import { B, art, banner, figure, flow, note } from '../../visuals/kit.mjs';
import { checklist, compare } from '../../visuals/campaign-parts.mjs';

const tick = (x, y) => `<path d="M${x} ${y}L${x + 9} ${y + 10}L${x + 26} ${y - 12}" fill="none" stroke="${B.amberD}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>`;
const cross = (x, y) => `<path d="M${x} ${y - 11}L${x + 22} ${y + 11}M${x + 22} ${y - 11}L${x} ${y + 11}" stroke="${B.pink}" stroke-width="4.5" stroke-linecap="round"/>`;

const bannerArt = () => {
  let out = '';
  out += art.box(646, 56, 504, 150, { fill: '#ffffff', r: 12 });
  out += `<line x1="646" y1="104" x2="1150" y2="104" stroke="${B.ink}" stroke-width="2"/>`;
  out += art.label(672, 88, 'QTY', { size: 15, fill: '#8a8a92' });
  out += art.label(780, 88, 'UNIT PRICE', { size: 15, fill: '#8a8a92' });
  out += art.label(948, 88, 'AMOUNT', { size: 15, fill: '#8a8a92' });
  out += art.label(672, 166, '20', { size: 32 });
  out += art.label(780, 166, '10.50', { size: 32 });
  out += art.label(948, 166, '126.00', { size: 32, fill: B.pink });
  out += cross(1104, 154);
  out += art.label(672, 268, '20 x 10.50 = 210.00', { size: 30, fill: B.amberD });
  out += tick(1100, 258);
  out += art.label(672, 318, 'the saved result is stale', { size: 18, fill: '#8a8a92' });
  return out;
};

export default {
  banner: banner({
    id: 'formula-banner',
    kicker: 'EXCEL FORMULAS',
    hook: ['Saved is', 'not current.'],
    sub: 'one sheet, five states',
    art: bannerArt,
  }),
  figures: {
    'formula-cells': figure({
      title: 'Which cells are formulas?',
      subtitle: 'The test order sheet, formulas and saved results.',
      parts: [
        compare({
          headers: ['CELL', 'CONTENT', 'SAVED RESULT'],
          widths: [140, 262, 150],
          size: 12.5,
          rows: [
            { label: 'Gasket qty', cells: [{ t: '12 (typed)' }, { t: '12' }] },
            { label: 'Amount', cells: [{ t: '=B2*C2' }, { t: '126.00' }] },
            { label: 'Total', cells: [{ t: '=SUM(D2:D4)' }, { t: '3876.75' }] },
            { label: 'Tax', cells: [{ t: '=ROUND(D5*B6,2)' }, { t: '290.76' }] },
            { label: 'Grand total', cells: [{ t: '=D5+D6' }, { t: '4167.51' }] },
            { label: 'Price check', cells: [{ t: '=VLOOKUP("Gasket XL",...)' }, { t: '#N/A', ok: false }] },
            { label: 'Per unit', cells: [{ t: '=D2/B10 (B10 empty)' }, { t: '#DIV/0!', ok: false }] },
            { label: 'Days since', cells: [{ t: '=TODAY()-DATE(2026,10,1)' }, { t: '39 on save day' }] },
          ],
        }),
        note('Nine formula cells in all. The output keeps only their saved results.'),
      ],
    }),
    'workbook-states': figure({
      title: 'One sheet, five states',
      subtitle: 'Converted values for the Gasket row and the grand total.',
      parts: [
        compare({
          headers: ['STATE', 'QTY', 'AMOUNT', 'GRAND TOTAL'],
          widths: [200, 70, 132, 150],
          size: 13,
          rows: [
            { label: 'Saved by an app', cells: [{ t: '12' }, { t: '126.00', ok: true }, { t: '4167.51', ok: true }] },
            { label: 'Input changed', cells: [{ t: '20' }, { t: '126.00', ok: false }, { t: '4167.51', ok: false }] },
            { label: 'Re-saved, defaults', cells: [{ t: '20' }, { t: '126.00', ok: false }, { t: '4167.51', ok: false }] },
            { label: 'Recalculated on load', cells: [{ t: '20' }, { t: '210.00', ok: true }, { t: '4257.81', ok: true }] },
            { label: 'Written by a script', cells: [{ t: '12' }, { t: 'NaN', ok: false }, { t: 'NaN', ok: false }] },
          ],
        }),
        note('App saves made with LibreOffice Calc, local run, 9 November 2026.'),
      ],
    }),
    'review-copy-steps': figure({
      title: 'Make a reviewed copy',
      subtitle: 'Give the conversion a known calculation state.',
      parts: [
        flow([
          { t: 'Show formulas', sub: 'Ctrl+` in Excel' },
          { t: 'Full recalculation', sub: 'Ctrl+Alt+F9 in Excel', s: 's1' },
          { t: 'Check by hand', sub: 'two or three results' },
          { t: 'Save a dated copy', sub: 'note app and date' },
          { t: 'Convert the copy', sub: 'then inspect output', s: 's1' },
        ], { cols: 3, boxH: 88 }),
      ],
    }),
    'nan-meanings': figure({
      title: 'Four cells, one NaN',
      subtitle: 'Different cells that converted to the same text.',
      parts: [
        compare({
          headers: ['IN THE SHEET', 'CELL', 'OUTPUT'],
          widths: [190, 222, 140],
          size: 13,
          rows: [
            { label: 'Empty cell', cells: [{ t: '(blank row)' }, { t: 'NaN', ok: null }] },
            { label: 'Lookup error', cells: [{ t: '#N/A' }, { t: 'NaN', ok: false }] },
            { label: 'Division error', cells: [{ t: '#DIV/0!' }, { t: 'NaN', ok: false }] },
            { label: 'No saved result', cells: [{ t: '=B2*C2 (script)' }, { t: 'NaN', ok: false }] },
          ],
        }),
        note('Look up every NaN in the sheet before you share the output.'),
      ],
    }),
    'formula-checklist': figure({
      title: 'Formula results pass',
      subtitle: 'Before an AI model reads the numbers.',
      parts: [
        checklist([
          { t: 'Formula cells identified' },
          { t: 'Date-based formulas noted with their save date' },
          { t: 'Full recalculation run before saving' },
          { t: 'Dated, reviewed copy converted' },
          { t: 'Two or three results recomputed from the output' },
          { t: 'Every NaN looked up in the sheet' },
        ]),
        note('The converter reads saved results. It does not recalculate.', { s: 's3' }),
      ],
    }),
  },
};
