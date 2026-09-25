// Round 7 · Do the new sleeves add anything beyond what we already run? Each candidate's daily returns are
// regressed on the shipped account and the shipped weekly momentum sleeve (14-day, 4 per side); the intercept is
// the candidate's own edge. Then the mix: shipped (80% account + 20% momentum) vs giving the candidate a share.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { evaluate } from './round6-lib';
import { loadSeries } from './sleeve-lib';
import { momentum } from './sleeves';

const DAY = 86_400;
const acct = await evaluate({ name: 'Baseline' }, 'research', false);
const A = new Map(acct.days.map((d, i) => [d, acct.daily[i]]));
const M = new Map((await momentum(14)).map((x) => [Math.floor(x.time / DAY) * DAY, x.ret]));

function ols(X: number[][], y: number[]) {
  const k = X[0].length;
  const XtX = Array.from({ length: k }, (_, i) => Array.from({ length: k }, (_, j) => X.reduce((s, x) => s + x[i] * x[j], 0)));
  const Xty = Array.from({ length: k }, (_, i) => X.reduce((s, x, t) => s + x[i] * y[t], 0));
  // Invert (k ≤ 4) by Gauss-Jordan.
  const inv = XtX.map((r, i) => [...r, ...Array.from({ length: k }, (_, j) => (i === j ? 1 : 0))]);
  for (let i = 0; i < k; i++) {
    const p = inv[i][i];
    for (let j = 0; j < 2 * k; j++) inv[i][j] /= p;
    for (let r = 0; r < k; r++) if (r !== i) {
      const f = inv[r][i];
      for (let j = 0; j < 2 * k; j++) inv[r][j] -= f * inv[i][j];
    }
  }
  const Ainv = inv.map((r) => r.slice(k));
  const b = Ainv.map((r) => r.reduce((s, v, j) => s + v * Xty[j], 0));
  const res = y.map((v, t) => v - X[t].reduce((s, x, j) => s + x * b[j], 0));
  const s2 = res.reduce((s, e) => s + e * e, 0) / (y.length - k);
  return { b, se: Ainv.map((r, i) => Math.sqrt(s2 * r[i])) };
}
const sharpe = (xs: number[]) => {
  const m = xs.reduce((a, v) => a + v, 0) / xs.length;
  const s = Math.sqrt(xs.reduce((a, v) => a + (v - m) ** 2, 0) / xs.length);
  return (m / s) * Math.sqrt(365);
};
const corr = (a: number[], b: number[]) => {
  const ma = a.reduce((x, v) => x + v, 0) / a.length;
  const mb = b.reduce((x, v) => x + v, 0) / b.length;
  return a.reduce((x, v, i) => x + (v - ma) * (b[i] - mb), 0) / Math.sqrt(a.reduce((x, v) => x + (v - ma) ** 2, 0) * b.reduce((x, v) => x + (v - mb) ** 2, 0));
};

const candidates = [
  'Residual momentum: 84-bar residual, hold 42 bars, fee 0.02%',
  'Residual momentum: 42-bar residual, hold 42 bars, fee 0.05%',
  'Pattern library: 24-bar shapes, 32 patterns, hold 18 bars, fee 0.02%',
  'Pattern library: 24-bar shapes, 64 patterns, hold 18 bars, fee 0.02%',
  'GP formulas (seed 7), hold 18 bars, fee 0.02%',
  'GP formulas (seed 11), hold 18 bars, fee 0.02%',
  'GP formulas (seed 23), hold 18 bars, fee 0.02%',
];
const lines = [
  '# Round 7 · What do the new sleeves add?\n',
  'Own edge = intercept of the candidate\'s daily returns regressed on the shipped account and the shipped weekly momentum sleeve (annualised, t-stat). Mix Sharpe: shipped 80% account + 20% momentum, versus moving 10% of capital into the candidate (from the account) or splitting the 20% sleeve share equally. Research years; each row over the candidate\'s own dates.\n',
  '| Candidate | Corr. with momentum sleeve | Own edge (t) | Shipped mix | + 10% candidate | 10% momentum + 10% candidate |',
  '|---|---|---|---|---|---|',
];
const all: Map<number, number>[] = [];
for (const name of candidates) {
  let s;
  try {
    s = loadSeries(name);
  } catch {
    continue;
  }
  const C = new Map(s.days.map((d, i) => [d, s.daily[i]]));
  all.push(C);
  const days = s.days.filter((d) => A.has(d) && M.has(d));
  const y = days.map((d) => C.get(d)!);
  const a = days.map((d) => A.get(d)!);
  const m = days.map((d) => M.get(d)!);
  const { b, se } = ols(days.map((_, i) => [1, a[i], m[i]]), y);
  const mix = (wa: number, wm: number, wc: number) => sharpe(days.map((_, i) => wa * a[i] + wm * m[i] + wc * y[i]));
  lines.push(`| ${name} | ${corr(y, m).toFixed(2)} | ${((b[0] * 365) * 100).toFixed(1)}%/yr (t ${(b[0] / se[0]).toFixed(1)}) | ${mix(0.8, 0.2, 0).toFixed(2)} | ${mix(0.7, 0.2, 0.1).toFixed(2)} | ${mix(0.8, 0.1, 0.1).toFixed(2)} |`);
  console.log(lines[lines.length - 1]);
}
writeFileSync(join(import.meta.dirname, 'RESULTS-round7-incremental.md'), lines.join('\n') + '\n');
