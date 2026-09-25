// Shared round-7 dataset: per coin and 4h bar, a normalised "shape" of the recent path plus context, and the
// target = the coin's next-24h return relative to the other coins, in units of its own volatility.
import { featureNames, featuresAt, rollVol } from '../src/patternFeatures';
import type { Panel } from './sleeve-lib';

export interface Sample { t: number; s: number; x: number[]; y: number }
export const H = 6; // 6 × 4h = 24h forward

export { rollVol };

/** Shape features (shared with the app: src/patternFeatures.ts) and the relative 24h-forward target. */
export function buildSamples(p: Panel, L = 24, step = 2, every = 1): { samples: Sample[]; names: string[] } {
  const n = p.times.length;
  const vols = p.close.map((c) => rollVol(c));
  const names = featureNames(L, step);
  const samples: Sample[] = [];
  for (let t = Math.max(L, 120); t < n - H; t += every) {
    const rows: Sample[] = [];
    for (let s = 0; s < p.syms.length; s++) {
      const c = p.close[s];
      if (!Number.isFinite(c[t + H])) continue;
      const x = featuresAt(p, vols, s, t, L, step);
      if (!x) continue;
      const v = vols[s][t];
      rows.push({ t, s, x, y: Math.log(c[t + H] / c[t]) / (v * Math.sqrt(H)) });
    }
    if (rows.length < 5) continue;
    // Relative target: subtract the cross-sectional mean (what's left is what the coin did vs the rest).
    const m = rows.reduce((a, r) => a + r.y, 0) / rows.length;
    for (const r of rows) samples.push({ ...r, y: Math.max(-4, Math.min(4, r.y - m)) });
  }
  return { samples, names };
}

/** Cross-sectional, market-neutral weights (gross 1) from per-sample scores at each bar, held `hold` bars. */
export function weightsFromScores(p: Panel, scored: { t: number; s: number; score: number }[]) {
  const n = p.times.length;
  const w = p.syms.map(() => new Float64Array(n));
  const byT = new Map<number, { s: number; score: number }[]>();
  for (const x of scored) byT.set(x.t, [...(byT.get(x.t) ?? []), x]);
  for (const [t, xs] of byT) {
    const m = xs.reduce((a, x) => a + x.score, 0) / xs.length;
    const g = xs.reduce((a, x) => a + Math.abs(x.score - m), 0);
    if (!g) continue;
    for (const x of xs) w[x.s][t] = (x.score - m) / g;
  }
  return w;
}
