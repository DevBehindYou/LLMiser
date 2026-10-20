// Generates the LLMiser icon kit (from study 11 "Prompt L") and ten Atomic File Manager
// folder icons (from study 50 "Markdown Folder"): SVG, PNG and ICO files plus two preview pages.
// Pure Node (zlib only): icons are pixel grids, so every shape is a rectangle.
//
//   node make-icons.mjs
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT_LLM = 'C:/Users/temp/Documents/GitHub/MDify-Pro/project-docs/brand/llmiser';
const OUT_ATOM = 'C:/Users/temp/Documents/GitHub/Atomic-File-Manager/docs/design/icon-variations';

// ── PNG / ICO encoding ───────────────────────────────────────────────────────
const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
function crc32(buf) { let c = 0xffffffff; for (const b of buf) c = CRC[(c ^ b) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function encodePNG(img) {
  const { w, h, data } = img, stride = w * 4 + 1, raw = Buffer.alloc(stride * h);
  for (let y = 0; y < h; y++) { raw[y * stride] = 0; Buffer.from(data.buffer, y * w * 4, w * 4).copy(raw, y * stride + 1); }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}
function encodeICO(entries) {
  const head = Buffer.alloc(6 + 16 * entries.length);
  head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(entries.length, 4);
  let off = head.length;
  entries.forEach((e, i) => {
    const o = 6 + i * 16;
    head[o] = e.size >= 256 ? 0 : e.size; head[o + 1] = e.size >= 256 ? 0 : e.size;
    head.writeUInt16LE(1, o + 4); head.writeUInt16LE(32, o + 6);
    head.writeUInt32LE(e.buf.length, o + 8); head.writeUInt32LE(off, o + 12); off += e.buf.length;
  });
  return Buffer.concat([head, ...entries.map((e) => e.buf)]);
}

// ── Raster ───────────────────────────────────────────────────────────────────
const hexRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const rgbHex = (c) => '#' + c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
const mix = (a, b, t) => { const A = hexRgb(a), B = hexRgb(b); return rgbHex(A.map((v, i) => v + (B[i] - v) * t)); };
const lum = (h) => { const [r, g, b] = hexRgb(h); return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255; };
const newImg = (w, h) => ({ w, h, data: new Uint8ClampedArray(w * h * 4) });
function blend(img, i, rgb, a) {
  const d = img.data, da = d[i + 3] / 255, oa = a + da * (1 - a);
  if (oa <= 0) return;
  for (let k = 0; k < 3; k++) d[i + k] = (rgb[k] * a + d[i + k] * da * (1 - a)) / oa;
  d[i + 3] = oa * 255;
}
function fillRect(img, x0, y0, x1, y1, hex, a = 1) {
  const rgb = hexRgb(hex);
  for (let y = Math.max(0, y0); y < Math.min(img.h, y1); y++) for (let x = Math.max(0, x0); x < Math.min(img.w, x1); x++) blend(img, (y * img.w + x) * 4, rgb, a);
}
function boxBlur(src, w, h, r) {
  const tmp = new Float32Array(w * h), out = new Float32Array(w * h), n = 2 * r + 1;
  for (let y = 0; y < h; y++) { let acc = 0; for (let x = -r; x <= r; x++) acc += x >= 0 && x < w ? src[y * w + x] : 0; for (let x = 0; x < w; x++) { tmp[y * w + x] = acc / n; const xa = x + r + 1, xr = x - r; acc += (xa < w ? src[y * w + xa] : 0) - (xr >= 0 ? src[y * w + xr] : 0); } }
  for (let x = 0; x < w; x++) { let acc = 0; for (let y = -r; y <= r; y++) acc += y >= 0 && y < h ? tmp[y * w + x] : 0; for (let y = 0; y < h; y++) { out[y * w + x] = acc / n; const ya = y + r + 1, yr = y - r; acc += (ya < h ? tmp[ya * w + x] : 0) - (yr >= 0 ? tmp[yr * w + x] : 0); } }
  return out;
}
// Draws 128-space rectangles at size S; optional soft drop shadow (dx 4, dy 6, sigma 3, 20%).
function rasterize(prims, S, ground, softShadow) {
  const s = S / 128, layer = newImg(S, S);
  for (const p of prims) {
    const x0 = Math.round(p.x * s), y0 = Math.round(p.y * s);
    const x1 = Math.max(x0 + 1, Math.round((p.x + p.w) * s)), y1 = Math.max(y0 + 1, Math.round((p.y + p.h) * s));
    fillRect(layer, x0, y0, x1, y1, p.f);
  }
  const out = newImg(S, S);
  if (ground) fillRect(out, 0, 0, S, S, ground);
  if (softShadow) {
    const dx = Math.round(4 * s), dy = Math.round(6 * s), mask = new Float32Array(S * S);
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { const sx = x - dx, sy = y - dy; if (sx >= 0 && sy >= 0 && sx < S && sy < S) mask[y * S + x] = layer.data[(sy * S + sx) * 4 + 3] / 255; }
    let m = mask; const r = Math.max(1, Math.round(3 * s * 0.95));
    for (let k = 0; k < 3; k++) m = boxBlur(m, S, S, r);
    for (let i = 0; i < S * S; i++) if (m[i] > 0.002) blend(out, i * 4, [0, 0, 0], 0.2 * m[i]);
  }
  for (let i = 0; i < S * S; i++) { const a = layer.data[i * 4 + 3] / 255; if (a) blend(out, i * 4, [layer.data[i * 4], layer.data[i * 4 + 1], layer.data[i * 4 + 2]], a); }
  return out;
}

// ── Pixel grid helpers ───────────────────────────────────────────────────────
const makeGrid = (n) => Array.from({ length: n }, () => Array(n).fill(null));
function px(g, x, y, c) { x = Math.round(x); y = Math.round(y); if (y >= 0 && y < g.length && x >= 0 && x < g.length) g[y][x] = c; }
function rect(g, x, y, w, h, c) { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) px(g, i, j, c); }
const hl = (g, x, y, w, c) => rect(g, x, y, w, 1, c);
function each(g, fn) { for (let y = 0; y < g.length; y++) for (let x = 0; x < g.length; x++) fn(x, y, x + 0.5, y + 0.5); }
function disc(g, cx, cy, r, c) { each(g, (x, y, mx, my) => { if ((mx - cx) ** 2 + (my - cy) ** 2 <= r * r) g[y][x] = c; }); }
function ring(g, cx, cy, r, c, t = 1) { each(g, (x, y, mx, my) => { const d = Math.hypot(mx - cx, my - cy); if (d <= r && d > r - t) g[y][x] = c; }); }
function poly(g, pts, c) {
  each(g, (x, y, mx, my) => {
    let inside = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, yi] = pts[i], [xj, yj] = pts[j];
      if ((yi > my) !== (yj > my) && mx < (xj - xi) * (my - yi) / (yj - yi) + xi) inside = !inside;
    }
    if (inside) g[y][x] = c;
  });
}
function orbit(g, cx, cy, rx, ry, deg, c) {
  const th = deg * Math.PI / 180, ct = Math.cos(th), st = Math.sin(th);
  for (let t = 0; t < Math.PI * 2; t += 0.004) { const ex = rx * Math.cos(t), ey = ry * Math.sin(t); px(g, Math.floor(cx + ex * ct - ey * st), Math.floor(cy + ex * st + ey * ct), c); }
}
const F5 = {
  L: ['1....', '1....', '1....', '1....', '1....', '1....', '11111'],
  '>': ['1....', '.1...', '..1..', '...1.', '..1..', '.1...', '1....'],
  '#': ['.1.1.', '.1.1.', '11111', '.1.1.', '11111', '.1.1.', '.1.1.'],
};
function txt(g, ch, x, y, c) { F5[ch].forEach((row, j) => [...row].forEach((b, i) => { if (b === '1') px(g, x + i, y + j, c); })); }

// Merge each row into runs of one colour.
function gridRuns(g, cell, ox, oy, dx, dy, colFn, skip) {
  const out = [], n = g.length;
  for (let y = 0; y < n; y++) {
    let x = 0;
    while (x < n) {
      const c = g[y][x];
      if (!c || (skip && skip(c))) { x++; continue; }
      let e = x; while (e + 1 < n && g[y][e + 1] === c) e++;
      out.push({ x: ox + x * cell + dx, y: oy + y * cell + dy, w: (e - x + 1) * cell, h: cell, f: colFn(c) });
      x = e + 1;
    }
  }
  return out;
}
const r2 = (v) => Math.round(v * 100) / 100;
const rectsSvg = (prims) => prims.map((p) => `<rect x="${r2(p.x)}" y="${r2(p.y)}" width="${r2(p.w)}" height="${r2(p.h)}" fill="${p.f}"/>`).join('');

// ═════════════════════════════════════════════════════════════════════════════
// LLMiser kit (MDify palette, soft shadow, stepped extrusion)
// ═════════════════════════════════════════════════════════════════════════════
const LBRAND = { L: '#a0a0ff', P: '#6b6bff', A: '#f59e0b' };
const LGROUND = { dark: { bg: '#08080a', T: '#f2f2f6' }, light: { bg: '#f4f4f4', T: '#1a1a1a' } };
const lcol = (c, th) => LGROUND[th][c] || LBRAND[c];
const lside = (c) => (lum(c) < 0.15 ? mix(c, '#6b6b78', 0.55) : mix(c, '#000000', 0.42));

// Study 11, centred one cell to the right: ">" amber, "L" in ink/paper, periwinkle underline.
function llmGrid() { const g = makeGrid(16); txt(g, '>', 2, 4, 'A'); txt(g, 'L', 9, 4, 'T'); hl(g, 9, 12, 5, 'L'); return g; }
function llmPrims(th, scale = 1) {
  const g = llmGrid(), out = [];
  for (let k = 3; k >= 1; k--) out.push(...gridRuns(g, 6, 16, 16, k, k, (c) => lside(lcol(c, th))));
  out.push(...gridRuns(g, 6, 16, 16, 0, 0, (c) => lcol(c, th)));
  return scale === 1 ? out : out.map((p) => ({ ...p, x: 64 + (p.x - 64) * scale, y: 64 + (p.y - 64) * scale, w: p.w * scale, h: p.h * scale }));
}
function llmSvg(th, { scale = 1, ground = true, id = 's' } = {}) {
  const bg = ground ? `<rect width="128" height="128" fill="${LGROUND[th].bg}"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><title>LLMiser</title><defs><filter id="${id}" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="4" dy="6" stdDeviation="3" flood-color="#000" flood-opacity="0.2"/></filter></defs>${bg}<g filter="url(#${id})" shape-rendering="crispEdges">${rectsSvg(llmPrims(th, scale))}</g></svg>`;
}
// Pixel-perfect small favicons: one grid cell = cellPx pixels, optional 1 px extrusion.
function llmPixel(th, cellPx, extrude) {
  const g = llmGrid(), S = 16 * cellPx, img = newImg(S, S);
  fillRect(img, 0, 0, S, S, LGROUND[th].bg);
  const draw = (off, colFn) => g.forEach((row, y) => row.forEach((c, x) => { if (c) fillRect(img, x * cellPx + off, y * cellPx + off, (x + 1) * cellPx + off, (y + 1) * cellPx + off, colFn(c)); }));
  if (extrude) draw(extrude, (c) => lside(lcol(c, th)));
  draw(0, (c) => lcol(c, th));
  return img;
}
function llmFaviconSvg() {
  const g = llmGrid();
  const cls = { T: ' class="t"' };
  const body = gridRuns(g, 1, 0, 0, 0, 0, (c) => c).map((p) => `<rect x="${p.x}" y="${p.y}" width="${p.w}" height="1"${cls[p.f] || ` fill="${LBRAND[p.f]}"`}/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" shape-rendering="crispEdges"><title>LLMiser</title><style>.g{fill:#08080a}.t{fill:#f2f2f6}@media (prefers-color-scheme:light){.g{fill:#f4f4f4}.t{fill:#1a1a1a}}</style><rect class="g" width="16" height="16"/>${body}</svg>`;
}
function llmMonoSvg() {
  const g = llmGrid();
  const body = gridRuns(g, 1, 0, 0, 0, 0, () => '#000000').map((p) => `<rect x="${p.x}" y="${p.y}" width="${p.w}" height="1"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" shape-rendering="crispEdges" fill="#000000"><title>LLMiser</title>${body}</svg>`;
}

// ═════════════════════════════════════════════════════════════════════════════
// Atomic File Manager folders (Atomic design system: ink, paper, one Signal,
// hard offset shadows, no blur)
// ═════════════════════════════════════════════════════════════════════════════
const AT = {
  light: { G: '#F4F5F1', I: '#15171B', C: '#FFFFFF', U: '#EDEEE8', A: '#3A2FF0', N: '#15171B', sh: '#15171B', R: '#C6C6CB', D: '#DCDDD7' },
  dark: { G: '#15171B', I: '#F4F5F1', C: '#1E2026', U: '#2B2E34', A: '#8F88FF', N: '#F4F5F1', sh: '#3A2FF0', R: '#45474B', D: '#2A2C33' },
};
const AT_FIXED = { S: '#3A2FF0', H: '#2A20C9', Q: '#1D14A0', V: '#8F88FF', M: '#D8D6FF', W: '#FFFFFF', P: '#F4F5F1', K: '#15171B', J: '#2B2E34' };
const acol = (r, th) => AT[th][r] || AT_FIXED[r];

// Study 50's folder on a 32 grid: stepped tab, back panel, front panel, 1-cell border.
function folder(g, { dx = 0, dy = 0, back, front, tab = back, line = 'I' }) {
  const o = (x, y, w, h, c) => rect(g, x + dx, y + dy, w, h, c);
  o(2, 3, 11, 1, line); o(2, 4, 12, 1, line); o(2, 5, 13, 1, line); o(2, 6, 28, 22, line);
  o(3, 4, 10, 1, tab); o(3, 5, 11, 1, tab); o(3, 6, 12, 1, tab);
  o(3, 7, 26, 20, back);
  if (front) { o(2, 10, 28, 1, line); o(3, 11, 26, 16, front); }
  [[2, 3], [29, 6], [2, 27], [29, 27]].forEach(([x, y]) => px(g, x + dx, y + dy, null));
}
// The Atomic mark: three orbits at 0°, 60° and 120°, a nucleus and three electrons.
// Open orbits (ry ≥ 2.9) leave a clear gap around the nucleus; electrons sit on orbit tips
// 120° apart (left, lower right, upper right).
function atom(g, cx, cy, { rx = 7.6, ry = 3.1, orbitC, nucleus, electron, nr = 1.8, er = 1.2, ts = [Math.PI, 0, Math.PI] }) {
  [0, 60, 120].forEach((a) => orbit(g, cx, cy, rx, ry, a, orbitC));
  if (electron) [0, 60, 120].forEach((a, i) => { const th = a * Math.PI / 180, ex = rx * Math.cos(ts[i]), ey = ry * Math.sin(ts[i]); disc(g, cx + ex * Math.cos(th) - ey * Math.sin(th), cy + ex * Math.sin(th) + ey * Math.cos(th), er, electron); });
  disc(g, cx, cy, nr, nucleus);
}
const ATOMIC = [
  { slug: 'paper-signal', name: 'Paper & Signal', note: 'The brand default: ink on paper, with a single Signal atom where the # was.', shadow: [2, 'sh'],
    draw: (g) => { folder(g, { back: 'U', front: 'C' }); atom(g, 16, 19, { orbitC: 'A', nucleus: 'N', electron: 'A' }); } },
  { slug: 'signal-folder', name: 'Signal Folder', note: 'Loud on purpose: a Signal folder carrying a white atom, deep-blue shadow.', shadow: [2, 'Q'],
    draw: (g) => { folder(g, { back: 'H', front: 'S' }); atom(g, 16, 19, { orbitC: 'W', nucleus: 'K', electron: 'W' }); } },
  { slug: 'ink-folder', name: 'Ink Folder', note: "The dark-section look: ink folder, signal-light atom, Signal shadow.", shadow: [2, 'S'],
    draw: (g) => { folder(g, { back: 'J', front: 'K' }); atom(g, 16, 19, { orbitC: 'V', nucleus: 'P', electron: 'V' }); } },
  { slug: 'line-folder', name: 'Line Folder', note: "Outline only, like Atomic's stroke icons, lifted on a Signal slab.", shadow: [1, 'A'],
    draw: (g) => { folder(g, { back: 'G', front: 'G' }); atom(g, 16, 19, { orbitC: 'I', nucleus: 'A', electron: 'A' }); } },
  { slug: 'atomic-coin', name: 'Atomic Coin', note: 'The Atomic Coin set into the folder front, with its deep-blue offset disc.', shadow: [2, 'sh'],
    draw: (g) => { folder(g, { back: 'U', front: 'C' }); disc(g, 16.8, 19.8, 7, 'Q'); disc(g, 16, 19, 7, 'P'); ring(g, 16, 19, 7, 'S', 1.6); atom(g, 16, 19, { rx: 4.6, ry: 1.8, orbitC: 'K', nucleus: 'K', nr: 1.1 }); } },
  { slug: 'open-folder', name: 'Open Folder', note: 'The atom rising out of an open folder: opening a folder is the core action.', shadow: [2, 'sh'],
    draw: (g) => { folder(g, { back: 'U', front: null }); atom(g, 16, 12.5, { rx: 7, ry: 2.9, orbitC: 'A', nucleus: 'N', electron: 'A' }); poly(g, [[4, 15], [31, 15], [28.6, 28], [1.4, 28]], 'I'); poly(g, [[5.2, 16], [29.8, 16], [27.7, 27], [2.3, 27]], 'C'); } },
  { slug: 'stacked', name: 'Stacked', note: 'Two folders deep, for a manager of many folders.', shadow: [1, 'sh'],
    draw: (g) => { folder(g, { dx: -2, dy: -2, back: 'M', front: 'M' }); folder(g, { dx: 1, dy: 2, back: 'U', front: 'C' }); atom(g, 17, 21, { rx: 7.2, ry: 2.9, orbitC: 'A', nucleus: 'N', electron: 'A' }); } },
  { slug: 'storage-meter', name: 'Storage Meter', note: 'The atom over a storage bar, the first thing Home answers.', shadow: [2, 'sh'],
    draw: (g) => { folder(g, { back: 'U', front: 'C' }); atom(g, 16, 17.3, { rx: 7, ry: 2.9, nr: 1.7, er: 1.1, orbitC: 'A', nucleus: 'N', electron: 'A' }); rect(g, 6, 24, 20, 2, 'R'); rect(g, 6, 24, 14, 2, 'S'); } },
  { slug: 'mono-knockout', name: 'Mono Knockout', note: 'One colour with the atom cut out, for themed and monochrome icons.', shadow: null,
    draw: (g) => { folder(g, { back: 'A', front: 'A', line: 'A' }); hl(g, 3, 10, 26, 'G'); atom(g, 16, 19, { orbitC: 'G', nucleus: 'G', electron: 'G' }); } },
  { slug: 'dot-grid-tab', name: 'Dot Grid Tab', note: "A Signal tab on Atomic's dot grid: quiet, with one loud detail.", shadow: [2, 'sh'], dots: true,
    draw: (g) => { folder(g, { back: 'C', front: 'C', tab: 'S' }); atom(g, 16, 19, { orbitC: 'A', nucleus: 'N', electron: 'S' }); } },
];
function atomPrims(icon, th) {
  const g = makeGrid(32); icon.draw(g);
  const out = [], C = 3, O = 16;
  if (icon.dots) for (let y = 1; y < 32; y += 4) for (let x = 1; x < 32; x += 4) if (!g[y][x]) out.push({ x: O + x * C, y: O + y * C, w: C, h: C, f: acol('D', th) });
  if (icon.shadow) { const [cells, role] = icon.shadow; out.push(...gridRuns(g, C, O, O, cells * C, cells * C, () => acol(role, th))); }
  out.push(...gridRuns(g, C, O, O, 0, 0, (c) => acol(c, th)));
  return out;
}
function atomSvg(icon, th, i) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><title>Atomic File Manager icon ${String(i + 1).padStart(2, '0')} ${icon.name} (${th})</title><rect width="128" height="128" fill="${acol('G', th)}"/><g shape-rendering="crispEdges">${rectsSvg(atomPrims(icon, th))}</g></svg>`;
}
// Study 50 as it was drawn (16 grid, MDify palette), for reference on the Atomic page.
function study50Svg() {
  const g = makeGrid(16);
  rect(g, 1, 2, 5, 2, 'a'); rect(g, 1, 4, 14, 10, 'a'); rect(g, 1, 6, 14, 8, 'A');
  rect(g, 6, 8, 1, 5, 'a'); rect(g, 9, 8, 1, 5, 'a'); hl(g, 5, 9, 6, 'a'); hl(g, 5, 11, 6, 'a');
  const col = { A: '#f59e0b', a: '#c97a10' };
  const prims = [];
  for (let k = 3; k >= 1; k--) prims.push(...gridRuns(g, 6, 16, 16, k, k, (c) => mix(col[c], '#000000', 0.42)));
  prims.push(...gridRuns(g, 6, 16, 16, 0, 0, (c) => col[c]));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="Study 50, Markdown Folder"><defs><filter id="ref50" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="4" dy="6" stdDeviation="3" flood-color="#000" flood-opacity="0.2"/></filter></defs><rect width="128" height="128" fill="#08080a"/><g filter="url(#ref50)" shape-rendering="crispEdges">${rectsSvg(prims)}</g></svg>`;
}

// ═════════════════════════════════════════════════════════════════════════════
// Write files
// ═════════════════════════════════════════════════════════════════════════════
const write = (dir, rel, data) => { const f = path.join(dir, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, data); return f; };
const kb = (n) => (n < 1024 ? n + ' B' : (n / 1024).toFixed(1) + ' KB');
const llmFiles = [];
const addL = (rel, data, use) => { write(OUT_LLM, rel, data); llmFiles.push({ rel, size: Buffer.byteLength(data), use }); return data; };

// SVG masters
addL('svg/llmiser-icon-dark.svg', llmSvg('dark'), 'Master app icon, dark ground');
addL('svg/llmiser-icon-light.svg', llmSvg('light'), 'Master app icon, light ground');
addL('svg/llmiser-glyph-on-dark.svg', llmSvg('dark', { ground: false }), 'Glyph only, transparent, for dark UI (header logo)');
addL('svg/llmiser-glyph-on-light.svg', llmSvg('light', { ground: false }), 'Glyph only, transparent, for light UI');
addL('svg/llmiser-icon-maskable-dark.svg', llmSvg('dark', { scale: 0.84 }), 'Maskable master (art inside the 80% safe zone)');
addL('favicon.svg', llmFaviconSvg(), 'Browser favicon; follows the light/dark system setting');
addL('svg/llmiser-mono.svg', llmMonoSvg(), 'One-colour glyph (Safari pinned tab, themed icons)');

// PNGs
const png = {};
const addPng = (rel, img, use) => { const buf = encodePNG(img); png[rel] = buf; addL(rel, buf, use); return buf; };
for (const th of ['dark', 'light']) {
  const sfx = th === 'dark' ? '' : '-light';
  addPng(`png/favicon-16${sfx}.png`, llmPixel(th, 1, 0), 'Pixel-perfect 16 px favicon' + (th === 'light' ? ', light' : ''));
  addPng(`png/favicon-32${sfx}.png`, llmPixel(th, 2, 1), 'Pixel-perfect 32 px favicon' + (th === 'light' ? ', light' : ''));
  for (const S of [48, 64, 128, 192, 512]) addPng(`png/icon-${S}${sfx}.png`, rasterize(llmPrims(th), S, LGROUND[th].bg, true), `${S} px app icon` + (th === 'light' ? ', light' : ''));
}
addPng('png/apple-touch-icon.png', rasterize(llmPrims('dark'), 180, LGROUND.dark.bg, true), 'iOS home screen (180 px, opaque)');
addPng('png/icon-maskable-192.png', rasterize(llmPrims('dark', 0.84), 192, LGROUND.dark.bg, true), 'Android maskable 192 px');
addPng('png/icon-maskable-512.png', rasterize(llmPrims('dark', 0.84), 512, LGROUND.dark.bg, true), 'Android maskable 512 px');
addL('favicon.ico', encodeICO([16, 32, 48].map((size) => ({ size, buf: size === 16 ? png['png/favicon-16.png'] : size === 32 ? png['png/favicon-32.png'] : png['png/icon-48.png'] }))), 'Legacy favicon (16, 32, 48 px)');

const manifest = JSON.stringify({
  name: 'LLMiser', short_name: 'LLMiser', theme_color: '#08080a', background_color: '#08080a', display: 'standalone',
  icons: [
    { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
}, null, 2) + '\n';
addL('site.webmanifest', manifest, 'Web app manifest (PWA install icons)');
const HEAD = `<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="#08080a">`;
const llmReadme = `# LLMiser icon kit

Built from icon study 11, "Prompt L": an amber \`>\` prompt pointing at an \`L\`, with a periwinkle underline.
Drawn on a 16 × 16 pixel grid in MDify's current palette (ink \`#08080a\`, paper \`#f2f2f6\`, periwinkle
\`#a0a0ff\`, amber \`#f59e0b\`), with a 3-step extrusion and the current mark's soft shadow
(dx 4, dy 6, blur 3, 20%). Generated by \`make-icons.mjs\`; open \`preview.html\` to see every file.

## Files

| File | Size | Use |
|---|---|---|
${llmFiles.map((f) => `| \`${f.rel}\` | ${kb(f.size)} | ${f.use} |`).join('\n')}

## Install on the website

Copy \`favicon.ico\`, \`favicon.svg\`, \`site.webmanifest\` and, from \`png/\`, \`apple-touch-icon.png\`,
\`icon-192.png\`, \`icon-512.png\` and \`icon-maskable-512.png\` into \`frontend/public/\`, then add to \`<head>\`
(in Next.js, the \`icons\` and \`manifest\` fields of \`metadata\` in \`app/layout.js\`):

\`\`\`html
${HEAD}
\`\`\`

The 16 and 32 px favicons are drawn pixel for pixel (one grid cell = 1 or 2 px), not scaled down,
so they stay sharp in browser tabs. \`favicon.svg\` switches ground with the visitor's light/dark setting.
`;
addL('README.md', llmReadme, 'This list');

// Atomic files
const atomFiles = [];
ATOMIC.forEach((icon, i) => {
  const n = String(i + 1).padStart(2, '0');
  for (const th of ['light', 'dark']) {
    const base = `atomic-folder-${n}-${icon.slug}-${th}`;
    const svg = atomSvg(icon, th, i);
    write(OUT_ATOM, `svg/${base}.svg`, svg);
    const buf = encodePNG(rasterize(atomPrims(icon, th), 512, acol('G', th), false));
    write(OUT_ATOM, `png/${base}-512.png`, buf);
    atomFiles.push({ rel: `svg/${base}.svg`, size: Buffer.byteLength(svg) }, { rel: `png/${base}-512.png`, size: buf.length });
  }
});
write(OUT_ATOM, 'README.md', `# Atomic File Manager: folder icon variations

Ten app icon directions built from LLMiser icon study 50, "Markdown Folder". The \`#\` on the folder front
is replaced by the Atomic mark (three orbits at 0°, 60° and 120°, a nucleus, three electrons). Colours,
borders and shadows follow \`docs/design/ATOMIC_DESIGN_SYSTEM.md\`: ink \`#15171B\` on paper \`#F4F5F1\`,
one accent (Signal \`#3A2FF0\`, \`#8F88FF\` on ink), hard offset shadows with no blur (ink on paper, Signal on
ink, \`#1D14A0\` under the coin and Signal shapes). Each variation has a light and a dark version.

Drawn on a 32 × 32 pixel grid. Generated by \`project-docs/brand/make-icons.mjs\` in the private MDify-Pro
repo; open \`preview.html\` to compare them.

| # | Name | Idea |
|---|---|---|
${ATOMIC.map((ic, i) => `| ${String(i + 1).padStart(2, '0')} | ${ic.name} | ${ic.note} |`).join('\n')}

Files: \`svg/atomic-folder-NN-<name>-<light|dark>.svg\` (128 × 128) and \`png/…-512.png\`.
Not wired into the app: the launcher still uses \`refract_launcher_art.png\`. Pick one and it can be turned
into an adaptive icon (foreground, background and monochrome layers).
`);

// ═════════════════════════════════════════════════════════════════════════════
// Preview pages
// ═════════════════════════════════════════════════════════════════════════════
const dataUri = (buf) => 'data:image/png;base64,' + buf.toString('base64');
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const sizesRow = (th) => {
  const sfx = th === 'dark' ? '' : '-light';
  const items = [['png/favicon-16' + sfx + '.png', 16], ['png/favicon-32' + sfx + '.png', 32], ['png/icon-48' + sfx + '.png', 48], ['png/icon-64' + sfx + '.png', 64], ['png/icon-128' + sfx + '.png', 128], ['png/icon-192' + sfx + '.png', 192]];
  return items.map(([f, s]) => `<figure class="sz"><img src="${dataUri(png[f])}" width="${s}" height="${s}" alt="${s} px, ${th} ground"><figcaption>${s}</figcaption></figure>`).join('');
};

const llmPage = `<title>LLMiser Icon Kit</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;700&family=Patrick+Hand&display=swap">
<style>
  :root { color-scheme: dark; --bg: #08080a; --surface: #111114; --surface-2: #16161a; --border: #1f1f24; --border-3: #2a2a30; --text: #f2f2f6; --muted: #c2c2cc; --faint: #9494a0; --accent: #f59e0b; --accent-text: #f59e0b; --peri: #a0a0ff; --hatch-1: #101014; --hatch-2: #16161c; }
  @media (prefers-color-scheme: light) { :root:not([data-theme="dark"]) { color-scheme: light; --bg: #f0eee9; --surface: #ffffff; --surface-2: #f5f3ee; --border: #e2e8f0; --border-3: #cbd5e1; --text: #18181b; --muted: #52525b; --faint: #64748b; --accent: #f59e0b; --accent-text: #b45309; --peri: #6b6bff; --hatch-1: #f5f3ee; --hatch-2: #efede7; } }
  :root[data-theme="light"] { color-scheme: light; --bg: #f0eee9; --surface: #ffffff; --surface-2: #f5f3ee; --border: #e2e8f0; --border-3: #cbd5e1; --text: #18181b; --muted: #52525b; --faint: #64748b; --accent: #f59e0b; --accent-text: #b45309; --peri: #6b6bff; --hatch-1: #f5f3ee; --hatch-2: #efede7; }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--text); font: 15px/1.55 Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; -webkit-font-smoothing: antialiased; }
  .wrap { max-width: 1120px; margin: 0 auto; padding-inline: clamp(16px, 4vw, 40px); padding-block: 24px 80px; display: grid; gap: 28px; }
  .mono, .eyebrow, figcaption, td code, pre, .tag { font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
  .eyebrow { font-size: 11px; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase; color: var(--faint); }
  h1, h2 { font-family: "Patrick Hand", "Comic Neue", ui-rounded, system-ui, sans-serif; font-weight: 400; line-height: 1.02; text-wrap: balance; margin: 0; }
  h1 { font-size: clamp(38px, 5.4vw, 58px); margin: 10px 0 12px; }
  h1 em { font-style: normal; color: var(--accent-text); }
  h2 { font-size: 30px; }
  .lead, .sub { color: var(--muted); max-width: 64ch; margin: 0; }
  .sub { font-size: 14px; margin-top: 6px; }
  .hero { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr); gap: 28px; align-items: center; padding: 28px; border: 1px solid var(--border); border-radius: 14px; background: repeating-linear-gradient(135deg, var(--hatch-1) 0 7px, var(--hatch-2) 7px 14px); }
  .masters { display: flex; flex-wrap: wrap; gap: 16px; justify-content: center; }
  .masters figure, .sz, .mask figure { margin: 0; display: grid; justify-items: center; gap: 6px; }
  .masters svg { width: 168px; height: 168px; border-radius: 22%; display: block; box-shadow: 0 0 0 1px var(--border-3); }
  figcaption { font-size: 11px; color: var(--faint); }
  section { display: grid; gap: 14px; }
  .panel { padding: 18px; border: 1px solid var(--border); border-radius: 12px; background: var(--surface); display: grid; gap: 16px; }
  .row { display: flex; flex-wrap: wrap; align-items: flex-end; gap: 18px; }
  .row-label { font-size: 12px; font-weight: 600; color: var(--muted); width: 100%; }
  .sz img { display: block; border-radius: 18%; image-rendering: auto; }
  .pixel { display: flex; flex-wrap: wrap; gap: 24px; align-items: flex-end; }
  .pixel img { display: block; image-rendering: pixelated; border-radius: 6px; box-shadow: 0 0 0 1px var(--border-3); }
  .tab { display: inline-flex; align-items: center; gap: 8px; padding: 8px 14px 8px 10px; border-radius: 10px 10px 0 0; background: var(--surface-2); border: 1px solid var(--border-3); border-bottom: 0; font-size: 13px; }
  .tab img { image-rendering: pixelated; display: block; }
  .mask { display: flex; flex-wrap: wrap; gap: 22px; align-items: flex-end; }
  .mask img { display: block; width: 132px; height: 132px; }
  .circle { border-radius: 50%; } .squircle { border-radius: 26%; } .teardrop { border-radius: 50% 50% 50% 12%; }
  .mono-tile { width: 132px; height: 132px; display: grid; place-items: center; border-radius: 26%; border: 1px solid var(--border-3); }
  .mono-tile svg { width: 84px; height: 84px; display: block; }
  .table-wrap { overflow-x: auto; border: 1px solid var(--border); border-radius: 12px; }
  table { border-collapse: collapse; width: 100%; font-size: 13px; background: var(--surface); }
  th, td { text-align: left; padding: 8px 12px; border-bottom: 1px solid var(--border); vertical-align: top; }
  th { font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--faint); background: var(--surface-2); }
  td code { font-size: 12px; color: var(--text); }
  td.num { font-variant-numeric: tabular-nums; white-space: nowrap; color: var(--muted); }
  pre { margin: 0; padding: 14px; border-radius: 10px; background: var(--surface-2); border: 1px solid var(--border-3); overflow-x: auto; font-size: 12.5px; line-height: 1.6; }
  .btn { font: 500 12.5px Inter, ui-sans-serif, system-ui, sans-serif; padding: 7px 12px; border-radius: 8px; border: 1px solid var(--accent); background: var(--accent); color: #1a1205; cursor: pointer; justify-self: start; }
  .status { font-size: 12px; color: var(--accent-text); min-height: 1em; }
  :focus-visible { outline: 2px solid var(--peri); outline-offset: 2px; }
  @media (max-width: 760px) { .hero { grid-template-columns: 1fr; padding: 20px; } }
</style>
<div class="wrap">
  <header class="hero">
    <div>
      <div class="eyebrow">LLMiser · icon kit · from study 11 “Prompt L”</div>
      <h1>A prompt that points at <em>the L</em></h1>
      <p class="lead">The study you picked, finished as a full set: SVG masters for both grounds, pixel-perfect 16 and 32 px favicons, a 3-size <span class="mono">favicon.ico</span>, an adaptive <span class="mono">favicon.svg</span>, iOS and Android icons, a maskable version and a one-colour glyph. Same palette and shadow as MDify's current mark; the glyph moved one cell right so it sits centred.</p>
    </div>
    <div class="masters">
      <figure>${llmSvg('dark', { id: 'h1' }).replace('<svg ', '<svg role="img" aria-label="LLMiser icon, dark ground" ')}<figcaption>dark ground</figcaption></figure>
      <figure>${llmSvg('light', { id: 'h2' }).replace('<svg ', '<svg role="img" aria-label="LLMiser icon, light ground" ')}<figcaption>light ground</figcaption></figure>
    </div>
  </header>

  <section>
    <div><h2>Every size, at its real size</h2><p class="sub">These are the exported PNG files shown at 1×. The two smallest are hand-placed pixels, not scaled down.</p></div>
    <div class="panel">
      <div class="row"><span class="row-label">Dark ground</span>${sizesRow('dark')}</div>
      <div class="row"><span class="row-label">Light ground</span>${sizesRow('light')}</div>
    </div>
  </section>

  <section>
    <div><h2>Pixel-perfect favicons</h2><p class="sub">One grid cell is one pixel at 16 px and two pixels at 32 px (with a one-pixel extrusion), enlarged here so each pixel shows.</p></div>
    <div class="panel">
      <div class="pixel">
        <figure class="sz"><img src="${dataUri(png['png/favicon-16.png'])}" width="128" height="128" alt="16 px favicon enlarged 8 times"><figcaption>16 px · ×8</figcaption></figure>
        <figure class="sz"><img src="${dataUri(png['png/favicon-32.png'])}" width="128" height="128" alt="32 px favicon enlarged 4 times"><figcaption>32 px · ×4</figcaption></figure>
        <figure class="sz"><img src="${dataUri(png['png/favicon-16-light.png'])}" width="128" height="128" alt="16 px light favicon enlarged 8 times"><figcaption>16 px light · ×8</figcaption></figure>
        <figure class="sz"><img src="${dataUri(png['png/favicon-32-light.png'])}" width="128" height="128" alt="32 px light favicon enlarged 4 times"><figcaption>32 px light · ×4</figcaption></figure>
      </div>
      <div><span class="tab"><img src="${dataUri(png['png/favicon-16.png'])}" width="16" height="16" alt="">LLMiser: AI-Ready Document Converter</span></div>
    </div>
  </section>

  <section>
    <div><h2>Maskable and one-colour</h2><p class="sub">Android crops the maskable icon to its own shape; the art stays inside the 80% safe zone. The one-colour glyph is for Safari pinned tabs and themed icons.</p></div>
    <div class="panel mask">
      <figure><img class="circle" src="${dataUri(png['png/icon-maskable-512.png'])}" alt="Maskable icon in a circle"><figcaption>circle</figcaption></figure>
      <figure><img class="squircle" src="${dataUri(png['png/icon-maskable-512.png'])}" alt="Maskable icon in a rounded square"><figcaption>rounded square</figcaption></figure>
      <figure><img class="teardrop" src="${dataUri(png['png/icon-maskable-512.png'])}" alt="Maskable icon in a teardrop"><figcaption>teardrop</figcaption></figure>
      <figure><div class="mono-tile" style="background:#f4f4f4">${llmMonoSvg().replace('fill="#000000"', 'fill="#1a1a1a"').replace('<svg ', '<svg role="img" aria-label="One-colour glyph on light" ')}</div><figcaption>one colour on light</figcaption></figure>
      <figure><div class="mono-tile" style="background:#08080a">${llmMonoSvg().replace('fill="#000000"', 'fill="#f2f2f6"').replace('<svg ', '<svg role="img" aria-label="One-colour glyph on dark" ')}</div><figcaption>one colour on dark</figcaption></figure>
    </div>
  </section>

  <section>
    <div><h2>Files</h2><p class="sub">Saved in <span class="mono">MDify-Pro/project-docs/brand/llmiser/</span> (private, not synced to the public repo).</p></div>
    <div class="table-wrap"><table><thead><tr><th>File</th><th>Size</th><th>Use</th></tr></thead><tbody>
      ${llmFiles.map((f) => `<tr><td><code>${f.rel}</code></td><td class="num">${kb(f.size)}</td><td>${esc(f.use)}</td></tr>`).join('')}
    </tbody></table></div>
  </section>

  <section>
    <div><h2>Head tags</h2><p class="sub">Copy the files listed in the README into <span class="mono">frontend/public/</span>, then use these tags.</p></div>
    <pre id="head-tags">${esc(HEAD)}</pre>
    <button type="button" class="btn" id="copy-head">Copy head tags</button>
    <span class="status" id="copy-status" role="status"></span>
  </section>
</div>
<script>
  document.getElementById('copy-head').addEventListener('click', function () {
    var text = document.getElementById('head-tags').textContent, status = document.getElementById('copy-status');
    var select = function () { var r = document.createRange(); r.selectNodeContents(document.getElementById('head-tags')); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); status.textContent = 'Copy is blocked here. The tags are selected: press Ctrl+C or ⌘C.'; };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { status.textContent = 'Head tags copied.'; }, select); else select();
  });
</script>
`;

const atomCards = ATOMIC.map((icon, i) => {
  const n = String(i + 1).padStart(2, '0');
  const tile = (th) => atomSvg(icon, th, i).replace('<svg ', `<svg role="img" aria-label="${icon.name}, ${th} theme" `);
  return `<article class="card" data-i="${i}">
    <div class="card-top"><span class="label">VARIATION ${n}</span><span class="label quiet">${icon.shadow ? 'HARD SHADOW ' + icon.shadow[0] * 3 + '/128' : 'NO SHADOW'}</span></div>
    <h3>${esc(icon.name)}</h3>
    <div class="tiles">
      <figure class="t-light">${tile('light')}<figcaption>LIGHT</figcaption></figure>
      <figure class="t-dark">${tile('dark')}<figcaption>DARK</figcaption></figure>
      <div class="minis"><span class="mini l48">${tile('light')}</span><span class="mini d48">${tile('dark')}</span><span class="mini l24">${tile('light')}</span><span class="mini d24">${tile('dark')}</span></div>
    </div>
    <p>${esc(icon.note)}</p>
    <div class="actions">
      <button type="button" class="b" data-copy="light" data-i="${i}">Copy SVG · light</button>
      <button type="button" class="b" data-copy="dark" data-i="${i}">Copy SVG · dark</button>
      <button type="button" class="b pick" data-pick="${i}" aria-pressed="false">Pick</button>
    </div>
  </article>`;
}).join('\n');
const atomSvgJson = JSON.stringify(ATOMIC.map((ic, i) => ({ name: ic.name, light: atomSvg(ic, 'light', i), dark: atomSvg(ic, 'dark', i) }))).replace(/</g, '\\u003c');

const atomPage = `<title>Atomic Folder Icons</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Hanken+Grotesk:wght@400;500;700&family=JetBrains+Mono:wght@400;500;700&display=swap">
<style>
  /* Atomic design system tokens (docs/design/ATOMIC_DESIGN_SYSTEM.md §3, §14). Dark follows §13 item 9. */
  :root { --bg: #f4f5f1; --card: #ffffff; --surface: #edeee8; --ink: #15171b; --text: #15171b; --body: #2b2e34; --slate: #4a4d55; --line: #c6c6cb; --accent: #3a2ff0; --accent-text: #3a2ff0; --on-accent: #ffffff; --shadow: #15171b; --dot: rgba(21, 23, 27, 0.12); }
  @media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { color-scheme: dark; --bg: #15171b; --card: #1e2026; --surface: #2b2e34; --ink: #f4f5f1; --text: #f4f5f1; --body: #c3c4c2; --slate: #9fa1a0; --line: #45474b; --accent: #3a2ff0; --accent-text: #8f88ff; --on-accent: #ffffff; --shadow: #3a2ff0; --dot: rgba(244, 245, 241, 0.1); } }
  :root[data-theme="dark"] { color-scheme: dark; --bg: #15171b; --card: #1e2026; --surface: #2b2e34; --ink: #f4f5f1; --text: #f4f5f1; --body: #c3c4c2; --slate: #9fa1a0; --line: #45474b; --accent: #3a2ff0; --accent-text: #8f88ff; --on-accent: #ffffff; --shadow: #3a2ff0; --dot: rgba(244, 245, 241, 0.1); }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--text); font: 16px/1.58 "Hanken Grotesk", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
  .wrap { max-width: 1180px; margin: 0 auto; padding-inline: clamp(16px, 4vw, 40px); padding-block: 28px 110px; }
  .label, .b, figcaption, .eyebrow, .chip { font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; text-transform: uppercase; }
  .eyebrow { font-size: 12px; letter-spacing: 2px; color: var(--accent-text); font-weight: 500; }
  h1, h3 { font-family: "Bebas Neue", Impact, "Arial Narrow", sans-serif; font-weight: 400; text-transform: uppercase; line-height: 0.95; margin: 0; }
  h1 { font-size: clamp(3rem, 8vw, 5.6rem); letter-spacing: 1px; margin: 12px 0 14px; color: var(--text); text-wrap: balance; }
  h1 span { color: var(--accent-text); text-shadow: 3px 3px 0 var(--shadow); }
  .hero { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr); gap: 32px; align-items: end; padding: 30px; border: 1.5px solid var(--ink); border-radius: 6px; background-color: var(--card); background-image: radial-gradient(var(--dot) 1.2px, transparent 1.3px); background-size: 22px 22px; box-shadow: 6px 6px 0 var(--shadow); }
  .lead { color: var(--body); max-width: 62ch; margin: 0; font-size: 17px; }
  .lead code { font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 0.86em; }
  .from { display: flex; gap: 14px; align-items: center; justify-self: end; }
  .from svg { width: 84px; height: 84px; border-radius: 22%; display: block; border: 1.5px solid var(--ink); }
  .from .arrow { font-family: "JetBrains Mono", ui-monospace, monospace; color: var(--accent-text); font-size: 20px; }
  .from p { margin: 0; font-size: 13px; color: var(--slate); max-width: 22ch; }
  .palette { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 18px; }
  .chip { font-size: 11px; letter-spacing: 1.2px; display: inline-flex; gap: 6px; align-items: center; padding: 4px 10px 4px 4px; border: 1.5px solid var(--ink); border-radius: 999px; background: var(--card); color: var(--text); }
  .chip i { width: 14px; height: 14px; border-radius: 999px; border: 1px solid var(--line); }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(330px, 1fr)); gap: 26px; margin-top: 34px; }
  .card { display: grid; gap: 12px; padding: 18px; background: var(--card); border: 1.5px solid var(--ink); border-radius: 6px; box-shadow: 5px 5px 0 var(--shadow); }
  .card.picked { border-color: var(--accent); box-shadow: 5px 5px 0 var(--accent); }
  .card-top { display: flex; justify-content: space-between; gap: 8px; }
  .label { font-size: 12px; letter-spacing: 1.4px; color: var(--accent-text); font-weight: 700; }
  .label.quiet { color: var(--slate); font-weight: 500; }
  h3 { font-size: 2rem; }
  .card p { margin: 0; color: var(--body); font-size: 15px; }
  .tiles { display: grid; grid-template-columns: 1fr 1fr auto; gap: 12px; align-items: end; }
  .tiles figure { margin: 0; display: grid; gap: 6px; justify-items: center; }
  .tiles figure svg { width: 100%; max-width: 128px; height: auto; aspect-ratio: 1; display: block; border-radius: 22%; border: 1.5px solid var(--line); }
  figcaption { font-size: 11px; letter-spacing: 1.2px; color: var(--slate); }
  .minis { display: grid; grid-template-columns: 48px 48px; gap: 8px; align-items: end; justify-items: center; }
  .mini svg { display: block; border-radius: 22%; }
  .l48 svg, .d48 svg { width: 48px; height: 48px; }
  .l24 svg, .d24 svg { width: 24px; height: 24px; }
  .actions { display: flex; flex-wrap: wrap; gap: 8px; }
  .b { font-size: 12px; letter-spacing: 1.4px; padding: 8px 12px; border: 2px solid var(--ink); border-radius: 4px; background: var(--card); color: var(--text); cursor: pointer; }
  .b:active { transform: translate(2px, 2px); }
  .b.pick[aria-pressed="true"], .b.primary { background: var(--accent); border-color: var(--ink); color: var(--on-accent); box-shadow: 3px 3px 0 var(--ink); }
  .bar { position: fixed; left: 0; right: 0; bottom: 0; z-index: 10; display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 8px 14px; padding: 12px 16px calc(12px + env(safe-area-inset-bottom, 0px)); background: var(--card); border-top: 1.5px solid var(--ink); font-size: 14px; }
  .bar .list { font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 12px; color: var(--slate); }
  .status { font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 12px; color: var(--accent-text); min-height: 1em; }
  #fallback { width: min(680px, 100%); min-height: 80px; font: 11px/1.4 "JetBrains Mono", ui-monospace, monospace; border: 1.5px solid var(--ink); border-radius: 4px; background: var(--surface); color: var(--text); padding: 8px; }
  .foot { margin-top: 30px; color: var(--slate); font-size: 14px; max-width: 75ch; }
  :focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
  @media (max-width: 760px) { .hero { grid-template-columns: 1fr; padding: 20px; } .from { justify-self: start; } }
  @media (max-width: 420px) { .tiles { grid-template-columns: 1fr 1fr; } .minis { grid-column: 1 / -1; grid-template-columns: repeat(4, auto); justify-content: start; } }
</style>
<div class="wrap">
  <header class="hero">
    <div>
      <div class="eyebrow">Atomic File Manager · App icon · 10 variations</div>
      <h1>One folder. <span>Ten atoms.</span></h1>
      <p class="lead">Study 50's Markdown folder, rebuilt for Atomic: the <code>#</code> is now the atom mark, and every colour, border and shadow comes from the Atomic design system. Ink on paper, one Signal, hard offset shadows, no blur. Each icon has a light and a dark version, shown here at 128, 48 and 24 px.</p>
      <div class="palette" aria-label="Palette">
        <span class="chip"><i style="background:#15171b"></i>Ink #15171B</span>
        <span class="chip"><i style="background:#f4f5f1"></i>Paper #F4F5F1</span>
        <span class="chip"><i style="background:#3a2ff0"></i>Signal #3A2FF0</span>
        <span class="chip"><i style="background:#8f88ff"></i>On ink #8F88FF</span>
        <span class="chip"><i style="background:#1d14a0"></i>Deep #1D14A0</span>
        <span class="chip"><i style="background:#d8d6ff"></i>Mist #D8D6FF</span>
      </div>
    </div>
    <div class="from">${study50Svg()}<span class="arrow" aria-hidden="true">→</span><p>Started from study 50, “Markdown Folder”, in LLMiser's palette.</p></div>
  </header>

  <main class="grid" id="grid">
${atomCards}
  </main>
  <p class="foot">Files: <code>Atomic-File-Manager/docs/design/icon-variations/</code>, with an SVG (128 × 128) and a 512 px PNG of every variation in both themes. Pick the ones worth developing and send the list back. The chosen icon can then become an Android adaptive icon with foreground, background and monochrome layers.</p>
  <textarea id="fallback" readonly hidden aria-label="SVG source"></textarea>
</div>
<div class="bar" id="bar" hidden>
  <span><b id="count">0</b> picked</span><span class="list" id="list"></span>
  <button type="button" class="b primary" id="copy-picks">Copy picks</button>
  <button type="button" class="b" id="clear">Clear</button>
  <span class="status" id="status" role="status"></span>
</div>
<script>
(function () {
  var ICONS = ${atomSvgJson};
  var picks = [];
  try { picks = JSON.parse(localStorage.getItem('atomic-folder-picks') || '[]').filter(function (n) { return n >= 0 && n < ICONS.length; }); } catch (e) { picks = []; }
  var pad = function (n) { return (n < 9 ? '0' : '') + (n + 1); };
  var status = document.getElementById('status');
  function copy(text, ok) {
    var fb = function () { var ta = document.getElementById('fallback'); ta.hidden = false; ta.value = text; ta.focus(); ta.select(); status.textContent = 'Copy is blocked here. Text selected below: press Ctrl+C or ⌘C.'; document.getElementById('bar').hidden = false; };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { status.textContent = ok; document.getElementById('bar').hidden = false; }, fb); else fb();
  }
  function sync() {
    document.querySelectorAll('.card').forEach(function (card) {
      var i = Number(card.getAttribute('data-i')), on = picks.indexOf(i) >= 0, b = card.querySelector('[data-pick]');
      card.classList.toggle('picked', on); b.setAttribute('aria-pressed', String(on)); b.textContent = on ? 'Picked' : 'Pick';
    });
    picks.sort(function (a, b) { return a - b; });
    document.getElementById('count').textContent = picks.length;
    document.getElementById('list').textContent = picks.map(pad).join(' · ');
    document.getElementById('bar').hidden = picks.length === 0 && !status.textContent;
    try { localStorage.setItem('atomic-folder-picks', JSON.stringify(picks)); } catch (e) { /* storage unavailable */ }
  }
  document.getElementById('grid').addEventListener('click', function (e) {
    var t = e.target.closest('button'); if (!t) return;
    if (t.hasAttribute('data-pick')) { var i = Number(t.getAttribute('data-pick')), k = picks.indexOf(i); if (k >= 0) picks.splice(k, 1); else picks.push(i); status.textContent = ''; sync(); }
    if (t.hasAttribute('data-copy')) { var j = Number(t.getAttribute('data-i')), th = t.getAttribute('data-copy'); copy(ICONS[j][th], 'SVG copied: ' + pad(j) + ' ' + ICONS[j].name + ', ' + th + '.'); }
  });
  document.getElementById('copy-picks').addEventListener('click', function () { copy('Atomic folder icon picks: ' + picks.map(function (i) { return pad(i) + ' ' + ICONS[i].name; }).join(', '), 'Copied ' + picks.length + ' picks.'); });
  document.getElementById('clear').addEventListener('click', function () { picks = []; status.textContent = ''; sync(); });
  sync();
})();
</script>
`;

// Contact sheets for a quick visual check (scratchpad only).
function sheet(tiles, cols, S) {
  const rows = Math.ceil(tiles.length / cols), img = newImg(cols * (S + 8) + 8, rows * (S + 8) + 8);
  fillRect(img, 0, 0, img.w, img.h, '#7a7a80');
  tiles.forEach((t, k) => { const ox = 8 + (k % cols) * (S + 8), oy = 8 + Math.floor(k / cols) * (S + 8); for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { const si = (y * S + x) * 4, di = ((oy + y) * img.w + ox + x) * 4; for (let c = 0; c < 4; c++) img.data[di + c] = t.data[si + c]; } });
  return img;
}
write(HERE, 'contact-atomic.png', encodePNG(sheet(ATOMIC.flatMap((ic) => ['light', 'dark'].map((th) => rasterize(atomPrims(ic, th), 160, acol('G', th), false))), 4, 160)));
write(HERE, 'contact-llm.png', encodePNG(sheet([rasterize(llmPrims('dark'), 192, LGROUND.dark.bg, true), rasterize(llmPrims('light'), 192, LGROUND.light.bg, true), rasterize(llmPrims('dark', 0.84), 192, LGROUND.dark.bg, true)], 3, 192)));

write(OUT_LLM, 'preview.html', llmPage);
write(OUT_ATOM, 'preview.html', atomPage);
write(HERE, 'llmiser-kit.html', llmPage);
write(HERE, 'atomic-folder-icons.html', atomPage);
console.log('LLMiser files:', llmFiles.length, '->', OUT_LLM);
console.log('Atomic files:', atomFiles.length, '->', OUT_ATOM);
console.log('pages:', kb(Buffer.byteLength(llmPage)), kb(Buffer.byteLength(atomPage)));
