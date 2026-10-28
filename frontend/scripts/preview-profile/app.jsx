import React, { useCallback, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import MarkdownViewer from '../../components/MarkdownViewer';
import { snapshotWithPendingEdits } from '../../lib/models/editorExport';

const chunk = '# Invoice 原文\n\nA generated document with **emphasis**, [reference](https://example.test), and multilingual words 日本語 Deutsch español.\n\n| Item | Amount |\n| --- | --- |\n| Services | 315 |\n\n- First item\n- Second item\n\n```js\nconst total = 315;\nconsole.log(total);\n```\n\n';
const fixture = size => chunk.repeat(Math.ceil(size / chunk.length)).slice(0, size);
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const frame = () => new Promise(resolve => requestAnimationFrame(resolve));
const round = n => Math.round(n * 10) / 10;

function App() {
  const [sample, setSample] = useState(null);
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState([]);
  const [progress, setProgress] = useState('Ready. Generated data only; results stay in this tab.');
  const editor = useRef(null);
  const [exportProof, setExportProof] = useState(null);
  const registerEditor = useCallback(take => { editor.current = take; return () => { if (editor.current === take) editor.current = null; }; }, []);
  function download() {
    const { activeResult } = snapshotWithPendingEdits({ activeResult: { id: sample.id, content: sample.content }, results: [] }, editor.current ? [editor.current] : []);
    setExportProof({ characters: activeResult.content.length, end: activeResult.content.slice(-80) });
    const url = URL.createObjectURL(new Blob([activeResult.content], { type: 'text/markdown;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'generated-reader-acceptance.md'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function run() {
    setBusy(true); setResults([]);
    const rows = [];
    for (const size of [10240, 102400, 262144, 1048576]) {
      for (const mode of ['raw', 'split']) {
        for (let repetition = 0; repetition < 3; repetition++) {
          flushSync(() => { setSample(null); setProgress(`${size} characters / ${mode} / run ${repetition + 1}`); });
          await pause(200);
          const content = fixture(size);
          const host = document.getElementById('reader');
          const tasks = [];
          const longTasksSupported = PerformanceObserver.supportedEntryTypes?.includes('longtask');
          const observer = longTasksSupported ? new PerformanceObserver(list => tasks.push(...list.getEntries())) : null;
          observer?.observe({ type: 'longtask' });
          let lastMutation = performance.now();
          const mutations = new MutationObserver(() => { lastMutation = performance.now(); });
          mutations.observe(host, { childList: true, subtree: true, characterData: true });
          const started = performance.now();
          // Initial display is synchronous in React too: useDeferredValue has
          // no earlier content on a fresh mount. This measures that case.
          flushSync(() => setSample({ content, mode, id: `${size}-${mode}-${repetition}` }));
          const commitMs = performance.now() - started;
          await frame(); await frame();
          let ready = performance.now();
          // Allow lazy parser/highlighter downloads and subsequent commits.
          // Report the settle window separately, not as an input latency.
          while ((host.textContent.includes('Loading formatted preview') || performance.now() - lastMutation < 200) && performance.now() - started < 30000) { await pause(50); }
          await frame(); await frame();
          const ended = performance.now();
          await pause(50);
          tasks.push(...(observer?.takeRecords() || [])); observer?.disconnect(); mutations.disconnect();
          const durations = tasks.filter(entry => entry.startTime + entry.duration > started && entry.startTime < ended).map(entry => entry.duration);
          const row = { size, mode, repetition: repetition + 1, commitMs: round(commitMs), twoFrameMs: round(ready - started), settleMs: round(ended - started), longTasksSupported, longTasks: durations.length, maxLongTaskMs: round(Math.max(0, ...durations)), longTaskTotalMs: round(durations.reduce((a,b) => a+b, 0)), elements: host.querySelectorAll('*').length, completeRawText: host.querySelector('textarea')?.value === content };
          rows.push(row); setResults([...rows]);
        }
      }
    }
    setProgress('Complete. Three runs per fixture; first formatted run includes lazy module loading.'); setBusy(false);
  }
  return <main style={{ padding: 20, maxWidth: 1200, margin: 'auto', fontFamily: 'system-ui' }}>
    <h1>LLMiser reader profiling</h1>
    <p>Production React, unminified bundle, actual reader components, generated mixed Markdown. No CPU throttling. Keep this tab visible.</p>
    <button disabled={busy} onClick={run} style={{ border: '1px solid', padding: 10, margin: '12px 0' }}>Run profiling matrix</button>
    <button disabled={busy} onClick={() => setSample({ content: fixture(60000) + '\nEND-OF-COMPLETE-DOCUMENT 日本語 🙂', mode: 'split', id: 'manual' })} style={{ border: '1px solid', padding: 10, margin: 12 }}>Load 60K acceptance document</button>
    <button disabled={busy || !sample} onClick={() => setSample(current => ({ ...current, id: current.id + '-next' }))} style={{ border: '1px solid', padding: 10, margin: 12 }}>Switch document with identical text</button>
    <button disabled={busy || !sample} onClick={download} style={{ border: '1px solid', padding: 10, margin: 12 }}>Download current Markdown</button>
    {exportProof && <output id="export-proof">{JSON.stringify(exportProof)}</output>}
    <p role="status">{progress}</p>
    <section id="reader" style={{ height: 440, overflow: 'hidden', marginTop: 10 }}>
      {sample && <MarkdownViewer docId={sample.id} content={sample.content} viewMode={sample.mode} maxHeightClass="h-full" registerExportEditor={registerEditor} onChangeContent={(docId, content) => setSample(current => current?.id === docId ? { ...current, content } : current)} />}
    </section>
    <details open><summary>Measured results (JSON)</summary><pre id="results" style={{ whiteSpace: 'pre-wrap', fontSize: 11 }}>{JSON.stringify({ userAgent: navigator.userAgent, viewport: { width: innerWidth, height: innerHeight }, rows: results }, null, 2)}</pre></details>
  </main>;
}
createRoot(document.getElementById('root')).render(<App />);
