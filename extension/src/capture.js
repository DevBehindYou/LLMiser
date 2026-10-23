import { Readability } from '@mozilla/readability';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';
import { MAX_MARKDOWN, sourceUrl } from './model.js';

export class CaptureError extends Error {}
const OMIT = new Set(['SCRIPT','STYLE','NOSCRIPT','TEMPLATE','IFRAME','OBJECT','EMBED','CANVAS','SVG',
  'FORM','INPUT','TEXTAREA','SELECT','BUTTON','AUDIO','VIDEO','SOURCE','LINK','META']);
const TAGS = new Set('A ABBR ADDRESS ARTICLE ASIDE B BLOCKQUOTE BR CAPTION CODE DD DEL DETAILS DFN DIV DL DT EM FIGCAPTION FIGURE H1 H2 H3 H4 H5 H6 HEADER HR I KBD LI MAIN MARK NAV OL P PRE Q S SAMP SECTION SMALL SPAN STRONG SUB SUMMARY SUP TABLE TBODY TD TFOOT TH THEAD TIME TR U UL VAR'.split(' '));
const escapeInline = value => value.replace(/\s+/g, ' ').trim().replace(/[\\`*_{}[\]<>#]/g, '\\$&');

function safeLink(value, base, image = false) {
  if (!value.trim()) return '';
  try {
    const url = new URL(value, base);
    if (!(image ? ['http:', 'https:'] : ['http:', 'https:', 'mailto:']).includes(url.protocol)) return '';
    url.username = ''; url.password = '';
    return url.href.replace(/[()]/g, x => x === '(' ? '%28' : '%29');
  } catch { return ''; }
}

// Build a detached, inert copy instead of inserting the site's HTML into
// the extension. Never copy executable/resource attributes or field values.
function inertCopy(source, targetDoc, { range, base, view, budget, warnings }, depth = 0) {
  if (++budget.nodes > 40_000 || depth > 120) throw new CaptureError('This page is too large to capture safely. Select a smaller section instead.');
  if (range && !range.intersectsNode(source)) return null;
  if (source.nodeType === 3) {
    const from = range?.startContainer === source ? range.startOffset : 0;
    const to = range?.endContainer === source ? range.endOffset : source.data.length;
    const text = source.data.slice(from, to);
    budget.characters += text.length;
    if (budget.characters > 2_000_000) throw new CaptureError('This page is too large. Select a smaller section instead.');
    return targetDoc.createTextNode(text);
  }
  if (source.nodeType !== 1) return null;
  if (source.tagName === 'IFRAME' || source.shadowRoot) warnings.add('Embedded frames and shadow DOM are not included.');
  if (OMIT.has(source.tagName)) return null;
  if (source.hidden || source.getAttribute('aria-hidden') === 'true' || source.isContentEditable ||
      (source.hasAttribute('contenteditable') && source.getAttribute('contenteditable') !== 'false')) return null;
  const style = view?.getComputedStyle(source);
  if (style?.display === 'none' || style?.opacity === '0' || ['hidden','collapse'].includes(style?.visibility)) return null;
  if (source.tagName === 'IMG') {
    const node = targetDoc.createElement('span');
    const alt = (source.getAttribute('alt') || '').slice(0, 500);
    node.setAttribute('data-llmiser-image', alt);
    node.setAttribute('data-llmiser-src', safeLink(source.getAttribute('src') || '', base, true));
    node.textContent = alt ? `[Image: ${alt}]` : '';
    return node;
  }
  const node = targetDoc.createElement(TAGS.has(source.tagName) ? source.tagName.toLowerCase() : 'div');
  for (const attribute of ['id','class','role','dir','lang','rowspan','colspan','start']) {
    const value = source.getAttribute(attribute);
    if (value && value.length < 1000) node.setAttribute(attribute, value);
  }
  if (source.tagName === 'A') {
    const href = safeLink(source.getAttribute('href') || '', base);
    if (href) node.setAttribute('href', href);
  }
  if (budget.nodes + source.childNodes.length > 40_000) {
    throw new CaptureError('This page is too large to capture safely. Select a smaller section instead.');
  }
  for (const child of source.childNodes) {
    const copy = inertCopy(child, targetDoc, { range, base, view, budget, warnings }, depth + 1);
    if (copy) node.appendChild(copy);
  }
  return node;
}

function markdownFrom(root, { includeImages, warnings }) {
  for (const table of root.querySelectorAll('table')) {
    if (table.querySelector('[rowspan]:not([rowspan="1"]),[colspan]:not([colspan="1"])')) {
      warnings.add('Merged table cells cannot be represented exactly in Markdown. Review the table.');
    }
    const first = table.querySelector('tr');
    if (first && !first.querySelector('th')) {
      for (const cell of Array.from(first.children)) {
        if (cell.tagName !== 'TD') continue;
        const th = root.ownerDocument.createElement('th');
        while (cell.firstChild) th.appendChild(cell.firstChild);
        cell.replaceWith(th);
      }
      warnings.add('A table had no header. Its first row is used as the Markdown header.');
    }
  }
  const converter = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced', bulletListMarker: '-', emDelimiter: '*' });
  converter.use(gfm);
  converter.addRule('safeCodeFence', { filter: 'pre', replacement: (_content, node) => {
    const code = node.querySelector('code') || node;
    const text = code.textContent || '';
    const language = /(?:^|\s)language-([\w+-]+)/.exec(code.className || '')?.[1] || '';
    const longest = (text.match(/`+/g) || []).reduce((max, x) => Math.max(max, x.length), 0);
    const fence = '`'.repeat(Math.max(3, longest + 1));
    return `\n\n${fence}${language}\n${text.replace(/\n$/, '')}\n${fence}\n\n`;
  } });
  converter.addRule('inertImage', { filter: node => node.hasAttribute?.('data-llmiser-image'), replacement: (_content, node) => {
    const rawAlt = node.getAttribute('data-llmiser-image') || '';
    const alt = escapeInline(rawAlt || 'Image');
    const href = node.getAttribute('data-llmiser-src');
    return includeImages && href ? `![${alt}](${href})` : rawAlt ? `[Image: ${alt}]` : '';
  } });
  return converter.turndown(root).trim();
}

export function captureDocument(doc, { mode = 'article', includeSource = true, includeImages = false,
  selection = doc.defaultView?.getSelection(), now = () => new Date().toISOString() } = {}) {
  if (!['article','page','selection'].includes(mode)) throw new CaptureError('Choose a capture mode.');
  const url = sourceUrl(doc.location?.href || doc.URL);
  if (!url) throw new CaptureError('Open a normal HTTP or HTTPS webpage before capturing.');
  if (!doc.body) throw new CaptureError('This page is not ready. Try again after it loads.');
  const warnings = new Set();
  let range = null;
  let source = doc.body;
  if (mode === 'selection') {
    if (!selection || selection.isCollapsed || !selection.rangeCount || !selection.toString().trim()) {
      throw new CaptureError('Select text in the webpage first, then capture selection. Text inside form fields is excluded.');
    }
    range = selection.getRangeAt(0).cloneRange();
    source = range.commonAncestorContainer;
    if (source.nodeType !== 1) source = source.parentElement;
    for (let ancestor = source; ancestor; ancestor = ancestor.parentElement) {
      const style = doc.defaultView?.getComputedStyle(ancestor);
      if (OMIT.has(ancestor.tagName) || ancestor.hidden || ancestor.getAttribute('aria-hidden') === 'true' ||
        (ancestor.hasAttribute('contenteditable') && ancestor.getAttribute('contenteditable') !== 'false') ||
        style?.display === 'none' || style?.opacity === '0' || ['hidden','collapse'].includes(style?.visibility)) {
        throw new CaptureError('Choose readable page text outside hidden content or form fields.');
      }
    }
  }
  const clone = doc.implementation.createHTMLDocument(doc.title.slice(0, 300));
  const copied = inertCopy(source, clone, { range, base: doc.baseURI, view: doc.defaultView, budget: { nodes: 0, characters: 0 }, warnings });
  if (!copied) throw new CaptureError('There is no readable content in this capture.');
  if (copied.tagName === 'BODY') { while (copied.firstChild) clone.body.appendChild(copied.firstChild); }
  else clone.body.appendChild(copied);
  let root = clone.body;
  let title = doc.title || 'Untitled page';
  let actualMode = mode;
  if (mode === 'article') {
    const article = new Readability(clone.cloneNode(true), { serializer: el => el, keepClasses: true, charThreshold: 120 }).parse();
    if (article?.content?.textContent?.trim()) { root = article.content; title = article.title || title; }
    else {
      root = clone.querySelector('main,[role="main"],article') || clone.body;
      actualMode = 'page'; warnings.add('No readable article was found. Page content was captured instead.');
    }
  }
  let markdown = markdownFrom(root, { includeImages, warnings });
  if (!markdown.trim()) throw new CaptureError('No readable text was found. Try selecting the section you need.');
  title = title.replace(/\s+/g, ' ').trim().slice(0, 300);
  if (includeSource) markdown = `Source: <${url}>\n\n${markdown}`;
  if (mode !== 'selection' && !markdown.match(/^# /m)) markdown = `# ${escapeInline(title)}\n\n${markdown}`;
  markdown += '\n';
  if (markdown.length > MAX_MARKDOWN) throw new CaptureError('The Markdown is too large for this panel. Select a smaller section instead.');
  return { markdown, title, sourceUrl: url, mode: actualMode, capturedAt: now(), warnings: [...warnings] };
}
