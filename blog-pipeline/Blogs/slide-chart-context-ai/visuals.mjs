// Visual spec for M05-S2 "Carry Chart Context From Slides Into AI Prompts".
// Data: fixtures/chart-files.json, out-original, out-label-trap, out-reviewed, render/*.png (slide display).

import { B, art, banner, decision, figure, note, panels } from '../../visuals/kit.mjs';
import { checklist, compare } from '../../visuals/campaign-parts.mjs';

const bannerArt = () => {
  let out = '';
  // Mini line chart as the slide displayed it (values 4.2, 5.1, 7.8 percent).
  out += art.box(642, 50, 270, 296, { fill: '#ffffff', r: 12 });
  out += art.label(660, 84, 'Churn', { size: 18, font: 'Inter, sans-serif' });
  const x0 = 676;
  const y0 = 300;
  const sx = 92;
  const sy = 22; // px per percentage point
  const pts = [[0, 4.2], [1, 5.1], [2, 7.8]].map(([i, v]) => [x0 + i * sx, y0 - (v - 2) * sy]);
  out += `<line x1="${x0 - 12}" y1="${y0}" x2="${x0 + 2 * sx + 20}" y2="${y0}" stroke="#c9c5b8" stroke-width="2"/>`;
  out += `<polyline points="${pts.map((p) => p.join(',')).join(' ')}" fill="none" stroke="${B.violet}" stroke-width="4" stroke-linejoin="round"/>`;
  pts.forEach(([x, y], i) => {
    out += `<circle cx="${x}" cy="${y}" r="6" fill="${B.violet}"/>`;
    out += art.label(x - 6, y - 16, ['4.2%', '5.1%', '7.8%'][i], { size: 16, fill: B.ink });
  });
  out += art.arrow(918, 198, 940, 198, { sw: 2.5, head: 9 });
  out += art.box(946, 50, 214, 296, { fill: '#ffffff', r: 12 });
  out += art.label(964, 84, 'CONVERTED', { size: 14, fill: '#8a8a92' });
  out += art.label(964, 126, '| Churn |', { size: 18 });
  ['0.042', '0.051', '0.078'].forEach((v, i) => {
    out += art.label(964, 176 + i * 50, `| ${v} |`, { size: 20, fill: B.pink });
  });
  return out;
};

export default {
  banner: banner({
    id: 'chart-banner',
    kicker: 'SLIDE CHARTS',
    hook: ['The slide said', '4.2%.'],
    sub: 'the text said 0.042',
    art: bannerArt,
  }),
  figures: {
    'slide-vs-output': figure({
      title: 'Slide versus converted text',
      subtitle: 'Four native charts from the original deck.',
      parts: [
        compare({
          headers: ['CHART', 'ON THE SLIDE', 'CONVERTED'],
          widths: [144, 200, 208],
          size: 12.5,
          rows: [
            { label: 'Churn', cells: [{ t: '4.2%  5.1%  7.8%' }, { t: '0.042 0.051 0.078', ok: false }] },
            { label: 'Signups', cells: [{ t: 'axis starts at 4' }, { t: 'values only', ok: null }] },
            { label: 'Revenue share', cells: [{ t: 'North 45%' }, { t: '45.0 (Revenue)', ok: false }] },
            { label: 'Revenue', cells: [{ t: '$125,000' }, { t: '125000.0', ok: false }] },
            { label: 'Revenue axis', cells: [{ t: 'Revenue (USD)' }, { t: 'missing', ok: false }] },
          ],
        }),
        note('Slide display rendered with LibreOffice. Local run, 9 November 2026.'),
      ],
    }),
    'survives-and-lost': figure({
      title: 'What a chart keeps',
      subtitle: 'Native chart content in the converted text.',
      parts: [
        compare({
          headers: ['CHART PART', '', 'IN THE OUTPUT'],
          widths: [250, 2, 300],
          size: 12.5,
          rowH: 28,
          rows: [
            { label: 'Chart title', cells: [{ t: '' }, { t: 'kept, as a Chart heading', ok: true }] },
            { label: 'Category names', cells: [{ t: '' }, { t: 'kept', ok: true }] },
            { label: 'Series names', cells: [{ t: '' }, { t: 'kept, as column headers', ok: true }] },
            { label: 'Stored values', cells: [{ t: '' }, { t: 'kept', ok: true }] },
            { label: '% and $ signs', cells: [{ t: '' }, { t: 'lost', ok: false }] },
            { label: 'Thousands separators', cells: [{ t: '' }, { t: 'lost', ok: false }] },
            { label: 'Axis titles', cells: [{ t: '' }, { t: 'lost', ok: false }] },
            { label: 'Axis start and end', cells: [{ t: '' }, { t: 'lost', ok: false }] },
            { label: 'Data labels, pie percentages', cells: [{ t: '' }, { t: 'lost', ok: false }] },
            { label: 'Visual trend', cells: [{ t: '' }, { t: 'lost', ok: false }] },
          ],
        }),
        note('Put units in the chart title and series names, which survive.'),
      ],
    }),
    'churn-fix': figure({
      title: 'Three versions of one table',
      subtitle: 'The churn chart as converted text.',
      parts: [
        panels([
          {
            title: 'Original',
            tag: 'NO UNIT',
            lines: [
              { t: '### Chart: Churn', k: 'dim' },
              { t: '| Category | Churn |' },
              { t: '| July | 0.042 |' },
              { t: '| September | 0.078 |' },
            ],
          },
          {
            title: 'First fix',
            tag: 'MISMATCH',
            s: 's3',
            lines: [
              { t: '### Chart: Monthly churn rate, % of accounts', k: 'dim' },
              { t: '| Category | Churn rate (%) |' },
              { t: '| July | 0.042 |', k: 'noise' },
              { t: '| September | 0.078 |', k: 'noise' },
            ],
          },
          {
            title: 'Reviewed',
            tag: 'MATCHES',
            s: 's1',
            lines: [
              { t: 'Churn rose from 4.2% to 7.8% of accounts.', k: 'head' },
              { t: '### Chart: Monthly churn rate, % of accounts', k: 'dim' },
              { t: '| Category | Churn rate (%) |' },
              { t: '| July | 4.2 |' },
              { t: '| September | 7.8 |' },
            ],
          },
        ]),
        note('August rows omitted. Local run, 9 November 2026.'),
      ],
    }),
    'keep-visual-decision': figure({
      title: 'Does the image need to travel?',
      subtitle: 'For any chart that supports a claim.',
      parts: [
        decision({
          start: { t: 'A chart behind a claim' },
          question: 'Is the shape the evidence?',
          yes: { t: 'Send the image too', sub: 'and note axis ranges', s: 's1' },
          no: { t: 'Table and takeaway', sub: 'one sentence, with units' },
        }),
        note('Either way, check every number in the description against the chart.'),
      ],
    }),
    'chart-checklist': figure({
      title: 'Chart context pass',
      subtitle: 'Before a model reads a converted deck.',
      parts: [
        checklist([
          { t: 'Question each chart answers, in one sentence' },
          { t: 'Units in chart titles and series names' },
          { t: 'Stored values match the named unit' },
          { t: 'A takeaway sentence on each chart slide' },
          { t: 'Axis ranges noted when the image travels too' },
          { t: 'Picture charts rebuilt or described' },
        ]),
        note('Number formats, axis titles and data labels do not survive.', { s: 's3' }),
      ],
    }),
  },
};
