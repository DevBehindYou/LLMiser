import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readDictionaries } from '../scripts/check-i18n.mjs';
import { PRIVACY_POLICY } from '../lib/legal/policies.js';

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const directory = fs.mkdtempSync(path.join(testDirectory,'.locale-runtime-'));
after(() => {
  assert.equal(path.dirname(path.resolve(directory)),testDirectory);
  assert.ok(path.basename(directory).startsWith('.locale-runtime-'));
  fs.rmSync(directory,{recursive:true,force:true});
});
const require = createRequire(import.meta.url);
const { transform } = require('next/dist/build/swc');
const files = { I18nContext:'i18n/I18nContext', LanguageSelector:'i18n/LanguageSelector', ProfileSelector:'converter/ProfileSelector', PreviewBoundary:'PreviewBoundary', LegalDocument:'LegalDocument', ResultOutputs:'converter/ResultOutputs', ExportActions:'converter/ExportActions' };
for (const [name,relative] of Object.entries(files)) {
  const input = new URL(`../components/${relative}.js`,import.meta.url);
  let source = fs.readFileSync(input,'utf8');
  source = source.replace(/from\s*(['"])(\.[^'"]+)\1/g,(_match,_quote,specifier) => {
    if (specifier.endsWith('I18nContext')) return "from './I18nContext.mjs'";
    const target = new URL(specifier.endsWith('.js') ? specifier : `${specifier}.js`,input);
    return `from ${JSON.stringify(target.href)}`;
  });
  const compiled = await transform(source,{ filename:`${name}.js`,jsc:{parser:{syntax:'ecmascript',jsx:true},transform:{react:{runtime:'automatic'}}},module:{type:'es6'} });
  fs.writeFileSync(path.join(directory,`${name}.mjs`),compiled.code);
}
const load = name => import(pathToFileURL(path.join(directory,`${name}.mjs`)));
const { I18nContext, EnglishContent } = await load('I18nContext');
const { default:Selector } = await load('LanguageSelector');
const { default:Profiles } = await load('ProfileSelector');
const { PlainTextPreview } = await load('PreviewBoundary');
const { default:Legal } = await load('LegalDocument');
const { default:Outputs } = await load('ResultOutputs');
const { default:Exports } = await load('ExportActions');
const dictionaries = readDictionaries();
const scope = (locale,child) => React.createElement(I18nContext.Provider,{value:{locale,requested:locale,messages:dictionaries[locale],pending:false,blog:false,setLocale:()=>{}}},child);

test('all six languages render an accessible selector and translated profile labels with the same selected wire profile',()=>{
  for (const locale of Object.keys(dictionaries)) {
    const html = renderToStaticMarkup(scope(locale,React.createElement(Selector)));
    assert.ok(html.includes(`aria-label="${dictionaries[locale].Language}"`));
    assert.equal((html.match(/<option /g)||[]).length,6);
    const selected = html.match(/<option\b[^>]*\bselected=""[^>]*>/g) || [];
    assert.equal(selected.length,1);
    assert.ok(selected[0].includes(`value="${locale}"`));
    const profiles = renderToStaticMarkup(scope(locale,React.createElement(Profiles,{profile:'Clean',onChange:()=>{}})));
    assert.equal((profiles.match(/aria-pressed="true"/g)||[]).length,1);
    assert.ok(profiles.includes(dictionaries[locale].Clean));
  }
});

test('an English blog scope overrides the saved app language and hides its language selector',()=>{
  const english = React.createElement(EnglishContent,null,React.createElement(React.Fragment,null,React.createElement(Selector),React.createElement(Profiles,{profile:'Clean',onChange:()=>{}})));
  const html = renderToStaticMarkup(scope('ja',english));
  assert.ok(html.includes('lang="en-US"'));assert.equal(html.includes('<select'),false);
  assert.ok(html.includes('Clean'));assert.equal(html.includes('クリーン'),false);
});

test('translated preview controls leave original document text and markup bytes untouched and escaped',()=>{
  const document = 'Choose files — 原文 🙂\n<script>alert(1)</script>';
  const html = renderToStaticMarkup(scope('de',React.createElement(PlainTextPreview,{content:document,loading:true})));
  assert.ok(html.includes(dictionaries.de['Loading formatted preview…']));
  assert.ok(html.includes('Choose files — 原文 🙂'));
  assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
  assert.equal(html.includes('<script>'),false);
});

test('legal summaries and full policy sections translate while contact links and retention limits remain intact',()=>{
  for (const locale of Object.keys(dictionaries)) {
    const html = renderToStaticMarkup(scope(locale,React.createElement(Legal,{doc:PRIVACY_POLICY})));
    assert.ok(html.includes(dictionaries[locale][PRIVACY_POLICY.summary[0]]));
    assert.ok(html.includes(dictionaries[locale]['4. How long we keep it']));
    assert.ok(html.includes('mailto:devbehindyou@gmail.com'));assert.ok(html.includes('48'));
    assert.ok(html.includes('id="retention"'));
    for (const section of PRIVACY_POLICY.sections) for (const block of section.blocks) {
      for (const text of [block.p, block.note, ...(block.ul || [])].filter(Boolean)) assert.ok(dictionaries[locale][text], `${locale}: missing policy copy`);
    }
  }
});

test('recovery and export labels translate without changing original output names or download endpoints',()=>{
  const job_id = '123e4567-e89b-42d3-a456-426614174000';
  for (const locale of Object.keys(dictionaries)) {
    const name = 'Choose files  原文.md';
    const html = renderToStaticMarkup(scope(locale,React.createElement(Outputs,{result:{job_id,outputs:[{name}]}})));
    assert.ok(html.includes(name));
    assert.ok(html.includes(`/api/jobs/${job_id}/download?output=${encodeURIComponent(name)}`));
    assert.ok(html.includes(dictionaries[locale]['Original output files ({count})'].replace('{count}','1')));
    const controls = renderToStaticMarkup(scope(locale,React.createElement(Exports,{hasActive:true,hasResults:true,copied:false})));
    assert.ok(controls.includes(dictionaries[locale]['Copy to clipboard']));
    assert.ok(controls.includes(dictionaries[locale]['Download .md file']));
  }
});
