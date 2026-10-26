export const DEFAULT_LOCALE = 'en-US';
export const LANGUAGE_KEY = 'llmiser-language';
export const LANGUAGES = [
  { code: 'en-US', name: 'English (US)' },
  { code: 'de', name: 'Deutsch' },
  { code: 'ja', name: '日本語' },
  { code: 'es', name: 'Español' },
  { code: 'ru', name: 'Русский' },
  { code: 'zh-CN', name: '简体中文' },
];
export const validLocale = value => LANGUAGES.some(language => language.code === value) ? value : DEFAULT_LOCALE;
export const isBlogPath = pathname => pathname === '/blog' || pathname?.startsWith('/blog/');
export const messageKey = value => value.replace(/\s+/g, ' ').trim();
const patternCache = new WeakMap();
function patterns(messages) {
  if (patternCache.has(messages)) return patternCache.get(messages);
  const compiled = Object.keys(messages).filter(key => /\{\w+\}/.test(key)).map(key => {
    const names = [];
    const expression = key.split(/(\{\w+\})/g).map(part => {
      if (/^\{\w+\}$/.test(part)) { names.push(part.slice(1,-1)); return '([\\s\\S]*?)'; }
      return part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }).join('');
    return { expression: new RegExp(`^${expression}$`), names, template: messages[key] };
  });
  patternCache.set(messages, compiled); return compiled;
}

// Only explicitly marked app copy passes here. Never walk the DOM or translate
// file contents, Markdown, filenames, code, API fields, URLs or blog articles.
export function translateMessage(messages, value, parameters = {}) {
  if (typeof value !== 'string') return value;
  const key = messageKey(value);
  let template = Object.hasOwn(messages, key) ? messages[key] : value;
  if (!Object.hasOwn(messages, key) && key.length < 8192) {
    for (const pattern of patterns(messages)) {
      const match = pattern.expression.exec(key);
      if (match) { template = pattern.template; parameters = Object.fromEntries(pattern.names.map((name,index) => [name,match[index+1]])); break; }
    }
  }
  const result = template.replace(/\{(\w+)\}/g, (match, name) => Object.hasOwn(parameters, name) ? String(parameters[name]) : match);
  return key === value ? result : `${value.match(/^\s*/)[0]}${result.trim()}${value.match(/\s*$/)[0]}`;
}
