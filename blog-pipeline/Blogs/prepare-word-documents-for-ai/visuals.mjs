// Visual spec for M04 "6 Ways to Prepare Word Documents for AI".
// Render privately: node blog-pipeline/scripts/campaign/render-private.mjs prepare-word-documents-for-ai
// Lines come from fixtures/out/refund-policy.Standard.md.

import { B, art, banner, decision, figure, note, panels } from '../../visuals/kit.mjs';
import { checklist, columns } from '../../visuals/campaign-parts.mjs';

const bannerArt = () => {
  let out = art.page(642, 48, 300, 304, { lines: 0, fill: '#ffffff' });
  out += art.label(664, 100, 'Eligibility', { size: 22, font: "var(--font-inter,'Inter'),Inter,sans-serif" });
  out += art.label(664, 146, 'Refund within', { size: 19, weight: 500 });
  out += art.label(664, 182, '14 days', { size: 19, fill: B.pink, weight: 600 });
  out += `<line x1="662" y1="176" x2="748" y2="176" stroke="${B.pink}" stroke-width="2.5"/>`;
  out += art.label(764, 182, '30 days', { size: 19, fill: B.violet, weight: 700 });
  out += `<line x1="764" y1="188" x2="850" y2="188" stroke="${B.violet}" stroke-width="2.5"/>`;
  out += art.box(668, 222, 250, 86, { fill: '#fff4d6', stroke: B.amberD, r: 10, sw: 2 });
  out += art.label(684, 252, 'Comment:', { size: 16, fill: B.amberD });
  out += art.label(684, 280, 'not approved yet', { size: 17 });
  out += art.arrow(952, 180, 1002, 180, { stroke: B.ink });
  out += art.box(1008, 140, 146, 80, { fill: B.rose, stroke: B.pink, r: 10 });
  out += art.label(1081, 174, 'within', { size: 19, anchor: 'middle' });
  out += art.label(1081, 202, '30 days', { size: 21, anchor: 'middle' });
  out += art.label(1081, 252, 'no mark,', { size: 15, anchor: 'middle', weight: 600 });
  out += art.label(1081, 274, 'no comment', { size: 15, anchor: 'middle', weight: 600 });
  return out;
};

export default {
  banner: banner({
    id: 'wdoc-banner',
    kicker: 'WORD PREP',
    hook: ['Pending in Word.', 'Final in text.'],
    sub: '6 fixes before you convert',
    art: bannerArt,
  }),
  figures: {
    'docx-to-markdown': figure({
      title: 'What the Word file became',
      subtitle: 'Synthetic refund policy, LLMiser Word conversion, local run.',
      parts: [
        columns({
          left: {
            title: 'In Word',
            lines: [
              '# REAL HEADINGS',
              'Heading 1, Heading 2',
              '# TRACKED CHANGE',
              '14 days -> 30 days',
              'comment: not approved',
              '# FAKE HEADING',
              'Exceptions, bold 18 pt',
              '# NESTED LIST',
              '1. Final-sale items',
              '   - Clearance labels',
              '2. Gift cards',
              '# ALSO',
              'merged table header',
              'chart, footer "draft v3"',
            ],
          },
          right: {
            title: 'In the Markdown',
            s: 's3',
            lines: [
              '# REAL HEADINGS',
              '+ # and ## headings',
              '# TRACKED CHANGE',
              '! within 30 days',
              '! comment missing',
              '# FAKE HEADING',
              '! **Exceptions**',
              '# NESTED LIST',
              '1. Final-sale items',
              '! * Clearance labels',
              '! 1. Gift cards',
              '# ALSO',
              '! empty header row',
              '! alt text, no footer',
            ],
          },
        }),
        note('Triangles mark output that changed meaning. Only real heading styles came through unchanged.'),
      ],
    }),
    'list-table-output': figure({
      title: 'The list and table, as converted',
      subtitle: 'Exact lines from the output. Nesting and the merged header are gone.',
      parts: [
        panels([
          {
            title: 'Exceptions list',
            tag: 'NESTING LOST',
            s: 's3',
            lines: [
              { t: '1. Final-sale items' },
              { t: '* Clearance labels' },
              { t: '* Bundles opened in store' },
              { t: '1. Gift cards', k: 'head' },
              { t: '2. Digital downloads' },
            ],
          },
          {
            title: 'Refund table',
            tag: 'EMPTY HEADER',
            s: 's3',
            lines: [
              { t: '|  |  |  |', k: 'head' },
              { t: '| --- | --- | --- |', k: 'dim' },
              { t: '| Item condition | Refund | |' },
              { t: '| Unopened | 100% | within 30 days |' },
              { t: '| Opened | 80% | within 14 days |' },
            ],
          },
        ]),
        note('Highlighted lines: numbering restarted at 1, and the header row is empty.'),
      ],
    }),
    'tracked-change-decision': figure({
      title: 'Decide every change first',
      subtitle: 'The converted text cannot show what was still pending.',
      parts: [
        decision({
          start: { t: 'A tracked change or comment' },
          question: 'Is it approved?',
          yes: { t: 'Accept it', sub: 'in a sharing copy', s: 's1' },
          no: { t: 'Reject it', sub: 'or say so in plain text', s: 's3' },
          after: { t: 'Convert the copy', sub: 'not the working draft' },
        }),
      ],
    }),
    'word-checklist': figure({
      title: 'Read the Markdown once',
      subtitle: 'Six things to confirm before you share the converted text.',
      parts: [
        checklist([
          { t: 'Section titles are Markdown headings' },
          { t: 'Lists keep their nesting and numbering' },
          { t: 'Each table has one clear header row' },
          { t: 'No pending changes or unanswered comments' },
          { t: 'Images and charts are described in words' },
          { t: 'Draft or confidential status is stated in the body' },
        ]),
        note('Converted text cannot show what was pending in Word.', { s: 's3' }),
      ],
    }),
  },
};
