// Visuals for "Why Your LLM Bill Is Too High, and Where the Waste Hides" (LLMiser)
import { B, art, banner, cards, figure, hbars, legend, note, panels, stacked, waterfall } from '../../visuals/kit.mjs';

const ID = 'wlb';

// One document question, in input-token equivalents (output counted at 5x,
// the output/input price ratio on current Claude models).
const BLOATED = [
  { label: 'Your question', add: 60, s: 's1', name: 'question' },
  { label: 'Duplicated system prompt', add: 2000, s: 's2', name: 'system prompt' },
  { label: 'Full chat history', add: 5000, s: 's3', name: 'history' },
  { label: 'Raw PDF, 6 pages', add: 13410, s: 's3', name: 'document' },
  { label: 'Off-topic retrieval', add: 4000, s: 's3', name: 'retrieval' },
  { label: '1,500-token answer (x5)', add: 7500, s: 's2', name: 'answer' },
];
const LEAN = [
  { v: 60, s: 's1', name: 'question' },
  { v: 200, s: 's2', name: 'cached system prompt' },
  { v: 800, s: 's3', name: 'history summary' },
  { v: 1334, s: 's3', name: '2 relevant pages as Markdown' },
  { v: 1000, s: 's3', name: 'trimmed retrieval' },
  { v: 2500, s: 's2', name: '500-token answer (x5)' },
];

export default {
  banner: banner({
    id: `${ID}-banner`,
    kicker: 'LLM BILL',
    hook: ['Paying for tokens', 'nobody needed?'],
    sub: 'find the waste before you switch models',
    art: () => {
      let out = '';
      const stack = (x, n, color, label) => {
        let s = '';
        for (let i = 0; i < n; i += 1) s += `<ellipse cx="${x}" cy="${330 - i * 22}" rx="62" ry="15" fill="${color}" stroke="${B.ink}" stroke-width="2.5"/>`;
        s += art.label(x, 362, label, { size: 18, anchor: 'middle' });
        return s;
      };
      out += stack(760, 11, B.pink, 'you pay');
      out += stack(930, 5, B.amber, 'you need');
      // Magnifying glass over the gap between the two stacks.
      out += `<circle cx="1062" cy="150" r="62" fill="${B.paper}" fill-opacity="0.85" stroke="${B.ink}" stroke-width="5"/>`;
      out += `<line x1="1106" y1="194" x2="1150" y2="238" stroke="${B.ink}" stroke-width="12" stroke-linecap="round"/>`;
      out += `<text x="1062" y="166" text-anchor="middle" style="fill:${B.ink};font-family:var(--font-patrick-hand,'Patrick Hand'),'Patrick Hand',ui-rounded,sans-serif;font-size:44px;font-weight:700">leaks</text>`;
      out += art.arrow(1008, 196, 968, 236, { sw: 3 });
      return out;
    },
  }),

  figures: {
    'bloated-request': figure({
      title: 'How one question becomes 31,970 tokens',
      subtitle: 'Input-token equivalents for one document question. Output counted at 5x, its price ratio to input.',
      parts: [
        waterfall(BLOATED.map(({ label, add, s }) => ({ label, add, s })), { totalLabel: 'Total' }),
        note('Illustration, not a measurement. The PDF pages are counted as text plus a page image (2,235 tokens each).'),
      ],
    }),

    'bloated-vs-lean': figure({
      title: 'Same question, same answer quality',
      subtitle: 'The lean version keeps everything the model needs and drops what it doesn\'t.',
      parts: [
        legend([
          { s: 's1', name: 'Question' },
          { s: 's2', name: 'Prompt and answer' },
          { s: 's3', name: 'History, documents, retrieval' },
        ]),
        stacked([
          { label: 'Bloated', parts: BLOATED.map(({ add, s, name }) => ({ v: add, s, name })), total: '31,970' },
          { label: 'Lean', parts: LEAN, total: '5,894', note: '5.4x smaller' },
        ], { max: 31970 }),
      ],
    }),

    'model-tiers': figure({
      title: 'The model you default to',
      subtitle: 'Input price per million tokens across current Claude tiers, checked 20 October 2026.',
      parts: [
        hbars([
          { label: 'Haiku 5.5', value: 0.1, display: '$0.10', s: 's1', note: 'prompts up to 100k' },
          { label: 'Haiku 4.5', value: 1, display: '$1', s: 's1' },
          { label: 'Sonnet 5.5', value: 2, display: '$2', s: 's2' },
          { label: 'Opus 5.5', value: 4, display: '$4', s: 's2' },
          { label: 'Fable 5.1', value: 10, display: '$10', s: 's3', note: '100x Haiku 5.5' },
        ]),
        note('Output costs 5x input on every tier shown. Claude pricing page, list prices.'),
      ],
    }),

    'six-leaks': figure({
      title: 'Six leaks to look for',
      parts: [
        cards([
          { k: '01', title: 'Repeated prompt', sub: 'Same instructions on every call. Cache or trim.', s: 's2' },
          { k: '02', title: 'Endless history', sub: 'Old turns resent forever. Summarize.', s: 's3' },
          { k: '03', title: 'Raw documents', sub: 'PDF pages as images. Convert to Markdown.', s: 's3' },
          { k: '04', title: 'Off-topic retrieval', sub: 'Chunks nobody reads. Rerank and cap.', s: 's3' },
          { k: '05', title: 'Overkill model', sub: 'Top tier for easy tasks. Route.', s: 's2' },
          { k: '06', title: 'Wordy output', sub: 'Long answers at 5x. Ask for less.', s: 's2' },
        ], { cols: 2, h: 100 }),
      ],
    }),

    'audit-checklist': figure({
      title: 'The one-hour cost audit',
      subtitle: 'Run it on a day of real traffic, not a demo.',
      parts: [
        panels([
          {
            title: 'cost-audit.md',
            tag: 'monthly',
            s: 's1',
            lines: [
              { t: '## 1. Measure', k: 'head' },
              { t: '[ ] Log input and output tokens per call' },
              { t: '[ ] Split input: prompt, history, docs, retrieval' },
              { t: '## 2. Fix the top three', k: 'head' },
              { t: '[ ] Biggest part first, one change at a time' },
              { t: '## 3. Prove it', k: 'head' },
              { t: '[ ] Re-run a fixed set of real questions' },
              { t: '[ ] Keep only changes that hold quality' },
            ],
          },
        ]),
      ],
    }),
  },
};
