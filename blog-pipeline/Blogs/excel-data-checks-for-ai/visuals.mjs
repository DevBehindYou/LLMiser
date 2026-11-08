// Visual spec for M03 "7 Excel Details to Check Before Sharing Data With AI".
// Render privately: node blog-pipeline/scripts/campaign/render-private.mjs excel-data-checks-for-ai
// Values come from fixtures/out/field-orders.Standard.md and fixtures/probe-text-ids/.

import { B, art, banner, decision, figure, note } from '../../visuals/kit.mjs';
import { checklist, compare, markLegend, tree } from '../../visuals/campaign-parts.mjs';

const bannerArt = () => {
  let out = '';
  const x0 = 646;
  const y0 = 70;
  const cw = [70, 110, 90];
  const labels = [['', 'A', 'B'], ['1', 'Account', 'Zip'], ['2', '00123', '02134'], ['3', '00456', '07030']];
  labels.forEach((row, r) => {
    let x = x0;
    row.forEach((cell, c) => {
      const head = r === 0 || c === 0;
      out += `<rect x="${x}" y="${y0 + r * 52}" width="${cw[c]}" height="52" fill="${head ? '#e9e6dd' : '#ffffff'}" stroke="${B.ink}" stroke-width="1.5"/>`;
      if (cell) out += art.label(x + cw[c] / 2, y0 + r * 52 + 34, cell, { size: head ? 18 : 22, anchor: 'middle', weight: head ? 600 : 700 });
      x += cw[c];
    });
  });
  out += `<rect x="716" y="174" width="110" height="52" fill="none" stroke="${B.amber}" stroke-width="5"/>`;
  out += art.arrow(930, 200, 990, 200, { stroke: B.ink });
  out += art.box(996, 150, 156, 100, { fill: B.paper, r: 10 });
  out += art.label(1074, 188, '| 123 |', { size: 26, anchor: 'middle' });
  out += art.label(1074, 228, '| 2134 |', { size: 26, anchor: 'middle' });
  out += `<path d="M1006 272L1022 288M1022 272L1006 288" stroke="${B.pink}" stroke-width="4" stroke-linecap="round"/>`;
  out += art.label(1032, 287, 'zeros lost', { size: 17, fill: B.ink, weight: 600 });
  out += art.label(646, 320, 'stored as text', { size: 16, fill: B.ink, weight: 500 });
  return out;
};

export default {
  banner: banner({
    id: 'xlsc-banner',
    kicker: 'EXCEL PREP',
    hook: ['Shows 00123.', 'Reads 123.'],
    sub: '7 workbook details to check',
    art: bannerArt,
  }),
  figures: {
    'workbook-to-markdown': figure({
      title: 'What the conversion did',
      subtitle: 'Each sheet becomes a ## heading and a pipe table, in workbook order.',
      parts: [
        tree([
          { t: 'field-orders.xlsx', mark: 'info', note: ' ' },
          { t: 'Read me', d: 1, mark: 'keep', note: 'TITLE BECAME HEADER' },
          { t: 'Orders', d: 1, mark: 'keep', note: 'PIPE TABLE' },
          { t: 'merged Region cell', d: 2, mark: 'sent', note: 'NaN IN ROW 2' },
          { t: 'blank spacer row', d: 2, mark: 'sent', note: 'ROW OF NaN' },
          { t: 'bar chart', d: 2, mark: 'skip', note: 'NOT IN OUTPUT' },
          { t: 'Q3 old (hidden)', d: 1, mark: 'sent', note: 'CONVERTED ANYWAY' },
        ], { title: 'Synthetic workbook, local run' }),
        markLegend(['keep', 'sent', 'skip']),
      ],
    }),
    'id-comparison': figure({
      title: 'IDs in, numbers out',
      subtitle: 'The cell, what Excel shows, and what the converted Markdown table held.',
      parts: [
        compare({
          headers: ['COLUMN', 'STORED AS', 'EXCEL SHOWS', 'MARKDOWN'],
          widths: [128, 128, 140, 156],
          rows: [
            { label: 'ZIP, all text', cells: [{ t: 'text' }, { t: '02134' }, { t: '2134', ok: false }] },
            { label: 'Account', cells: [{ t: 'number 123' }, { t: '00123' }, { t: '123', ok: false }] },
            { label: 'Mixed column', cells: [{ t: 'text' }, { t: '00123' }, { t: '00123', ok: true }] },
            { label: 'Long ID', cells: [{ t: 'number' }, { t: '...1230000' }, { t: '...1230080', ok: false }] },
            { label: 'Tax rate', cells: [{ t: 'number' }, { t: '7.5%' }, { t: '0.075', ok: null }] },
            { label: 'Unit price', cells: [{ t: 'number' }, { t: '$1,250.00' }, { t: '1250.00', ok: null }] },
          ],
        }),
        note('Cross: the value changed. Dash: same value, display format dropped. Same ZIP codes exported to CSV and converted kept their zeros.'),
      ],
    }),
    'merged-blank-decision': figure({
      title: 'Merged or blank cell?',
      subtitle: 'The converted table cannot tell "same as above" from "missing".',
      parts: [
        decision({
          start: { t: 'A merged or blank cell' },
          question: 'Means same as above?',
          yes: { t: 'Fill it into each row', sub: 'the merged value, repeated', s: 's1' },
          no: { t: 'Leave it blank', sub: 'add a note saying why' },
          after: { t: 'Check the output', sub: 'each NaN is a visible gap', s: 's3' },
        }),
      ],
    }),
    'workbook-checklist': figure({
      title: 'Before you share the workbook',
      subtitle: 'Check the converted Markdown, not the grid.',
      parts: [
        checklist([
          { t: 'Only the sheets you need, main sheet first', sub: 'Hidden sheets convert too.' },
          { t: 'Headers carry their units' },
          { t: 'Every ID column matches the original exactly' },
          { t: 'Dates, percents and currency mean what you intend' },
          { t: 'Formulas were recalculated and saved' },
          { t: 'Merged and blank cells are filled or explained' },
          { t: 'Chart and color meanings are written down' },
        ]),
        note('The conversion reads stored values, not what the cell displays.', { s: 's3' }),
      ],
    }),
  },
};
