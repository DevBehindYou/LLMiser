// Visual spec for M02-S3 "Check OCR Coverage in a Mixed PDF".
// Data: fixtures/packet-truth.json, out-packet/run.json and packet.Standard.md, out-workaround/.

import { B, C, F, banner, cards, custom, figure, note, panels, rect, text } from '../../visuals/kit.mjs';
import { checklist, compare } from '../../visuals/campaign-parts.mjs';

// Page thumbnail in the banner palette. kind: text, scan, blank, stamp, photo, double.
const thumbB = (x, y, w, h, kind, num) => {
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="${kind === 'scan' || kind === 'stamp' ? '#e4e1d8' : '#ffffff'}" stroke="${B.ink}" stroke-width="2.5"/>`;
  const lines = (color, n, top = 30) => {
    let o = '';
    for (let i = 0; i < n; i += 1) o += `<rect x="${x + 12}" y="${y + top + i * 13}" width="${(w - 24) * [0.9, 0.7, 0.8, 0.6, 0.75][i % 5]}" height="5" rx="2.5" fill="${color}"/>`;
    return o;
  };
  if (kind === 'text') s += lines(B.lav, 5);
  if (kind === 'double') s += lines(B.lav, 4) + `<rect x="${x + 8}" y="${y + 22}" width="${w - 16}" height="52" rx="4" fill="none" stroke="${B.violet}" stroke-width="1.5" stroke-dasharray="4 3"/>`;
  if (kind === 'scan') s += lines('#a29e93', 5);
  if (kind === 'stamp') s += `<rect x="${x + 10}" y="${y + 10}" width="${w - 30}" height="6" rx="3" fill="${B.amber}"/>` + lines('#a29e93', 4, 36);
  if (kind === 'photo') s += `<rect x="${x + w / 2 - 13}" y="${y + 34}" width="26" height="36" rx="2" fill="#e4e1d8" stroke="${B.ink}" stroke-width="1.5"/>`;
  s += `<text x="${x + 8}" y="${y + h - 8}" style="fill:${B.ink};font-family:${F.mono};font-size:15px;font-weight:700">${num}</text>`;
  return s;
};
const tickB = (cx, cy) => `<path d="M${cx - 12} ${cy}L${cx - 3} ${cy + 9}L${cx + 13} ${cy - 11}" fill="none" stroke="${B.amberD}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;
const crossB = (cx, cy) => `<path d="M${cx - 10} ${cy - 10}L${cx + 10} ${cy + 10}M${cx + 10} ${cy - 10}L${cx - 10} ${cy + 10}" stroke="${B.pink}" stroke-width="4" stroke-linecap="round"/>`;
const dashB = (cx, cy) => `<path d="M${cx - 10} ${cy}H${cx + 10}" stroke="#8a8a92" stroke-width="4" stroke-linecap="round"/>`;
const twiceB = (cx, cy) => `<text x="${cx}" y="${cy + 8}" text-anchor="middle" style="fill:${B.pink};font-family:${F.mono};font-size:22px;font-weight:700">x2</text>`;

const PAGES = [
  ['text', tickB], ['scan', tickB], ['blank', dashB], ['text', tickB],
  ['stamp', crossB], ['photo', crossB], ['double', twiceB], ['blank', dashB],
];

const bannerArt = () => {
  let out = '';
  PAGES.forEach(([kind, mark], i) => {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const x = 668 + col * 118;
    const y = 46 + row * 166;
    out += thumbB(x, y, 82, 106, kind, i + 1);
    out += mark(x + 41, y + 132);
  });
  return out;
};

// Fixture illustration in figure tokens.
const TYPES = [
  ['text', 'Text page', ''], ['scan', 'Scanned page', 'no text layer'], ['blank', 'Blank', ''], ['text', 'Text page', ''],
  ['stamp', 'Scanned page', 'plus text stamp'], ['photo', 'Small photo', 'about 19%'], ['double', 'Text page', 'plus hidden copy'], ['blank', 'Blank', ''],
];
const thumb = (x, y, w, h, kind, num) => {
  const grey = kind === 'scan' || kind === 'stamp';
  let s = rect(x, y, w, h, { fill: grey ? C.border3 : C.surface2, fo: grey ? 0.6 : undefined, stroke: C.faint, sw: 1.6, r: 6 });
  const lines = (n, top, color) => {
    let o = '';
    for (let i = 0; i < n; i += 1) o += rect(x + 14, y + top + i * 15, (w - 28) * [0.9, 0.7, 0.8, 0.6, 0.75][i % 5], 6, { fill: color, r: 3 });
    return o;
  };
  if (kind === 'text' || kind === 'double') s += lines(5, 30, C.s2);
  if (kind === 'double') s += rect(x + 8, y + 22, w - 16, 80, { stroke: C.s3, sw: 1.4, dash: '4 3', r: 5 });
  if (kind === 'scan') s += lines(5, 30, C.faint);
  if (kind === 'stamp') s += rect(x + 10, y + 10, w - 36, 6, { fill: C.s1, r: 3 }) + lines(4, 38, C.faint);
  if (kind === 'photo') s += rect(x + w / 2 - 17, y + 40, 34, 48, { fill: C.border3, stroke: C.faint, sw: 1.4, r: 3 });
  s += text(x + 10, y + h - 10, String(num), { size: 15, font: F.mono, weight: 700 });
  return s;
};

const packet = custom(400, (y) => {
  let s = '';
  TYPES.forEach(([kind, label, sub], i) => {
    const x = 24 + (i % 4) * 146;
    const yy = y + Math.floor(i / 4) * 206;
    s += thumb(x + 9, yy, 102, 132, kind, i + 1);
    s += text(x + 60, yy + 156, label, { size: 14, weight: 600, anchor: 'middle' });
    if (sub) s += text(x + 60, yy + 175, sub, { size: 12.5, fill: C.muted, anchor: 'middle' });
  });
  return s;
});

export default {
  banner: banner({
    id: 'mix-banner',
    kicker: 'MIXED PDF',
    hook: ['Every page,', 'accounted for.'],
    sub: 'eight pages, two never read',
    art: bannerArt,
  }),
  figures: {
    'packet-pages': figure({
      title: 'List every page first',
      subtitle: 'The synthetic eight-page packet in this test.',
      parts: [
        packet,
        note('Pages 5 and 6 look like scans but are not treated as scans.'),
      ],
    }),
    'page-map': figure({
      title: 'Where each page landed',
      subtitle: 'First and last lines searched in the output.',
      parts: [
        compare({
          headers: ['PAGE', 'TYPE', 'IN THE OUTPUT'],
          widths: [74, 220, 258],
          size: 13,
          rows: [
            { label: '1', cells: [{ t: 'text' }, { t: 'found', ok: true }] },
            { label: '2', cells: [{ t: 'scan' }, { t: 'found, marked', ok: true }] },
            { label: '3', cells: [{ t: 'blank' }, { t: 'no trace', ok: null }] },
            { label: '4', cells: [{ t: 'text' }, { t: 'found', ok: true }] },
            { label: '5', cells: [{ t: 'scan + stamp' }, { t: 'stamp only', ok: false }] },
            { label: '6', cells: [{ t: 'small photo' }, { t: 'missing', ok: false }] },
            { label: '7', cells: [{ t: 'text + copy' }, { t: 'found twice', ok: false }] },
            { label: '8', cells: [{ t: 'blank' }, { t: 'no trace', ok: null }] },
          ],
        }),
        note('No page in the packet produced a warning.'),
      ],
    }),
    'gap-causes': figure({
      title: 'Trace each gap to its cause',
      subtitle: 'What happened in the packet, and what fixed it.',
      parts: [
        cards([
          { k: '5', title: 'Scan with a stamp', sub: 'Read as a text page, so only the stamp came back. Fix: export as an image.', s: 's3' },
          { k: '6', title: 'Small photo', sub: 'About 19% picture, under 30%, so not read. Fix: export as an image.', s: 's3' },
          { k: '7', title: 'Hidden copy', sub: 'The approval came back twice. Fix: compare, then delete the repeat.', s: 's2' },
          { k: '3 8', title: 'Blank pages', sub: 'No trace here, a notice in another file. Fix: note them.', s: 's1' },
        ], { h: 124 }),
      ],
    }),
    'page5-export': figure({
      title: 'Page 5, read two ways',
      subtitle: 'Inside the PDF, then exported as an image.',
      parts: [
        panels([
          {
            title: 'In the PDF output',
            tag: '1 LINE',
            s: 's3',
            lines: [{ t: 'Scanned 2026-04-18 09:14 by FrontDesk-02' }],
          },
          {
            title: 'Exported as an image',
            tag: 'COMPLETE',
            s: 's1',
            lines: [
              { t: 'Scanned 2026-04-18 09:14 by FrontDesk-02', k: 'dim' },
              { t: 'RETURN AUTHORIZATION RA-2207' },
              { t: 'Return 2 valves, brass' },
              { t: 'Return 1 gasket, 1/2 in' },
              { t: 'Reason: damaged on arrival' },
              { t: 'Credit to account 0045-1170' },
              { t: 'Authorized by: M. Chen' },
            ],
          },
        ]),
      ],
    }),
    'coverage-checklist': figure({
      title: 'Coverage pass',
      subtitle: 'For PDFs that mix typed and scanned pages.',
      parts: [
        checklist([
          { t: 'Every page listed with its type' },
          { t: 'Stamped scans and small photos flagged' },
          { t: 'First and last line of each page found' },
          { t: 'No passage repeated' },
          { t: 'Blank pages recorded' },
          { t: 'Unread pages exported as images and converted' },
        ]),
        note('One synthetic packet. Real PDFs mix these cases in less tidy ways.', { s: 's3' }),
      ],
    }),
  },
};
