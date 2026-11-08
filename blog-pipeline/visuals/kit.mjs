// Drawing kit for LLMiser blog visuals (banners, charts and diagrams).
//
// Every figure is a plain SVG string. Colors are CSS variables with a light
// fallback, so a figure drawn inline in the Blog dialog and on /blog/{slug}
// follows the app's theme toggle (--text, --surface, --bf-s1...) and still
// looks right when the file is opened on its own. Each figure ends with a
// small LLMiser signature (the Prompt L mark and the site name).
//
// Banners use the LLMiser identity in fixed colors that read the same in both
// themes: the ink ground of the Prompt L icon kit (project-docs/brand/llmiser),
// the pixel mark, a paper card for the article's illustration, and an amber to
// periwinkle hairline. The illustration inside the card keeps the B palette.
//
// Series colors (validated with the dataviz palette checker against both
// themes' --surface-2, all checks PASS):
//   s1 amber   light #b45309  dark #c97a10   what you keep: Markdown, savings
//   s2 violet  light #6d5fd0  dark #8a7ee0   what the model is also sent: page images, extra context
//   s3 pink    light #c2558f  dark #d9629c   waste: noise, duplicates, repeats
// Text never wears a series color except a short label next to its own mark.

export const W = 600;
const PAD = 24;

const v = (name, fallback) => `var(--${name},${fallback})`;
export const C = {
  ink: v('text', '#18181b'),
  muted: v('muted', '#52525b'),
  faint: v('faint', '#64748b'),
  surface: v('surface', '#ffffff'),
  surface2: v('surface-2', '#f5f3ee'),
  border: v('border', '#e2e8f0'),
  border3: v('border-3', '#cbd5e1'),
  s1: v('bf-s1', '#b45309'),
  s2: v('bf-s2', '#6d5fd0'),
  s3: v('bf-s3', '#c2558f'),
};
export const F = {
  hand: "var(--font-patrick-hand,'Patrick Hand'),'Patrick Hand',ui-rounded,system-ui,sans-serif",
  mono: "var(--font-jetbrains-mono,'JetBrains Mono'),'JetBrains Mono',ui-monospace,Menlo,monospace",
  sans: "var(--font-inter,'Inter'),Inter,system-ui,-apple-system,'Segoe UI',sans-serif",
};

export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const n = (x) => Math.round(x * 10) / 10;
const st = (o) => Object.entries(o).filter(([, val]) => val !== undefined && val !== null && val !== false).map(([k, val]) => `${k}:${val}`).join(';');
const color = (s) => (s ? C[s] || s : undefined);

// ── Primitives ──────────────────────────────────────────────────────────────

export function rect(x, y, w, h, { fill = 'none', stroke, sw = 1.5, r = 8, fo, so, dash, tip } = {}) {
  const style = st({ fill, 'fill-opacity': fo, stroke, 'stroke-width': stroke ? sw : undefined, 'stroke-opacity': so, 'stroke-dasharray': dash });
  const body = `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="${r}" style="${style}"`;
  return tip ? `${body}><title>${esc(tip)}</title></rect>` : `${body}/>`;
}

export function text(x, y, str, { size = 15, fill = C.ink, font = F.sans, weight, anchor = 'start', op, italic, spacing } = {}) {
  const style = st({ fill, 'font-family': font, 'font-size': `${size}px`, 'font-weight': weight, 'fill-opacity': op, 'font-style': italic ? 'italic' : undefined, 'letter-spacing': spacing, 'white-space': 'pre' });
  return `<text x="${n(x)}" y="${n(y)}" text-anchor="${anchor}" style="${style}">${esc(str)}</text>`;
}

export function line(x1, y1, x2, y2, { stroke = C.border3, sw = 1.5, dash, op, cap = 'round' } = {}) {
  return `<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" style="${st({ stroke, 'stroke-width': sw, 'stroke-dasharray': dash, 'stroke-opacity': op, 'stroke-linecap': cap })}"/>`;
}

export function path(d, { fill = 'none', stroke, sw = 1.5, fo, so, join = 'round', cap = 'round', dash } = {}) {
  return `<path d="${d}" style="${st({ fill, 'fill-opacity': fo, stroke, 'stroke-width': stroke ? sw : undefined, 'stroke-opacity': so, 'stroke-linejoin': join, 'stroke-linecap': cap, 'stroke-dasharray': dash })}"/>`;
}

export function circle(cx, cy, r, { fill = 'none', stroke, sw = 1.5, fo } = {}) {
  return `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" style="${st({ fill, 'fill-opacity': fo, stroke, 'stroke-width': stroke ? sw : undefined })}"/>`;
}

/** Arrow from (x1,y1) to (x2,y2) with a drawn head (no <marker> ids to collide). */
export function arrow(x1, y1, x2, y2, { stroke = C.faint, sw = 2, head = 8 } = {}) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const p1 = [x2 - head * Math.cos(a - 0.45), y2 - head * Math.sin(a - 0.45)];
  const p2 = [x2 - head * Math.cos(a + 0.45), y2 - head * Math.sin(a + 0.45)];
  return line(x1, y1, x2, y2, { stroke, sw }) + path(`M${n(p1[0])} ${n(p1[1])}L${n(x2)} ${n(y2)}L${n(p2[0])} ${n(p2[1])}`, { stroke, sw });
}

/** Horizontal bar, square at the baseline, 4px rounded data end. */
export function bar(x, y, w, h, fill, tip) {
  const r = Math.min(4, w / 2, h / 2);
  if (w <= 0) return '';
  const d = `M${n(x)} ${n(y)}H${n(x + w - r)}Q${n(x + w)} ${n(y)} ${n(x + w)} ${n(y + r)}V${n(y + h - r)}Q${n(x + w)} ${n(y + h)} ${n(x + w - r)} ${n(y + h)}H${n(x)}Z`;
  const shape = `<path d="${d}" style="${st({ fill })}"`;
  return tip ? `${shape}><title>${esc(tip)}</title></path>` : `${shape}/>`;
}

/** Splits text into lines of at most `max` characters, on spaces. */
export function wrap(str, max) {
  const out = [];
  let cur = '';
  for (const word of String(str).split(/\s+/)) {
    if (cur && (cur + ' ' + word).length > max) {
      out.push(cur);
      cur = word;
    } else cur = cur ? `${cur} ${word}` : word;
  }
  if (cur) out.push(cur);
  return out;
}

function pill(x, y, label, { s = 's1', size = 13, anchor = 'start' } = {}) {
  const w = label.length * size * 0.62 + 18;
  const x0 = anchor === 'end' ? x - w : x;
  return rect(x0, y - size - 3, w, size + 10, { fill: color(s), fo: 0.13, stroke: color(s), sw: 1.2, r: (size + 10) / 2 })
    + text(x0 + w / 2, y + 1, label, { size, font: F.mono, anchor: 'middle', fill: C.ink, weight: 600 });
}

// ── Figure frame ────────────────────────────────────────────────────────────

/**
 * A complete figure: optional hand-drawn title and subtitle, then parts
 * stacked top to bottom. Each part is (y) => ({ svg, h }).
 */
export function figure({ title, subtitle, parts, gap = 18, bottom = 20 }) {
  let y = 14;
  let out = '';
  if (title) {
    y += 28;
    out += text(PAD, y, title, { size: 31, font: F.hand, weight: 700 });
  }
  if (subtitle) {
    for (const lineText of wrap(subtitle, 70)) {
      y += 21;
      out += text(PAD, y, lineText, { size: 14.5, fill: C.muted });
    }
  }
  if (title || subtitle) y += gap;
  for (const part of parts) {
    const { svg, h } = part(y);
    out += svg;
    y += h + gap;
  }
  y = y - gap + 14;
  out += signature(y);
  const height = Math.round(y + 16 + bottom - 8);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${height}" width="${W}" height="${height}" focusable="false">${out}</svg>\n`;
}

// ── Brand mark ──────────────────────────────────────────────────────────────

// Prompt L (icon study 11) on its 16 x 16 grid: an amber ">", an "L" and a
// periwinkle underline. Same cells as project-docs/brand/llmiser.
const MARK = {
  gt: [[2, 4], [3, 5], [4, 6], [5, 7], [4, 8], [3, 9], [2, 10]],
  l: [[9, 4], [9, 5], [9, 6], [9, 7], [9, 8], [9, 9], [9, 10], [10, 10], [11, 10], [12, 10], [13, 10]],
  under: [[9, 12], [10, 12], [11, 12], [12, 12], [13, 12]],
};

/** The Prompt L glyph as merged pixel rects. `x, y` is the grid's top-left corner. */
export function promptL(x, y, cell, { gt = '#f59e0b', l = '#f2f2f6', under = '#a0a0ff', depth = 0, side } = {}) {
  const rows = (cells) => {
    const byRow = new Map();
    cells.forEach(([cx, cy]) => byRow.set(cy, [...(byRow.get(cy) || []), cx]));
    const out = [];
    for (const [cy, xs] of byRow) {
      xs.sort((a, b) => a - b);
      let start = xs[0];
      let prev = xs[0];
      for (const cx of [...xs.slice(1), Infinity]) {
        if (cx !== prev + 1) {
          out.push([start, cy, prev - start + 1]);
          start = cx;
        }
        prev = cx;
      }
    }
    return out;
  };
  const draw = (cells, fill, dx = 0) => rows(cells)
    .map(([cx, cy, w]) => `<rect x="${n(x + cx * cell + dx)}" y="${n(y + cy * cell + dx)}" width="${n(w * cell)}" height="${n(cell)}" style="fill:${fill}"/>`)
    .join('');
  let out = '';
  if (depth) out += draw([...MARK.gt, ...MARK.l, ...MARK.under], side || 'rgba(0,0,0,0.35)', depth);
  return out + draw(MARK.gt, gt) + draw(MARK.l, l) + draw(MARK.under, under);
}

/** Small signature under every figure: the mark, then the site name. */
function signature(y) {
  const cell = 1.25;
  const label = 'LLMiser · llmiser.devbehindyou.com';
  const lw = label.length * 6.6;
  const x = W - PAD - lw - 22;
  return line(PAD, y - 8, W - PAD, y - 8, { stroke: C.border, sw: 1 })
    + promptL(x - 2, y - 4, cell, { gt: '#f59e0b', l: C.ink, under: '#a0a0ff' })
    + text(W - PAD, y + 10, label, { size: 11, font: F.mono, fill: C.faint, anchor: 'end' });
}

// ── Parts ───────────────────────────────────────────────────────────────────

export function legend(items) {
  return (y) => {
    let x = PAD;
    let svg = '';
    let row = 0;
    for (const item of items) {
      const w = 22 + item.name.length * 7.6 + 22;
      if (x + w > W - PAD) {
        x = PAD;
        row += 1;
      }
      const yy = y + row * 24;
      svg += rect(x, yy, 13, 13, { fill: color(item.s), r: 3 }) + text(x + 20, yy + 11.5, item.name, { size: 14, fill: C.ink });
      x += w;
    }
    return { svg, h: (row + 1) * 24 - 8 };
  };
}

/**
 * Horizontal bars, one value per row: { label, value, s, display, note }.
 * Labels sit above their bar and values at the bar end (direct labels).
 */
export function hbars(rows, { max, unit = '', labelWidth = 0 } = {}) {
  const top = Math.max(...rows.map((r) => r.value));
  const scale = max || top;
  const x0 = PAD + labelWidth;
  const longest = Math.max(...rows.map((r) => (r.display || `${r.value.toLocaleString('en-US')}${unit}`).length));
  const full = W - PAD - x0 - Math.max(60, longest * 9.4 + 14);
  return (y) => {
    let svg = '';
    rows.forEach((r, i) => {
      const yy = y + i * 58;
      const w = Math.max(3, (r.value / scale) * full);
      const shown = r.display || `${r.value.toLocaleString('en-US')}${unit}`;
      svg += text(PAD, yy + 15, r.label, { size: 15, weight: 600 });
      if (r.note) svg += text(PAD + r.label.length * 8.6 + 10, yy + 15, r.note, { size: 13.5, fill: C.faint });
      svg += line(x0, yy + 22, x0, yy + 46, { stroke: C.border3, sw: 1 });
      svg += bar(x0, yy + 23, w, 22, color(r.s || 's1'), `${r.label}: ${shown}`);
      svg += text(x0 + w + 8, yy + 39, shown, { size: 15, font: F.mono, weight: 700 });
    });
    return { svg, h: rows.length * 58 - 8 };
  };
}

/**
 * Stacked horizontal bars: rows of { label, parts: [{ v, s, name }], total }.
 * 2px surface gaps between segments, direct total at the end.
 */
export function stacked(rows, { max, unit = '' } = {}) {
  const top = max || Math.max(...rows.map((r) => r.parts.reduce((a, p) => a + p.v, 0)));
  const longest = Math.max(...rows.map((r) => String(r.total || r.parts.reduce((a, p) => a + p.v, 0).toLocaleString('en-US')).length));
  const full = W - PAD * 2 - Math.max(70, longest * 9.4 + 14);
  return (y) => {
    let svg = '';
    rows.forEach((r, i) => {
      const yy = y + i * 62;
      svg += text(PAD, yy + 15, r.label, { size: 15, weight: 600 });
      if (r.note) svg += text(PAD + r.label.length * 8.6 + 10, yy + 15, r.note, { size: 13.5, fill: C.faint });
      let x = PAD;
      let sum = 0;
      r.parts.forEach((p, j) => {
        const w = (p.v / top) * full;
        const last = j === r.parts.length - 1;
        const segW = Math.max(1, last ? w : w - 2);
        const tip = `${r.label}, ${p.name}: ${p.v.toLocaleString('en-US')}${unit}`;
        svg += last ? bar(x, yy + 23, segW, 24, color(p.s), tip) : rect(x, yy + 23, segW, 24, { fill: color(p.s), r: 0, tip });
        if (p.inLabel && w > 70) svg += text(x + 8, yy + 40, p.inLabel, { size: 12.5, font: F.mono, fill: '#ffffff', weight: 700 });
        x += w;
        sum += p.v;
      });
      svg += line(PAD, yy + 21, PAD, yy + 49, { stroke: C.border3, sw: 1 });
      svg += text(x + 8, yy + 41, r.total || `${sum.toLocaleString('en-US')}${unit}`, { size: 15, font: F.mono, weight: 700 });
    });
    return { svg, h: rows.length * 62 - 8 };
  };
}

/**
 * Process diagram: steps of { t, sub, s } in a snake grid (left to right,
 * then right to left). A step with `s` is highlighted in that series color.
 */
export function flow(steps, { cols = 3, boxH = 72, gapX = 30, gapY = 34, numbered = true } = {}) {
  const boxW = (W - PAD * 2 - gapX * (cols - 1)) / cols;
  return (y) => {
    let svg = '';
    const pos = steps.map((_, i) => {
      const row = Math.floor(i / cols);
      const k = i % cols;
      const col = row % 2 === 0 ? k : cols - 1 - k;
      return { x: PAD + col * (boxW + gapX), y: y + row * (boxH + gapY), row };
    });
    steps.forEach((step, i) => {
      if (i === 0) return;
      const a = pos[i - 1];
      const b = pos[i];
      if (a.row === b.row) {
        const ltr = b.x > a.x;
        svg += arrow(ltr ? a.x + boxW + 4 : a.x - 4, a.y + boxH / 2, ltr ? b.x - 5 : b.x + boxW + 5, b.y + boxH / 2);
      } else {
        svg += arrow(a.x + boxW / 2, a.y + boxH + 4, b.x + boxW / 2, b.y - 5);
      }
    });
    steps.forEach((step, i) => {
      const { x, y: yy } = pos[i];
      const hl = step.s ? color(step.s) : null;
      svg += rect(x, yy, boxW, boxH, { fill: hl || C.surface2, fo: hl ? 0.12 : undefined, stroke: hl || C.border3, sw: hl ? 2 : 1.5, r: 10, dash: step.dashed ? '5 4' : undefined });
      if (numbered) svg += text(x + 8, yy + 14, String(i + 1).padStart(2, '0'), { size: 11, font: F.mono, fill: C.faint });
      const titleLines = wrap(step.t, Math.floor(boxW / 9.2));
      const subLines = step.sub ? wrap(step.sub, Math.floor(boxW / 8.2)) : [];
      const block = titleLines.length * 21 + subLines.length * 17;
      let ty = Math.max(yy + boxH / 2 - block / 2 + 16 + (numbered ? 6 : 0), yy + (numbered ? 38 : 26));
      for (const t of titleLines) {
        svg += text(x + boxW / 2, ty, t, { size: 21, font: F.hand, weight: 700, anchor: 'middle' });
        ty += 21;
      }
      for (const t of subLines) {
        svg += text(x + boxW / 2, ty - 2, t, { size: 12.5, font: F.mono, fill: C.muted, anchor: 'middle' });
        ty += 17;
      }
    });
    const rows = Math.ceil(steps.length / cols);
    return { svg, h: rows * boxH + (rows - 1) * gapY };
  };
}

/**
 * Text panels stacked vertically, each like a little editor window:
 * { title, tag, s, lines: [{ t, k }] }. Line kinds: 'keep' (default),
 * 'head' (a Markdown heading), 'noise' (struck through, waste color), 'dim'.
 */
export function panels(list) {
  return (y) => {
    let svg = '';
    let yy = y;
    for (const p of list) {
      const h = 46 + p.lines.length * 23 + 10;
      svg += rect(PAD, yy, W - PAD * 2, h, { fill: C.surface2, stroke: p.s ? color(p.s) : C.border3, sw: p.s ? 2 : 1.5, r: 10 });
      svg += circle(PAD + 16, yy + 18, 4, { fill: C.border3 }) + circle(PAD + 30, yy + 18, 4, { fill: C.border3 }) + circle(PAD + 44, yy + 18, 4, { fill: C.border3 });
      svg += text(PAD + 58, yy + 25, p.title, { size: 22, font: F.hand, weight: 700 });
      if (p.tag) svg += pill(W - PAD - 12, yy + 24, p.tag, { s: p.s || 's2', anchor: 'end' });
      svg += line(PAD, yy + 36, W - PAD, yy + 36, { stroke: C.border3, sw: 1 });
      p.lines.forEach((ln, i) => {
        const ly = yy + 58 + i * 23;
        const kind = ln.k || 'keep';
        const fill = kind === 'head' ? C.s1 : kind === 'noise' ? C.s3 : kind === 'dim' ? C.faint : C.ink;
        svg += text(PAD + 16, ly, ln.t, { size: 14.5, font: F.mono, fill, weight: kind === 'head' ? 700 : undefined });
        if (kind === 'noise') {
          const w = ln.t.length * 8.7;
          svg += line(PAD + 14, ly - 5, PAD + 18 + w, ly - 5, { stroke: C.s3, sw: 1.5 });
        }
      });
      yy += h + 14;
    }
    return { svg, h: yy - y - 14 };
  };
}

/**
 * Narrowing bars centered on one axis: { label, value, display, s }.
 * Used for "what's retrieved vs what's needed" style reductions.
 */
export function funnel(stages, { unit = '' } = {}) {
  const top = Math.max(...stages.map((s) => s.value));
  const full = W - PAD * 2;
  return (y) => {
    let svg = '';
    stages.forEach((s, i) => {
      const yy = y + i * 64;
      const shownText = s.display || `${s.value.toLocaleString('en-US')}${unit}`;
      const need = Math.max(s.label.length * 8.8, shownText.length * 8.3) + 36;
      const w = Math.min(full, Math.max(need, (s.value / top) * full));
      const x = (W - w) / 2;
      const shown = s.display || `${s.value.toLocaleString('en-US')}${unit}`;
      svg += rect(x, yy, w, 44, { fill: color(s.s || 's2'), fo: 0.16, stroke: color(s.s || 's2'), sw: 1.8, r: 8, tip: `${s.label}: ${shown}` });
      svg += text(W / 2, yy + 20, s.label, { size: 15, weight: 600, anchor: 'middle' });
      svg += text(W / 2, yy + 37, shown, { size: 13.5, font: F.mono, fill: C.muted, anchor: 'middle' });
      if (i < stages.length - 1) svg += arrow(W / 2, yy + 47, W / 2, yy + 61, { sw: 1.8, head: 6 });
    });
    return { svg, h: stages.length * 64 - 20 };
  };
}

/**
 * Card grid: { k, title, sub, s }. `k` is a short hand-drawn key figure or
 * label ("-50%", "01"), `sub` wraps inside the card.
 */
export function cards(items, { cols = 2, h = 118, gap = 14 } = {}) {
  const cw = (W - PAD * 2 - gap * (cols - 1)) / cols;
  return (y) => {
    let svg = '';
    items.forEach((it, i) => {
      const x = PAD + (i % cols) * (cw + gap);
      const yy = y + Math.floor(i / cols) * (h + gap);
      svg += rect(x, yy, cw, h, { fill: C.surface2, stroke: C.border3, r: 12 });
      svg += rect(x, yy + 12, 4, h - 24, { fill: color(it.s || 's1'), r: 2 });
      svg += text(x + 18, yy + 36, it.k, { size: 32, font: F.hand, weight: 700, fill: color(it.s || 's1') });
      const kw = String(it.k).length * 16.5 + 34;
      const titleLines = wrap(it.title, Math.floor((cw - kw - 14) / 8.6));
      titleLines.forEach((t, j) => {
        svg += text(x + kw, yy + 22 + j * 18 + (titleLines.length === 1 ? 7 : 0), t, { size: 15, weight: 700 });
      });
      wrap(it.sub, Math.floor((cw - 32) / 7.3)).forEach((t, j) => {
        svg += text(x + 18, yy + 66 + j * 18, t, { size: 13.5, fill: C.muted });
      });
    });
    const rows = Math.ceil(items.length / cols);
    return { svg, h: rows * h + (rows - 1) * gap };
  };
}

/**
 * Hero numbers in a row: { big, label, s }. For one or two headline facts,
 * not a chart.
 */
export function tiles(items) {
  const gap = 14;
  const tw = (W - PAD * 2 - gap * (items.length - 1)) / items.length;
  return (y) => {
    let svg = '';
    items.forEach((it, i) => {
      const x = PAD + i * (tw + gap);
      svg += rect(x, y, tw, 104, { fill: C.surface2, stroke: it.s ? color(it.s) : C.border3, sw: it.s ? 2 : 1.5, r: 12 });
      svg += text(x + tw / 2, y + 50, it.big, { size: 44, font: F.hand, weight: 700, anchor: 'middle', fill: it.s ? color(it.s) : C.ink });
      wrap(it.label, Math.floor(tw / 7.6)).forEach((t, j) => {
        svg += text(x + tw / 2, y + 74 + j * 17, t, { size: 13.5, fill: C.muted, anchor: 'middle' });
      });
    });
    return { svg, h: 104 };
  };
}

/**
 * Cumulative build-up, one row per added cost: { label, add, s }. Each bar
 * starts where the previous one ended, the last row shows the total.
 */
export function waterfall(rows, { unit = '', totalLabel = 'Total' } = {}) {
  const total = rows.reduce((a, r) => a + r.add, 0);
  const x0 = PAD + 200;
  const full = W - PAD - x0 - 74;
  return (y) => {
    let svg = '';
    let acc = 0;
    const all = [...rows, { label: totalLabel, add: total, total: true }];
    all.forEach((r, i) => {
      const yy = y + i * 40;
      const start = r.total ? 0 : acc;
      const w = Math.max(2, (r.add / total) * full);
      const xs = x0 + (start / total) * full;
      svg += text(x0 - 12, yy + 21, r.label, { size: 14.5, anchor: 'end', weight: r.total ? 700 : undefined });
      svg += r.total
        ? bar(xs, yy + 6, w, 22, C.ink, `${r.label}: ${r.add.toLocaleString('en-US')}${unit}`)
        : rect(xs, yy + 6, w, 22, { fill: color(r.s || 's2'), r: 3, tip: `${r.label}: +${r.add.toLocaleString('en-US')}${unit}` });
      if (!r.total && i < rows.length - 1) svg += line(xs + w, yy + 28, xs + w, yy + 46, { stroke: C.faint, sw: 1, dash: '3 3' });
      svg += text(xs + w + 8, yy + 22, `${r.total ? '' : '+'}${r.add.toLocaleString('en-US')}${unit}`, { size: 13.5, font: F.mono, weight: 700 });
      if (!r.total) acc += r.add;
    });
    svg += line(x0, y, x0, y + all.length * 40 - 6, { stroke: C.border3, sw: 1 });
    return { svg, h: all.length * 40 - 6 };
  };
}

/**
 * One question, two branches: { start, question, yes: {t, sub, s}, no: {t, sub, s}, after }.
 * `after` optionally continues the "no" branch with one more step.
 */
export function decision({ start, question, yes, no, after }) {
  const box = (x, y, w, h, step) => {
    const hl = step.s ? color(step.s) : null;
    let s = rect(x, y, w, h, { fill: hl || C.surface2, fo: hl ? 0.12 : undefined, stroke: hl || C.border3, sw: hl ? 2 : 1.5, r: 10 });
    const tl = wrap(step.t, Math.floor(w / 9.2));
    const sl = step.sub ? wrap(step.sub, Math.floor(w / 8.2)) : [];
    let ty = y + h / 2 - (tl.length * 21 + sl.length * 17) / 2 + 16;
    for (const t of tl) {
      s += text(x + w / 2, ty, t, { size: 21, font: F.hand, weight: 700, anchor: 'middle' });
      ty += 21;
    }
    for (const t of sl) {
      s += text(x + w / 2, ty - 2, t, { size: 12.5, font: F.mono, fill: C.muted, anchor: 'middle' });
      ty += 17;
    }
    return s;
  };
  return (y) => {
    let svg = '';
    const cw = 250;
    const cx = W / 2;
    svg += box(cx - cw / 2, y, cw, 56, start);
    svg += arrow(cx, y + 60, cx, y + 82);
    const qy = y + 86;
    const qw = 420;
    svg += path(`M${cx} ${qy}L${cx + qw / 2} ${qy + 42}L${cx} ${qy + 84}L${cx - qw / 2} ${qy + 42}Z`, { fill: C.surface2, stroke: C.ink, sw: 1.8 });
    wrap(question, 28).forEach((t, i, all) => {
      svg += text(cx, qy + 49 - (all.length - 1) * 11 + i * 22, t, { size: 20, font: F.hand, weight: 700, anchor: 'middle' });
    });
    const by = qy + 120;
    const bw = 250;
    const lx = PAD;
    const rx = W - PAD - bw;
    svg += path(`M${cx - qw / 2} ${qy + 42}H${lx + bw / 2}V${by - 5}`, { stroke: C.faint, sw: 2 }) + arrow(lx + bw / 2, by - 14, lx + bw / 2, by - 4);
    svg += path(`M${cx + qw / 2} ${qy + 42}H${rx + bw / 2}V${by - 5}`, { stroke: C.faint, sw: 2 }) + arrow(rx + bw / 2, by - 14, rx + bw / 2, by - 4);
    svg += text(lx + 8, qy + 34, 'YES', { size: 13, font: F.mono, weight: 700, fill: C.muted });
    svg += text(W - PAD - 8, qy + 34, 'NO', { size: 13, font: F.mono, weight: 700, fill: C.muted, anchor: 'end' });
    svg += box(lx, by, bw, 76, yes);
    svg += box(rx, by, bw, 76, no);
    let h = by + 76 - y;
    if (after) {
      svg += arrow(rx + bw / 2, by + 80, rx + bw / 2, by + 102);
      svg += box(rx, by + 106, bw, 76, after);
      h += 106;
    }
    return { svg, h };
  };
}

/**
 * Fork and join: { start, branches: [{t, sub, s}, ...], join, end }.
 * One input splits into parallel paths that come back together.
 */
export function fork({ start, branches, join, end }) {
  const box = (x, y, w, h, step) => {
    const hl = step.s ? color(step.s) : null;
    let s = rect(x, y, w, h, { fill: hl || C.surface2, fo: hl ? 0.12 : undefined, stroke: hl || C.border3, sw: hl ? 2 : 1.5, r: 10 });
    const tl = wrap(step.t, Math.floor(w / 9.2));
    const sl = step.sub ? wrap(step.sub, Math.floor(w / 8.2)) : [];
    let ty = y + h / 2 - (tl.length * 22 + sl.length * 17) / 2 + 16;
    for (const t of tl) {
      s += text(x + w / 2, ty, t, { size: 21, font: F.hand, weight: 700, anchor: 'middle' });
      ty += 22;
    }
    for (const t of sl) {
      s += text(x + w / 2, ty - 2, t, { size: 12.5, font: F.mono, fill: C.muted, anchor: 'middle' });
      ty += 17;
    }
    return s;
  };
  return (y) => {
    let svg = '';
    const cx = W / 2;
    const sw = 260;
    svg += box(cx - sw / 2, y, sw, 62, start);
    const by = y + 110;
    const gap = 20;
    const bw = (W - PAD * 2 - gap * (branches.length - 1)) / branches.length;
    branches.forEach((b, i) => {
      const bx = PAD + i * (bw + gap);
      svg += path(`M${cx} ${y + 66}V${y + 86}H${bx + bw / 2}V${by - 5}`, { stroke: C.faint, sw: 2 }) + arrow(bx + bw / 2, by - 14, bx + bw / 2, by - 4);
      svg += box(bx, by, bw, 84, b);
    });
    const jy = by + 84 + 48;
    branches.forEach((b, i) => {
      const bx = PAD + i * (bw + gap);
      svg += path(`M${bx + bw / 2} ${by + 88}V${by + 108}H${cx}`, { stroke: C.faint, sw: 2 });
    });
    svg += arrow(cx, by + 108, cx, jy - 4);
    svg += box(cx - sw / 2, jy, sw, 62, join);
    let h = jy + 62 - y;
    if (end) {
      svg += arrow(cx, jy + 66, cx, jy + 88);
      svg += box(cx - sw / 2, jy + 92, sw, 62, end);
      h += 92;
    }
    return { svg, h };
  };
}

/** A short note line under a chart (method, assumption). */
export function note(str, { s } = {}) {
  return (y) => {
    const lines = wrap(str, 74);
    let svg = '';
    lines.forEach((t, i) => {
      svg += text(PAD, y + 14 + i * 19, t, { size: 13.5, fill: s ? color(s) : C.faint, italic: !s });
    });
    return { svg, h: lines.length * 19 };
  };
}

/** Free-form drawing with the same primitives: (y) => ({ svg, h }). */
export function custom(h, draw) {
  return (y) => ({ svg: draw(y), h });
}

// ── Banners ─────────────────────────────────────────────────────────────────

// Illustration palette for the paper card inside a banner (ink on paper).
export const B = {
  ink: '#2d2740',
  paper: '#fffdf8',
  lav: '#b6ade0',
  violet: '#6d5fd0',
  amber: '#f59e0b',
  amberD: '#b45309',
  pink: '#c2558f',
  rose: '#eec9d6',
  mist: '#cfc8ef',
};

// LLMiser banner frame, fixed in both themes (Prompt L icon kit colors).
export const L = {
  ground: '#0b0b0e',
  grid: '#ffffff',
  paper: '#f2f2f6',
  card: '#f7f6f1',
  edge: '#2a2a30',
  muted: '#c2c2cc',
  faint: '#9494a0',
  amber: '#f59e0b',
  peri: '#a0a0ff',
  periD: '#6b6bff',
};

/**
 * A 1200 x 400 LLMiser banner. Left: the Prompt L mark and wordmark, a kicker
 * chip, the hook in the hand-drawn face and a mono sub line. Right: a paper
 * card (x 612 to 1176, y 28 to 372) holding the article's art from `art()`,
 * clipped to the card and drawn in the B palette. `id` keeps gradient and clip
 * ids unique when several banners share a page.
 */
export function banner({ id, kicker, hook, sub, art }) {
  const glowA = `${id}-glow-a`;
  const glowB = `${id}-glow-b`;
  const hair = `${id}-hair`;
  const clip = `${id}-card`;
  const hookLines = Array.isArray(hook) ? hook : [hook];
  const card = { x: 612, y: 28, w: 564, h: 344, r: 22 };
  let out = '<defs>'
    + `<radialGradient id="${glowA}" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="${L.amber}" stop-opacity="0.28"/><stop offset="1" stop-color="${L.amber}" stop-opacity="0"/></radialGradient>`
    + `<radialGradient id="${glowB}" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="${L.periD}" stop-opacity="0.32"/><stop offset="1" stop-color="${L.periD}" stop-opacity="0"/></radialGradient>`
    + `<linearGradient id="${hair}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${L.amber}"/><stop offset="1" stop-color="${L.peri}"/></linearGradient>`
    + `<clipPath id="${clip}"><rect x="${card.x}" y="${card.y}" width="${card.w}" height="${card.h}" rx="${card.r}"/></clipPath>`
    + '</defs>';
  out += `<rect width="1200" height="400" fill="${L.ground}"/>`;
  out += `<circle cx="180" cy="430" r="360" fill="url(#${glowA})"/><circle cx="1120" cy="-40" r="420" fill="url(#${glowB})"/>`;
  // Pixel grid: one 16 px cell, like the 16 x 16 icon grid.
  for (let x = 32; x < 1200; x += 32) out += `<line x1="${x}" y1="0" x2="${x}" y2="400" stroke="${L.grid}" stroke-opacity="0.045" stroke-width="1"/>`;
  for (let y = 32; y < 400; y += 32) out += `<line x1="0" y1="${y}" x2="1200" y2="${y}" stroke="${L.grid}" stroke-opacity="0.045" stroke-width="1"/>`;
  // Mark, wordmark and kicker.
  out += promptL(44, 30, 3.5, { depth: 1.5, side: '#000000' });
  out += `<text x="104" y="76" style="${st({ fill: L.paper, 'font-family': F.mono, 'font-size': '24px', 'font-weight': 700, 'letter-spacing': '0.5px' })}">LLMiser</text>`;
  if (kicker) {
    const kx = 232;
    const kw = kicker.length * 10.4 + 30;
    out += `<rect x="${kx}" y="54" width="${n(kw)}" height="30" rx="15" fill="${L.peri}" fill-opacity="0.1" stroke="${L.peri}" stroke-opacity="0.55" stroke-width="1.5"/>`;
    out += `<text x="${n(kx + kw / 2)}" y="74" text-anchor="middle" style="${st({ fill: L.peri, 'font-family': F.mono, 'font-size': '15px', 'font-weight': 700, 'letter-spacing': '1.5px' })}">${esc(kicker)}</text>`;
  }
  hookLines.forEach((t, i) => {
    out += `<text x="52" y="${178 + i * 68}" style="${st({ fill: L.paper, 'font-family': F.hand, 'font-size': '70px', 'font-weight': 700 })}">${esc(t)}</text>`;
  });
  if (sub) {
    out += `<text x="54" y="${178 + hookLines.length * 68 + 2}" style="${st({ fill: L.peri, 'font-family': F.mono, 'font-size': '21px' })}">${esc(sub)}</text>`;
  }
  out += `<text x="54" y="360" style="${st({ fill: L.faint, 'font-family': F.mono, 'font-size': '14px', 'letter-spacing': '0.5px' })}">llmiser.devbehindyou.com · Make Every Token Count.</text>`;
  // Illustration card.
  out += `<rect x="${card.x + 6}" y="${card.y + 6}" width="${card.w}" height="${card.h}" rx="${card.r}" fill="#000000" fill-opacity="0.45"/>`;
  out += `<rect x="${card.x}" y="${card.y}" width="${card.w}" height="${card.h}" rx="${card.r}" fill="${L.card}"/>`;
  out += `<g clip-path="url(#${clip})">${art ? art() : ''}</g>`;
  out += `<rect x="${card.x}" y="${card.y}" width="${card.w}" height="${card.h}" rx="${card.r}" fill="none" stroke="${L.edge}" stroke-width="2"/>`;
  out += `<rect y="394" width="1200" height="6" fill="url(#${hair})"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 400" width="1200" height="400" focusable="false">${out}</svg>\n`;
}

/** Banner art helpers: plain attributes in the fixed aurora palette. */
export const art = {
  page(x, y, w, h, { lines = 7, fill = B.paper, stroke = B.ink, rot = 0, fold = true, lineColor = B.lav, widths } = {}) {
    let out = `<g transform="rotate(${rot} ${n(x + w / 2)} ${n(y + h / 2)})">`;
    const f = fold ? 26 : 0;
    out += `<path d="M${x} ${y}H${x + w - f}L${x + w} ${y + f}V${y + h}H${x}Z" fill="${fill}" stroke="${stroke}" stroke-width="2.5" stroke-linejoin="round"/>`;
    if (fold) out += `<path d="M${x + w - f} ${y}V${y + f}H${x + w}" fill="none" stroke="${stroke}" stroke-width="2" stroke-linejoin="round"/>`;
    for (let i = 0; i < lines; i += 1) {
      const lw = (widths ? widths[i % widths.length] : [0.8, 0.65, 0.75, 0.5, 0.7][i % 5]) * (w - 40);
      out += `<rect x="${x + 20}" y="${y + 38 + i * ((h - 60) / lines)}" width="${n(lw)}" height="7" rx="3.5" fill="${lineColor}"/>`;
    }
    return `${out}</g>`;
  },
  chip(x, y, w, fill, { h = 22, stroke = B.ink } = {}) {
    return `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${h}" rx="6" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>`;
  },
  label(x, y, t, { size = 22, fill = B.ink, font = F.mono, weight = 700, anchor = 'start' } = {}) {
    return `<text x="${n(x)}" y="${n(y)}" text-anchor="${anchor}" style="${st({ fill, 'font-family': font, 'font-size': `${size}px`, 'font-weight': weight })}">${esc(t)}</text>`;
  },
  arrow(x1, y1, x2, y2, { stroke = B.ink, sw = 3.5, head = 16 } = {}) {
    const a = Math.atan2(y2 - y1, x2 - x1);
    const p1 = [x2 - head * Math.cos(a - 0.5), y2 - head * Math.sin(a - 0.5)];
    const p2 = [x2 - head * Math.cos(a + 0.5), y2 - head * Math.sin(a + 0.5)];
    return `<path d="M${n(x1)} ${n(y1)}L${n(x2)} ${n(y2)}M${n(p1[0])} ${n(p1[1])}L${n(x2)} ${n(y2)}L${n(p2[0])} ${n(p2[1])}" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`;
  },
  box(x, y, w, h, { fill = B.paper, stroke = B.ink, r = 14, sw = 2.5, op } = {}) {
    return `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="${r}" fill="${fill}"${op ? ` fill-opacity="${op}"` : ''} stroke="${stroke}" stroke-width="${sw}"/>`;
  },
  raw: (s) => s,
};
