// Visual spec for M03-S1 "Keep Leading Zeros When Preparing Excel Data for AI".
// Data: fixtures/ids-truth.json, out-ids-xlsx/ids.Standard.md, out-ids-export-csv/ids-export.Standard.md.

import { B, art, banner, decision, figure, note, panels } from '../../visuals/kit.mjs';
import { checklist, compare } from '../../visuals/campaign-parts.mjs';

const tick = (x, y) => `<path d="M${x} ${y}L${x + 9} ${y + 10}L${x + 26} ${y - 12}" fill="none" stroke="${B.amberD}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>`;
const cross = (x, y) => `<path d="M${x} ${y - 11}L${x + 22} ${y + 11}M${x + 22} ${y - 11}L${x} ${y + 11}" stroke="${B.pink}" stroke-width="4.5" stroke-linecap="round"/>`;

const bannerArt = () => {
  let out = '';
  // Sheet column.
  out += art.box(646, 58, 196, 284, { fill: '#ffffff', r: 10 });
  out += `<rect x="646" y="58" width="196" height="46" rx="10" fill="#ece9f8" stroke="${B.ink}" stroke-width="2.5"/>`;
  out += art.label(744, 89, 'Account', { size: 20, anchor: 'middle', font: 'Inter, sans-serif' });
  ['00123', '00456', '01789'].forEach((v, i) => {
    out += art.label(668, 158 + i * 64, v, { size: 30 });
    out += `<rect x="668" y="${166 + i * 64}" width="${v.match(/^0+/)[0].length * 18 - 2}" height="4" rx="1" fill="${B.amber}"/>`;
  });
  // Two routes.
  out += art.arrow(856, 150, 924, 112, { sw: 3, head: 12 });
  out += art.arrow(856, 250, 924, 288, { sw: 3, head: 12 });
  out += art.box(934, 54, 216, 118, { fill: '#fdf1f6', stroke: B.pink, r: 12 });
  out += art.label(952, 86, 'WORKBOOK', { size: 14, fill: '#8a8a92' });
  out += art.label(952, 130, '123 456 1789', { size: 22, fill: B.pink });
  out += cross(1112, 82);
  out += art.box(934, 228, 216, 118, { fill: '#fff6e6', stroke: B.amberD, r: 12 });
  out += art.label(952, 260, 'CSV', { size: 14, fill: '#8a8a92' });
  out += art.label(952, 302, '00123 00456', { size: 22 });
  out += art.label(952, 332, '01789', { size: 22 });
  out += tick(1106, 258);
  return out;
};

export default {
  banner: banner({
    id: 'zeros-banner',
    kicker: 'EXCEL IDS',
    hook: ['00123 is', 'not 123.'],
    sub: 'one sheet, two routes',
    art: bannerArt,
  }),
  figures: {
    'id-columns': figure({
      title: 'Identifiers or quantities?',
      subtitle: 'The ten columns of the test workbook.',
      parts: [
        compare({
          headers: ['COLUMN', 'STORED AS', 'KIND'],
          widths: [170, 236, 146],
          size: 13,
          rows: [
            { label: 'Account', cells: [{ t: 'text "00123"' }, { t: 'identifier' }] },
            { label: 'Account, blank', cells: [{ t: 'text, one cell empty' }, { t: 'identifier' }] },
            { label: 'SKU', cells: [{ t: 'text, digits and letters' }, { t: 'identifier' }] },
            { label: 'Formatted', cells: [{ t: '123, format 00000' }, { t: 'identifier' }] },
            { label: 'Text formula', cells: [{ t: '=TEXT(D2,"00000")' }, { t: 'identifier' }] },
            { label: 'Member, 16', cells: [{ t: 'text, 16 digits' }, { t: 'identifier' }] },
            { label: 'Ref, 20', cells: [{ t: 'text, 20 digits' }, { t: 'identifier' }] },
            { label: 'Phone', cells: [{ t: 'text with spaces' }, { t: 'identifier' }] },
            { label: 'Qty', cells: [{ t: 'number' }, { t: 'quantity' }] },
            { label: 'Unit price', cells: [{ t: 'number, $ format' }, { t: 'quantity' }] },
          ],
        }),
        note('Would you ever add, average or round it? If not, it is an identifier.'),
      ],
    }),
    'stored-vs-shown': figure({
      title: 'What does the cell store?',
      subtitle: 'Read the formula bar, not the grid.',
      parts: [
        decision({
          start: { t: 'A cell shows 00123' },
          question: 'Formula bar: 00123?',
          yes: { t: 'Stored as text', sub: 'real zeros, may still drop', s: 's1' },
          no: { t: 'Format or formula', sub: 'stored value is 123', s: 's3' },
        }),
        note('Either way, compare the converted column with the sheet.'),
      ],
    }),
    'xlsx-results': figure({
      title: 'Workbook route, column by column',
      subtitle: 'Converted output compared with the sheet.',
      parts: [
        compare({
          headers: ['COLUMN', 'IN THE SHEET', 'CONVERTED'],
          widths: [140, 196, 216],
          size: 12.5,
          rows: [
            { label: 'Account', cells: [{ t: '00123' }, { t: '123', ok: false }] },
            { label: 'Account, blank', cells: [{ t: '00123, (blank)' }, { t: '123.0, NaN', ok: false }] },
            { label: 'SKU', cells: [{ t: '00123' }, { t: '00123', ok: true }] },
            { label: 'Formatted', cells: [{ t: '00123 (shown)' }, { t: '123', ok: false }] },
            { label: 'Text formula', cells: [{ t: '00123' }, { t: '123', ok: false }] },
            { label: 'Member, 16', cells: [{ t: '0099123400005679' }, { t: '99123400005679', ok: false }] },
            { label: 'Ref, 20', cells: [{ t: '00991234000056790002' }, { t: '991234000056790002', ok: false }] },
            { label: 'Phone', cells: [{ t: '0412 555 018' }, { t: '0412 555 018', ok: true }] },
            { label: 'Qty', cells: [{ t: '12' }, { t: '12', ok: true }] },
            { label: 'Unit price', cells: [{ t: '$1,250.00' }, { t: '1250.00', ok: null }] },
          ],
        }),
        note('Every digit-only ID column lost its zeros, however it was stored.'),
      ],
    }),
    'csv-route': figure({
      title: 'Same sheet, two routes',
      subtitle: 'Workbook converted directly, or saved as CSV first.',
      parts: [
        panels([
          {
            title: 'Workbook converted',
            tag: 'ZEROS LOST',
            s: 's3',
            lines: [
              { t: 'Account    123    456    1789   10001' },
              { t: 'Formatted  123    456    1789   10001' },
              { t: 'Blank      123.0  NaN    1789.0' },
            ],
          },
          {
            title: 'Saved as CSV, then converted',
            tag: 'ZEROS KEPT',
            s: 's1',
            lines: [
              { t: 'Account    00123  00456  01789  10001' },
              { t: 'Formatted  00123  00456  01789  10001' },
              { t: 'Blank      00123  (empty) 01789' },
            ],
          },
        ]),
        note('CSV exported with LibreOffice Calc. Check your own app\'s CSV in a text editor.'),
      ],
    }),
    'zeros-checklist': figure({
      title: 'Leading-zero pass',
      subtitle: 'Before a model reads the data.',
      parts: [
        checklist([
          { t: 'Each column marked as identifier or quantity' },
          { t: 'Formula bar checked in every ID column' },
          { t: 'IDs over 15 digits stored as text' },
          { t: 'ID-heavy sheets saved as CSV, one per sheet' },
          { t: 'Zero-led, longest and blank values compared' },
        ]),
        note('One synthetic workbook and one CSV export app.', { s: 's3' }),
      ],
    }),
  },
};
