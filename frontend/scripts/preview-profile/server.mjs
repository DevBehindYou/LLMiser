// Local-only production-mode bundle of the real reader. No Next routes, env
// loading, uploads, storage or production credentials are involved.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const output = path.join(root, '.preview-profile/build');
fs.mkdirSync(output, { recursive: true });
const bundled = require('next/dist/compiled/webpack/webpack');
bundled.init();
await new Promise((resolve, reject) => bundled.webpack({
  mode: 'production', context: root, entry: path.join(here, 'app.jsx'),
  output: { path: output, filename: 'app.js', publicPath: '/' },
  module: { rules: [{ test: /\.[jm]sx?$/, exclude: /node_modules/, use: path.join(here, 'loader.cjs') }] },
  resolve: { extensions: ['.js', '.jsx', '.mjs'] },
  optimization: { minimize: false },
  devtool: false,
}, (error, stats) => error || stats.hasErrors() ? reject(error || new Error(stats.toString({ all: false, errors: true }))) : resolve()));
execFileSync(process.execPath, [require.resolve('tailwindcss/lib/cli.js'), '-c', path.join(root, 'tailwind.config.js'), '-i', path.join(root, 'app/globals.css'), '-o', path.join(output, 'style.css'), '--minify'], { cwd: root, stdio: 'inherit' });
const html = '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>LLMiser reader profiling</title><link rel="stylesheet" href="/style.css"><body><div id="root"></div><script src="/app.js"></script></body></html>';
http.createServer((req, res) => {
  const name = req.url?.split('?')[0];
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'none'; connect-src 'none'; frame-ancestors 'none'");
  if (name === '/') { res.setHeader('Content-Type', 'text/html; charset=utf-8'); return res.end(html); }
  // No arbitrary filesystem access, directory listings or write endpoints.
  if (!/^\/[\w.-]+\.(js|css)$/.test(name || '')) { res.statusCode = 404; return res.end(); }
  const target = path.join(output, name.slice(1));
  if (!fs.existsSync(target)) { res.statusCode = 404; return res.end(); }
  res.setHeader('Content-Type', name.endsWith('.css') ? 'text/css' : 'text/javascript');
  fs.createReadStream(target).pipe(res);
}).listen(4318, '127.0.0.1', () => console.log('Reader profiling ready: http://127.0.0.1:4318'));
