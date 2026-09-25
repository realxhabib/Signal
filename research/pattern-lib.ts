// Round 8 · Pattern-library building blocks: purged walk-forward scores (cached on disk), ensembles, the daily
// traded target, a no-trade band and sleeve volatility targeting.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { kmeans, scoreClusters } from './kmeans';
import { buildSamples, H, weightsFromScores, type Sample } from './ml-features';
import { hold, type Panel } from './sleeve-lib';

const DAY = 86_400;
export type Scored = { t: number; s: number; score: number }[];

/** Walk-forward pattern scores: re-learned every 6 months on data that finished a day (plus 24h) before. */
export function walkForwardScores(p: Panel, L: number, K: number, seed = 1, tag = ''): Scored {
  const file = join(import.meta.dirname, '.cache', `wf-${tag || p.syms.length}-${L}-${K}-${seed}.json`);
  if (existsSync(file)) return JSON.parse(readFileSync(file, 'utf8'));
  const { samples } = buildSamples(p, L, L >= 24 ? L / 12 : 1);
  const scored: Scored = [];
  for (let ws = Date.UTC(2020, 0, 1) / 1000; ws < p.times[p.times.length - 1]; ws += 182 * DAY) {
    const we = ws + 182 * DAY;
    const purge = ws - H * 14_400 - DAY;
    const train = samples.filter((x) => p.times[x.t] < purge);
    const test = samples.filter((x) => p.times[x.t] >= ws && p.times[x.t] < we);
    if (train.length < 5000 || !test.length) continue;
    const d = train[0].x.length;
    const mu = Array.from({ length: d }, (_, j) => train.reduce((a, x) => a + x.x[j], 0) / train.length);
    const sd = Array.from({ length: d }, (_, j) => Math.sqrt(train.reduce((a, x) => a + (x.x[j] - mu[j]) ** 2, 0) / train.length) || 1);
    const z = (x: Sample) => x.x.map((v, j) => (v - mu[j]) / sd[j]);
    const sub = train.filter((_, i) => i % Math.max(1, Math.floor(train.length / 40_000)) === 0);
    const km = kmeans(sub.map(z), K, 25, seed);
    const score = scoreClusters(train.map((x) => ({ c: km.nearest(z(x)), y: x.y })), K);
    for (const x of test) scored.push({ t: x.t, s: x.s, score: score[km.nearest(z(x))] });
  }
  writeFileSync(file, JSON.stringify(scored));
  return scored;
}

/** Average of members' cross-sectional z-scores per bar. */
export function ensemble(members: Scored[]): Scored {
  const acc = new Map<string, { t: number; s: number; sum: number; n: number }>();
  for (const m of members) {
    const byT = new Map<number, { s: number; score: number }[]>();
    for (const x of m) byT.set(x.t, [...(byT.get(x.t) ?? []), x]);
    for (const [t, xs] of byT) {
      const mean = xs.reduce((a, x) => a + x.score, 0) / xs.length;
      const sd = Math.sqrt(xs.reduce((a, x) => a + (x.score - mean) ** 2, 0) / xs.length);
      for (const x of xs) {
        const k = `${t}|${x.s}`;
        const e = acc.get(k) ?? { t, s: x.s, sum: 0, n: 0 };
        e.sum += sd > 0 ? (x.score - mean) / sd : 0;
        e.n++;
        acc.set(k, e);
      }
    }
  }
  return [...acc.values()].map((e) => ({ t: e.t, s: e.s, score: e.sum / members.length }));
}

/**
 * Weights traded once a day at the 00:00 UTC close: the average of the last `holdBars` market-neutral signals.
 * With `band`, a coin is only re-traded when its target moved by more than `band` (fraction of sleeve capital).
 */
export function dailyWeights(p: Panel, scored: Scored, holdBars = 18, band = 0): Float64Array[] {
  const target = weightsFromScores(p, scored).map((x) => hold(x, holdBars));
  const out = p.syms.map(() => new Float64Array(p.times.length));
  const cur = new Float64Array(p.syms.length);
  for (let t = 0; t < p.times.length; t++) {
    if (Math.floor(p.times[t] / 14_400) % 6 === 5)
      for (let k = 0; k < p.syms.length; k++) if (Math.abs(target[k][t] - cur[k]) > band || target[k][t] === 0) cur[k] = target[k][t];
    for (let k = 0; k < p.syms.length; k++) out[k][t] = cur[k];
  }
  return out;
}

/**
 * Scale weights so the sleeve's trailing 60-day volatility aims at `annVol` (clipped 0.5×–2×), using only the
 * sleeve's own returns before each day.
 */
export function volTarget(p: Panel, w: Float64Array[], annVol: number): Float64Array[] {
  const n = p.times.length;
  const dayRet = new Map<number, number>();
  for (let t = 0; t < n - 1; t++) {
    let r = 0;
    for (let k = 0; k < p.syms.length; k++) {
      const c0 = p.close[k][t];
      const c1 = p.close[k][t + 1];
      if (w[k][t] && Number.isFinite(c0) && Number.isFinite(c1)) r += w[k][t] * (c1 / c0 - 1);
    }
    const d = Math.floor(p.times[t + 1] / DAY) * DAY;
    dayRet.set(d, (1 + (dayRet.get(d) ?? 0)) * (1 + r) - 1);
  }
  const days = [...dayRet.keys()].sort((a, b) => a - b);
  const scale = new Map<number, number>();
  for (let i = 0; i < days.length; i++) {
    const past = days.slice(Math.max(0, i - 60), i).map((d) => dayRet.get(d)!);
    if (past.length < 30) { scale.set(days[i], 1); continue; }
    const m = past.reduce((a, v) => a + v, 0) / past.length;
    const sd = Math.sqrt(past.reduce((a, v) => a + (v - m) ** 2, 0) / past.length) * Math.sqrt(365);
    scale.set(days[i], sd > 0 ? Math.min(2, Math.max(0.5, annVol / sd)) : 1);
  }
  return w.map((x) => Float64Array.from(x, (v, t) => v * (scale.get(Math.floor(p.times[t] / DAY) * DAY) ?? 1)));
}
