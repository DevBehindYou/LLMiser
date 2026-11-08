// Visuals for "PDFs Are Expensive for AI: Here's Why" (LLMiser)
import { B, C, F, art, banner, custom, figure, flow, hbars, line, note, panels, rect, text } from '../../visuals/kit.mjs';

const ID = 'wpe';

export default {
  banner: banner({
    id: `${ID}-banner`,
    kicker: 'PDF + AI',
    hook: ['PDFs are', 'expensive for AI.'],
    sub: 'the cost is in the extraction, not the file',
    art: () => {
      let out = art.page(760, 50, 230, 300, { lines: 9, lineColor: '#d9b8cf' });
      // Noise markers on the page.
      out += `<rect x="780" y="72" width="170" height="16" rx="4" fill="${B.pink}" fill-opacity="0.55"/>`;
      out += `<rect x="780" y="318" width="120" height="14" rx="4" fill="${B.pink}" fill-opacity="0.55"/>`;
      out += `<line x1="875" y1="100" x2="875" y2="300" stroke="${B.ink}" stroke-width="2" stroke-dasharray="6 5"/>`;
      // Price tag.
      out += `<g transform="rotate(10 1080 140)"><path d="M1010 100 H1130 L1160 140 L1130 180 H1010 Z" fill="${B.amber}" stroke="${B.ink}" stroke-width="3" stroke-linejoin="round"/>`;
      out += `<circle cx="1128" cy="140" r="8" fill="${B.paper}" stroke="${B.ink}" stroke-width="2"/>`;
      out += `<text x="1064" y="152" text-anchor="middle" style="fill:${B.ink};font-family:${F.hand};font-size:40px;font-weight:700">7x</text></g>`;
      out += `<path d="M995 170 C1020 200 1040 200 1060 180" fill="none" stroke="${B.ink}" stroke-width="2.5"/>`;
      return out;
    },
  }),

  figures: {
    'seven-times': figure({
      title: 'Same 3 pages, seven times the tokens',
      subtitle: 'Claude PDF docs, Amazon Bedrock Converse API: text extraction only versus each page also read as an image.',
      parts: [
        hbars([
          { label: 'Text extraction only', value: 1000, display: '~1,000 tokens', s: 's1' },
          { label: 'Text plus page images', value: 7000, display: '~7,000 tokens', s: 's3', note: '7x' },
        ]),
        note('Per page, extracted text typically uses 1,500 to 3,000 tokens depending on density, according to the same docs (checked 20 October 2026).'),
      ],
    }),

    'page-anatomy': figure({
      title: 'Where a PDF page hides extra tokens',
      subtitle: 'Each marked area turns into tokens you pay for but the model does not need.',
      parts: [
        custom(330, (y) => {
          let s = '';
          const px = 40;
          const pw = 300;
          s += rect(px, y, pw, 320, { fill: C.surface2, stroke: C.border3, r: 8 });
          const zone = (x, yy, w, h, n, col) => rect(x, yy, w, h, { fill: col, fo: 0.18, stroke: col, sw: 1.6, r: 5 })
            + text(x + 8, yy + 15, n, { size: 12, font: F.mono, weight: 700, fill: C.ink });
          s += zone(px + 12, y + 10, pw - 24, 22, '1', C.s3);
          for (let c = 0; c < 2; c += 1) {
            for (let r = 0; r < 5; r += 1) {
              s += rect(px + 20 + c * 140, y + 50 + r * 18, 118 - (r % 2) * 22, 6, { fill: C.border3, r: 3 });
            }
          }
          s += zone(px + 12, y + 42, pw - 24, 96, '2', C.s2);
          s += zone(px + 12, y + 150, pw - 24, 80, '3', C.s2);
          for (let r = 0; r < 3; r += 1) for (let c = 0; c < 4; c += 1) s += rect(px + 24 + c * 66, y + 172 + r * 18, 56, 10, { fill: C.border3, r: 2 });
          s += zone(px + 12, y + 242, 130, 40, '4', C.s3);
          s += zone(px + 12, y + 290, pw - 24, 22, '5', C.s3);
          const labels = [
            ['1', 'Running header on every page'],
            ['2', 'Two columns read line by line'],
            ['3', 'Table flattened into numbers'],
            ['4', 'Scanned or image-only text'],
            ['5', 'Footer, legal line, page number'],
          ];
          labels.forEach(([n, t], i) => {
            const ly = y + 30 + i * 62;
            s += rect(370, ly - 18, 24, 24, { fill: i === 1 || i === 2 ? C.s2 : C.s3, fo: 0.2, stroke: i === 1 || i === 2 ? C.s2 : C.s3, r: 12 });
            s += text(382, ly - 1, n, { size: 13, font: F.mono, weight: 700, anchor: 'middle' });
            const words = t.split(' ');
            const half = Math.ceil(words.length / 2);
            s += text(402, ly - 1, words.slice(0, half).join(' '), { size: 15, weight: 600 });
            s += text(402, ly + 18, words.slice(half).join(' '), { size: 14, fill: C.muted });
          });
          return s;
        }),
      ],
    }),

    'repeats': figure({
      title: 'Three pages, three copies of the noise',
      subtitle: 'Extracted text from consecutive pages. Struck lines repeat on every page of the report.',
      parts: [
        panels([
          {
            title: 'pages 12-14, extracted',
            tag: '6 repeats',
            s: 's3',
            lines: [
              { t: 'ACME Corp | Annual Report 2025', k: 'noise' },
              { t: 'Revenue grew 18% in the fiscal year.' },
              { t: 'Page 12 | Confidential', k: 'noise' },
              { t: 'ACME Corp | Annual Report 2025', k: 'noise' },
              { t: 'Operating costs fell 4%.' },
              { t: 'Page 13 | Confidential', k: 'noise' },
              { t: 'ACME Corp | Annual Report 2025', k: 'noise' },
              { t: 'Headcount rose to 240.' },
              { t: 'Page 14 | Confidential', k: 'noise' },
            ],
          },
        ]),
        note('On a 60-page report that is 120 lines of noise. Each is small, and they are sent with every question.'),
      ],
    }),

    'table-fragments': figure({
      title: 'What happens to a table',
      parts: [
        panels([
          {
            title: 'Raw extraction',
            tag: 'which number is which?',
            s: 's3',
            lines: [
              { t: 'Region Q1 Q2 Q3 Q4', k: 'dim' },
              { t: 'North 4.1 4.4 4.9 5.2 South', k: 'dim' },
              { t: '3.0 3.1 2.8 3.3 West 1.9 2.2', k: 'dim' },
              { t: '2.5 2.6', k: 'dim' },
            ],
          },
          {
            title: 'Markdown',
            tag: 'columns kept',
            s: 's1',
            lines: [
              { t: '| Region | Q1  | Q2  | Q3  | Q4  |' },
              { t: '|--------|-----|-----|-----|-----|' },
              { t: '| North  | 4.1 | 4.4 | 4.9 | 5.2 |' },
              { t: '| South  | 3.0 | 3.1 | 2.8 | 3.3 |' },
              { t: '| West   | 1.9 | 2.2 | 2.5 | 2.6 |' },
            ],
          },
        ]),
      ],
    }),

    'fix-flow': figure({
      title: 'Fix it once, before the AI reads it',
      parts: [
        flow([
          { t: 'PDF', sub: 'text, scans, tables' },
          { t: 'Convert to Markdown', sub: 'headings, lists, tables', s: 's1' },
          { t: 'Strip repeats', sub: 'headers, footers', s: 's1' },
          { t: 'Chunk by heading', sub: 'one topic each' },
          { t: 'Index', sub: 'once per document' },
          { t: 'Ask', sub: 'send relevant chunks', s: 's1' },
        ], { cols: 3, boxH: 98 }),
      ],
    }),
  },
};
