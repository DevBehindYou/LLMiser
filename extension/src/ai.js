export function aiSite(url) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return null;
    if (['chatgpt.com', 'chat.openai.com'].includes(parsed.hostname)) return { id: 'chatgpt', label: 'ChatGPT' };
    if (parsed.hostname === 'claude.ai') return { id: 'claude', label: 'Claude' };
    if (parsed.hostname === 'gemini.google.com') return { id: 'gemini', label: 'Gemini' };
  } catch { /* An unavailable tab URL has no recognized AI destination. */ }
  return null;
}

// Self-contained for chrome.scripting.executeScript's isolated world. Never
// submit, click Send, overwrite a nonempty draft, or return composer contents.
export function pasteIntoComposer({ site, text }) {
  const definitions = {
    chatgpt: { hosts: ['chatgpt.com', 'chat.openai.com'], selectors: ['#prompt-textarea'] },
    claude: { hosts: ['claude.ai'], selectors: ['[contenteditable="true"][role="textbox"]', '[contenteditable="true"].ProseMirror'] },
    gemini: { hosts: ['gemini.google.com'], selectors: ['rich-textarea [contenteditable="true"][role="textbox"]', 'rich-textarea [contenteditable="true"]'] },
  };
  const definition = definitions[site];
  if (location.protocol !== 'https:' || !definition?.hosts.includes(location.hostname) || typeof text !== 'string' || !text.trim() || text.length > 500_000) {
    return { ok: false, error: 'The AI tab changed. Detect it again before pasting.' };
  }
  const candidates = [...new Set(definition.selectors.flatMap(selector => [...document.querySelectorAll(selector)]))]
    .filter(element => {
      const style = getComputedStyle(element);
      return (element instanceof HTMLTextAreaElement || element.isContentEditable) &&
        !element.disabled && !element.readOnly && element.getAttribute('aria-disabled') !== 'true' &&
        element.getClientRects().length > 0 && style.display !== 'none' && style.visibility !== 'hidden';
    });
  if (candidates.length !== 1) return { ok: false, error: 'No single editable AI composer was found. Open a chat, or use Copy Markdown and paste it yourself.' };
  const element = candidates[0];
  const existing = element instanceof HTMLTextAreaElement ? element.value : element.textContent;
  if (existing?.replace(/\u200b/g, '').trim()) return { ok: false, error: 'Your AI composer already has text. It was preserved. Clear it first, or copy and paste manually.' };
  element.focus();
  if (element instanceof HTMLTextAreaElement) {
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(element, text);
    element.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: text }));
  } else {
    const range = document.createRange(); range.selectNodeContents(element);
    const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
    // insertText preserves plain text, and supports the native undo stack in
    // contenteditable editors. If the editor rejects it, do not force HTML in.
    if (!document.execCommand('insertText', false, text)) {
      return { ok: false, error: 'The AI editor blocked pasting. Use Copy Markdown, then paste into the chat.' };
    }
  }
  const actual = element instanceof HTMLTextAreaElement ? element.value : element.innerText;
  return actual?.replace(/\r\n/g, '\n').trim() === text.replace(/\r\n/g, '\n').trim()
    ? { ok: true } : { ok: false, error: 'The AI editor changed the inserted text. Review the composer before sending.' };
}
