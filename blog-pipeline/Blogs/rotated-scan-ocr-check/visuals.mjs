// Visual spec for M02-S1 "Check Rotated Scans Before Running OCR".
// Data: fixtures/rotation-results.json, skew-8.txt, skew-3.txt.

import { B, art, banner, decision, figure, flow, note, panels } from '../../visuals/kit.mjs';
import { checklist, compare } from '../../visuals/campaign-parts.mjs';

const mini = (cx, cy, rot, ok) => {
  let out = `<g transform="rotate(${rot} ${cx} ${cy})">`;
  out += `<rect x="${cx - 44}" y="${cy - 56}" width="88" height="112" rx="4" fill="#ffffff" stroke="${B.ink}" stroke-width="2"/>`;
  for (let i = 0; i < 5; i += 1) out += `<rect x="${cx - 32}" y="${cy - 40 + i * 18}" width="${[64, 50, 58, 40, 54][i]}" height="6" rx="3" fill="${B.lav}"/>`;
  out += '</g>';
  out += ok
    ? `<path d="M${cx - 12} ${cy + 78}L${cx - 3} ${cy + 88}L${cx + 14} ${cy + 66}" fill="none" stroke="${B.amberD}" stroke-width="4" stroke-linecap="round"/>`
    : `<path d="M${cx - 11} ${cy + 66}L${cx + 11} ${cy + 88}M${cx + 11} ${cy + 66}L${cx - 11} ${cy + 88}" stroke="${B.pink}" stroke-width="4" stroke-linecap="round"/>`;
  return out;
};

const bannerArt = () => mini(690, 150, 0, true) + mini(800, 150, 90, true) + mini(910, 150, 180, true) + mini(1040, 150, 8, false)
  + art.label(1040, 290, '8 degrees', { size: 16, anchor: 'middle', fill: B.pink });

export default {
  banner: banner({
    id: 'rot-banner',
    kicker: 'OCR ORIENTATION',
    hook: ['A tilt hurt more', 'than a turn.'],
    sub: 'one page, seven orientations',
    art: bannerArt,
  }),
  figures: {
    'orientation-steps': figure({
      title: 'How orientation is handled',
      subtitle: 'From LLMiser recognition code. Quarter turns only.',
      parts: [
        flow([
          { t: 'Camera tag', sub: 'applied first' },
          { t: 'Read the page', sub: 'measure confidence' },
          { t: 'Weak read?', sub: 'then check turns', s: 's2' },
          { t: 'Keep the best', sub: 'only if clearly better', s: 's1' },
        ], { cols: 2, boxH: 80 }),
        note('A tilt of a few degrees is not a quarter turn, so it is read as it is.'),
      ],
    }),
    'orientation-results': figure({
      title: 'Seven runs of one page',
      subtitle: 'Similarity to the upright text, local run.',
      parts: [
        compare({
          headers: ['VARIANT', 'CHECK RAN', 'RESULT'],
          widths: [196, 150, 206],
          size: 12.5,
          rows: [
            { label: 'Upright', cells: [{ t: 'no' }, { t: 'reference', ok: null }] },
            { label: 'Turned 90', cells: [{ t: 'no' }, { t: '0.986 similar', ok: true }] },
            { label: 'Turned 180', cells: [{ t: 'yes, turned' }, { t: 'identical', ok: true }] },
            { label: 'Turned 270', cells: [{ t: 'yes, turned' }, { t: 'identical', ok: true }] },
            { label: 'Camera tag', cells: [{ t: 'tag applied' }, { t: 'identical', ok: true }] },
            { label: 'Tilted 3', cells: [{ t: 'no' }, { t: '0.879, ID wrong', ok: false }] },
            { label: 'Tilted 8', cells: [{ t: 'no' }, { t: '0.274, page lost', ok: false }] },
          ],
        }),
      ],
    }),
    'tilt-output': figure({
      title: 'What the 8-degree tilt returned',
      subtitle: 'Exact recognized text compared with the upright run.',
      parts: [
        panels([
          {
            title: 'Upright',
            tag: '~20 LINES',
            s: 's1',
            lines: [
              { t: 'ACME FIELD SUPPLY INVOICE' },
              { t: 'Invoice no: INV-00123' },
              { t: 'Order: PO 1005-B' },
              { t: '... table, totals ...', k: 'dim' },
              { t: 'Terms: net 30. A late fee of 1.5% ...' },
            ],
          },
          {
            title: 'Tilted 8 degrees',
            tag: '1 LINE',
            s: 's3',
            lines: [
              { t: 'Terms. net 30. 4 late Fee of 15%' },
              { t: 'per Month applies after 2026 05-17', k: 'dim' },
            ],
          },
        ]),
        note('No warning said the rest of the page was missing. 1.5% became 15%.', { s: 's3' }),
      ],
    }),
    'tilt-decision': figure({
      title: 'Turned or tilted?',
      subtitle: 'They need different handling.',
      parts: [
        decision({
          start: { t: 'A scanned page' },
          question: 'Tilted a few degrees?',
          yes: { t: 'Straighten first', sub: 'rescan, deskew or rotate', s: 's3' },
          no: { t: 'Upload it', sub: 'quarter turns were fixed', s: 's1' },
          after: { t: 'Compare key fields', sub: 'first and last lines too' },
        }),
      ],
    }),
    'orientation-checklist': figure({
      title: 'Orientation pass',
      subtitle: 'Before upload and after recognition.',
      parts: [
        checklist([
          { t: 'Pages upright or turned in quarter steps' },
          { t: 'Tilted pages straightened' },
          { t: 'Phone photos keep their orientation tag' },
          { t: 'First and last lines of each page found in the output' },
          { t: 'IDs and amounts compared with the original' },
        ]),
        note('One synthetic page. Results vary by page, font and resolution.', { s: 's3' }),
      ],
    }),
  },
};
