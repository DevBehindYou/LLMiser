import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getMarkdownCounts, calculateDocStats } from '../lib/documentStats.js';

// Compatibility oracle: the previous public statistics behavior, including
// whitespace-only text, trailing LF and UTF-16 (rather than grapheme) counts.
function previousCounts(content = '') {
  if (!content) return { characters: 0, charactersNoSpaces: 0, words: 0, lines: 0, tokensEst: 0, readingTime: '0 min' };
  const words = content.trim() ? content.trim().split(/\s+/).filter(Boolean).length : 0;
  return { characters: content.length, charactersNoSpaces: content.replace(/\s/g, '').length,
    words, lines: content.split('\n').length, tokensEst: Math.max(1, Math.round(content.length / 4)),
    readingTime: words < 120 ? '< 1 min' : `${Math.max(1, Math.ceil(words / 200))} min read` };
}

test('shared counts preserve empty, Unicode, Markdown and reading-time boundary behavior', () => {
  for (const content of [undefined, null, '', ' ', '\n', 'a\r\nb\n', 'a\rb',
    '# Titel\n\n日本語 中文 Русский español 🙂 e\u0301\n', 'a\u200bb\u0085c',
    ...[119, 120, 199, 200, 201].map(count => Array(count).fill('word').join(' '))]) {
    const expected = previousCounts(content);
    assert.deepEqual(getMarkdownCounts(content), expected);
    const { characters, words, lines, tokensEst, readingTime } = expected;
    assert.deepEqual(calculateDocStats(content), { characters, words, lines, tokens: tokensEst, readingTime });
  }
});

test('scanner matches ECMAScript whitespace semantics for every BMP code unit', () => {
  for (let code = 0; code <= 0xffff; code += 1) {
    const content = `a${String.fromCharCode(code)}b`;
    assert.deepEqual(getMarkdownCounts(content), previousCounts(content), `U+${code.toString(16)}`);
  }
});

test('mixed document and long-line counts stay equivalent at representative large sizes', () => {
  const row = '| 日本語 🙂 | invoice 2048 |\t$315\r\n\u00a0\u2028';
  for (const content of [row.repeat(35000), 'x'.repeat(2 * 1024 * 1024), ' \t\n'.repeat(350000)]) {
    assert.deepEqual(getMarkdownCounts(content), previousCounts(content));
  }
});
