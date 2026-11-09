// Visual spec for M03-S3 "Prepare Merged Excel Headers for Markdown Tables".
// Data: fixtures/sales-files.json, out-*/sales-*.Standard.md, meaning-results.json.

import { B, C, F, art, banner, custom, figure, legend, note, rect, text } from '../../visuals/kit.mjs';
import { checklist, compare } from '../../visuals/campaign-parts.mjs';

const bannerArt = () => {
  let out = '';
  out += art.box(650, 52, 490, 46, { fill: '#ece9f8', r: 8 });
  out += art.label(895, 83, 'Q1 2026', { size: 22, anchor: 'middle', font: 'Inter, sans-serif' });
  ['Units', 'Revenue (USD)', 'Weight (kg)'].forEach((t, i) => {
    out += art.box(650 + i * 163.3, 98, 163.3, 46, { fill: '#ffffff', r: 0, sw: 2 });
    out += art.label(650 + i * 163.3 + 81.6, 128, t, { size: 18, anchor: 'middle', font: 'Inter, sans-serif', weight: 600 });
  });
  out += art.arrow(895, 158, 895, 200, { sw: 3, head: 12 });
  out += art.box(650, 212, 490, 132, { fill: '#ffffff', r: 12 });
  out += art.label(668, 252, '| Q1 2026 |', { size: 20 });
  out += art.label(820, 252, 'Unnamed: 3', { size: 20, fill: B.pink });
  out += art.label(966, 252, 'Unnamed: 4', { size: 20, fill: B.pink });
  out += art.label(668, 296, '| Units | Revenue (USD) | ...', { size: 17, fill: B.amberD });
  out += art.label(668, 326, 'units pushed into a data row', { size: 15, fill: '#8a8a92' });
  return out;
};

// Original sheet grid (fixture illustration).
const sheet = custom(212, (y) => {
  const xs = [24, 98, 190, 254, 318, 382, 446, 510, 576];
  const rows = [y, y + 34, y + 78, y + 108, y + 138, y + 168, y + 198];
  let s = '';
  const cell = (c0, c1, r0, r1, label, { tone, size = 12.5, font = F.sans, weight, lines } = {}) => {
    const x = xs[c0];
    const w = xs[c1] - x;
    const yy = rows[r0];
    const h = rows[r1] - yy;
    s += rect(x, yy, w, h, { fill: tone || C.surface2, fo: tone ? 0.16 : undefined, stroke: tone || C.border3, sw: tone ? 1.6 : 1, r: 0 });
    const ls = lines || [label];
    ls.forEach((t, i) => {
      s += text(x + w / 2, yy + h / 2 + 4.5 - (ls.length - 1) * 7.5 + i * 15, t, { size, font, weight, anchor: 'middle' });
    });
  };
  cell(0, 1, 0, 2, 'Region', { tone: C.s3, weight: 700 });
  cell(1, 2, 0, 2, 'Channel', { tone: C.s3, weight: 700 });
  cell(2, 5, 0, 1, 'Q1 2026', { tone: C.s2, weight: 700 });
  cell(5, 8, 0, 1, 'Q2 2026', { tone: C.s2, weight: 700 });
  const subs = [['Units'], ['Revenue', '(USD)'], ['Weight', '(kg)']];
  for (let i = 0; i < 6; i += 1) cell(2 + i, 3 + i, 1, 2, '', { tone: C.s1, lines: subs[i % 3], size: 11.5 });
  const data = [
    ['Retail', '120', '1260', '54', '135', '1417.5', '60.8'],
    ['Wholesale', '400', '3800', '180', '380', '3610', '171'],
    ['Retail', '90', '945', '40.5', '110', '1155', '49.5'],
    ['Wholesale', '250', '2375', '112.5', '300', '2850', '135'],
  ];
  cell(0, 1, 2, 4, 'North', { tone: C.s3 });
  cell(0, 1, 4, 6, 'South', { tone: C.s3 });
  data.forEach((r, i) => r.forEach((v, j) => cell(1 + j, 2 + j, 2 + i, 3 + i, v, { font: j ? F.mono : F.sans, size: j ? 11.5 : 12 })));
  return s;
});

// Converted output, first five columns (exact strings).
const output = custom(176, (y) => {
  const xs = [24, 104, 194, 300, 438, 576];
  const head = ['Region', 'Channel', 'Q1 2026', 'Unnamed: 3', 'Unnamed: 4'];
  const body = [
    ['NaN', 'NaN', 'Units', 'Revenue (USD)', 'Weight (kg)'],
    ['North', 'Retail', '120', '1260', '54'],
    ['NaN', 'Wholesale', '400', '3800', '180'],
  ];
  let s = rect(24, y, 552, 170, { fill: C.surface2, stroke: C.border3, r: 10 });
  head.forEach((h, j) => {
    s += text(xs[j] + 10, y + 26, h, { size: 12.5, font: F.mono, weight: 700, fill: h.startsWith('Unnamed') ? C.s3 : C.ink });
  });
  s += `<line x1="24" y1="${y + 38}" x2="576" y2="${y + 38}" style="stroke:${C.border3};stroke-width:1.5"/>`;
  body.forEach((r, i) => {
    const yy = y + 70 + i * 40;
    if (i === 0) s += rect(28, yy - 22, 544, 32, { fill: C.s1, fo: 0.12, stroke: C.s1, sw: 1.2, r: 6 });
    r.forEach((v, j) => {
      s += text(xs[j] + 10, yy, v, { size: 12.5, font: F.mono, fill: v === 'NaN' ? C.s3 : C.ink, weight: v === 'NaN' ? 700 : undefined });
    });
  });
  return s;
});

export default {
  banner: banner({
    id: 'hdr-banner',
    kicker: 'EXCEL HEADERS',
    hook: ['One header row.', 'Two levels.'],
    sub: 'one sheet, three tables',
    art: bannerArt,
  }),
  figures: {
    'grouped-labels': figure({
      title: 'Find the grouped labels',
      subtitle: 'The original synthetic sales sheet.',
      parts: [
        sheet,
        legend([
          { name: 'merged across columns', s: 's2' },
          { name: 'second header row, units', s: 's1' },
          { name: 'merged down', s: 's3' },
        ]),
      ],
    }),
    'grouped-output': figure({
      title: 'What the table became',
      subtitle: 'First five columns of the converted original.',
      parts: [
        output,
        note('Unnamed: 6 and 7 follow under Q2 2026. Units landed in a data row.'),
      ],
    }),
    'header-map': figure({
      title: 'Two rows into one label',
      subtitle: 'How the flat sharing copy was labeled.',
      parts: [
        compare({
          headers: ['GROUP', 'SECOND ROW', 'ONE-ROW LABEL'],
          widths: [110, 178, 264],
          size: 12.5,
          rows: [
            { label: 'Q1 2026', cells: [{ t: 'Units' }, { t: 'Q1 2026 Units', ok: true }] },
            { label: 'Q1 2026', cells: [{ t: 'Revenue (USD)' }, { t: 'Q1 2026 Revenue (USD)', ok: true }] },
            { label: 'Q1 2026', cells: [{ t: 'Weight (kg)' }, { t: 'Q1 2026 Weight (kg)', ok: true }] },
            { label: 'Q2 2026', cells: [{ t: 'Units' }, { t: 'Q2 2026 Units', ok: true }] },
            { label: 'Q2 2026', cells: [{ t: 'Revenue (USD)' }, { t: 'Q2 2026 Revenue (USD)', ok: true }] },
            { label: 'Q2 2026', cells: [{ t: 'Weight (kg)' }, { t: 'Q2 2026 Weight (kg)', ok: true }] },
            { label: 'North', cells: [{ t: 'merged, 2 rows' }, { t: 'North in both rows', ok: true }] },
          ],
        }),
      ],
    }),
    'meaning-results': figure({
      title: 'Can each value be named?',
      subtitle: 'Region, channel, quarter and measure from its own row and header.',
      parts: [
        compare({
          headers: ['TABLE', 'VALUES', 'FULLY LABELED'],
          widths: [190, 120, 242],
          size: 13,
          rows: [
            { label: 'Original sheet', cells: [{ t: '24' }, { t: '0 of 24', ok: false }] },
            { label: 'Flat copy', cells: [{ t: '24' }, { t: '24 of 24', ok: true }] },
            { label: 'Long copy', cells: [{ t: '24' }, { t: '24 of 24', ok: true }] },
          ],
        }),
        compare({
          headers: ['ORIGINAL: MISSING', 'VALUES', 'WHY'],
          widths: [190, 120, 242],
          size: 13,
          rows: [
            { label: 'Measure and unit', cells: [{ t: '24' }, { t: 'in a data row' }] },
            { label: 'Quarter', cells: [{ t: '16' }, { t: '"Unnamed" headers' }] },
            { label: 'Region', cells: [{ t: '12' }, { t: 'NaN rows' }] },
            { label: 'Channel', cells: [{ t: '0' }, { t: 'not merged in data' }] },
          ],
        }),
      ],
    }),
    'headers-checklist': figure({
      title: 'Header pass',
      subtitle: 'Before a model reads a grouped table.',
      parts: [
        checklist([
          { t: 'Merged headers and units rows found' },
          { t: 'Sharing copy made with one header row' },
          { t: 'Group, measure and unit in every label' },
          { t: 'Merged row labels filled down' },
          { t: 'Values and totals matched with the original' },
          { t: 'Four or five values named from row and column alone' },
        ]),
        note('Flattening is manual. Conversion does not repair merged cells.', { s: 's3' }),
      ],
    }),
  },
};
