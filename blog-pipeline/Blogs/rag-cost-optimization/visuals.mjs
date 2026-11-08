// Visuals for "The Real Cost of RAG: Embeddings, Tokens and Re-Ranking" (LLMiser)
import { B, art, banner, cards, figure, flow, hbars, legend, note, tiles } from '../../visuals/kit.mjs';

const ID = 'rcr';

export default {
  banner: banner({
    id: `${ID}-banner`,
    kicker: 'RAG COST',
    hook: ['Embeddings are', 'the cheap part.'],
    sub: 'the bill grows at question time',
    art: () => {
      let out = '';
      const steps = [
        [660, 110, 'parse', B.lav, '$'],
        [800, 110, 'embed', B.lav, '$'],
        [940, 110, 'store', B.lav, '$'],
        [660, 250, 'retrieve', B.pink, '$$'],
        [800, 250, 'rerank', B.pink, '$$'],
        [940, 250, 'generate', B.pink, '$$$$'],
      ];
      steps.forEach(([x, y, t, c, cost], i) => {
        out += art.box(x, y, 118, 64, { fill: B.paper, r: 12 });
        out += art.label(x + 59, y + 38, t, { size: 18, anchor: 'middle' });
        out += art.box(x + 66, y - 18, 64, 30, { fill: c, r: 15, sw: 2 }) + art.label(x + 98, y + 3, cost, { size: 16, anchor: 'middle' });
        if (i % 3 !== 2) out += art.arrow(x + 122, y + 32, x + 136, y + 32, { sw: 2.5, head: 10 });
      });
      out += art.label(1072, 152, 'once', { size: 20, weight: 700 });
      out += art.label(1072, 292, 'every', { size: 20, weight: 700 }) + art.label(1072, 316, 'question', { size: 20, weight: 700 });
      return out;
    },
  }),

  figures: {
    'rag-cost-map': figure({
      title: 'Where a RAG system spends',
      subtitle: 'The top row runs once per document. The bottom rows run for every question.',
      parts: [
        legend([
          { s: 's2', name: 'Once per document' },
          { s: 's3', name: 'Every question' },
        ]),
        flow([
          { t: 'Parse', sub: 'PDF to text', s: 's2' },
          { t: 'Chunk', sub: 'split by section', s: 's2' },
          { t: 'Embed and store', sub: 'vectors + metadata', s: 's2' },
          { t: 'Retrieve', sub: 'top-K search', s: 's3' },
          { t: 'Rerank', sub: 'score candidates', s: 's3' },
          { t: 'Build context', sub: 'pick what fits', s: 's3' },
          { t: 'Input tokens', sub: 'context + prompt', s: 's3' },
          { t: 'Output tokens', sub: 'the answer', s: 's3' },
        ], { cols: 3, boxH: 74 }),
      ],
    }),

    'once-vs-monthly': figure({
      title: 'One-time tokens vs monthly tokens',
      subtitle: 'A 2,000-page corpus answering 10,000 questions a month with 8,000 tokens of context each.',
      parts: [
        hbars([
          { label: 'Embed the whole corpus, once', value: 1.33, display: '1.33M tokens', s: 's2' },
          { label: 'Context sent to the model, per month', value: 80, display: '80M tokens', s: 's3', note: '60x' },
        ]),
        note('About 667 tokens per page as Markdown (rule of thumb). 80M input tokens at Sonnet 5.5\'s $2 per million is $160 a month, before output.'),
      ],
    }),

    'context-per-question': figure({
      title: 'Context per question',
      subtitle: 'Fewer, smaller, cleaner chunks change the per-question bill the most.',
      parts: [
        hbars([
          { label: 'Top 20 chunks of 400 tokens', value: 8000, s: 's3' },
          { label: 'Reranked to the top 5', value: 2000, s: 's2', note: '-75%' },
          { label: 'Top 5 of 300-token clean chunks', value: 1500, s: 's1', note: '-81%' },
        ]),
        note('Illustrative sizes. Whether 5 chunks are enough depends on your questions: test recall before you cut.'),
      ],
    }),

    'contextual-retrieval': figure({
      title: 'Better retrieval, fewer failures',
      subtitle: 'Drop in top-20 retrieval failure rate in Anthropic\'s Contextual Retrieval tests (2024).',
      parts: [
        tiles([
          { big: '-35%', label: 'contextual embeddings', s: 's2' },
          { big: '-49%', label: '+ contextual keyword search', s: 's2' },
          { big: '-67%', label: '+ reranking', s: 's1' },
        ]),
        note('One-time cost to add context to each chunk: $1.02 per million document tokens, with prompt caching.'),
      ],
    }),

    'where-to-optimize': figure({
      title: 'Where optimization pays',
      subtitle: 'Ranked by how often the cost repeats.',
      parts: [
        cards([
          { k: '01', title: 'Context size', sub: 'Billed on every question. Set a hard token budget.', s: 's3' },
          { k: '02', title: 'Top-K', sub: 'Retrieve wide, send narrow.', s: 's3' },
          { k: '03', title: 'Reranking', sub: 'Costs a call, saves context tokens.', s: 's2' },
          { k: '04', title: 'Parse quality', sub: 'Clean Markdown means fewer junk chunks.', s: 's2' },
          { k: '05', title: 'Caching', sub: 'Cache the stable prompt prefix.', s: 's1' },
          { k: '06', title: 'Skip RAG', sub: 'Under ~200,000 tokens, send it all.', s: 's1' },
        ], { cols: 2, h: 100 }),
      ],
    }),
  },
};
