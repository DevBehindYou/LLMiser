// Visual spec for M02-S2 "Verify Numbers and Identifiers in OCR Output".
// Data: fixtures/receipt-truth.json, out/*.txt, field-results.json, correction-log.csv.

import { B, C, F, art, banner, custom, figure, line, note, panels, rect, text } from '../../visuals/kit.mjs';
import { checklist, compare } from '../../visuals/campaign-parts.mjs';

const tick = (x, y) => `<path d="M${x} ${y}L${x + 9} ${y + 10}L${x + 26} ${y - 12}" fill="none" stroke="${B.amberD}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>`;
const cross = (x, y) => `<path d="M${x} ${y - 11}L${x + 22} ${y + 11}M${x + 22} ${y - 11}L${x} ${y + 11}" stroke="${B.pink}" stroke-width="4.5" stroke-linecap="round"/>`;
const under = (x, y, k, color, size = 24) => `<rect x="${x + k * size * 0.6 + 1}" y="${y + 6}" width="${size * 0.6 - 2}" height="4" rx="1" fill="${color}"/>`;

const bannerArt = () => {
  let out = '';
  out += art.label(652, 82, 'PRINTED', { size: 15, fill: '#8a8a92' });
  out += art.label(852, 82, 'OUTPUT', { size: 15, fill: '#8a8a92' });
  const rows = [
    ['RCT-000418', 'RCT-000418', true],
    ['O0-2207', '00-2207', false],
    ['17.04.2026', '17,04.2026', false],
    ['4,154.18', 'missing', false],
  ];
  rows.forEach(([a, b, ok], i) => {
    const y = 140 + i * 62;
    if (i) out += `<line x1="640" y1="${y - 38}" x2="1150" y2="${y - 38}" stroke="#d9d5c8" stroke-width="1.5"/>`;
    out += art.label(652, y, a, { size: 24 });
    out += art.arrow(808, y - 8, 838, y - 8, { sw: 2.5, head: 10 });
    out += art.label(852, y, b, { size: 24, fill: ok ? B.ink : B.pink });
    out += ok ? tick(1112, y - 6) : cross(1114, y - 8);
  });
  out += under(652, 202, 0, B.amberD);
  out += under(852, 264, 2, B.pink);
  return out;
};

// Annotated receipt: value spans are [line, start char, length, marker].
const RECEIPT = [
  'Receipt no: RCT-000418',
  'Account:    0045-1170',
  'Order:      PO 10O5-B',
  'Reference:  O0-2207',
  'Delivered:  17.04.2026',
  'Seal kit    1  0.75',
  'Credit      1 -12.40',
  'Total       4,154.18',
  'Paid in EUR 1.250,00',
];
const MARKS = [
  [0, 12, 10, 1], [1, 12, 9, 1], [2, 12, 9, 2], [3, 12, 7, 2], [4, 12, 10, 3],
  [5, 12, 1, 4], [6, 14, 6, 5], [7, 12, 8, 6], [8, 12, 8, 3],
];
const KINDS = [
  [1, 'Leading zeros', 's1'],
  [2, 'Letter O among digits', 's3'],
  [3, 'Separators, decimal marks', 's2'],
  [4, 'Small values in tables', 's1'],
  [5, 'Signs', 's3'],
  [6, 'Totals', 's2'],
];
const kindTone = (k) => C[KINDS[k - 1][2]];

const annotated = custom(306, (y) => {
  const size = 14;
  const cw = size * 0.6;
  const x0 = 24;
  const tx = x0 + 16;
  let s = rect(x0, y, 262, 306, { fill: C.surface2, stroke: C.border3, r: 10 });
  RECEIPT.forEach((ln, i) => {
    const ly = y + 34 + i * 31;
    s += text(tx, ly, ln, { size, font: F.mono });
  });
  for (const [li, start, len, k] of MARKS) {
    const ly = y + 34 + li * 31;
    s += rect(tx + start * cw - 3, ly - 15, len * cw + 6, 21, { fill: kindTone(k), fo: 0.14, stroke: kindTone(k), sw: 1.4, r: 4 });
    s += text(x0 + 262 - 12, ly, String(k), { size: 13, font: F.mono, weight: 700, fill: kindTone(k), anchor: 'end' });
  }
  // The letter O, underlined: "PO 10O5-B" index 17, "O0-2207" index 12.
  for (const [li, k] of [[2, 17], [3, 12]]) {
    const ly = y + 34 + li * 31;
    s += line(tx + k * cw + 0.5, ly + 4, tx + (k + 1) * cw - 0.5, ly + 4, { stroke: C.s3, sw: 2.4, cap: 'butt' });
  }
  KINDS.forEach(([k, label], i) => {
    const ly = y + 40 + i * 46;
    s += rect(306, ly - 17, 24, 24, { fill: kindTone(k), fo: 0.14, stroke: kindTone(k), sw: 1.4, r: 6 });
    s += text(318, ly, String(k), { size: 14, font: F.mono, weight: 700, anchor: 'middle', fill: kindTone(k) });
    s += text(342, ly, label, { size: 15 });
  });
  return s;
});

export default {
  banner: banner({
    id: 'num-banner',
    kicker: 'OCR NUMBERS',
    hook: ['Check the digits,', 'one by one.'],
    sub: 'one receipt, four copies',
    art: bannerArt,
  }),
  figures: {
    'high-impact-fields': figure({
      title: 'Mark the fields that matter',
      subtitle: 'The synthetic receipt used in this test.',
      parts: [
        annotated,
        note('The letter O is underlined. Mark fields on the original before reading the output.'),
      ],
    }),
    'receipt-results': figure({
      title: 'Ten fields, four copies',
      subtitle: 'Recognized text compared with the printed value.',
      parts: [
        compare({
          headers: ['', 'PRINTED', '200 DPI', 'JPEG', 'FAX', 'PHOTO'],
          widths: [0, 124, 107, 107, 107, 107],
          size: 12,
          rows: [
            { label: '', cells: [{ t: 'RCT-000418' }, { t: 'exact', ok: true }, { t: 'exact', ok: true }, { t: 'exact', ok: true }, { t: 'exact', ok: true }] },
            { label: '', cells: [{ t: '0045-1170' }, { t: 'exact', ok: true }, { t: 'exact', ok: true }, { t: 'exact', ok: true }, { t: 'exact', ok: true }] },
            { label: '', cells: [{ t: 'PO 10O5-B', u: [5] }, { t: '1005-B', ok: false }, { t: '1005-B', ok: false }, { t: '1005-B', ok: false }, { t: '1005-B', ok: false }] },
            { label: '', cells: [{ t: 'O0-2207', u: [0] }, { t: '00-2207', ok: false }, { t: '00-2207', ok: false }, { t: '00-2207', ok: false }, { t: '00-2207', ok: false }] },
            { label: '', cells: [{ t: '17.04.2026' }, { t: 'exact', ok: true }, { t: 'exact', ok: true }, { t: '17,04.2026', ok: false }, { t: 'exact', ok: true }] },
            { label: '', cells: [{ t: 'Seal kit 1' }, { t: 'exact', ok: true }, { t: 'missing', ok: false }, { t: 'missing', ok: false }, { t: 'i', ok: false }] },
            { label: '', cells: [{ t: 'Credit 1' }, { t: 'exact', ok: true }, { t: 'exact', ok: true }, { t: 'exact', ok: true }, { t: 'zt', ok: false }] },
            { label: '', cells: [{ t: '-12.40' }, { t: 'exact', ok: true }, { t: 'exact', ok: true }, { t: 'exact', ok: true }, { t: 'exact', ok: true }] },
            { label: '', cells: [{ t: '1.250,00' }, { t: 'exact', ok: true }, { t: 'exact', ok: true }, { t: 'exact', ok: true }, { t: 'missing', ok: false }] },
            { label: '', cells: [{ t: '4,154.18' }, { t: 'exact', ok: true }, { t: 'exact', ok: true }, { t: 'exact', ok: true }, { t: 'missing', ok: false }] },
          ],
        }),
        note('No copy came with a warning. The letter O is underlined.'),
      ],
    }),
    'digits-only-trap': figure({
      title: 'Compare the whole value',
      subtitle: 'Stripping separators hid a real change.',
      parts: [
        panels([
          {
            title: 'Digits only',
            tag: 'PASSED',
            s: 's3',
            lines: [
              { t: 'printed  17.04.2026' },
              { t: 'output   17,04.2026' },
              { t: 'compare  17042026 = 17042026', k: 'dim' },
            ],
          },
          {
            title: 'Exact characters',
            tag: 'CAUGHT',
            s: 's1',
            lines: [
              { t: 'printed  17.04.2026' },
              { t: 'output   17,04.2026' },
              { t: "differs  3rd character, '.' to ','", k: 'head' },
            ],
          },
        ]),
      ],
    }),
    'correction-log': figure({
      title: 'Log every correction',
      subtitle: 'Four fixes from the phone-photo-style copy.',
      parts: [
        compare({
          headers: ['FIELD', 'IN OUTPUT', 'CORRECTED TO'],
          widths: [160, 186, 206],
          size: 13,
          rows: [
            { label: 'Order', cells: [{ t: 'PO 1005-B', ok: false }, { t: 'PO 10O5-B', ok: true, u: [5] }] },
            { label: 'Reference', cells: [{ t: '00-2207', ok: false }, { t: 'O0-2207', ok: true, u: [0] }] },
            { label: 'Seal kit qty', cells: [{ t: 'i', ok: false }, { t: '1', ok: true }] },
            { label: 'Total', cells: [{ t: 'missing', ok: false }, { t: '4,154.18', ok: true }] },
          ],
        }),
        note('Also record what you checked each value against and who checked it.'),
      ],
    }),
    'number-checklist': figure({
      title: 'Number and ID pass',
      subtitle: 'After recognition, before you share the text.',
      parts: [
        checklist([
          { t: 'High-impact fields marked on the original' },
          { t: 'Each value found next to its label' },
          { t: 'Values per table row counted' },
          { t: 'Last lines of the page found' },
          { t: 'Every character and separator compared' },
          { t: 'Corrections logged with their source' },
        ]),
        note('One synthetic receipt. Results vary by page, font and scan.', { s: 's3' }),
      ],
    }),
  },
};
