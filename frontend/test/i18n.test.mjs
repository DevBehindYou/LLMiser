import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LANGUAGES, DEFAULT_LOCALE, validLocale, isBlogPath, translateMessage } from '../lib/i18n/core.js';
import { readDictionaries, validateDictionaries } from '../scripts/check-i18n.mjs';

const dictionaries = readDictionaries();

test('six supported interface languages have complete keys and matching interpolation parameters', () => {
  assert.deepEqual(LANGUAGES.map(language => language.code), ['en-US','de','ja','es','ru','zh-CN']);
  assert.ok(Object.keys(dictionaries['en-US']).length > 500);
  assert.deepEqual(validateDictionaries(dictionaries), []);
  for (const locale of ['de','ja','es','ru','zh-CN']) {
    assert.notEqual(dictionaries[locale]['Choose files'], 'Choose files');
    assert.notEqual(dictionaries[locale]['Privacy Policy'], 'Privacy Policy');
  }
});

test('untrusted locale preferences cannot select a module and blog matching is segment-bound', () => {
  for (const value of [null,undefined,'fr','../../private','DE','zh','']) assert.equal(validLocale(value),DEFAULT_LOCALE);
  assert.equal(validLocale('ja'),'ja');assert.equal(validLocale('zh-CN'),'zh-CN');
  assert.equal(isBlogPath('/blog'),true);assert.equal(isBlogPath('/blog/article'),true);
  assert.equal(isBlogPath('/blogger'),false);assert.equal(isBlogPath('/'),false);
});

test('interpolation preserves filenames and user values verbatim without translating or recursively expanding them', () => {
  const result = translateMessage(dictionaries.de, 'Loaded "{v0}" from recent sessions', {v0:'Choose files <script>{v1}</script> 漢字🙂'});
  assert.ok(result.includes('Choose files <script>{v1}</script> 漢字🙂'));
  assert.equal(translateMessage(dictionaries.ja,'  Choose files  '),'  ファイルを選択  ');
  assert.equal(translateMessage(dictionaries.ru,'An unknown diagnostic'),'An unknown diagnostic');
});

test('app-generated dynamic notices use translated templates while captured names remain unchanged', () => {
  const source = 'Loaded "Choose files.md" from recent sessions';
  assert.equal(translateMessage(dictionaries.de,source),'„Choose files.md“ aus dem Verlauf geladen');
  assert.equal(translateMessage(dictionaries['zh-CN'],'Convert all (20)'),'全部转换（20）');
});

test('dictionary validation rejects omissions and lost placeholder values', () => {
  const changed = structuredClone(dictionaries); delete changed.es['Choose files'];
  changed.ja['Convert all ({v0})'] = 'すべて変換';
  assert.ok(validateDictionaries(changed).some(error => error.startsWith('es:')));
  assert.ok(validateDictionaries(changed).some(error => error.startsWith('ja: changed placeholders')));
});
