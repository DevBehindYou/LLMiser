// Visual spec for M02 "9 OCR Checks Before You Send Scanned Text to AI".
// Render privately: node blog-pipeline/scripts/campaign/render-private.mjs ocr-checks-before-ai
// Field values come from fixtures/truth.json and the recorded outputs in fixtures/out-*.

import { B, F, art, banner, decision, figure, flow, note } from '../../visuals/kit.mjs';
import { checklist, compare } from '../../visuals/campaign-parts.mjs';

const bannerArt = () => {
  let out = art.page(640, 46, 280, 308, { lines: 9, rot: -2, lineColor: '#d6d3cc', fill: '#f4f1ea' });
  out += art.box(662, 170, 236, 56, { fill: '#ffffff', r: 8, sw: 2 });
  out += art.label(680, 208, 'PO 10O5-B', { size: 30 });
  out += `<rect x="768" y="179" width="22" height="38" rx="4" fill="none" stroke="${B.amberD}" stroke-width="3"/>`;
  out += art.label(779, 248, 'letter O', { size: 15, anchor: 'middle', fill: B.amberD });
  out += art.arrow(928, 198, 988, 198, { stroke: B.ink });
  out += art.box(996, 170, 158, 56, { fill: B.rose, stroke: B.pink, r: 10 });
  out += art.label(1075, 208, 'PO 1005-B', { size: 26, anchor: 'middle', fill: B.ink });
  out += `<path d="M1016 250L1034 268M1034 250L1016 268" stroke="${B.pink}" stroke-width="4" stroke-linecap="round"/>`;
  out += art.label(1044, 266, 'read as zero', { size: 16, fill: B.ink, weight: 600 });
  return out;
};

export default {
  banner: banner({
    id: 'ocrc-banner',
    kicker: 'OCR CHECKS',
    hook: ['Fluent OCR', "isn't proof."],
    sub: '9 checks for scanned text',
    art: bannerArt,
  }),
  figures: {
    'nine-checks': figure({
      title: 'Nine checks, in order',
      subtitle: 'Coverage first, then the characters, then structure, then a final side-by-side pass.',
      parts: [
        flow([
          { t: 'Text present', sub: 'no empty pages' },
          { t: 'Pages, order', sub: 'landmarks in order' },
          { t: 'Orientation', sub: 'sideways pages' },
          { t: 'Small print', sub: 'terms, footnotes' },
          { t: 'Numbers', sub: 'decimals, totals', s: 's3' },
          { t: 'Dates and IDs', sub: 'O versus 0', s: 's3' },
          { t: 'Reading order', sub: 'labels and values' },
          { t: 'Tables', sub: 'every column', s: 's3' },
          { t: 'Side by side', sub: 'fields that matter', s: 's1' },
        ], { cols: 3, boxH: 70, gapY: 30 }),
        note('Highlighted checks caught real errors in our synthetic test.'),
      ],
    }),
    'field-comparison': figure({
      title: 'What recognition returned',
      subtitle: 'Synthetic invoice, LLMiser recognition code, local run on 8 Nov 2026.',
      parts: [
        compare({
          headers: ['FIELD', 'ORIGINAL', 'CLEAN SCAN', 'DEGRADED'],
          widths: [102, 150, 150, 150],
          rows: [
            { label: 'Invoice', cells: [{ t: 'INV-00123' }, { t: 'INV-00123', ok: true }, { t: 'anv.o0123-', ok: false }] },
            { label: 'Customer', cells: [{ t: 'C0O1-7781', u: [2] }, { t: 'C0O1-7781', ok: true, u: [2] }, { t: '-c001- 7781', ok: false }] },
            { label: 'Order', cells: [{ t: 'PO 10O5-B', u: [5] }, { t: 'PO 1005-B', ok: false }, { t: 'PO 1005-8', ok: false }] },
            { label: 'Issued', cells: [{ t: '03/04/2026' }, { t: '03/04/2026', ok: true }, { t: '03/04/2026', ok: true }] },
            { label: 'Qty col.', cells: [{ t: '12 / 3 / 1' }, { t: 'missing', ok: false }, { t: 'missing', ok: false }] },
            { label: 'Unit', cells: [{ t: '10.50' }, { t: '10.50', ok: true }, { t: '40. 50', ok: false }] },
            { label: 'Total', cells: [{ t: '4,167.51' }, { t: '4,167.51', ok: true }, { t: '4,167.51 alone', ok: null }] },
            { label: 'Terms', cells: [{ t: '1.5% ... 05-17' }, { t: 'exact', ok: true }, { t: '1:5 ... 0517', ok: false }] },
          ],
        }),
        note('Underlined: the letter O, not zero. "Missing": not in the output at all. "Alone": right value, label lost.'),
      ],
    }),
    'verify-decision': figure({
      title: 'Where to spend review time',
      subtitle: 'Check every field a decision depends on. Spot-check the rest.',
      parts: [
        decision({
          start: { t: 'A recognized field' },
          question: 'Decision depends on it?',
          yes: { t: 'Compare each character', sub: 'amounts, IDs, dates, names', s: 's1' },
          no: { t: 'Spot-check a sample', sub: 'body text, headings' },
          after: { t: 'Still unsure?', sub: 'mark it [unreadable in scan]', s: 's3' },
        }),
      ],
    }),
    'final-checklist': figure({
      title: 'Before the text goes in a prompt',
      subtitle: 'Six quick confirmations against the original scan.',
      parts: [
        checklist([
          { t: 'Every page has text, or a stated reason it has none' },
          { t: 'Recognized page labels appear in the right order' },
          { t: 'Amounts add up', sub: 'Subtotal plus tax equals the total.' },
          { t: 'IDs and dates match the original exactly', sub: 'Watch O and 0, S and 5, and day/month order.' },
          { t: 'Every table column survived' },
          { t: 'Unreadable fields are flagged, not guessed' },
        ]),
        note('Recognition is set up for English printed text. Read other languages and handwriting in full.', { s: 's3' }),
      ],
    }),
  },
};
