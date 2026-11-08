// Visual spec for M08 "LLMiser Profiles: Standard, Clean, Compact, RAG-ready".
// Render privately: node blog-pipeline/scripts/campaign/render-private.mjs llmiser-processing-profiles
// Lines and counts come from fixtures/out/{Standard,Clean,Compact,RAG-ready}/ and run.json.

import { B, art, banner, decision, figure, note, panels } from '../../visuals/kit.mjs';
import { compare } from '../../visuals/campaign-parts.mjs';

const card = (x, y, name, lines, bad) => {
  let out = art.box(x, y, 118, 150, { fill: '#ffffff', stroke: bad ? B.pink : B.ink, r: 10, sw: bad ? 3 : 2 });
  out += art.label(x + 59, y + 26, name, { size: 15, anchor: 'middle' });
  lines.forEach((w, i) => {
    out += `<rect x="${x + 14}" y="${y + 44 + i * 16}" width="${w}" height="7" rx="3.5" fill="${B.lav}"/>`;
  });
  return out;
};

const bannerArt = () => {
  let out = '';
  out += card(648, 70, 'Standard', [86, 70, 90, 60, 80, 72]);
  out += card(780, 70, 'Clean', [70, 90, 60, 80, 72]);
  out += card(912, 70, 'Compact', [90, 90, 90, 90, 90, 90], true);
  out += card(1044, 70, 'RAG-ready', [86, 50, 70, 50, 80, 60]);
  out += `<rect x="1058" y="${70 + 60}" width="86" height="4" fill="${B.amber}"/><rect x="1058" y="${70 + 108}" width="86" height="4" fill="${B.amber}"/>`;
  out += `<path d="M960 248L980 268M980 248L960 268" stroke="${B.pink}" stroke-width="4" stroke-linecap="round"/>`;
  out += art.label(992, 266, 'table broken', { size: 15, weight: 600 });
  out += art.label(1101, 252, 'markers', { size: 15, weight: 600, anchor: 'middle', fill: B.amberD });
  out += art.label(648, 300, 'same input, four final passes', { size: 17, weight: 600 });
  return out;
};

export default {
  banner: banner({
    id: 'prof-banner',
    kicker: 'PROFILES',
    hook: ['Four profiles,', 'real differences.'],
    sub: 'Standard, Clean, Compact, RAG-ready',
    art: bannerArt,
  }),
  figures: {
    'profile-diff': figure({
      title: 'One file, four profiles',
      subtitle: 'What each profile did to the same synthetic Markdown file.',
      parts: [
        compare({
          headers: ['FEATURE', 'STANDARD', 'CLEAN', 'COMPACT', 'RAG-READY'],
          widths: [140, 103, 103, 103, 103],
          size: 12,
          rows: [
            { label: 'Source note', cells: [{ t: 'added' }, { t: 'removed' }, { t: 'kept' }, { t: 'kept' }] },
            { label: 'Divider ---', cells: [{ t: 'kept' }, { t: 'kept' }, { t: 'removed' }, { t: 'kept' }] },
            { label: 'Table row ---', cells: [{ t: 'kept' }, { t: 'kept', ok: true }, { t: 'emptied', ok: false }, { t: 'kept', ok: true }] },
            { label: 'March---April', cells: [{ t: 'kept' }, { t: 'kept', ok: true }, { t: 'changed', ok: false }, { t: 'kept', ok: true }] },
            { label: 'Code blank line', cells: [{ t: 'kept' }, { t: 'kept', ok: true }, { t: 'removed', ok: false }, { t: 'kept', ok: true }] },
            { label: 'Marker in code', cells: [{ t: 'no' }, { t: 'no', ok: true }, { t: 'no', ok: true }, { t: 'added', ok: false }] },
            { label: 'Words', cells: [{ t: '98' }, { t: '90' }, { t: '95' }, { t: '118' }] },
          ],
        }),
        note('Crosses mark changes that alter meaning or code. Standard is the reference column.'),
      ],
    }),
    'compact-table': figure({
      title: 'Compact empties the table row',
      subtitle: 'The same lines in Standard and Compact output.',
      parts: [
        panels([
          {
            title: 'Standard',
            tag: 'TABLE',
            s: 's1',
            lines: [
              { t: '| Region | Tickets |' },
              { t: '| --- | --- |', k: 'head' },
              { t: '| North | 1,240 |' },
              { t: 'The pilot ran from March---April 2026.' },
            ],
          },
          {
            title: 'Compact',
            tag: 'NOT A TABLE',
            s: 's3',
            lines: [
              { t: '| Region | Tickets |' },
              { t: '|  |  |', k: 'head' },
              { t: '| North | 1,240 |' },
              { t: 'The pilot ran from MarchApril 2026.', k: 'head' },
            ],
          },
        ]),
        note('Compact deletes every "---" in the text, not only divider lines.'),
      ],
    }),
    'rag-markers': figure({
      title: 'Where RAG-ready put markers',
      subtitle: 'Before every line that starts with ##, including one inside code.',
      parts: [
        panels([
          {
            title: 'RAG-ready output (excerpt)',
            tag: '4 MARKERS',
            s: 's2',
            lines: [
              { t: '# Field Guide', k: 'dim' },
              { t: '<!-- chunk-boundary -->', k: 'head' },
              { t: '## Setup' },
              { t: '### Notes   (no marker)', k: 'dim' },
              { t: '```python' },
              { t: '<!-- chunk-boundary -->', k: 'noise' },
              { t: '## a comment inside code, not a heading' },
              { t: '```' },
              { t: '<!-- chunk-boundary -->', k: 'head' },
              { t: '## Next steps' },
            ],
          },
        ]),
        note('Struck line: the marker inside the code block. Results got a marker too (not shown).'),
      ],
    }),
    'choose-profile': figure({
      title: 'Pick from the content',
      subtitle: 'Profiles apply text rules. Check what your document holds first.',
      parts: [
        decision({
          start: { t: 'A converted document' },
          question: 'Tables, code or --- inside?',
          yes: { t: 'Use Clean', sub: 'or Standard for a source note', s: 's1' },
          no: { t: 'Compact can work', sub: 'read the output first' },
          after: { t: 'Splitting at ## ?', sub: 'RAG-ready: check code blocks', s: 's2' },
        }),
      ],
    }),
  },
};
