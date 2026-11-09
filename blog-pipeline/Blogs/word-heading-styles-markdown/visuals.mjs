// Visual spec for M04-S1 "Use Word Heading Styles Before Markdown Conversion".
// Data: fixtures/guide-files.json, out-original/guide-original.Standard.md, out-reviewed/guide-reviewed.Standard.md.

import { B, art, banner, figure, note } from '../../visuals/kit.mjs';
import { checklist, columns, compare } from '../../visuals/campaign-parts.mjs';

const tick = (x, y) => `<path d="M${x} ${y}L${x + 8} ${y + 9}L${x + 23} ${y - 10}" fill="none" stroke="${B.amberD}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;
const cross = (x, y) => `<path d="M${x} ${y - 9}L${x + 18} ${y + 9}M${x + 18} ${y - 9}L${x} ${y + 9}" stroke="${B.pink}" stroke-width="4" stroke-linecap="round"/>`;

const bannerArt = () => {
  let out = '';
  const rows = [
    ['Heading 2', '## Your first week', true],
    ['Section Heading', 'Your first week', false],
    ['bold Normal', '**Your first week**', false],
    ['Title', 'Your first week', false],
  ];
  out += art.label(650, 74, 'IN WORD', { size: 14, fill: '#8a8a92' });
  out += art.label(902, 74, 'MARKDOWN', { size: 14, fill: '#8a8a92' });
  rows.forEach(([style, md, ok], i) => {
    const y = 122 + i * 64;
    out += art.label(650, y - 4, 'Your first week', { size: 22, font: 'Inter, sans-serif', fill: '#2f5597' });
    out += art.label(650, y + 19, style, { size: 14, fill: '#8a8a92' });
    out += art.arrow(846, y - 4, 884, y - 4, { sw: 2.5, head: 10 });
    out += art.label(902, y, md, { size: 16, fill: ok ? B.ink : B.pink });
    out += ok ? tick(1120, y - 8) : cross(1122, y - 8);
  });
  return out;
};

export default {
  banner: banner({
    id: 'wordh-banner',
    kicker: 'WORD HEADINGS',
    hook: ['Looks like a heading.', "Isn't one."],
    sub: 'same look, four styles',
    art: bannerArt,
  }),
  figures: {
    'style-inventory': figure({
      title: 'Seven ways to mark a title',
      subtitle: 'The original synthetic guide, by actual formatting.',
      parts: [
        compare({
          headers: ['TITLE TEXT', 'FORMATTING IN WORD'],
          widths: [236, 316],
          size: 12.5,
          rows: [
            { label: 'Northwind Onboarding Guide', cells: [{ t: 'Title style' }] },
            { label: 'Overview', cells: [{ t: 'Heading 1' }] },
            { label: 'Before your first day', cells: [{ t: 'Heading 2' }] },
            { label: 'Accounts and access', cells: [{ t: 'Normal, bold, 16 pt' }] },
            { label: 'Your first week', cells: [{ t: 'Section Heading (custom)' }] },
            { label: 'Policies', cells: [{ t: 'Normal + outline level 1' }] },
            { label: 'Badges must be worn...', cells: [{ t: 'Heading 3 on a sentence' }] },
            { label: '(empty line)', cells: [{ t: 'Heading 2, no text' }] },
          ],
        }),
        note('Section Heading is based on Heading 2 and looks the same in Word.'),
      ],
    }),
    'style-results': figure({
      title: 'Only built-in Heading styles count',
      subtitle: 'What each formatting choice became in Markdown.',
      parts: [
        compare({
          headers: ['FORMATTING', 'MARKDOWN', 'RESULT'],
          widths: [176, 214, 162],
          size: 12.5,
          rows: [
            { label: 'Title style', cells: [{ t: 'plain text' }, { t: 'file-name title', ok: false }] },
            { label: 'Heading 1', cells: [{ t: '# Overview' }, { t: 'heading', ok: true }] },
            { label: 'Heading 2', cells: [{ t: '## Before your...' }, { t: 'heading', ok: true }] },
            { label: 'Bold 16 pt Normal', cells: [{ t: '**Accounts...**' }, { t: 'bold text', ok: false }] },
            { label: 'Section Heading', cells: [{ t: 'Your first week' }, { t: 'plain text', ok: false }] },
            { label: 'Outline level only', cells: [{ t: 'Policies' }, { t: 'plain text', ok: false }] },
            { label: 'Heading 3, sentence', cells: [{ t: '### Badges must...' }, { t: 'false section', ok: false }] },
            { label: 'Empty Heading 2', cells: [{ t: '(nothing)' }, { t: 'dropped', ok: null }] },
          ],
        }),
        note('Local run of LLMiser\'s Word conversion, 9 November 2026.'),
      ],
    }),
    'outline-before-after': figure({
      title: 'The converted outline',
      subtitle: 'Every line starting with # in each version.',
      parts: [
        columns({
          left: {
            title: 'Original',
            s: 's3',
            lines: [
              '! # Guide Original',
              '\\# Overview',
              '## Before your first day',
              '### Equipment',
              '\\# Contacts',
              '! ### Helpdesk',
              '! ### Badges must be...',
            ],
          },
          right: {
            title: 'Reviewed copy',
            s: 's1',
            lines: [
              '\\# Northwind Onboarding Guide',
              '## Overview',
              '### Before your first day',
              '+ ## Accounts and access',
              '+ ## Your first week',
              '### Equipment',
              '+ ## Policies',
              '## Contacts',
              '### Helpdesk',
            ],
          },
        }),
        note('Warnings: a file-name title, a skipped level and a false section.'),
      ],
    }),
    'heading-checklist': figure({
      title: 'Heading pass',
      subtitle: 'Before you convert a Word document.',
      parts: [
        checklist([
          { t: 'Every section title uses a built-in Heading style' },
          { t: 'No custom or look-alike heading styles in the sharing copy' },
          { t: 'Heading 1 used once, for the title' },
          { t: 'No skipped levels' },
          { t: 'No sentences styled as headings' },
          { t: 'Converted # lines match the document outline' },
        ]),
        note('One synthetic document. Other templates may name styles differently.', { s: 's3' }),
      ],
    }),
  },
};
