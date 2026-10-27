// Informational local comparison; timing is not a CI pass/fail threshold.
// Run: node --expose-gc --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/benchmark-document-stats.mjs
import { performance } from 'node:perf_hooks';
import { getMarkdownCounts } from '../lib/documentStats.js';

// Previous reader work: a separate line split plus the status bar's full scans.
function previousReader(content) {
  const editorLines = content.split('\n').length;
  const charactersNoSpaces = content.replace(/\s/g, '').length;
  const lines = content.split('\n').length;
  const trimmed = content.trim();
  const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
  const tokensEst = Math.max(1, Math.round(content.length / 4));
  const readingTime = words < 120 ? '< 1 min' : `${Math.max(1, Math.ceil(words / 200))} min read`;
  return { editorLines, characters: content.length, charactersNoSpaces, words, lines, tokensEst, readingTime };
}

function measure(run, content) {
  run(content); run(content);
  const timings=[];
  for(let sample=0;sample<9;sample+=1) {
    global.gc?.();
    const started=performance.now();
    const stats=run(content);
    timings.push(performance.now()-started);
    if(!stats.characters) throw new Error('Missing benchmark result');
  }
  return Number(timings.sort((a,b)=>a-b)[4].toFixed(3));
}

const rows=[];
for(const [fixture,row] of [
  ['markdown','# Invoice 2048\n\n| Item | Total |\n| --- | --- |\n| Service | $315 |\n\nMake every token count.\n'],
  ['unicode','# 日本語 中文 Русский Español 🙂\n\nInvoice\t2048\u00a0total\u3000$315\r\n'],
  ['single-line','abcdefghij'],
]) {
  for(const characters of [10*1024,1024*1024,5*1024*1024]) {
    const content=row.repeat(Math.ceil(characters/row.length)).slice(0,characters);
    const previousMs=measure(previousReader,content);
    const sharedMs=measure(getMarkdownCounts,content);
    rows.push({fixture,characters,previousMs,sharedMs,speedup:Number((previousMs/sharedMs).toFixed(2))});
  }
}
console.log(JSON.stringify({node:process.version,samples:9,statistic:'median milliseconds',rows},null,2));
