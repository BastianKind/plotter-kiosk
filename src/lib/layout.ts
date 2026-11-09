import { FALLBACK_HAND, HANDS, PRODUCTS } from '../data/catalog';
import type { Address, CardDesign, Drawing, Glyphs, HandKey, IconKey, Pt } from '../types';
import { PAD, bounds, fitStrokes, length } from './strokes';

/** Something the pen draws. All positions are in millimetres on the paper. */
export type Mark =
  | { kind: 'text'; x: number; y: number; text: string; family: string; size: number; w: number }
  | { kind: 'stroke'; pts: Pt[]; len: number }
  | { kind: 'icon'; icon: IconKey; x: number; y: number; size: number };

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** One sheet of paper (card or envelope) with everything the pen will draw on it. */
export interface SheetLayout {
  w: number;
  h: number;
  paper: string;
  marks: Mark[];
  /** Pre-printed bits that are not written by the pen. */
  printed: { lines: [number, number, number, number][]; stampBox: Box | null; fold: boolean };
  stamp: boolean;
  overflow: boolean;
}

// ---------- measuring ----------

const ctx = typeof document !== 'undefined' ? document.createElement('canvas').getContext('2d') : null;
const cache = new Map<string, number>();

/** Width of a text in em (multiply by the font size in mm). */
export function emWidth(text: string, family: string) {
  const key = `${family}|${text}`;
  let w = cache.get(key);
  if (w === undefined) {
    if (ctx) {
      ctx.font = `100px ${family}`;
      w = ctx.measureText(text).width / 100;
    } else w = text.length * 0.45;
    cache.set(key, w);
  }
  return w;
}

/** Call when web fonts finish loading; widths measured before that are wrong. */
export function resetMeasurements() {
  cache.clear();
}

interface Writer {
  size: number;
  lineH: number;
  width: (s: string) => number;
  write: (s: string, x: number, y: number, out: Mark[]) => void;
}

/** Writes with a font, or with the customer's own letters (skipped letters fall back to Jamie). */
function makeWriter(hand: HandKey, glyphs: Glyphs, baseSize: number): Writer {
  if (hand !== 'own') {
    const h = HANDS[hand];
    const size = baseSize * h.factor;
    return {
      size,
      lineH: size * 1.3,
      width: (s) => emWidth(s, h.family) * size,
      write: (s, x, y, out) => {
        if (s.trim()) out.push({ kind: 'text', x, y, text: s, family: h.family, size, w: emWidth(s, h.family) * size });
      },
    };
  }

  const size = baseSize;
  const fb = FALLBACK_HAND.family;
  // Tall letters on the pad (ascender line → baseline) become about 0.62 of the type size.
  const k = (0.62 * size) / (PAD.base - PAD.asc);
  const gap = 0.06 * size;
  const space = 0.3 * size;
  const glyphW = (ch: string) => {
    const b = bounds(glyphs[ch]);
    return (b.maxX - b.minX) * k;
  };
  const has = (ch: string) => (glyphs[ch]?.length ?? 0) > 0;
  const adv = (ch: string) => (ch === ' ' ? space : has(ch) ? glyphW(ch) + gap : emWidth(ch, fb) * size);

  return {
    size,
    lineH: size * 1.32,
    width: (s) => [...s].reduce((sum, ch) => sum + adv(ch), 0),
    write: (s, x, y, out) => {
      let cx = x;
      let run = '';
      let runX = x;
      const flush = () => {
        if (run) out.push({ kind: 'text', x: runX, y, text: run, family: fb, size, w: emWidth(run, fb) * size });
        run = '';
      };
      for (const ch of s) {
        if (ch === ' ') {
          flush();
          cx += space;
        } else if (has(ch)) {
          flush();
          const b = bounds(glyphs[ch]);
          for (const st of glyphs[ch]) {
            const pts = st.map(([px, py]) => [cx + (px - b.minX) * k, y + (py - PAD.base) * k] as Pt);
            out.push({ kind: 'stroke', pts, len: length(pts) });
          }
          cx += glyphW(ch) + gap;
        } else {
          if (!run) runX = cx;
          run += ch;
          cx += emWidth(ch, fb) * size;
        }
      }
      flush();
    },
  };
}

/** Greedy word wrap. Keeps empty lines, breaks words that are longer than a whole line. */
export function wrap(text: string, maxW: number, width: (s: string) => number): string[] {
  const out: string[] = [];
  for (const para of text.split('\n')) {
    const words = para.split(' ').filter(Boolean);
    if (!words.length) {
      out.push('');
      continue;
    }
    let line = '';
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (width(candidate) <= maxW) {
        line = candidate;
        continue;
      }
      if (line) out.push(line);
      line = word;
      while (width(line) > maxW && line.length > 1) {
        let cut = line.length - 1;
        while (cut > 1 && width(line.slice(0, cut)) > maxW) cut--;
        out.push(line.slice(0, cut));
        line = line.slice(cut);
      }
    }
    out.push(line);
  }
  return out;
}

// ---------- drawings ----------

function drawingMarks(drawing: Drawing, box: Box, out: Mark[]) {
  if (drawing.kind === 'icon') out.push({ kind: 'icon', icon: drawing.icon, x: box.x, y: box.y, size: box.w });
  if (drawing.kind === 'doodle')
    for (const s of fitStrokes(drawing.strokes, box.x, box.y, box.w, box.h)) out.push({ kind: 'stroke', pts: s, len: length(s) });
}

// ---------- the card ----------

function postcardPrinted(w: number, h: number) {
  const left = w / 2 + 6;
  return {
    lines: [
      [w / 2, 9, w / 2, h - 9] as [number, number, number, number],
      ...[63, 75, 87].map((y) => [left, y + 1.2, w - 9, y + 1.2] as [number, number, number, number]),
    ],
    stampBox: { x: w - 9 - 20, y: 9, w: 20, h: 24 },
    fold: false,
  };
}

function addressMarks(address: Address, writerFor: (size: number) => Writer, x: number, firstY: number, lineGap: number, maxW: number, size: number, out: Mark[]) {
  [address.name, address.street, address.city].forEach((line, i) => {
    let writer = writerFor(size);
    const w = writer.width(line);
    if (w > maxW) writer = writerFor((size * maxW) / w);
    writer.write(line, x, firstY + i * lineGap, out);
  });
}

export function layoutCard(d: CardDesign): SheetLayout {
  const p = PRODUCTS[d.product];
  const area = p.area;
  const marks: Mark[] = [];

  // A little drawing goes on top, centred.
  let top = area.y;
  if (d.drawing.kind !== 'none') {
    const size = d.product === 'postcard' ? 15 : Math.min(24, area.w * 0.28);
    drawingMarks(d.drawing, { x: area.x + (area.w - size) / 2, y: area.y, w: size, h: size }, marks);
    top += size + 5;
  }

  const blocks = [
    { text: d.opening.trim(), gap: 0 },
    { text: d.message.trim(), gap: 0.45 },
    { text: d.closing.trim(), gap: 0.6 },
  ].filter((b) => b.text);

  // Shrink the type until everything fits, but not below about two thirds of the normal size.
  let overflow = false;
  let placed: { line: string; y: number }[] = [];
  let writer = makeWriter(d.hand, d.glyphs, p.size);
  for (let size = p.size; ; size *= 0.94) {
    writer = makeWriter(d.hand, d.glyphs, size);
    placed = [];
    let y = top + writer.size * 0.95;
    blocks.forEach((b, i) => {
      if (i > 0) y += b.gap * writer.lineH;
      for (const line of wrap(b.text, area.w, writer.width)) {
        placed.push({ line, y });
        y += writer.lineH;
      }
    });
    const bottom = placed.length ? placed[placed.length - 1].y + writer.size * 0.35 : top;
    overflow = bottom > area.y + area.h;
    if (!overflow || size < p.size * 0.68) break;
  }
  // On a greeting card, a short text sits a little lower instead of hugging the top edge.
  const bottom = placed.length ? placed[placed.length - 1].y + writer.size * 0.35 : top;
  const lift = d.product === 'greeting' && !overflow ? Math.max(0, area.y + area.h - bottom) * 0.3 : 0;
  if (lift)
    for (const m of marks) {
      if (m.kind === 'icon') m.y += lift;
      if (m.kind === 'stroke') m.pts = m.pts.map(([x, y]) => [x, y + lift] as Pt);
    }
  for (const { line, y } of placed) writer.write(line, area.x, y + lift, marks);

  let printed: SheetLayout['printed'] = { lines: [], stampBox: null, fold: d.product === 'greeting' };
  if (d.product === 'postcard') {
    printed = postcardPrinted(p.w, p.h);
    if (d.address)
      addressMarks(d.address, (s) => makeWriter(d.hand, d.glyphs, s), p.w / 2 + 7, 63, 12, p.w / 2 - 17, 5, marks);
  }

  return { w: p.w, h: p.h, paper: p.paper, marks, printed, stamp: d.product === 'postcard' && !!d.address && d.stamp, overflow };
}

/** The envelope, if the product has one and the customer wants the address written on it. */
export function layoutEnvelope(d: CardDesign): SheetLayout | null {
  const env = PRODUCTS[d.product].envelope;
  if (!env || !d.address) return null;
  const { w, h } = env;
  const size = h * 0.058;
  const marks: Mark[] = [];
  addressMarks(d.address, (s) => makeWriter(d.hand, d.glyphs, s), w * 0.45, h * 0.56, size * 1.45, w * 0.5, size, marks);
  return {
    w,
    h,
    paper: '#f7f2e6',
    marks,
    printed: { lines: [], stampBox: { x: w - 10 - 22, y: 10, w: 22, h: 26 }, fold: false },
    stamp: d.stamp,
    overflow: false,
  };
}

// ---------- timing ----------

/** How much pen work a mark is, roughly in millimetres of pen travel. */
function weight(m: Mark) {
  if (m.kind === 'text') return m.w * 1.15 + 2;
  if (m.kind === 'stroke') return m.len * 0.6 + 1;
  return m.size * 2 + 2;
}

/** Start and end of each mark on a 0–1 timeline. */
export function timeline(marks: Mark[]): [number, number][] {
  const weights = marks.map(weight);
  const total = weights.reduce((a, b) => a + b, 0) || 1;
  let acc = 0;
  return weights.map((w) => {
    const span: [number, number] = [acc / total, (acc + w) / total];
    acc += w;
    return span;
  });
}

/** Rough real writing time of the machine, including feeding the paper in and out. */
export function writingSeconds(sheets: (SheetLayout | null)[], copies: number) {
  const work = sheets.reduce((sum, s) => sum + (s ? s.marks.reduce((a, m) => a + weight(m), 0) : 0), 0);
  return copies * (12 + work * 0.1);
}

export function aboutMinutes(seconds: number) {
  const min = Math.max(1, Math.round(seconds / 60));
  return `about ${min} min`;
}

/** The characters someone has to draw so the whole card can be written in their own hand. */
export function neededChars(d: Pick<CardDesign, 'opening' | 'message' | 'closing' | 'address'>): string[] {
  const text = [d.opening, d.message, d.closing, d.address?.name, d.address?.street, d.address?.city].filter(Boolean).join('');
  const seen = new Set<string>();
  for (const ch of text) if (ch.trim()) seen.add(ch);
  return [...seen];
}

export const ALPHABET = [
  ...'abcdefghijklmnopqrstuvwxyzäöü',
  ...'ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜ',
  ...'0123456789',
  ...'.,!?’-:',
];
