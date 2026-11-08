// Visuals for "The Hidden Token Tax in RAG Pipelines" (LLMiser)
import { B, C, F, banner, cards, custom, figure, funnel, hbars, legend, note, rect, stacked, text } from '../../visuals/kit.mjs';

const ID = 'htt';

// Chunks stored (and retrieved) per unit of text with overlap o: 1 / (1 - o).
const inflate = (o) => Math.round((1 / (1 - o)) * 100) / 100;

export default {
  banner: banner({
    id: `${ID}-banner`,
    kicker: 'RAG TOKENS',
    hook: ['The hidden', 'token tax.'],
    sub: 'most of it sits below the waterline',
    art: () => {
      let out = '';
      out += `<path d="M900 70 L960 150 L940 150 L985 200 L815 200 L860 150 L840 150 Z" fill="${B.paper}" stroke="${B.ink}" stroke-width="3" stroke-linejoin="round"/>`;
      out += `<rect x="640" y="200" width="540" height="190" fill="#8f83d8" fill-opacity="0.22"/>`;
      out += `<path d="M640 200 Q700 190 760 200 T880 200 T1000 200 T1120 200 T1180 200" fill="none" stroke="${B.ink}" stroke-width="2.5"/>`;
      out += `<path d="M815 200 L720 300 L780 360 L1030 370 L1100 290 L985 200 Z" fill="${B.lav}" fill-opacity="0.75" stroke="${B.ink}" stroke-width="3" stroke-linejoin="round"/>`;
      out += `<text x="900" y="186" text-anchor="middle" style="fill:${B.ink};font-family:${F.mono};font-size:18px;font-weight:700">answer</text>`;
      out += `<text x="905" y="300" text-anchor="middle" style="fill:${B.ink};font-family:${F.mono};font-size:22px;font-weight:700">8,000 context tokens</text>`;
      return out;
    },
  }),

  figures: {
    'tax-funnel': figure({
      title: 'Where 8,000 tokens of context come from',
      subtitle: 'One question, one untuned pipeline. The model needed about 1,500 tokens to answer.',
      parts: [
        funnel([
          { label: 'Retrieve top 20', value: 8000, display: '20 chunks x 400 = 8,000 tokens', s: 's3' },
          { label: 'Drop near-duplicates', value: 6000, display: '15 chunks, ~6,000 tokens', s: 's3' },
          { label: 'Rerank, keep top 6', value: 2400, display: '~2,400 tokens', s: 's2' },
          { label: 'Keep relevant passages', value: 1500, display: '~1,500 tokens needed', s: 's1' },
        ]),
        note('Illustrative pipeline. Each step needs its own recall test before you trust the cut.'),
      ],
    }),

    'overlap-inflation': figure({
      title: 'What chunk overlap costs',
      subtitle: 'Tokens stored and embedded per token of source text, by overlap between neighbouring chunks.',
      parts: [
        hbars([0, 0.1, 0.25, 0.5].map((o) => ({
          label: `${Math.round(o * 100)}% overlap`,
          value: inflate(o),
          display: `${inflate(o).toFixed(2)}x`,
          s: o === 0 ? 's1' : o >= 0.5 ? 's3' : 's2',
        }))),
        note('Overlap also lets two neighbouring chunks carry the same sentences into one prompt.'),
      ],
    }),

    'one-relevant-sentence': figure({
      title: 'A 400-token chunk, one useful sentence',
      subtitle: 'Large chunks match the question on one line and bring the whole page along.',
      parts: [
        custom(250, (y) => {
          let s = rect(24, y, 552, 250, { fill: C.surface2, stroke: C.border3, r: 10 });
          s += text(42, y + 28, '## Billing policy', { size: 15, font: F.mono, weight: 700, fill: C.s1 });
          const widths = [470, 420, 500, 380, 460, 300, 490, 410, 350];
          widths.forEach((w, i) => {
            const yy = y + 48 + i * 21;
            const hit = i === 4;
            s += rect(42, yy, w, 11, { fill: hit ? C.s1 : C.s3, fo: hit ? 0.85 : 0.25, r: 4 });
          });
          s += text(42, y + 240, 'Paid for: ~400 tokens', { size: 14, font: F.mono, fill: C.muted });
          s += text(558, y + 240, 'Needed: ~45 tokens', { size: 14, font: F.mono, weight: 700, anchor: 'end' });
          return s;
        }),
        legend([
          { s: 's1', name: 'Answers the question' },
          { s: 's3', name: 'Rides along' },
        ]),
      ],
    }),

    'budget': figure({
      title: 'Give the prompt a budget',
      subtitle: 'Input tokens per question before and after setting a fixed context budget.',
      parts: [
        legend([
          { s: 's1', name: 'Question' },
          { s: 's2', name: 'Instructions' },
          { s: 's3', name: 'Retrieved context' },
        ]),
        stacked([
          { label: 'Untuned', parts: [{ v: 50, s: 's1', name: 'question' }, { v: 600, s: 's2', name: 'instructions' }, { v: 8000, s: 's3', name: 'context' }], total: '8,650' },
          { label: 'With a 1,500-token budget', parts: [{ v: 50, s: 's1', name: 'question' }, { v: 600, s: 's2', name: 'instructions' }, { v: 1500, s: 's3', name: 'context' }], total: '2,150', note: '-75%' },
        ], { max: 8650 }),
      ],
    }),

    'eight-knobs': figure({
      title: 'Eight knobs that set the tax',
      parts: [
        cards([
          { k: '01', title: 'Chunk size', sub: 'Smaller, one-topic chunks waste less.', s: 's3' },
          { k: '02', title: 'Overlap', sub: 'Keep it low. 50% doubles storage.', s: 's3' },
          { k: '03', title: 'Top-K', sub: 'Retrieve wide, send narrow.', s: 's3' },
          { k: '04', title: 'Deduplication', sub: 'Drop chunks that say the same thing.', s: 's2' },
          { k: '05', title: 'Reranking', sub: 'Score candidates, keep the best.', s: 's2' },
          { k: '06', title: 'Metadata filters', sub: 'Search the right documents only.', s: 's2' },
          { k: '07', title: 'Clean Markdown', sub: 'No headers, footers or layout junk.', s: 's1' },
          { k: '08', title: 'Token budget', sub: 'A hard cap on context per question.', s: 's1' },
        ], { cols: 2, h: 96 }),
      ],
    }),
  },
};
