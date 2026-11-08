// Visual spec for M09 "How to Edit and Export Markdown With LLMiser".
// Render privately: node blog-pipeline/scripts/campaign/render-private.mjs edit-export-markdown-llmiser
// Data: fixtures/export-behavior.json.

import { B, art, banner, decision, figure, flow, note } from '../../visuals/kit.mjs';
import { checklist, columns } from '../../visuals/campaign-parts.mjs';

const bannerArt = () => {
  let out = art.box(646, 50, 330, 300, { fill: '#ffffff', r: 12 });
  out += `<rect x="646" y="50" width="330" height="38" rx="12" fill="#e9e6dd"/>`;
  out += art.label(664, 76, 'RAW MARKDOWN', { size: 14, fill: '#6a6a74' });
  out += art.label(664, 120, '# Report', { size: 19, fill: B.amberD });
  out += `<rect x="658" y="140" width="306" height="64" rx="6" fill="#fff4d6" stroke="${B.amberD}" stroke-width="2"/>`;
  out += art.label(668, 166, 'Total: 4,167.51', { size: 17 });
  out += art.label(668, 192, '(USD, checked)', { size: 17, fill: B.amberD });
  out += `<rect x="664" y="226" width="250" height="8" rx="4" fill="${B.lav}"/><rect x="664" y="248" width="200" height="8" rx="4" fill="${B.lav}"/><rect x="664" y="270" width="230" height="8" rx="4" fill="${B.lav}"/>`;
  ['Copy', '.md', '.zip'].forEach((t, i) => {
    out += art.box(1000, 82 + i * 82, 150, 56, { fill: i === 0 ? B.mist : '#ffffff', r: 10 });
    out += art.label(1075, 118 + i * 82, t, { size: 21, anchor: 'middle' });
  });
  out += art.arrow(978, 172, 996, 172, { stroke: B.ink, sw: 3, head: 10 });
  return out;
};

export default {
  banner: banner({
    id: 'edit-banner',
    kicker: 'EDIT AND EXPORT',
    hook: ['Edit, then', 'export.'],
    sub: 'your edits live in the open page',
    art: bannerArt,
  }),
  figures: {
    'edit-export-flow': figure({
      title: 'From result to saved file',
      subtitle: 'Edits stay in the page until you export them.',
      parts: [
        flow([
          { t: 'Open a result', sub: 'one per file' },
          { t: 'Edit', sub: 'Raw or Split view' },
          { t: 'Export', sub: 'Copy, .md, .zip', s: 's1' },
          { t: 'Open the file', sub: 'what you saved' },
          { t: 'Compare', sub: 'with the reader', s: 's1' },
        ], { cols: 3, boxH: 74 }),
        note('Recent sessions keep the original conversion, not your edits.', { s: 's3' }),
      ],
    }),
    'original-vs-edited': figure({
      title: 'Which version you get',
      subtitle: 'Local run of LLMiser export and session code, 8 Nov 2026.',
      parts: [
        columns({
          left: {
            title: 'Exports',
            s: 's1',
            lines: ['# INCLUDES', '+ Copy', '+ .md download', '+ .zip download', '# CONTENT', 'Total: 4,167.51', '(USD, checked...)', '# LAST KEYSTROKES', '+ included'],
          },
          right: {
            title: 'Session and retry',
            s: 's3',
            lines: ['# INCLUDES', 'recent session', 'retried download', '', '# CONTENT', 'Total: 4,167.51', '! edit missing', '# KEPT', 'up to 5 sessions'],
          },
        }),
      ],
    }),
    'copy-or-download': figure({
      title: 'Copy or download?',
      subtitle: 'All three exports include your edits.',
      parts: [
        decision({
          start: { t: 'An edited result' },
          question: 'Pasting into a chat now?',
          yes: { t: 'Copy', sub: 'current document only', s: 's1' },
          no: { t: 'Download .md', sub: 'or .zip for the batch' },
          after: { t: 'Open and compare', sub: 'the saved file' },
        }),
        note('In a .zip, a second report.md is saved as report (2).md.'),
      ],
    }),
    'export-checklist': figure({
      title: 'Check the file, not the reader',
      subtitle: 'Open what you exported before you use it.',
      parts: [
        checklist([
          { t: 'Your last edit is in the file' },
          { t: 'The last line matches the reader', sub: 'Long documents may pause the preview, never the export.' },
          { t: 'Every document in a ZIP is there', sub: 'Check names with a (2) suffix.' },
          { t: 'Tables and headings render where you pasted' },
          { t: 'Comments and markers are kept or removed on purpose' },
        ]),
        note('Close the tab without exporting and your edits are gone.', { s: 's3' }),
      ],
    }),
  },
};
