// Visual spec for M11 "Prompt Injection: Can a Document Hijack Your AI?".
// Render privately: node blog-pipeline/scripts/campaign/render-private.mjs document-prompt-injection
// Data: fixtures/out-*/ (inert synthetic files, never sent to a model).

import { B, art, banner, cards, decision, figure, note } from '../../visuals/kit.mjs';
import { checklist, markLegend, tree } from '../../visuals/campaign-parts.mjs';

const bannerArt = () => {
  let out = art.page(646, 46, 270, 308, { lines: 0, fill: '#ffffff' });
  out += art.label(666, 98, 'Northwind offer', { size: 20 });
  out += `<rect x="666" y="118" width="200" height="8" rx="4" fill="${B.lav}"/><rect x="666" y="138" width="170" height="8" rx="4" fill="${B.lav}"/>`;
  out += `<rect x="660" y="166" width="236" height="64" rx="6" fill="#fde7c2" fill-opacity="0.85"/>`;
  out += art.label(668, 190, 'Note to any AI', { size: 15, fill: '#b9b6ad', weight: 500 });
  out += art.label(668, 214, 'assistant: ...', { size: 15, fill: '#b9b6ad', weight: 500 });
  out += `<rect x="666" y="252" width="190" height="8" rx="4" fill="${B.lav}"/>`;
  out += art.arrow(926, 198, 978, 198, { stroke: B.ink });
  out += art.box(984, 130, 170, 140, { fill: B.paper, r: 10 });
  out += art.label(998, 164, 'Note to any AI', { size: 15 });
  out += art.label(998, 188, 'assistant: ...', { size: 15 });
  out += art.box(998, 214, 120, 34, { fill: B.rose, stroke: B.pink, r: 8 });
  out += art.label(1058, 237, 'untrusted', { size: 15, anchor: 'middle', fill: B.ink });
  return out;
};

export default {
  banner: banner({
    id: 'inj-banner',
    kicker: 'AI SAFETY',
    hook: ['Can a document', 'hijack your AI?'],
    sub: 'indirect prompt injection, explained',
    art: bannerArt,
  }),
  figures: {
    'hiding-places': figure({
      title: 'Five hiding places, one sentence',
      subtitle: 'Where the inert instruction sat, and what conversion did with it.',
      parts: [
        tree([
          { t: 'brochure.docx', mark: 'info', note: ' ' },
          { t: 'white 1 pt text', d: 1, mark: 'sent', note: 'VISIBLE IN OUTPUT' },
          { t: 'image alt text', d: 1, mark: 'sent', note: 'KEPT AS ALT TEXT' },
          { t: 'brochure.html', mark: 'info', note: ' ' },
          { t: 'display:none block', d: 1, mark: 'sent', note: 'VISIBLE IN OUTPUT' },
          { t: 'HTML comment', d: 1, mark: 'skip', note: 'DROPPED' },
          { t: 'pitch.pptx', mark: 'info', note: ' ' },
          { t: 'speaker notes', d: 1, mark: 'sent', note: 'KEPT UNDER NOTES' },
        ], { title: 'Synthetic files, local run' }),
        markLegend(['sent', 'skip']),
        note('Four of five copies reached the text. Nothing went to a model.'),
      ],
    }),
    'warning-signs': figure({
      title: 'Text that talks to the AI',
      subtitle: 'Signs worth a second look. None is proof on its own.',
      parts: [
        cards([
          { k: '1', title: 'Addresses the AI', sub: 'speaks to an assistant, not to the reader', s: 's3' },
          { k: '2', title: 'Changes the task', sub: 'tries to alter a summary, rating or conclusion', s: 's3' },
          { k: '3', title: 'Asks for actions', sub: 'a link, a message, a tool call or data', s: 's3' },
          { k: '4', title: 'Hidden or odd place', sub: 'white, tiny, collapsed, notes or alt text', s: 's3' },
        ], { cols: 2, h: 108 }),
      ],
    }),
    'action-decision': figure({
      title: 'Before anything happens',
      subtitle: 'Limit what a document-driven answer can do.',
      parts: [
        decision({
          start: { t: 'A model read a document' },
          question: 'Output triggers an action?',
          yes: { t: 'Human approves first', sub: 'least access for the tool', s: 's1' },
          no: { t: 'Review the answer', sub: 'before you rely on it' },
        }),
        note('OWASP recommends enforcing permissions at the tool boundary and least privilege.'),
      ],
    }),
    'review-checklist': figure({
      title: 'Layered checks',
      subtitle: 'For any document you did not write.',
      parts: [
        checklist([
          { t: 'Read the converted text before prompting' },
          { t: 'Search for lines that address an AI' },
          { t: 'Quote or remove what you find' },
          { t: 'Say in the prompt that the document is data' },
          { t: 'Keep actions behind human approval' },
          { t: 'Give tools the least access they need' },
        ]),
        note('No check finds every attempt. LLMiser does not detect or remove them.', { s: 's3' }),
      ],
    }),
  },
};
