// Visual spec for M05-S3 "Keep Slide Titles and Order Clear in Markdown".
// Data: fixtures/flow-files.json, out-original, out-reviewed, out-reviewed-first-attempt.

import { B, C, F, art, banner, custom, figure, note, path, text } from '../../visuals/kit.mjs';
import { checklist, columns, tree } from '../../visuals/campaign-parts.mjs';

const bannerArt = () => {
  let out = '';
  out += art.box(642, 50, 250, 296, { fill: '#ffffff', r: 10 });
  out += art.label(660, 84, 'Step 2 of 3', { size: 15, fill: B.pink });
  out += art.label(660, 136, 'Cause', { size: 34, font: 'Inter, sans-serif' });
  out += art.label(660, 188, 'The session token', { size: 15 });
  out += art.label(660, 212, 'expires before the', { size: 15 });
  out += art.label(660, 236, 'second request.', { size: 15 });
  out += art.label(660, 326, 'SLIDE 5', { size: 14, fill: '#8a8a92' });
  out += art.arrow(898, 198, 918, 198, { sw: 2.5, head: 9 });
  out += art.box(924, 50, 238, 296, { fill: '#ffffff', r: 10 });
  const lines = [
    ['# Symptoms', B.ink, 700],
    ['It happens only on', '#8a8a92', 500],
    ['the mobile app.', '#8a8a92', 500],
    ['Step 2 of 3', B.pink, 700],
    ['# Cause', B.ink, 700],
    ['The session token...', '#8a8a92', 500],
  ];
  lines.forEach(([t, fill, weight], i) => {
    out += art.label(944, 96 + i * 42, t, { size: 17, fill, weight });
  });
  // Bracket: everything from "# Symptoms" to the label belongs to the Symptoms section.
  out += `<path d="M1148 78V232" stroke="${B.amberD}" stroke-width="3" stroke-linecap="round"/>`;
  return out;
};

// Converted original, slides 3 to 6, with warning marks on problem lines.
const ROWS = [
  ['<!-- Slide number: 3 -->', 'dim'],
  ['Step 1 of 3', 'warn', 'above its heading'],
  ['# Symptoms', 'head'],
  ['Users see error 4012 after entering a password.'],
  ['<!-- Slide number: 4 -->', 'dim'],
  ['# Symptoms', 'warn', 'repeated heading'],
  ['It happens only on the mobile app.'],
  ['<!-- Slide number: 5 -->', 'dim'],
  ['Step 2 of 3', 'warn', 'above its heading'],
  ['# Cause', 'head'],
  ['The session token expires before the second request.'],
  ['<!-- Slide number: 6 -->', 'dim'],
  ['Step 3 of 3', 'warn', 'no heading on slide 6'],
  ['Fix', 'warn'],
  ['Refresh the token before the second request.'],
  ['As the previous slide shows, timing is the cause.', 'warn', 'points back'],
];
const excerpt = custom(ROWS.length * 22 + 26, (y) => {
  let s = `<rect x="24" y="${y}" width="552" height="${ROWS.length * 22 + 20}" rx="10" style="fill:${C.surface2};stroke:${C.border3};stroke-width:1.5"/>`;
  ROWS.forEach(([t, kind, n], i) => {
    const ly = y + 26 + i * 22;
    const warn = kind === 'warn';
    if (warn) s += path(`M40 ${ly}L46 ${ly - 10}L52 ${ly}Z`, { fill: C.s3 });
    s += text(warn ? 58 : 40, ly, t, { size: 12.5, font: F.mono, fill: warn ? C.s3 : kind === 'dim' ? C.faint : C.ink, weight: warn || kind === 'head' ? 700 : undefined });
    if (n) s += text(562, ly, n, { size: 11.5, fill: C.muted, anchor: 'end', italic: true });
  });
  return s;
});

export default {
  banner: banner({
    id: 'order-banner',
    kicker: 'SLIDE ORDER',
    hook: ['Step 2 landed', 'under step 1.'],
    sub: 'six slides, one sequence',
    art: bannerArt,
  }),
  figures: {
    'sequence-map': figure({
      title: 'Map the sequence first',
      subtitle: 'The synthetic troubleshooting deck.',
      parts: [
        tree([
          { t: 'Section: Diagnosis', mark: 'info', note: 'POWERPOINT SECTION' },
          { t: '1  Fix the Login Error', d: 1 },
          { t: '2  Diagnosis', d: 1, note: 'DIVIDER' },
          { t: '3  Symptoms', d: 1, note: 'STEP LABEL ABOVE TITLE' },
          { t: '4  Symptoms', d: 1, note: 'CONTINUES SLIDE 3' },
          { t: '5  Cause', d: 1, note: 'STEP LABEL ABOVE TITLE' },
          { t: 'Section: Resolution', mark: 'info', note: 'POWERPOINT SECTION' },
          { t: '6  Fix', d: 1, note: 'NO TITLE PLACEHOLDER' },
          { t: '"As the previous slide..."', d: 2, note: 'POINTS BACK' },
        ]),
      ],
    }),
    'original-output': figure({
      title: 'Where the text landed',
      subtitle: 'Converted original, slides 3 to 6.',
      parts: [
        excerpt,
        note('Two body lines omitted. Local run, 9 November 2026.'),
      ],
    }),
    'headings-before-after': figure({
      title: 'The heading outline',
      subtitle: 'Every heading in each converted deck.',
      parts: [
        columns({
          left: {
            title: 'Original',
            s: 's3',
            lines: [
              '\\# Fix the Login Error...',
              '\\# Diagnosis',
              '\\# Symptoms',
              '! # Symptoms',
              '\\# Cause',
              '! (slide 6: no heading)',
            ],
          },
          right: {
            title: 'Reviewed copy',
            s: 's1',
            lines: [
              '\\# Fix the Login Error...',
              '+ # Diagnosis: steps 1 and 2...',
              '+ # Step 1: Symptoms of...',
              '+ # Step 1, continued: Mobile...',
              '+ # Step 2: Cause',
              '+ # Step 3: Fix',
            ],
          },
        }),
        note('Long titles shortened. Section names appear in neither version.'),
      ],
    }),
    'order-checklist': figure({
      title: 'Sequence pass',
      subtitle: 'Before you share a converted deck.',
      parts: [
        checklist([
          { t: 'Slide sequence mapped with steps and sections' },
          { t: "Every slide uses its layout's title placeholder" },
          { t: 'Labels like "Step 2 of 3" inside the title' },
          { t: 'No repeated headings in the output' },
          { t: '"The previous slide" written out' },
          { t: 'Section names repeated in divider titles' },
        ]),
        note('PowerPoint sections and reading order do not carry into the text.', { s: 's3' }),
      ],
    }),
  },
};
