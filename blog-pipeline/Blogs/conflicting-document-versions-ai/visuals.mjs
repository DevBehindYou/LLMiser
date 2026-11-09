// Visual spec for M12 "Why Two Versions of a Document Can Confuse AI".
// Render privately: node blog-pipeline/scripts/campaign/render-private.mjs conflicting-document-versions-ai
// Data: fixtures/out-v1-*, out-v2-* and fixtures/inputs.json.

import { B, art, banner, decision, figure, note } from '../../visuals/kit.mjs';
import { checklist, columns, compare } from '../../visuals/campaign-parts.mjs';

const page = (x, rot, days, cap, name) => {
  let out = art.page(x, 62, 220, 260, { lines: 0, fill: '#ffffff', rot });
  out += `<g transform="rotate(${rot} ${x + 110} 192)">`;
  out += art.label(x + 18, 104, 'Travel Policy', { size: 19 });
  out += `<rect x="${x + 18}" y="122" width="170" height="7" rx="3.5" fill="${B.lav}"/>`;
  out += art.box(x + 14, 142, 190, 40, { fill: '#fff4d6', stroke: B.amberD, r: 8, sw: 2 });
  out += art.label(x + 24, 168, `receipts: ${days} days`, { size: 16 });
  out += art.label(x + 24, 210, `hotel cap: ${cap}`, { size: 15, weight: 500 });
  out += `<rect x="${x + 18}" y="230" width="150" height="7" rx="3.5" fill="${B.lav}"/>`;
  out += art.label(x + 18, 300, name, { size: 12, fill: '#7a7a85', weight: 500 });
  return `${out}</g>`;
};

const bannerArt = () => page(652, -3, 30, 180, 'travel-policy.docx')
  + page(912, 3, 14, 200, 'travel-policy (1).docx')
  + art.label(893, 210, '?', { size: 64, anchor: 'middle', fill: B.pink });

export default {
  banner: banner({
    id: 'ver-banner',
    kicker: 'SOURCE VERSIONS',
    hook: ['Two versions,', 'one answer?'],
    sub: 'keep dates and provenance in the text',
    art: bannerArt,
  }),
  figures: {
    'version-diff': figure({
      title: 'Almost the same document',
      subtitle: 'Two converted policy versions, compared.',
      parts: [
        compare({
          headers: ['', 'JANUARY FILE', 'JULY FILE'],
          widths: [150, 196, 206],
          size: 12.5,
          rows: [
            { label: 'File name', cells: [{ t: 'travel-policy.docx' }, { t: 'travel-policy (1).docx' }] },
            { label: 'Title', cells: [{ t: 'Travel Policy' }, { t: 'Travel Policy' }] },
            { label: 'Effective date', cells: [{ t: 'missing' }, { t: 'missing', ok: false }] },
            { label: 'Receipts', cells: [{ t: '30 days' }, { t: '14 days', ok: false }] },
            { label: 'Hotel cap', cells: [{ t: '180 USD' }, { t: '200 USD', ok: false }] },
            { label: 'Similarity', cells: [{ t: '0.867 (difflib)' }, { t: 'same value' }] },
          ],
        }),
        note('Crosses mark what a reader needs and the text does not settle.'),
      ],
    }),
    'provenance-line': figure({
      title: 'One line of provenance',
      subtitle: 'The July file, as converted, and with a provenance line added.',
      parts: [
        columns({
          left: {
            title: 'As converted (Clean)',
            s: 's3',
            lines: ['\\# Travel Policy', '', '## Expenses', 'Submit receipts within', '14 days of the trip.', '', '! no date or version', '! no source'],
          },
          right: {
            title: 'With provenance',
            s: 's1',
            lines: ['+ Version 2, effective', '+ 2026-07-01. Replaces', '+ the January policy.', '+ Source: HR handbook', '\\# Travel Policy', '## Expenses', 'Submit receipts within', '14 days of the trip.'],
          },
        }),
        note('Illustration: the provenance line is an example, not LLMiser output.'),
      ],
    }),
    'superseded-or-scoped': figure({
      title: 'Replaced, or both valid?',
      subtitle: 'The fix depends on what kind of conflict it is.',
      parts: [
        decision({
          start: { t: 'Two sources disagree' },
          question: 'One replaces the other?',
          yes: { t: 'Use the current one', sub: 'label it with its date', s: 's1' },
          no: { t: 'Label each scope', sub: 'team, region, product', s: 's2' },
          after: { t: 'Still unclear?', sub: 'ask the document owner' },
        }),
      ],
    }),
    'version-checklist': figure({
      title: 'Before mixed sources meet a prompt',
      subtitle: 'Check the facts, not just the files.',
      parts: [
        checklist([
          { t: 'Find the facts that differ between versions' },
          { t: 'Add version, effective date and source to each' },
          { t: 'Keep only current or clearly scoped sources' },
          { t: 'Remove superseded excerpts and notes' },
          { t: 'Never deduplicate by similarity alone' },
          { t: 'Test with a question whose answer changed' },
        ]),
        note('LLMiser converts body text. It does not pick the current version.', { s: 's3' }),
      ],
    }),
  },
};
