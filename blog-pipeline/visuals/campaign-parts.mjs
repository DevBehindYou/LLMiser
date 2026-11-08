// Extra figure parts for the selected-title campaign, built only from the
// primitives and tokens in ./kit.mjs. kit.mjs itself stays unchanged (it is
// part of the preservation baseline). Parts follow the kit contract:
// (y) => ({ svg, h }), 600-unit figures, CSS-variable colors with light
// fallbacks, and shapes or labels in addition to color.

import { C, F, W, circle, line, path, rect, text, wrap } from './kit.mjs';

const PAD = 24;
const tone = (s) => (s ? C[s] || s : C.border3);

/**
 * A checklist with drawn boxes: [{ t, sub, done }]. `done` draws a tick,
 * otherwise an empty box. Text wraps; each item grows to fit.
 */
export function checklist(items, { s = 's1', size = 15.5 } = {}) {
  return (y) => {
    let svg = '';
    let yy = y;
    for (const it of items) {
      const tl = wrap(it.t, 58);
      const sl = it.sub ? wrap(it.sub, 66) : [];
      const h = Math.max(30, tl.length * 21 + sl.length * 18 + 8);
      svg += rect(PAD, yy + 2, 20, 20, { fill: C.surface2, stroke: tone(s), sw: 2, r: 4 });
      if (it.done !== false) svg += path(`M${PAD + 4.5} ${yy + 12.5}L${PAD + 9} ${yy + 17}L${PAD + 16} ${yy + 7}`, { stroke: tone(s), sw: 2.6 });
      tl.forEach((t, i) => {
        svg += text(PAD + 34, yy + 17 + i * 21, t, { size, weight: 600 });
      });
      sl.forEach((t, i) => {
        svg += text(PAD + 34, yy + 17 + tl.length * 21 + i * 18, t, { size: 13.5, fill: C.muted });
      });
      yy += h + 8;
    }
    return { svg, h: yy - y - 8 };
  };
}

const MARKS = {
  keep: { s: 's1', label: 'KEEP' },
  remove: { s: 's3', label: 'REMOVE' },
  skip: { s: 's2', label: 'SKIPPED' },
  sent: { s: 's3', label: 'CONVERTED' },
  info: { s: null, label: '' },
};

function markShape(x, y, kind) {
  const m = MARKS[kind] || MARKS.info;
  const c = tone(m.s);
  if (kind === 'keep') return rect(x, y - 9, 12, 12, { fill: c, r: 2 });
  if (kind === 'remove' || kind === 'sent') return path(`M${x} ${y - 9}L${x + 12} ${y + 3}M${x + 12} ${y - 9}L${x} ${y + 3}`, { stroke: c, sw: 2.4 });
  if (kind === 'skip') return circle(x + 6, y - 3, 6, { stroke: c, sw: 2 }) + line(x + 1.5, y - 3, x + 10.5, y - 3, { stroke: c, sw: 2 });
  return '';
}

/**
 * A file tree with a drawn mark per row: rows of { t, d, mark, note }.
 * `d` is the indent depth, `mark` one of keep/remove/skip/sent/info.
 * Marks use a shape and a right-aligned word label, not color alone.
 */
export function tree(rows, { title, rowH = 24 } = {}) {
  return (y) => {
    let svg = '';
    const top = y;
    let yy = y + (title ? 40 : 14);
    const h = (title ? 40 : 14) + rows.length * rowH + 10;
    svg += rect(PAD, top, W - PAD * 2, h, { fill: C.surface2, stroke: C.border3, r: 10 });
    if (title) {
      svg += text(PAD + 16, top + 26, title, { size: 21, font: F.hand, weight: 700 });
      svg += line(PAD, top + 36, W - PAD, top + 36, { stroke: C.border3, sw: 1 });
    }
    for (const r of rows) {
      const x = PAD + 18 + (r.d || 0) * 18;
      const by = yy + rowH - 6;
      svg += markShape(x, by, r.mark);
      svg += text(x + 20, by + 1, r.t, { size: 14, font: F.mono, fill: r.mark === 'info' ? C.faint : C.ink });
      const m = MARKS[r.mark];
      const label = r.note || (m && m.label) || '';
      if (label) svg += text(W - PAD - 14, by + 1, label, { size: 12, font: F.mono, fill: C.muted, anchor: 'end', weight: 600 });
      yy += rowH;
    }
    return { svg, h };
  };
}

/** Legend row for tree marks: keys from MARKS. */
export function markLegend(kinds) {
  return (y) => {
    let x = PAD;
    let svg = '';
    for (const k of kinds) {
      const m = MARKS[k];
      svg += markShape(x, y + 13, k) + text(x + 18, y + 14, m.label.toLowerCase(), { size: 13.5, fill: C.ink });
      x += 30 + m.label.length * 8.4 + 14;
    }
    return { svg, h: 18 };
  };
}

/**
 * Two labeled columns side by side: { left: {title, s, lines}, right: {...} }.
 * Lines are short mono strings. Prefixes: "- " struck through in the waste
 * color (removed), "+ " bold in the keep color (kept), "! " in the waste color
 * with a warning triangle (got through although it should not have), "# " a
 * small sans section label. Others are plain ink.
 */
export function columns({ left, right, lineH = 22 }) {
  const cw = (W - PAD * 2 - 16) / 2;
  return (y) => {
    const n = Math.max(left.lines.length, right.lines.length);
    const h = 44 + n * lineH + 12;
    let svg = '';
    [left, right].forEach((col, i) => {
      const x = PAD + i * (cw + 16);
      svg += rect(x, y, cw, h, { fill: C.surface2, stroke: tone(col.s), sw: col.s ? 2 : 1.5, r: 10 });
      svg += text(x + 14, y + 27, col.title, { size: 20, font: F.hand, weight: 700 });
      svg += line(x, y + 38, x + cw, y + 38, { stroke: C.border3, sw: 1 });
      col.lines.forEach((ln, j) => {
        const ly = y + 60 + j * lineH;
        const kind = /^[-+!#] /.test(ln) ? ln[0] : '';
        const t = kind ? ln.slice(2) : ln;
        if (kind === '#') {
          svg += text(x + 14, ly, t, { size: 12.5, fill: C.faint, weight: 600, spacing: '0.3px' });
          return;
        }
        if (kind === '!') svg += path(`M${x + 14} ${ly}L${x + 20} ${ly - 10}L${x + 26} ${ly}Z`, { fill: C.s3 });
        const tx = kind === '!' ? x + 32 : x + 14;
        svg += text(tx, ly, t, { size: 13, font: F.mono, fill: kind === '-' || kind === '!' ? C.s3 : kind === '+' ? C.s1 : C.ink, weight: kind === '+' || kind === '!' ? 700 : undefined });
        if (kind === '-') svg += line(x + 12, ly - 4.5, x + 16 + t.length * 7.85, ly - 4.5, { stroke: C.s3, sw: 1.4 });
      });
    });
    return { svg, h };
  };
}
