// Visuals for "Why Your LLM Token Usage Is So High, and How to Fix It" (LLMiser)
import { B, art, banner, cards, figure, flow, hbars, legend, note, stacked } from '../../visuals/kit.mjs';

const ID = 'rtu';

// 10-turn chat: 1,000-token system prompt, 150-token questions, 350-token answers.
// Input at turn k = 1,000 + 150 + 500 * (k - 1). Sum over 10 turns = 34,000.
const turn = (k) => 1000 + 150 + 500 * (k - 1);

export default {
  banner: banner({
    id: `${ID}-banner`,
    kicker: 'TOKEN USAGE',
    hook: ['Where do all', 'the tokens go?'],
    sub: 'six quiet leaks, and how to plug them',
    art: () => {
      let out = '';
      // A gauge in the red.
      out += `<path d="M700 300 A190 190 0 0 1 1080 300" fill="none" stroke="${B.paper}" stroke-width="34" stroke-linecap="round"/>`;
      out += `<path d="M700 300 A190 190 0 0 1 820 128" fill="none" stroke="${B.lav}" stroke-width="34" stroke-linecap="round"/>`;
      out += `<path d="M820 128 A190 190 0 0 1 980 132" fill="none" stroke="${B.amber}" stroke-width="34" stroke-linecap="round"/>`;
      out += `<path d="M980 132 A190 190 0 0 1 1080 300" fill="none" stroke="${B.pink}" stroke-width="34" stroke-linecap="round"/>`;
      out += `<path d="M700 300 A190 190 0 0 1 1080 300" fill="none" stroke="${B.ink}" stroke-width="2.5"/>`;
      out += `<line x1="890" y1="300" x2="1040" y2="200" stroke="${B.ink}" stroke-width="7" stroke-linecap="round"/><circle cx="890" cy="300" r="16" fill="${B.ink}"/>`;
      // Token chips spilling out.
      const chips = [[1010, 330, 70], [1090, 312, 50], [960, 352, 56], [1050, 360, 44], [1120, 350, 38]];
      chips.forEach(([x, y, w], i) => {
        out += art.chip(x, y - 10, w, [B.amber, B.lav, B.pink][i % 3], { h: 20 });
      });
      out += art.label(890, 260, 'tokens', { size: 22, anchor: 'middle' });
      return out;
    },
  }),

  figures: {
    'history-growth': figure({
      title: 'Every turn resends the whole chat',
      subtitle: 'Input tokens per turn in a 10-turn chat: 1,000-token system prompt, 150-token questions, 350-token answers.',
      parts: [
        hbars([
          { label: 'Turn 1', value: turn(1), s: 's2' },
          { label: 'Turn 4', value: turn(4), s: 's2' },
          { label: 'Turn 7', value: turn(7), s: 's2' },
          { label: 'Turn 10', value: turn(10), s: 's3', note: 'almost 5x turn 1' },
        ], { unit: '' }),
        note('Ten short questions sent 34,000 input tokens in total. The questions themselves were 1,500 of them.'),
      ],
    }),

    'request-anatomy': figure({
      title: 'Anatomy of one "simple" question',
      subtitle: 'An example request to a document assistant. The question is the smallest part.',
      parts: [
        legend([
          { s: 's1', name: 'Question' },
          { s: 's2', name: 'Instructions and tools' },
          { s: 's3', name: 'History and documents' },
        ]),
        stacked([
          {
            label: 'As sent',
            parts: [
              { v: 80, s: 's1', name: 'question' },
              { v: 2500, s: 's2', name: 'system prompt' },
              { v: 1200, s: 's2', name: 'tool definitions' },
              { v: 4000, s: 's3', name: 'chat history' },
              { v: 6000, s: 's3', name: 'raw PDF pages' },
            ],
            total: '13,780',
          },
          {
            label: 'Trimmed',
            parts: [
              { v: 80, s: 's1', name: 'question' },
              { v: 900, s: 's2', name: 'system prompt' },
              { v: 300, s: 's2', name: 'tool definitions' },
              { v: 600, s: 's3', name: 'history summary' },
              { v: 1300, s: 's3', name: 'relevant sections as Markdown' },
            ],
            total: '3,180',
          },
        ], { max: 13780 }),
        note('Illustrative numbers. Measure your own requests: most APIs return input token counts with every response.'),
      ],
    }),

    'pdf-modes': figure({
      title: 'The same 3-page PDF, two ways',
      subtitle: 'From the Claude PDF docs (Amazon Bedrock Converse API): text extraction only versus full visual understanding.',
      parts: [
        hbars([
          { label: 'Text extraction only', value: 1000, display: '~1,000 tokens', s: 's1' },
          { label: 'Text plus page images', value: 7000, display: '~7,000 tokens', s: 's2', note: '7x' },
        ]),
      ],
    }),

    'six-fixes': figure({
      title: 'Six leaks, six fixes',
      parts: [
        cards([
          { k: '01', title: 'Raw PDFs', sub: 'Convert to Markdown first. Attach page images only for charts.', s: 's3' },
          { k: '02', title: 'Long chat history', sub: 'Start fresh threads. Carry over a short summary.', s: 's3' },
          { k: '03', title: 'Oversized prompts', sub: 'Cut rules the model already follows. Cache the rest.', s: 's2' },
          { k: '04', title: 'Unused tools', sub: 'Send only the tools this request can use.', s: 's2' },
          { k: '05', title: 'Duplicate text', sub: 'Strip repeated headers, footers and boilerplate.', s: 's3' },
          { k: '06', title: 'Whole documents', sub: 'Retrieve the sections that answer the question.', s: 's3' },
        ], { cols: 2, h: 112 }),
      ],
    }),

    'audit-loop': figure({
      title: 'A 30-minute token audit',
      parts: [
        flow([
          { t: 'Log usage', sub: 'input and output per call' },
          { t: 'Split by part', sub: 'prompt, history, docs' },
          { t: 'Find the biggest', sub: 'fix that one first', s: 's1' },
          { t: 'Re-test answers', sub: 'same questions, same checks' },
          { t: 'Measure again', sub: 'keep it or roll it back' },
        ], { cols: 3, boxH: 84 }),
      ],
    }),
  },
};
