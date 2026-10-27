// Keep the existing UTF-16 character, LF line and whitespace-delimited word
// semantics. These are document metrics, not language-specific tokenization.
function isWhitespace(code) {
  return (code >= 9 && code <= 13) || code === 32 || code === 160 ||
    code === 5760 || (code >= 8192 && code <= 8202) ||
    code === 8232 || code === 8233 || code === 8239 || code === 8287 ||
    code === 12288 || code === 65279;
}

/** Count without constructing document-sized word/line arrays or text copies. */
export function getMarkdownCounts(content = '') {
  const characters = content?.length || 0;
  let charactersNoSpaces = 0;
  let words = 0;
  let lines = characters ? 1 : 0;
  let inWord = false;
  // Native regexp scanning is much faster for a long unbroken source line;
  // mixed documents normally stop this probe at their first space/newline.
  if (characters && !/\s/.test(content)) {
    charactersNoSpaces = characters;
    words = 1;
  } else {
    for (let index = 0; index < characters; index += 1) {
      const code = content.charCodeAt(index);
      if (code === 10) lines += 1;
      if (isWhitespace(code)) {
        inWord = false;
      } else {
        charactersNoSpaces += 1;
        if (!inWord) words += 1;
        inWord = true;
      }
    }
  }
  return {
    characters,
    charactersNoSpaces,
    words,
    lines,
    tokensEst: characters ? Math.max(1, Math.round(characters / 4)) : 0,
    readingTime: !characters ? '0 min' : words < 120 ? '< 1 min' : `${Math.max(1, Math.ceil(words / 200))} min read`,
  };
}

// Preserve the header helper's existing public return shape.
export function calculateDocStats(content = '') {
  const { characters, words, lines, tokensEst, readingTime } = getMarkdownCounts(content);
  return { characters, words, lines, tokens: tokensEst, readingTime };
}
