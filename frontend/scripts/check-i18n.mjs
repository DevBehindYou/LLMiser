import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LANGUAGES } from '../lib/i18n/core.js';

export function readDictionaries() {
  const directory = new URL('../lib/i18n/messages/', import.meta.url);
  return Object.fromEntries(LANGUAGES.map(({ code }) => [code, JSON.parse(fs.readFileSync(new URL(`${code}.json`, directory), 'utf8'))]));
}
export function validateDictionaries(dictionaries) {
  const errors = [];
  const english = dictionaries['en-US'];
  const keys = Object.keys(english).sort();
  const placeholders = text => [...text.matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort().join(',');
  for (const { code } of LANGUAGES) {
    const dictionary = dictionaries[code];
    if (JSON.stringify(Object.keys(dictionary).sort()) !== JSON.stringify(keys)) errors.push(`${code}: message keys differ from English`);
    for (const key of keys) {
      const value = dictionary[key];
      if (typeof value !== 'string' || !value.trim()) errors.push(`${code}: empty or missing message ${key}`);
      else if (placeholders(value) !== placeholders(english[key])) errors.push(`${code}: changed placeholders in ${key}`);
    }
  }
  return errors;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const dictionaries = readDictionaries();
  const errors = validateDictionaries(dictionaries);
  if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
  else console.log(`${LANGUAGES.length} locales, ${Object.keys(dictionaries['en-US']).length} messages each: keys, content and placeholders passed.`);
}
