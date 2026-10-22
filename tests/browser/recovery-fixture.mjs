// Local-only transport fixture for browser acceptance. Start a built frontend
// on 127.0.0.1:3101, then run this script and open http://127.0.0.1:3102.
// All /api requests are intercepted here: no production jobs or services run.
import http from 'node:http';
import { createRequire } from 'node:module';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

const require = createRequire(new URL('../../frontend/package.json', import.meta.url));
const JSZip = require('jszip');
const directory = await mkdtemp(path.join(tmpdir(), 'llmiser-recovery-'));
const zip = new JSZip(); zip.file('notes.txt', 'Synthetic browser recovery fixture.');
const file = path.join(directory, 'recovery-project.zip');
await writeFile(file, await zip.generateAsync({ type: 'nodebuffer' }));
const origin = 'http://127.0.0.1:3102';
const jobId = '123e4567-e89b-42d3-a456-426614174000';
const first = '# Recovery project\n\n```python\nprint("漢';
const second = '# Recovery project (part 2 of 2)\n\n字🙂")\n```\n';
const expected = first + '字🙂")\n```\n';
const names = ['recovery-project-part-001.md', 'recovery-project-part-002.md', 'PROJECT_INDEX.md', 'manifest.json'];
const outputs = names.map((name, i) => ({ name, kind: 'OUTPUT', url: `${origin}/__fixture/output/${i}` }));
const result = { filename: 'recovery-project.md', original_name: 'recovery-project.zip', download_url: outputs[0].url, outputs };
const state = { uploads: 0, starts: 0, recoveries: 0, reads: 0, gone: false };
const json = (res, body, status = 200) => { res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(body)); };

http.createServer(async (req, res) => {
  const url = new URL(req.url, origin);
  req.on('error', () => res.destroy());
  if (url.pathname === '/__fixture/state') return json(res, { ...state, expected });
  if (url.pathname === '/__fixture/gone' && req.method === 'POST') { state.gone = true; return json(res, state); }
  if (url.pathname === '/api/health') return json(res, { status: 'ok', storage: true });
  if (url.pathname === '/api/wake') return json(res, { all_ready: true, pools: {} });
  if (url.pathname === '/api/uploads/create') { req.resume(); state.uploads++; return json(res, { job_id: jobId, upload_url: origin + '/__fixture/upload' }, 201); }
  if (url.pathname === '/__fixture/upload') { req.resume(); return json(res, {}); }
  if (url.pathname === `/api/jobs/${jobId}/start`) { state.starts++; return json(res, { job_id: jobId, status: 'COMPLETED', source_type: 'ARCHIVE', result }); }
  if (url.pathname === `/api/jobs/${jobId}/download`) {
    state.recoveries++;
    if (state.gone) return json(res, { detail: 'Files were deleted' }, 410);
    if (url.searchParams.has('output')) {
      const output = outputs.find(o => o.name === url.searchParams.get('output'));
      if (!output) return json(res, { detail: 'Unknown output' }, 404);
      res.writeHead(307, { Location: output.url, 'Cache-Control': 'no-store' }); return res.end();
    }
    return json(res, { job_id: jobId, source_type: 'ARCHIVE', result, download_url: result.download_url });
  }
  if (url.pathname.startsWith('/__fixture/output/')) {
    state.reads++;
    if (state.reads === 1) { res.writeHead(403); return res.end('Synthetic expired signed URL'); }
    const index = Number(url.pathname.split('/').pop());
    const bodies = [first, second, '# Project index\n\n- notes.txt\n', '{"fixture":true}\n'];
    res.writeHead(200, { 'Content-Type': index === 3 ? 'application/json' : 'text/markdown; charset=utf-8', 'Content-Disposition': `attachment; filename="${names[index]}"` });
    return res.end(bodies[index]);
  }
  if (url.pathname.startsWith('/api/')) return json(res, { detail: 'No production API access from this fixture' }, 404);
  const upstream = http.request({ hostname: '127.0.0.1', port: 3101, method: req.method, path: req.url, headers: req.headers }, reply => {
    res.writeHead(reply.statusCode, reply.headers); reply.pipe(res);
  });
  upstream.on('error', () => { if (!res.headersSent) res.writeHead(502); res.end('Start the built frontend on port 3101 first.'); });
  req.pipe(upstream);
}).listen(3102, '127.0.0.1', () => console.log(JSON.stringify({ origin, file, jobId, expected })));
