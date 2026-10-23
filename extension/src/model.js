export const MAX_MARKDOWN = 500_000;

export function sourceUrl(value) {
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) return '';
    url.username = ''; url.password = ''; url.search = ''; url.hash = '';
    return url.href;
  } catch { return ''; }
}

export function filenameFor(title) {
  const stem = String(title || 'llmiser-page').normalize('NFC')
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '-').replace(/\s+/g, ' ').trim().slice(0, 100).replace(/[. ]+$/, '');
  return `${/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(stem) ? '_' : ''}${stem || 'llmiser-page'}.md`;
}

export function textStats(text) {
  const characters = Array.from(text).length;
  return { characters, words: (text.match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu) || []).length,
    tokens: Math.ceil(characters / 4) };
}

// Session storage is an allowlist: no arbitrary page objects, HTML or URLs
// with query strings/fragments become part of the retained draft metadata.
export function draftRecord(value) {
  if (!value || typeof value.markdown !== 'string' || value.markdown.length > MAX_MARKDOWN) return null;
  return { markdown: value.markdown, title: String(value.title || 'Untitled page').slice(0, 300),
    sourceUrl: sourceUrl(value.sourceUrl), mode: ['article', 'page', 'selection', 'file'].includes(value.mode) ? value.mode : 'page',
    capturedAt: typeof value.capturedAt === 'string' ? value.capturedAt.slice(0, 40) : '',
    warnings: Array.isArray(value.warnings) ? value.warnings.filter(x => typeof x === 'string').slice(0, 8).map(x => x.slice(0, 220)) : [] };
}
