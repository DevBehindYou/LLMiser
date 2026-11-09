// Visual spec for M05-S1 "Check PowerPoint Speaker Notes After Conversion".
// Data: fixtures/deck-files.json, out-pricing-update, out-pdf, out-notes-pages, out-pricing-update-reviewed.

import { B, art, banner, figure, note, panels } from '../../visuals/kit.mjs';
import { checklist, compare, tree } from '../../visuals/campaign-parts.mjs';

const tick = (x, y) => `<path d="M${x} ${y}L${x + 8} ${y + 9}L${x + 23} ${y - 10}" fill="none" stroke="${B.amberD}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;
const cross = (x, y) => `<path d="M${x} ${y - 9}L${x + 18} ${y + 9}M${x + 18} ${y - 9}L${x} ${y + 9}" stroke="${B.pink}" stroke-width="4" stroke-linecap="round"/>`;
const warn = (x, y) => `<path d="M${x + 10} ${y - 12}L${x + 21} ${y + 8}L${x - 1} ${y + 8}Z" fill="${B.amber}" stroke="${B.ink}" stroke-width="1.5" stroke-linejoin="round"/>`;

const bannerArt = () => {
  let out = '';
  out += art.box(642, 46, 262, 150, { fill: '#ffffff', r: 8 });
  out += art.label(658, 82, 'New plan prices', { size: 19, font: 'Inter, sans-serif' });
  out += art.label(658, 118, '- Starter: $12', { size: 15 });
  out += art.label(658, 146, '- Team: $30', { size: 15 });
  out += art.label(658, 182, 'SLIDE 2', { size: 14, fill: '#8a8a92' });
  out += art.box(642, 208, 262, 130, { fill: '#fff6e6', stroke: B.amberD, r: 8, sw: 2 });
  out += art.label(658, 236, 'NOTES', { size: 14, fill: B.amberD });
  out += art.label(658, 266, 'Do not quote Team', { size: 16, weight: 700 });
  out += art.label(658, 292, 'pricing to schools', { size: 16, weight: 700 });
  out += art.label(658, 318, 'yet.', { size: 16, weight: 700 });
  const rows = [['.pptx', 'note kept', tick], ['slides PDF', 'note missing', cross], ['notes PDF', 'unlabeled', warn]];
  rows.forEach(([route, result, mark], i) => {
    const y = 96 + i * 104;
    out += art.label(936, y, route, { size: 20 });
    out += art.label(936, y + 30, result, { size: 15, fill: '#8a8a92' });
    out += mark(1120, y - 4);
  });
  return out;
};

export default {
  banner: banner({
    id: 'notes-banner',
    kicker: 'SPEAKER NOTES',
    hook: ['The caveat was', 'in the notes.'],
    sub: 'one deck, three routes',
    art: bannerArt,
  }),
  figures: {
    'notes-inventory': figure({
      title: 'Which slides have notes?',
      subtitle: 'The synthetic pricing deck, sorted by what each note is for.',
      parts: [
        tree([
          { t: '1  Pricing Update', mark: 'info', note: 'NO NOTES' },
          { t: '2  New plan prices', note: '3 PARAGRAPHS' },
          { t: 'Starts 1 March', d: 1, note: 'CONTEXT' },
          { t: 'Existing customers keep price', d: 1, note: 'CONTEXT' },
          { t: "Don't quote Team to schools", d: 1, mark: 'keep', note: 'MUST-READ' },
          { t: '3  Customer impact', mark: 'info', note: 'NO NOTES' },
          { t: '4  Rollout', mark: 'info', note: 'SPACES ONLY' },
        ]),
        note('Notes summarized. Slide 2 holds the caveat the slide itself leaves out.'),
      ],
    }),
    'route-results': figure({
      title: 'One deck, three routes',
      subtitle: 'What each converted file kept.',
      parts: [
        compare({
          headers: ['CHECK', '.PPTX', 'SLIDES PDF', 'NOTES PDF'],
          widths: [160, 124, 132, 136],
          size: 12.5,
          rows: [
            { label: 'Slide markers', cells: [{ t: 'kept' }, { t: 'none', ok: false }, { t: 'none', ok: false }] },
            { label: 'Slide 2 notes', cells: [{ t: 'kept' }, { t: 'missing', ok: false }, { t: 'present', ok: true }] },
            { label: 'Labeled as notes', cells: [{ t: 'yes' }, { t: 'n/a', ok: null }, { t: 'no', ok: false }] },
            { label: 'Titles as headings', cells: [{ t: 'yes' }, { t: 'no', ok: false }, { t: 'no', ok: false }] },
            { label: 'Stray page numbers', cells: [{ t: 'none' }, { t: 'none', ok: true }, { t: '2 and 4', ok: false }] },
          ],
        }),
        note('PDFs exported with LibreOffice Impress. Local run, 9 November 2026.'),
      ],
    }),
    'slide2-routes': figure({
      title: 'Slide 2, three ways',
      subtitle: 'Converted text, long lines shortened. Notes in bold.',
      parts: [
        panels([
          {
            title: 'From the .pptx',
            tag: 'NOTES KEPT',
            s: 's1',
            lines: [
              { t: '# New plan prices', k: 'dim' },
              { t: 'Starter: $12 per user per month', k: 'dim' },
              { t: 'Team: $30 per user per month', k: 'dim' },
              { t: '### Notes:', k: 'head' },
              { t: 'New prices take effect on 1 March.', k: 'head' },
              { t: 'Existing customers keep their current...', k: 'head' },
              { t: 'Do not quote Team pricing to schools yet...', k: 'head' },
            ],
          },
          {
            title: 'From the slides-only PDF',
            tag: 'NO NOTES',
            s: 's3',
            lines: [
              { t: 'New plan prices', k: 'dim' },
              { t: '• Starter: $12 per user per month', k: 'dim' },
              { t: '• Team: $30 per user per month', k: 'dim' },
            ],
          },
          {
            title: 'From the notes-pages PDF',
            tag: 'UNLABELED',
            lines: [
              { t: 'New plan prices', k: 'dim' },
              { t: '• Starter: $12 per user per month', k: 'dim' },
              { t: '• Team: $30 per user per month', k: 'dim' },
              { t: 'New prices take effect on 1 March.', k: 'head' },
              { t: 'Existing customers keep their current price', k: 'head' },
              { t: 'until renewal.', k: 'head' },
              { t: 'Do not quote Team pricing to schools yet.', k: 'head' },
              { t: 'Education terms are still being negotiated.', k: 'head' },
              { t: '2' },
            ],
          },
        ]),
      ],
    }),
    'slide2-before-after': figure({
      title: 'Move the caveat onto the slide',
      subtitle: 'Slide 2 converted from the original and the reviewed deck.',
      parts: [
        panels([
          {
            title: 'Original deck',
            tag: 'IN NOTES ONLY',
            s: 's3',
            lines: [
              { t: '# New plan prices', k: 'dim' },
              { t: 'Starter: $12 per user per month' },
              { t: 'Team: $30 per user per month' },
              { t: '### Notes:', k: 'dim' },
              { t: '...', k: 'dim' },
              { t: 'Do not quote Team pricing to schools yet...' },
            ],
          },
          {
            title: 'Reviewed copy',
            tag: 'ON THE SLIDE',
            s: 's1',
            lines: [
              { t: '# New plan prices', k: 'dim' },
              { t: 'Starter: $12 per user per month' },
              { t: 'Team: $30 per user per month' },
              { t: 'Starts 1 March. Existing customers keep...', k: 'head' },
              { t: 'Team pricing for schools is not final yet.', k: 'head' },
              { t: '### Notes:', k: 'dim' },
              { t: 'Education terms are being negotiated...' },
            ],
          },
        ]),
      ],
    }),
    'notes-checklist': figure({
      title: 'Speaker notes pass',
      subtitle: 'Before you share a converted deck.',
      parts: [
        checklist([
          { t: 'Every slide with notes listed' },
          { t: 'Must-read notes marked' },
          { t: 'The .pptx converted, not a PDF export' },
          { t: 'Each note found under its own slide' },
          { t: 'Must-read notes moved onto the slide or into the message' },
          { t: 'Presenter-only notes removed from the sharing copy' },
        ]),
        note('One synthetic deck. PDFs exported with LibreOffice Impress.', { s: 's3' }),
      ],
    }),
  },
};
