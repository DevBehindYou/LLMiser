export const MAX_MARKDOWN = 500_000;

export function filenameFor(title) {
  const stem = String(title || 'llmiser-file').normalize('NFC')
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '-').replace(/\s+/g, ' ').trim().slice(0, 100).replace(/[. ]+$/, '');
  return `${/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(stem) ? '_' : ''}${stem || 'llmiser-file'}.md`;
}

export function textStats(text) {
  const characters = Array.from(text).length;
  return { characters, words: (text.match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu) || []).length,
    tokens: Math.ceil(characters / 4) };
}

// Retain only file-draft fields, never arbitrary objects or signed URLs.
export function draftRecord(value) {
  if (!value || value.mode !== 'file' || typeof value.markdown !== 'string' || value.markdown.length > MAX_MARKDOWN) return null;
  return { markdown: value.markdown, title: String(value.title || 'Untitled file').slice(0, 300),
    mode: 'file',
    capturedAt: typeof value.capturedAt === 'string' ? value.capturedAt.slice(0, 40) : '',
    warnings: Array.isArray(value.warnings) ? value.warnings.filter(x => typeof x === 'string').slice(0, 8).map(x => x.slice(0, 220)) : [] };
}

export function pendingJobRecord(value) {
  if (!value || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(value.jobId || '') ||
      typeof value.filename !== 'string' || !value.filename.trim() || !['uploading','processing'].includes(value.phase)) return null;
  return { jobId: value.jobId, filename: value.filename.slice(0,300), phase: value.phase };
}
