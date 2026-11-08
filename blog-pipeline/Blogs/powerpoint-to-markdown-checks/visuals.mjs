// Visual spec for M05 "8 Checks When Converting PowerPoint to Markdown".
// Render privately: node blog-pipeline/scripts/campaign/render-private.mjs powerpoint-to-markdown-checks
// Content comes from fixtures/out/q3-review.Standard.md.

import { B, art, banner, decision, figure, note, panels } from '../../visuals/kit.mjs';
import { checklist, markLegend, tree } from '../../visuals/campaign-parts.mjs';

const bannerArt = () => {
  let out = '';
  [0, 1, 2].forEach((i) => {
    const x = 640 + i * 18;
    const y = 70 + i * 62;
    out += art.box(x, y, 210, 118, { fill: '#ffffff', r: 8, sw: 2 });
    out += `<rect x="${x + 14}" y="${y + 16}" width="120" height="12" rx="4" fill="${B.ink}"/>`;
    out += `<rect x="${x + 14}" y="${y + 40}" width="160" height="8" rx="4" fill="${B.lav}"/>`;
    out += `<rect x="${x + 14}" y="${y + 58}" width="130" height="8" rx="4" fill="${B.lav}"/>`;
    out += art.label(x + 186, y + 104, String(i + 1), { size: 20, anchor: 'middle', fill: B.amberD });
  });
  out += art.arrow(890, 200, 942, 200, { stroke: B.ink });
  out += art.page(950, 60, 200, 280, { lines: 0, fill: B.paper });
  out += art.label(962, 112, '<!-- Slide number: 3 -->', { size: 12, fill: '#7a7a85', weight: 500 });
  out += art.label(966, 148, '# Results', { size: 20, fill: B.amberD });
  out += art.label(966, 182, 'Signups grew', { size: 15, weight: 500 });
  out += art.label(966, 206, 'Strongest in Sep', { size: 15, weight: 500 });
  out += art.label(966, 248, '### Notes:', { size: 17, fill: B.violet });
  out += art.label(966, 276, 'Caveat: 400', { size: 15, weight: 500 });
  out += art.label(966, 298, 'test accounts', { size: 15, weight: 500 });
  return out;
};

export default {
  banner: banner({
    id: 'pptx-banner',
    kicker: 'SLIDES PREP',
    hook: ['Read the deck', 'as text first.'],
    sub: '8 checks for PowerPoint to Markdown',
    art: bannerArt,
  }),
  figures: {
    'deck-to-markdown': figure({
      title: 'Eight slides, as converted',
      subtitle: 'What happened to each slide of the synthetic deck.',
      parts: [
        tree([
          { t: '1 Title slide', mark: 'keep', note: 'TITLE KEPT' },
          { t: '2 Section: Results', mark: 'sent', note: 'EMPTY HEADING' },
          { t: '3 Results, bullets', mark: 'keep', note: 'NOTES KEPT' },
          { t: 'nested bullet levels', d: 1, mark: 'sent', note: 'FLATTENED' },
          { t: '4 Native chart', mark: 'keep', note: 'DATA TABLE' },
          { t: 'axis titles', d: 1, mark: 'skip', note: 'MISSING' },
          { t: '5 Picture only', mark: 'sent', note: 'ALT TEXT ONLY' },
          { t: '6 Table + units box', mark: 'keep', note: 'TABLE KEPT' },
          { t: '7 Two text boxes', mark: 'keep', note: 'LEFT TO RIGHT' },
          { t: '8 Hidden, old numbers', mark: 'sent', note: 'CONVERTED ANYWAY' },
        ], { title: 'q3-review.pptx, local run' }),
        markLegend(['keep', 'sent', 'skip']),
      ],
    }),
    'chart-output': figure({
      title: 'A chart becomes a table',
      subtitle: 'Slide 4 as converted, and what did not come with it.',
      parts: [
        panels([
          {
            title: 'In the Markdown',
            tag: 'VALUES KEPT',
            s: 's1',
            lines: [
              { t: '### Chart: Signups per month (thousands)', k: 'head' },
              { t: '| Category | Signups (thousands) |' },
              { t: '| July | 4.2 |' },
              { t: '| August | 5.1 |' },
              { t: '| September | 7.8 |' },
            ],
          },
          {
            title: 'Not in the Markdown',
            tag: 'ADD AS TEXT',
            s: 's3',
            lines: [
              { t: 'chart type: clustered columns', k: 'dim' },
              { t: 'axis title: Month', k: 'dim' },
              { t: 'takeaway: rising every month', k: 'dim' },
            ],
          },
        ]),
      ],
    }),
    'picture-slide-decision': figure({
      title: 'Is the meaning in a picture?',
      subtitle: 'A picture converts to its alt text and a file reference, nothing more.',
      parts: [
        decision({
          start: { t: 'A slide in the deck' },
          question: 'Meaning lives in a picture?',
          yes: { t: 'Describe it in words', sub: 'title, values, takeaway', s: 's1' },
          no: { t: 'Check the text', sub: 'title, notes, bullet levels' },
          after: { t: 'Compare with the deck', sub: 'slide by slide' },
        }),
      ],
    }),
    'deck-checklist': figure({
      title: 'Before you share the Markdown',
      subtitle: 'With the original deck open beside it.',
      parts: [
        checklist([
          { t: 'No hidden or backup slides', sub: 'Hidden slides convert without a mark.' },
          { t: 'Every slide has a unique title' },
          { t: 'Sub-points still make sense without indents' },
          { t: 'Speaker notes are edited for sharing' },
          { t: 'Chart units and takeaways are written as text' },
          { t: 'Image-only slides are described' },
          { t: 'Table units sit in the headers' },
        ]),
        note('Pictures in slides are not read as text.', { s: 's3' }),
      ],
    }),
  },
};
