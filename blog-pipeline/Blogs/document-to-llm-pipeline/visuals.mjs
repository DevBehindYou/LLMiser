// Visuals for "Stop Sending Whole Documents to AI: Build a Better Pipeline" (LLMiser)
import { B, art, banner, figure, flow, fork, funnel, hbars, note, panels } from '../../visuals/kit.mjs';

const ID = 'dlp';

export default {
  banner: banner({
    id: `${ID}-banner`,
    kicker: 'DOCUMENT PIPELINE',
    hook: ['Send the answer,', 'not the archive.'],
    sub: '100 pages in -> 3 chunks out',
    art: () => {
      let out = '';
      for (let i = 4; i >= 0; i -= 1) out += art.page(660 + i * 12, 70 + i * 10, 150, 200, { lines: 6, rot: -4 + i, fold: i === 0 });
      out += `<path d="M860 110 H1000 L960 200 V262 H900 V200 Z" fill="${B.paper}" fill-opacity="0.85" stroke="${B.ink}" stroke-width="3" stroke-linejoin="round"/>`;
      out += art.label(930, 150, 'clean', { size: 18, anchor: 'middle' }) + art.label(930, 176, 'chunk', { size: 18, anchor: 'middle' }) + art.label(930, 202, 'rank', { size: 18, anchor: 'middle' });
      out += art.arrow(1010, 190, 1050, 190, { sw: 3 });
      [0, 1, 2].forEach((i) => {
        out += art.box(1060, 120 + i * 50, 100, 38, { fill: B.amber, r: 10 }) + art.label(1110, 145 + i * 50, `#${i + 1}`, { size: 18, anchor: 'middle' });
      });
      out += art.arrow(1110, 272, 1110, 302, { sw: 3 });
      out += art.box(1050, 308, 120, 42, { fill: B.lav, r: 12 }) + art.label(1110, 336, 'LLM', { size: 20, anchor: 'middle' });
      return out;
    },
  }),

  figures: {
    'naive-vs-pipeline': figure({
      title: 'Two ways to ask about a 100-page PDF',
      subtitle: 'Top: send everything. Bottom: prepare once, then send only what answers the question.',
      parts: [
        flow([
          { t: '100-page PDF' },
          { t: 'Send it all', sub: 'every page, every time', s: 's3' },
          { t: 'LLM' },
        ], { cols: 3, boxH: 62, numbered: false }),
        flow([
          { t: 'Extract', sub: 'text and scans' },
          { t: 'Clean', sub: 'drop headers, footers' },
          { t: 'Structure', sub: 'Markdown headings' },
          { t: 'Chunk', sub: 'one section each' },
          { t: 'Add metadata', sub: 'doc, section, page' },
          { t: 'Index', sub: 'search once' },
          { t: 'Retrieve', sub: 'top matches' },
          { t: 'Assemble', sub: 'within a budget', s: 's1' },
          { t: 'LLM', sub: 'small, focused input', s: 's1' },
        ], { cols: 3, boxH: 72 }),
      ],
    }),

    'tokens-per-question': figure({
      title: 'Input tokens for one question',
      subtitle: 'A 100-page report of about 500 words per page, three ways.',
      parts: [
        hbars([
          { label: 'Whole PDF, text plus page images', value: 223500, s: 's3' },
          { label: 'Whole document as Markdown', value: 66700, s: 's2' },
          { label: 'Six relevant chunks', value: 3000, s: 's1', note: 'about 1% of the PDF' },
        ]),
        note('Estimates: 667 tokens of text and up to about 1,568 image tokens per page (standard tier), chunks of about 500 tokens.'),
      ],
    }),

    'mixed-pdf': figure({
      title: 'PDFs with text pages and scanned pages',
      subtitle: 'Each page takes the cheapest path that still reads it, then the pieces go back in order.',
      parts: [
        fork({
          start: { t: 'Mixed PDF', sub: 'reports, contracts, scans' },
          branches: [
            { t: 'Text page', sub: 'read the text directly', s: 's1' },
            { t: 'Picture-only page', sub: 'text recognition', s: 's2' },
          ],
          join: { t: 'Merge in page order' },
          end: { t: 'One Markdown file', s: 's1' },
        }),
      ],
    }),

    'chunk-record': figure({
      title: 'A chunk that knows where it came from',
      subtitle: 'Metadata lets you filter before you search and cite after you answer.',
      parts: [
        panels([
          {
            title: 'chunk 14 of 212',
            tag: '~480 tokens',
            s: 's1',
            lines: [
              { t: 'doc:      employee-handbook-2026.md', k: 'dim' },
              { t: 'section:  Leave > Parental leave', k: 'dim' },
              { t: 'pages:    31-32', k: 'dim' },
              { t: '## Parental leave', k: 'head' },
              { t: 'Employees get 16 weeks of paid leave...' },
              { t: '| Tenure    | Paid weeks |' },
              { t: '| < 1 year  | 8          |' },
            ],
          },
        ]),
      ],
    }),

    'context-budget': figure({
      title: 'From search results to a context budget',
      subtitle: 'Each step drops text the model would have had to read past.',
      parts: [
        funnel([
          { label: 'Retrieved', value: 10000, display: '20 chunks, ~10,000 tokens', s: 's3' },
          { label: 'Duplicates removed', value: 7000, display: '14 chunks, ~7,000 tokens', s: 's2' },
          { label: 'Reranked', value: 3000, display: 'top 6, ~3,000 tokens', s: 's2' },
          { label: 'Sent to the model', value: 2600, display: 'fits a 3,000-token budget', s: 's1' },
        ]),
        note('Illustrative pipeline. Tune the numbers against questions you already know the answers to.'),
      ],
    }),
  },
};
