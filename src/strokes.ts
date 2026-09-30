// Stroke geometry and grading for the handwriting pad. Coordinates use KanjiVG's 109×109 box.
export type Pt = [number, number];
export const BOX = 109;

const dist = (a: Pt, b: Pt) => Math.hypot(a[0] - b[0], a[1] - b[1]);
export const length = (p: Pt[]) => p.reduce((s, q, i) => (i ? s + dist(p[i - 1], q) : 0), 0);

/** Flattens an SVG path (the M/L/H/V/C/S/Q/T/Z subset KanjiVG uses) into points */
export function sample(d: string, steps = 12): Pt[] {
  const tok = d.match(/[a-zA-Z]|-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/g) ?? [];
  const out: Pt[] = [];
  let i = 0, cmd = '', cur: Pt = [0, 0], start: Pt = [0, 0], ctrl: Pt | null = null;
  const num = () => parseFloat(tok[i++]);
  const bez = (p: Pt[]) => {
    for (let s = 1; s <= steps; s++) {
      const t = s / steps, u = 1 - t;
      const w = p.length === 4 ? [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t] : [u * u, 2 * u * t, t * t];
      out.push([w.reduce((a, k, j) => a + k * p[j][0], 0), w.reduce((a, k, j) => a + k * p[j][1], 0)]);
    }
  };
  while (i < tok.length) {
    if (/[a-zA-Z]/.test(tok[i])) cmd = tok[i++];
    const rel = cmd === cmd.toLowerCase(), C = cmd.toUpperCase();
    const pt = (): Pt => { const x = num(), y = num(); return rel ? [cur[0] + x, cur[1] + y] : [x, y]; };
    const mirror = (): Pt => (ctrl ? [2 * cur[0] - ctrl[0], 2 * cur[1] - ctrl[1]] : cur);
    if (C === 'M') { cur = start = pt(); out.push(cur); ctrl = null; cmd = rel ? 'l' : 'L'; }
    else if (C === 'L') { cur = pt(); out.push(cur); ctrl = null; }
    else if (C === 'H') { const x = num(); cur = [rel ? cur[0] + x : x, cur[1]]; out.push(cur); ctrl = null; }
    else if (C === 'V') { const y = num(); cur = [cur[0], rel ? cur[1] + y : y]; out.push(cur); ctrl = null; }
    else if (C === 'C') { const a = pt(), b = pt(), e = pt(); bez([cur, a, b, e]); ctrl = b; cur = e; }
    else if (C === 'S') { const a = mirror(), b = pt(), e = pt(); bez([cur, a, b, e]); ctrl = b; cur = e; }
    else if (C === 'Q') { const a = pt(), e = pt(); bez([cur, a, e]); ctrl = a; cur = e; }
    else if (C === 'T') { const a = mirror(), e = pt(); bez([cur, a, e]); ctrl = a; cur = e; }
    else if (C === 'Z') { cur = start; out.push(cur); ctrl = null; }
    else i++;
  }
  return out;
}

/** `n` points spaced evenly along the polyline */
export function resample(p: Pt[], n: number): Pt[] {
  const total = length(p);
  if (p.length < 2 || total === 0) return Array.from({ length: n }, () => p[0] ?? [0, 0]);
  const out: Pt[] = [];
  let seg = 1, acc = 0; // `acc` is the arc length up to p[seg - 1]
  for (let k = 0; k < n; k++) {
    const at = (total * k) / (n - 1);
    while (seg < p.length - 1 && acc + dist(p[seg - 1], p[seg]) < at) { acc += dist(p[seg - 1], p[seg]); seg++; }
    const a = p[seg - 1], b = p[seg], l = dist(a, b), t = l ? Math.min(1, (at - acc) / l) : 0;
    out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
  }
  return out;
}

const N = 24;
export type Score = { avg: number; start: number; end: number; dir: number; ratio: number };

export function score(user: Pt[], ref: Pt[]): Score {
  const u = resample(user, N), r = resample(ref, N);
  let avg = 0, dir = 0;
  for (let i = 0; i < N; i++) avg += dist(u[i], r[i]) / N;
  for (let i = 1; i < N; i++) {
    const ux = u[i][0] - u[i - 1][0], uy = u[i][1] - u[i - 1][1], rx = r[i][0] - r[i - 1][0], ry = r[i][1] - r[i - 1][1];
    const m = Math.hypot(ux, uy) * Math.hypot(rx, ry);
    dir += (m ? (ux * rx + uy * ry) / m : 0) / (N - 1);
  }
  return { avg, start: dist(u[0], r[0]), end: dist(u[N - 1], r[N - 1]), dir, ratio: length(user) / Math.max(1, length(ref)) };
}

/** Whether a drawn stroke is close enough to the reference. `lenient` > 1 loosens every threshold. */
export function fits(s: Score, refLen: number, lenient = 1) {
  const minLen = 0.45 - 3 / Math.max(refLen, 1), maxLen = 1.9 + 12 / Math.max(refLen, 1);
  return s.avg <= 13 * lenient && s.start <= 19 * lenient && s.end <= 19 * lenient && s.dir >= 0.6 - (lenient - 1) * 0.5 && s.ratio >= minLen / lenient && s.ratio <= maxLen * lenient;
}

export type Verdict = 'ok' | 'order' | 'miss' | 'tap';

/**
 * Grades one drawn stroke against stroke `i`, the way Duolingo does: the stroke must match in position,
 * shape and direction, and it is rejected as out of order if it is really one of the strokes still to come.
 */
export function judge(user: Pt[], refs: Pt[][], i: number, lenient = 1): Verdict {
  if (length(user) < 2.5) return 'tap';
  const s = score(user, refs[i]);
  const later = refs.slice(i + 1).map(r => ({ r, s: score(user, r) })).filter(x => fits(x.s, length(x.r), lenient));
  if (fits(s, length(refs[i]), lenient)) return later.some(x => x.s.avg < s.avg * 0.55) ? 'order' : 'ok';
  return later.length ? 'order' : 'miss';
}
