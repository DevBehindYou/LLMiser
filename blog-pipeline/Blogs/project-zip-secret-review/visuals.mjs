// Visual spec for M01-S1 "Check a Project ZIP for Secrets Before Sharing It".
// Data: fixtures/review-original.json and review-sharing.json (fake values only).

import { B, art, banner, decision, figure, flow, note } from '../../visuals/kit.mjs';
import { checklist, compare } from '../../visuals/campaign-parts.mjs';

const list = (x, title, rows, hi) => {
  let out = art.box(x, 60, 200, 270, { fill: '#ffffff', r: 10 });
  out += art.label(x + 14, 92, title, { size: 17, fill: B.amberD });
  rows.forEach((t, i) => {
    const y = 128 + i * 34;
    if (i === hi) out += `<rect x="${x + 8}" y="${y - 22}" width="184" height="30" rx="6" fill="${B.rose}"/>`;
    out += art.label(x + 16, y, t, { size: 15, weight: 500 });
  });
  return out;
};

const bannerArt = () => {
  let out = art.box(650, 160, 84, 84, { fill: B.mist, r: 10 });
  for (let y = 168; y < 200; y += 9) out += `<rect x="686" y="${y}" width="10" height="5" rx="1" fill="${B.ink}"/>`;
  out += art.arrow(740, 180, 756, 120, { stroke: B.ink, sw: 3, head: 10 });
  out += art.arrow(740, 226, 756, 280, { stroke: B.ink, sw: 3, head: 10 });
  out += list(762, 'names', ['.env', 'id_ed25519', 'app.log', 'screenshot.png', 'backup.zip', '.git/config'], 3);
  out += list(970, 'contents', ['key = ...', 'token in URL', 'e-mail address', 'settings.local', '(prose key?)'], 3);
  return out;
};

export default {
  banner: banner({
    id: 'zsec-banner',
    kicker: 'SECRET REVIEW',
    hook: ['Search names.', 'Then contents.'],
    sub: 'a review routine for a sharing copy',
    art: bannerArt,
  }),
  figures: {
    'review-flow': figure({
      title: 'Two passes, then a recheck',
      subtitle: 'Run on the copy you will share, not on your working folder.',
      parts: [
        flow([
          { t: 'Unzip a copy', sub: 'never the original' },
          { t: 'List every file', sub: 'hidden and nested' },
          { t: 'Scan names', sub: 'env, keys, logs, backups' },
          { t: 'Scan contents', sub: 'keys, e-mails, URLs', s: 's1' },
          { t: 'Fix and rezip', sub: 'placeholder or delete' },
          { t: 'Recheck', sub: 'both scans, new ZIP', s: 's1' },
        ], { cols: 3, boxH: 80 }),
      ],
    }),
    'two-scans': figure({
      title: 'What each pass caught',
      subtitle: 'Six files from the synthetic project. All values are fake.',
      parts: [
        compare({
          headers: ['FILE', 'NAME PASS', 'CONTENT PASS'],
          widths: [222, 150, 180],
          size: 12.5,
          rows: [
            { label: 'settings.local.yaml', cells: [{ t: 'missed', ok: false }, { t: 'key line', ok: true }] },
            { label: 'id_ed25519', cells: [{ t: 'flagged', ok: true }, { t: 'missed', ok: false }] },
            { label: 'screenshot.png', cells: [{ t: 'flagged', ok: true }, { t: 'not readable', ok: false }] },
            { label: 'tmp/debug-notes.txt', cells: [{ t: 'flagged', ok: true }, { t: 'e-mail only', ok: null }] },
            { label: 'backup zip, old yaml', cells: [{ t: 'flagged', ok: true }, { t: 'key line', ok: true }] },
            { label: '.git/config', cells: [{ t: 'flagged', ok: true }, { t: 'token in URL', ok: true }] },
          ],
        }),
        note('Name pass flagged 13 of 35 entries, content pass 8. Dash: the key in a sentence was missed.'),
      ],
    }),
    'flagged-file-decision': figure({
      title: 'What to do with a flag',
      subtitle: 'Every flagged file ends one of two ways, then a recheck.',
      parts: [
        decision({
          start: { t: 'A flagged file' },
          question: 'Does the task need it?',
          yes: { t: 'Swap in a placeholder', sub: 'key: REPLACE_ME', s: 's1' },
          no: { t: 'Delete it', sub: 'from the copy only', s: 's3' },
          after: { t: 'Zip and recheck', sub: 'both passes again' },
        }),
      ],
    }),
    'recheck-checklist': figure({
      title: 'Before you send the ZIP',
      subtitle: 'Run it on the new archive.',
      parts: [
        checklist([
          { t: 'Every file listed, hidden and nested included' },
          { t: 'Names scanned for keys, env files, logs, backups' },
          { t: 'Text contents scanned for keys, e-mails, URLs' },
          { t: 'Images and PDFs looked at by a person' },
          { t: 'Secrets replaced or files deleted' },
          { t: 'Both scans rerun on the new ZIP' },
        ]),
        note('Patterns miss secrets in prose and images. Rotate leaked ones.', { s: 's3' }),
      ],
    }),
  },
};
