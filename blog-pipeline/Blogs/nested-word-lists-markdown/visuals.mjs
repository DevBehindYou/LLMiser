// Visual spec for M04-S2 "Check Nested Word Lists in Markdown Output".
// Data: fixtures/steps-files.json, wp-render/*.pdf (displayed numbering), out-*/steps-*.Standard.md.

import { B, art, banner, figure, note } from '../../visuals/kit.mjs';
import { checklist, columns, compare, tree } from '../../visuals/campaign-parts.mjs';

const cross = (x, y) => `<path d="M${x} ${y - 9}L${x + 18} ${y + 9}M${x + 18} ${y - 9}L${x} ${y + 9}" stroke="${B.pink}" stroke-width="4" stroke-linecap="round"/>`;

const listCard = (x, title, lines) => {
  let out = art.box(x, 50, 248, 296, { fill: '#ffffff', r: 12 });
  out += art.label(x + 16, 82, title, { size: 14, fill: '#8a8a92' });
  lines.forEach(([t, color], i) => {
    out += art.label(x + 16, 130 + i * 52, t, { size: 17, fill: color || B.ink, weight: color ? 700 : 500 });
  });
  return out;
};

const bannerArt = () => listCard(642, 'IN WORD', [
  ['1. Pack the device'], ['2. Print the label'], ['Note: labels expire', '#8a8a92'], ['3. Drop off parcel', B.amberD],
]) + art.arrow(896, 198, 914, 198, { sw: 2.5, head: 9 })
  + listCard(920, 'MARKDOWN', [
    ['1. Pack the device'], ['2. Print the label'], ['Note: labels expire', '#8a8a92'], ['1. Drop off parcel', B.pink],
  ]) + cross(1130, 282);

export default {
  banner: banner({
    id: 'lists-banner',
    kicker: 'WORD LISTS',
    hook: ['Step 3 became', 'step 1.'],
    sub: 'one note, one restart',
    art: bannerArt,
  }),
  figures: {
    'list-outline': figure({
      title: 'Outline the lists first',
      subtitle: 'The original procedure as a word processor showed it.',
      parts: [
        tree([
          { t: 'Return your equipment', mark: 'info', note: 'HEADING' },
          { t: '1. Pack the device' },
          { t: 'a. Remove the SIM card', d: 1 },
          { t: 'b. Wipe personal files', d: 1 },
          { t: '- Photos', d: 2 },
          { t: '- Downloads', d: 2 },
          { t: '2. Print the return label' },
          { t: 'Note: labels expire...', note: 'NOT A LIST ITEM' },
          { t: '3. Drop off the parcel', note: 'CONTINUES' },
          { t: 'After drop-off', mark: 'info', note: 'HEADING' },
          { t: '1. Check the email', note: 'RESTARTS' },
          { t: '2. Keep the receipt' },
          { t: "Items we can't take back", mark: 'info', note: 'HEADING' },
          { t: '1. Final-sale items', note: 'LIST NUMBER' },
          { t: '- Clearance labels', d: 1, note: 'LIST BULLET 2' },
          { t: '- Opened bundles', d: 1, note: 'LIST BULLET 2' },
          { t: '2. Gift cards', note: 'LIST NUMBER' },
        ], { rowH: 23 }),
        note('Numbering as LibreOffice displayed the original file.'),
      ],
    }),
    'list-results': figure({
      title: 'Item by item',
      subtitle: 'Displayed numbering against the converted Markdown.',
      parts: [
        compare({
          headers: ['ITEM', 'IN WORD', 'MARKDOWN'],
          widths: [196, 160, 196],
          size: 12.5,
          rows: [
            { label: 'Pack the device', cells: [{ t: '1.' }, { t: '1.', ok: true }] },
            { label: 'Remove the SIM card', cells: [{ t: 'a. under 1' }, { t: '1. under 1', ok: null }] },
            { label: 'Photos, Downloads', cells: [{ t: 'bullets under b' }, { t: 'under 2', ok: true }] },
            { label: 'Print the return label', cells: [{ t: '2.' }, { t: '2.', ok: true }] },
            { label: 'Drop off the parcel', cells: [{ t: '3.' }, { t: '1.', ok: false }] },
            { label: 'Check the email', cells: [{ t: '1. (new list)' }, { t: '1.', ok: true }] },
            { label: 'Clearance labels', cells: [{ t: 'bullet under 1' }, { t: 'top level', ok: false }] },
            { label: 'Gift cards', cells: [{ t: '2.' }, { t: '1.', ok: false }] },
          ],
        }),
        note('Nesting kept, letters became numbers (dash). Local run, 9 November 2026.'),
      ],
    }),
    'before-after': figure({
      title: 'Original and reviewed copy',
      subtitle: 'Converted Markdown for the two problem spots.',
      parts: [
        columns({
          left: {
            title: 'Original',
            s: 's3',
            lines: [
              '2. Print the return label',
              'Note: labels expire...',
              '! 1. Drop off the parcel',
              "# ITEMS WE CAN'T TAKE BACK",
              '1. Final-sale items',
              '! * Clearance labels',
              '! * Opened bundles',
              '! 1. Gift cards',
            ],
          },
          right: {
            title: 'Reviewed copy',
            s: 's1',
            lines: [
              '2. Print the return label.',
              '   Labels expire after 7...',
              '+ 3. Drop off the parcel',
              "# ITEMS WE CAN'T TAKE BACK",
              '1. Final-sale items',
              '+    * Clearance labels',
              '+    * Opened bundles',
              '+ 2. Gift cards',
            ],
          },
        }),
      ],
    }),
    'lists-checklist': figure({
      title: 'List pass',
      subtitle: 'Before you share a converted Word document.',
      parts: [
        checklist([
          { t: 'Each list outlined before converting' },
          { t: 'Notes or images between list items noted' },
          { t: 'Template-style levels found by style name' },
          { t: "Every item's parent and number compared" },
          { t: 'Letter references such as "step 1b" rewritten' },
          { t: 'Reviewed copy converted and compared again' },
        ]),
        note('Markdown numbered lists use numbers only.', { s: 's3' }),
      ],
    }),
  },
};
