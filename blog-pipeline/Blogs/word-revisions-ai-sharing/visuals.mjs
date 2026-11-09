// Visual spec for M04-S3 "Prepare Word Revisions and Comments for AI Sharing".
// Data: fixtures/views.json, out-draft, out-shared, view-results.json.

import { B, art, banner, figure, note, panels } from '../../visuals/kit.mjs';
import { checklist, compare } from '../../visuals/campaign-parts.mjs';

const strike = (x, y, chars, size = 16) => `<line x1="${x - 2}" y1="${y - size * 0.32}" x2="${x + chars * size * 0.6 + 2}" y2="${y - size * 0.32}" stroke="${B.pink}" stroke-width="2.5"/>`;
const under = (x, y, chars, size = 16) => `<line x1="${x}" y1="${y + 5}" x2="${x + chars * size * 0.6}" y2="${y + 5}" stroke="${B.violet}" stroke-width="2.5"/>`;

const bannerArt = () => {
  let out = '';
  out += art.box(642, 50, 262, 296, { fill: '#ffffff', r: 12 });
  out += art.label(658, 82, 'WORD DRAFT', { size: 14, fill: '#8a8a92' });
  out += art.label(658, 130, 'up to', { size: 16 });
  out += art.label(722, 130, '5', { size: 16, fill: B.pink }) + strike(722, 130, 1);
  out += art.label(742, 130, '10', { size: 16, fill: B.violet }) + under(742, 130, 2);
  out += art.label(772, 130, 'days', { size: 16 });
  out += art.label(658, 182, 'Unused days expire', { size: 16, fill: B.violet }) + under(658, 182, 18);
  out += art.box(780, 196, 108, 30, { fill: '#fff6e6', stroke: B.amberD, r: 8, sw: 2 });
  out += art.label(834, 216, 'pending', { size: 14, anchor: 'middle', fill: B.amberD });
  out += art.label(658, 262, 'Managers may approve', { size: 16, fill: B.pink }) + strike(658, 262, 20);
  out += art.label(658, 292, 'exceptions.', { size: 16, fill: B.pink }) + strike(658, 292, 11);
  out += art.arrow(910, 198, 930, 198, { sw: 2.5, head: 9 });
  out += art.box(936, 50, 226, 296, { fill: '#ffffff', r: 12 });
  out += art.label(952, 82, 'CONVERTED', { size: 14, fill: '#8a8a92' });
  out += art.label(952, 130, 'up to 10 days', { size: 16 });
  out += art.label(952, 182, 'Unused days expire', { size: 16, fill: B.pink });
  out += art.label(952, 212, 'as if final', { size: 14, fill: '#8a8a92' });
  out += art.label(952, 262, '(sentence gone)', { size: 16, fill: '#8a8a92' });
  return out;
};

export default {
  banner: banner({
    id: 'rev-banner',
    kicker: 'WORD REVISIONS',
    hook: ['Pending reads', 'as final.'],
    sub: 'one draft, three readings',
    art: bannerArt,
  }),
  figures: {
    'review-items': figure({
      title: 'Four items under review',
      subtitle: 'The synthetic leave policy draft.',
      parts: [
        compare({
          headers: ['ITEM', 'CHANGE', 'STATUS'],
          widths: [140, 246, 166],
          size: 12.5,
          rows: [
            { label: 'Replacement', cells: [{ t: '5 -> 10 days' }, { t: 'approved', ok: true }] },
            { label: 'Insertion', cells: [{ t: '31 March expiry added' }, { t: 'pending', ok: false }] },
            { label: 'Deletion', cells: [{ t: 'exceptions removed' }, { t: 'pending', ok: false }] },
            { label: 'Hidden text', cells: [{ t: 'Internal: figures...' }, { t: 'hidden in Word', ok: null }] },
          ],
        }),
        note('Two comments by Reviewer B record the approval and the legal review.'),
      ],
    }),
    'three-readings': figure({
      title: 'Three readings, one file',
      subtitle: 'Expected body text for each view, sentences shortened.',
      parts: [
        panels([
          {
            title: 'Every change rejected',
            tag: 'ORIGINAL',
            lines: [
              { t: 'Staff may carry over up to 5 days of leave.' },
              { t: 'Managers may approve exceptions.' },
              { t: 'Requests go through the HR portal.' },
            ],
          },
          {
            title: 'Every change accepted',
            tag: 'NO MARKUP',
            s: 's3',
            lines: [
              { t: 'Staff may carry over up to 10 days of leave.' },
              { t: 'Unused days expire on 31 March.' },
              { t: 'Requests go through the HR portal.' },
            ],
          },
          {
            title: 'Decided',
            tag: 'SHARE THIS',
            s: 's1',
            lines: [
              { t: 'Staff may carry over up to 10 days of leave.' },
              { t: 'Managers may approve exceptions.' },
              { t: 'Requests go through the HR portal.' },
              { t: 'The 31 March rule is under legal review.' },
            ],
          },
        ]),
      ],
    }),
    'view-results': figure({
      title: 'What each file converted to',
      subtitle: 'Checks on the converted body text.',
      parts: [
        compare({
          headers: ['CHECK', 'DRAFT', 'SHARING COPY'],
          widths: [196, 180, 176],
          size: 12.5,
          rows: [
            { label: 'Reading matched', cells: [{ t: 'accept-all', ok: false }, { t: 'decided', ok: true }] },
            { label: '10 days', cells: [{ t: 'yes' }, { t: 'yes', ok: true }] },
            { label: 'Exceptions sentence', cells: [{ t: 'missing', ok: false }, { t: 'present', ok: true }] },
            { label: '31 March rule', cells: [{ t: 'as policy', ok: false }, { t: 'as pending', ok: true }] },
            { label: 'Hidden note', cells: [{ t: 'shown', ok: false }, { t: 'removed', ok: true }] },
            { label: 'Comments', cells: [{ t: 'dropped', ok: false }, { t: 'in the text', ok: true }] },
          ],
        }),
        note('Local run of LLMiser\'s Word conversion, 9 November 2026.'),
      ],
    }),
    'draft-vs-copy': figure({
      title: 'The converted text',
      subtitle: 'Exact body text of each output, wrapped to fit.',
      parts: [
        panels([
          {
            title: 'Converted draft',
            tag: 'ACCEPT-ALL',
            s: 's3',
            lines: [
              { t: 'Staff may carry over up to 10 days of leave into' },
              { t: 'the next year. Unused days expire on 31 March.' },
              { t: 'Requests go through the HR portal. Internal:' },
              { t: 'figures not final.' },
            ],
          },
          {
            title: 'Converted sharing copy',
            tag: 'DECIDED',
            s: 's1',
            lines: [
              { t: 'Staff may carry over up to 10 days of leave into' },
              { t: 'the next year.' },
              { t: 'Managers may approve exceptions.' },
              { t: 'Requests go through the HR portal.' },
              { t: 'A proposed rule that unused days expire on 31' },
              { t: 'March is under legal review and is not in effect.' },
            ],
          },
        ]),
      ],
    }),
    'revisions-checklist': figure({
      title: 'Revision pass',
      subtitle: 'Before you share a Word document.',
      parts: [
        checklist([
          { t: 'Intended revision decided for each change' },
          { t: 'Decision written down with the date' },
          { t: 'Sharing copy with every change accepted or rejected' },
          { t: 'Comments that matter written into the body' },
          { t: 'Hidden text removed' },
          { t: 'Converted copy compared sentence by sentence' },
        ]),
        note('The conversion does not show what was pending, so the copy has to.', { s: 's3' }),
      ],
    }),
  },
};
