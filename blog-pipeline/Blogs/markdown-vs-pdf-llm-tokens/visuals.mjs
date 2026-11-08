// Visuals for "Markdown vs Raw PDFs: Which Uses Fewer LLM Tokens?" (LLMiser)
import { B, C, F, art, banner, custom, decision, figure, legend, line, note, panels, rect, stacked, text } from '../../visuals/kit.mjs';

const ID = 'mvp';

export default {
  banner: banner({
    id: `${ID}-banner`,
    kicker: 'PDF VS MARKDOWN',
    hook: ['Same page,', 'fewer tokens.'],
    sub: 'worked example: 2,235 → 667 tokens',
    art: () => {
      let out = art.page(650, 70, 190, 250, { rot: -6, lines: 9, lineColor: '#d9b8cf', widths: [0.9, 0.4, 0.85, 0.3, 0.7, 0.95, 0.5, 0.8, 0.35] });
      out += art.box(668, 270, 120, 34, { fill: B.pink, stroke: B.ink, r: 17, sw: 2 }) + art.label(728, 294, '2,235', { anchor: 'middle', fill: '#ffffff', size: 21 });
      out += art.arrow(870, 200, 950, 200);
      out += art.page(975, 80, 175, 230, { rot: 4, lines: 6, lineColor: B.lav, widths: [0.55, 0.9, 0.8, 0.85, 0.5, 0.75] });
      out += `<text x="995" y="125" style="fill:${B.amberD};font-family:${F.mono};font-size:24px;font-weight:700" transform="rotate(4 1062 195)">##</text>`;
      out += art.box(1010, 270, 110, 34, { fill: B.amber, stroke: B.ink, r: 17, sw: 2 }) + art.label(1065, 294, '667', { anchor: 'middle', size: 21 });
      return out;
    },
  }),

  figures: {
    'tokens-per-page': figure({
      title: 'One 500-word page, three ways',
      subtitle: 'Worked example: input tokens when an AI app reads the page. PDF readers often send the extracted text plus an image of every page.',
      parts: [
        legend([
          { s: 's1', name: 'Page text' },
          { s: 's2', name: 'Page image' },
        ]),
        stacked([
          { label: 'Markdown', parts: [{ v: 667, s: 's1', name: 'text' }], total: '667' },
          { label: 'PDF, standard-tier image', parts: [{ v: 667, s: 's1', name: 'text' }, { v: 1568, s: 's2', name: 'image' }], total: '2,235  (-70%)' },
          { label: 'PDF, high-res tier (Claude 4.7+)', parts: [{ v: 667, s: 's1', name: 'text' }, { v: 2714, s: 's2', name: 'image' }], total: '3,381  (-80%)' },
        ], { max: 3381 }),
        note('Text: about 0.75 words per token (rule of thumb). Image: one token per 28 x 28 px patch of a 1275 x 1650 px page, capped near 1,568 on the standard tier. Checked 20 October 2026.'),
      ],
    }),

    'extraction-noise': figure({
      title: 'What the model actually reads',
      subtitle: 'The same page, as plain extracted text and as Markdown. Struck lines are tokens you pay for and the model has to ignore.',
      parts: [
        panels([
          {
            title: 'Raw PDF text',
            tag: 'noisy',
            s: 's3',
            lines: [
              { t: 'ACME Corp  |  Annual Report 2025   Page 14', k: 'noise' },
              { t: 'Revenue grew 18% in the fiscal year, dri-', k: 'keep' },
              { t: 'Operating costs fell 4% after the plat-', k: 'keep' },
              { t: 'ven by two new regions. form migration.', k: 'dim' },
              { t: 'Region Q1 Q2 Q3 Q4 North 4.1 4.4 4.9', k: 'dim' },
              { t: 'Confidential. Do not distribute.   14', k: 'noise' },
            ],
          },
          {
            title: 'Markdown',
            tag: 'clean',
            s: 's1',
            lines: [
              { t: '## Results', k: 'head' },
              { t: 'Revenue grew 18%, driven by two new regions.' },
              { t: 'Operating costs fell 4% after the platform migration.' },
              { t: '| Region | Q1  | Q2  | Q3  |' },
              { t: '| North  | 4.1 | 4.4 | 4.9 |' },
            ],
          },
        ]),
      ],
    }),

    'reading-order': figure({
      title: 'Two columns, one wrong order',
      subtitle: 'Text extraction reads across the page by line position. In a two-column layout that interleaves the columns.',
      parts: [
        custom(250, (y) => {
          let svg = '';
          const page = (x, label, order) => {
            let s = rect(x, y, 250, 210, { fill: C.surface2, stroke: C.border3, r: 10 });
            s += text(x + 125, y + 236, label, { size: 15, weight: 700, anchor: 'middle' });
            const cols = [x + 18, x + 132];
            for (let c = 0; c < 2; c += 1) {
              for (let r = 0; r < 3; r += 1) {
                const bx = cols[c];
                const by = y + 22 + r * 60;
                const tag = c === 0 ? `A${r + 1}` : `B${r + 1}`;
                s += rect(bx, by, 100, 46, { fill: c === 0 ? C.s1 : C.s2, fo: 0.14, stroke: c === 0 ? C.s1 : C.s2, sw: 1.5, r: 6 });
                s += text(bx + 50, by + 29, tag, { size: 16, font: F.mono, weight: 700, anchor: 'middle' });
              }
            }
            order.forEach(([a, b], i) => {
              s += line(a[0], a[1], b[0], b[1], { stroke: C.ink, sw: 1.6, dash: i % 2 ? '4 4' : undefined, op: 0.7 });
            });
            return s;
          };
          const L = 24;
          const R = 326;
          const cxA = (x) => x + 18 + 50;
          const cxB = (x) => x + 132 + 50;
          const ry = (r) => y + 22 + r * 60 + 23;
          svg += page(L, 'Extracted: A1 B1 A2 B2 A3 B3', [
            [[cxA(L) + 50, ry(0)], [cxB(L) - 50, ry(0)]],
            [[cxB(L) - 50, ry(0) + 10], [cxA(L) + 50, ry(1) - 10]],
            [[cxA(L) + 50, ry(1)], [cxB(L) - 50, ry(1)]],
            [[cxB(L) - 50, ry(1) + 10], [cxA(L) + 50, ry(2) - 10]],
            [[cxA(L) + 50, ry(2)], [cxB(L) - 50, ry(2)]],
          ]);
          svg += page(R, 'Markdown: A1 A2 A3 B1 B2 B3', [
            [[cxA(R), ry(0) + 23], [cxA(R), ry(1) - 23]],
            [[cxA(R), ry(1) + 23], [cxA(R), ry(2) - 23]],
            [[cxA(R) + 50, ry(2) - 10], [cxB(R) - 50, ry(0) + 10]],
            [[cxB(R), ry(0) + 23], [cxB(R), ry(1) - 23]],
            [[cxB(R), ry(1) + 23], [cxB(R), ry(2) - 23]],
          ]);
          return svg;
        }),
      ],
    }),

    'chunk-boundaries': figure({
      title: 'Headings make better chunk edges',
      subtitle: 'Fixed-size chunks cut through sections. Markdown headings give a splitter natural places to cut.',
      parts: [
        custom(252, (y) => {
          let svg = '';
          const sections = [
            { h: '## Pricing', n: 3 },
            { h: '## Refunds', n: 2 },
            { h: '## Support', n: 3 },
          ];
          const doc = (x, label, cuts, sColor) => {
            let s = text(x, y + 14, label, { size: 15, weight: 700 });
            let yy = y + 28;
            const ys = [];
            sections.forEach((sec) => {
              ys.push(yy);
              s += text(x + 10, yy + 16, sec.h, { size: 14, font: F.mono, weight: 700, fill: C.s1 });
              yy += 24;
              for (let i = 0; i < sec.n; i += 1) {
                s += rect(x + 10, yy + 4, 200 - (i % 2) * 50, 7, { fill: C.border3, r: 3.5 });
                yy += 16;
              }
              yy += 6;
            });
            s += rect(x, y + 24, 250, yy - y - 20, { stroke: C.border3, r: 8 });
            const marks = cuts === 'heading' ? ys.slice(1).map((v) => v - 3) : [y + 70, y + 148, y + 216];
            marks.forEach((my) => {
              s += line(x - 6, my, x + 256, my, { stroke: sColor, sw: 2.5, dash: '7 5' });
            });
            return s;
          };
          svg += doc(24, 'Every 120 tokens', 'fixed', C.s3);
          svg += doc(326, 'At each ## heading', 'heading', C.s1);
          return svg;
        }),
        note('LLMiser\'s RAG-ready profile adds a <!-- chunk-boundary --> marker before every ## heading for exactly this.', { s: 's1' }),
      ],
    }),

    'when-to-send-pdf': figure({
      title: 'Markdown or the PDF itself?',
      subtitle: 'Convert by default. Send the page when the answer lives in a picture.',
      parts: [
        decision({
          start: { t: 'Your document', sub: 'PDF, slides, scan' },
          question: 'Is the answer in a chart, photo or layout?',
          yes: { t: 'Send that page', sub: 'image tokens are worth it here', s: 's2' },
          no: { t: 'Convert to Markdown', sub: 'headings, lists, tables', s: 's1' },
          after: { t: 'Paste only what you need', sub: 'fewer tokens per question', s: 's1' },
        }),
      ],
    }),
  },
};
