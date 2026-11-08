// Visuals for "How to Reduce LLM API Costs Without Losing Quality" (LLMiser)
import { B, art, banner, cards, figure, flow, hbars, legend, note } from '../../visuals/kit.mjs';

const ID = 'rac';

// Worked example on Claude Sonnet 5.5 list prices ($2 input, $10 output per
// million tokens, cache hits at 0.05x, platform.claude.com pricing page,
// checked 20 October 2026).
// Baseline: 3,000-token system prompt + 10 PDF pages (2,235 each) + 50-token
// question, 800 output tokens.
const IN = 2 / 1e6;
const OUT = 10 / 1e6;
const cents = (input, output) => Math.round((input * IN + output * OUT) * 10000) / 100;
const baseline = cents(3000 + 22350 + 50, 800); // 5.88
const markdown = cents(3000 + 6670 + 50, 800); // 2.74
const cached = cents(150 + 6670 + 50, 800); // 2.17
const capped = cents(150 + 6670 + 50, 500); // 1.87
const batched = Math.round(capped * 50) / 100; // 0.94

export default {
  banner: banner({
    id: `${ID}-banner`,
    kicker: 'LLM API COSTS',
    hook: ['Smaller bill.', 'Same answers.'],
    sub: 'cut waste, not quality',
    art: () => {
      let out = '';
      // Receipt with a zigzag bottom.
      let zig = 'M740 70 H1000 V300';
      for (let x = 1000; x > 740; x -= 20) zig += ` L${x - 10} 316 L${x - 20} 300`;
      zig += ' Z';
      out += `<path d="${zig}" fill="${B.paper}" stroke="${B.ink}" stroke-width="2.5" stroke-linejoin="round"/>`;
      out += art.label(870, 108, 'API INVOICE', { size: 20, anchor: 'middle' });
      const rows = [['input', '$$$$'], ['output', '$$$$$'], ['retries', '$$'], ['tools', '$$']];
      rows.forEach(([k, v], i) => {
        out += art.label(764, 150 + i * 34, k, { size: 18, weight: 400 }) + art.label(976, 150 + i * 34, v, { size: 18, anchor: 'end' });
        out += `<line x1="764" y1="${160 + i * 34}" x2="976" y2="${160 + i * 34}" stroke="${B.lav}" stroke-width="1.5" stroke-dasharray="4 4"/>`;
        // Waste rows (retries, tools) struck through.
        if (i >= 2) out += `<line x1="760" y1="${144 + i * 34}" x2="980" y2="${144 + i * 34}" stroke="${B.pink}" stroke-width="3" stroke-linecap="round"/>`;
      });
      // Stamp.
      out += `<g transform="rotate(-14 1060 230)"><rect x="985" y="190" width="150" height="80" rx="14" fill="${B.amber}" fill-opacity="0.92" stroke="${B.ink}" stroke-width="3"/>`;
      out += `<text x="1060" y="246" text-anchor="middle" style="fill:${B.ink};font-family:var(--font-patrick-hand,'Patrick Hand'),'Patrick Hand',ui-rounded,sans-serif;font-size:44px;font-weight:700">trimmed</text></g>`;
      return out;
    },
  }),

  figures: {
    'output-price': figure({
      title: 'Output tokens cost 5x input',
      subtitle: 'List prices per million tokens, checked 20 October 2026. Haiku 5.5 prices apply to prompts up to 100,000 tokens.',
      parts: [
        legend([
          { s: 's2', name: 'Input' },
          { s: 's3', name: 'Output' },
        ]),
        hbars([
          { label: 'Haiku 5.5 input', value: 0.1, display: '$0.10', s: 's2' },
          { label: 'Haiku 5.5 output', value: 0.5, display: '$0.50', s: 's3' },
          { label: 'Sonnet 5.5 input', value: 2, display: '$2', s: 's2' },
          { label: 'Sonnet 5.5 output', value: 10, display: '$10', s: 's3' },
          { label: 'Opus 5.5 input', value: 4, display: '$4', s: 's2' },
          { label: 'Opus 5.5 output', value: 20, display: '$20', s: 's3' },
        ]),
      ],
    }),

    'cache-math': figure({
      title: 'A 10,000-token prompt, sent 10 times',
      subtitle: 'Billed input in token-equivalents. One cache write at 1.25x, then nine cache hits.',
      parts: [
        hbars([
          { label: 'No caching', value: 100000, s: 's3' },
          { label: 'Hits at 0.1x (most models)', value: 21500, s: 's1', note: '78% less' },
          { label: 'Hits at 0.05x (Sonnet/Opus 5.5)', value: 17000, s: 's1', note: '83% less' },
        ]),
        note('12,500 for the first write plus 9 hits. The 5-minute cache refreshes on each hit. Rates checked 20 October 2026.'),
      ],
    }),

    'seven-levers': figure({
      title: 'Where the savings come from',
      subtitle: 'Each figure comes from the source named in the article. Your savings depend on your workload.',
      parts: [
        cards([
          { k: '-50%', title: 'Batch what can wait', sub: 'Batch API halves input and output prices.', s: 's1' },
          { k: '≤0.1x', title: 'Cache what repeats', sub: 'A cache hit costs 10% or less of normal input.', s: 's1' },
          { k: '-70%', title: 'Shrink documents', sub: 'One PDF page as Markdown, in our worked example.', s: 's1' },
          { k: '>2x', title: 'Route easy requests', sub: 'Cheaper model when it is good enough.', s: 's2' },
          { k: '5x', title: 'Cap the output', sub: 'Output tokens cost five times input.', s: 's3' },
          { k: '2-5x', title: 'Compress prompts', sub: 'Learned compression on long inputs.', s: 's2' },
        ], { cols: 2, h: 104 }),
      ],
    }),

    'worked-example': figure({
      title: 'One request, five changes',
      subtitle: 'Cost of one document Q&A request on Sonnet 5.5, applying each change on top of the last.',
      parts: [
        hbars([
          { label: 'Baseline: PDF pages, full prompt', value: baseline, display: `${baseline.toFixed(2)}¢`, s: 's3' },
          { label: '+ PDF converted to Markdown', value: markdown, display: `${markdown.toFixed(2)}¢`, s: 's1' },
          { label: '+ system prompt cached', value: cached, display: `${cached.toFixed(2)}¢`, s: 's1' },
          { label: '+ output capped at 500 tokens', value: capped, display: `${capped.toFixed(2)}¢`, s: 's1', note: '-68%' },
          { label: '+ Batch API (async only)', value: batched, display: `${batched.toFixed(2)}¢`, s: 's1', note: '-84%' },
        ]),
        note('Illustration, not a benchmark: 3,000-token system prompt, 10 PDF pages, 50-token question, 800 output tokens. Cache hits at 0.05x, write left out.'),
      ],
    }),

    'safe-loop': figure({
      title: 'Cut cost without cutting quality',
      parts: [
        flow([
          { t: 'Build a test set', sub: '30 to 50 real questions' },
          { t: 'Record a baseline', sub: 'cost and answer quality' },
          { t: 'Change one lever', s: 's1' },
          { t: 'Re-run the test set', sub: 'same questions, same checks' },
          { t: 'Keep or roll back', sub: 'quality first, then cost' },
        ], { cols: 3, boxH: 96 }),
      ],
    }),
  },
};
