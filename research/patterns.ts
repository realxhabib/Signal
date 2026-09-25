// Round 7 · Pattern library: the system discovers its own chart shapes. Every coin's recent path (plus Bitcoin's,
// volume and range) is clustered with k-means; each cluster ("pattern") is scored by what followed it on past
// data only, shrunk toward zero when evidence is thin, and re-learned every 6 months (purged walk-forward).
// Trades: long the coins showing the best-scoring patterns and short the worst, market neutral, held 24h.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { kmeans, scoreClusters } from './kmeans';
import { buildSamples, H, weightsFromScores, type Sample } from './ml-features';
import { HOLDOUT_START } from './account';
import { evaluate } from './round6-lib';
import { HEADER, hold, panel, report, simulate } from './sleeve-lib';

const DAY = 86_400;
const FEE = Number(process.env.FEE ?? 0.0005);
const HOLD = Number(process.env.HOLD ?? H);

const p = await panel('4h');
const lines = ['# Round 7 · Pattern library (k-means on chart shapes, purged walk-forward)\n', 'Market-neutral sleeve, research years, market-order fees. Each pattern\'s score = average relative 24h move after it on past data, shrunk by n/(n+200); only patterns with |t| > 2 in training are traded.\n', HEADER];
const cache = new Map<string, ReturnType<typeof buildSamples>>();
const GRID = (process.env.GRID ?? '24x64,24x32,24x128,12x64,48x64').split(',').map((g) => g.split('x').map(Number) as [number, number]);
for (const [L, K] of GRID) {
  const key = `${L}`;
  if (!cache.has(key)) cache.set(key, buildSamples(p, L, L >= 24 ? L / 12 : 1));
  const { samples } = cache.get(key)!;
  const scored: { t: number; s: number; score: number }[] = [];
  const firstWs = Date.UTC(2020, 0, 1) / 1000;
  for (let ws = firstWs; ws < p.times[p.times.length - 1]; ws += 182 * DAY) {
    const we = ws + 182 * DAY;
    const purge = ws - H * 14_400 - DAY;
    const train = samples.filter((x) => p.times[x.t] < purge);
    const test = samples.filter((x) => p.times[x.t] >= ws && p.times[x.t] < we);
    if (train.length < 5000 || !test.length) continue;
    // Standardise on training data; subsample for speed.
    const d = train[0].x.length;
    const mu = Array.from({ length: d }, (_, j) => train.reduce((a, x) => a + x.x[j], 0) / train.length);
    const sd = Array.from({ length: d }, (_, j) => Math.sqrt(train.reduce((a, x) => a + (x.x[j] - mu[j]) ** 2, 0) / train.length) || 1);
    const z = (x: Sample) => x.x.map((v, j) => (v - mu[j]) / sd[j]);
    const sub = train.filter((_, i) => i % Math.max(1, Math.floor(train.length / 40_000)) === 0);
    const km = kmeans(sub.map(z), K);
    const score = scoreClusters(train.map((x) => ({ c: km.nearest(z(x)), y: x.y })), K);
    for (const x of test) scored.push({ t: x.t, s: x.s, score: score[km.nearest(z(x))] });
  }
  // MODE=topk: every HOLD bars, long the top K coins by pattern score and short the bottom K (equal weights), held
  // until the next rebalance — the version a person can follow by hand.
  const K4 = Number(process.env.K ?? 4);
  const w =
    process.env.MODE === 'daily'
      ? (() => {
          // The staggered target (average of the last HOLD bars' signals), but traded only once a day at 00:00 UTC.
          const target = weightsFromScores(p, scored).map((x) => hold(x, HOLD));
          const out = p.syms.map(() => new Float64Array(p.times.length));
          let cur = new Float64Array(p.syms.length);
          for (let t = 0; t < p.times.length; t++) {
            if (Math.floor(p.times[t] / 14_400) % 6 === 5) cur = Float64Array.from(target, (w) => w[t]); // the bar closing at 00:00 UTC
            for (let k = 0; k < p.syms.length; k++) out[k][t] = cur[k];
          }
          return out;
        })()
      : process.env.MODE === 'basket'
      ? (() => {
          // Every coin at its pattern-score weight (market neutral, gross 1), reset every HOLD bars and held fixed.
          const raw = weightsFromScores(p, scored);
          const out = p.syms.map(() => new Float64Array(p.times.length));
          let cur = new Float64Array(p.syms.length);
          for (let t = 0; t < p.times.length; t++) {
            if (Math.floor(p.times[t] / 14_400) % HOLD === 0 && raw.some((w) => w[t] !== 0)) cur = Float64Array.from(raw, (w) => w[t]);
            for (let k = 0; k < p.syms.length; k++) out[k][t] = cur[k];
          }
          return out;
        })()
      : process.env.MODE === 'topk'
      ? (() => {
          const out = p.syms.map(() => new Float64Array(p.times.length));
          const byT = new Map<number, { s: number; score: number }[]>();
          for (const x of scored) byT.set(x.t, [...(byT.get(x.t) ?? []), x]);
          let cur = new Float64Array(p.syms.length);
          for (let t = 0; t < p.times.length; t++) {
            const xs = byT.get(t);
            if (xs && Math.floor(p.times[t] / 14_400) % HOLD === 0) {
              // Only coins whose current pattern has a real track record (score ≠ 0); ties at 0 are not picks.
              cur = new Float64Array(p.syms.length);
              const longs = xs.filter((x) => x.score > 0).sort((a, b) => b.score - a.score).slice(0, K4);
              const shorts = xs.filter((x) => x.score < 0).sort((a, b) => a.score - b.score).slice(0, K4);
              for (const x of longs) cur[x.s] = 0.5 / K4;
              for (const x of shorts) cur[x.s] = -0.5 / K4;
            }
            for (let k = 0; k < p.syms.length; k++) out[k][t] = cur[k];
          }
          return out;
        })()
      : weightsFromScores(p, scored).map((x) => hold(x, HOLD));
  const r = simulate(p, w, FEE, `Pattern library: ${L}-bar shapes, ${K} patterns${process.env.MODE === 'daily' ? `, ${HOLD}-bar target traded daily` : process.env.MODE === 'basket' ? `, basket rebalanced every ${HOLD} bars` : process.env.MODE === 'topk' ? `, top/bottom ${K4} every ${HOLD} bars` : HOLD !== H ? `, hold ${HOLD} bars` : ''}${FEE !== 0.0005 ? `, fee ${FEE * 100}%` : ''}`, Date.UTC(2020, 0, 1) / 1000);
  lines.push(await report(r));
  console.log(lines[lines.length - 1]);
  if (process.env.LOCKED) {
    // One-time locked-year check (finalist only): the sleeve alone, and 10% of capital moved into it.
    const lk = simulate(p, w, FEE, `${r.name} · LOCKED YEAR`, HOLDOUT_START, Infinity);
    const acct = await evaluate({ name: 'Baseline' }, 'holdout', false);
    const S = new Map(lk.days.map((d, i) => [d, lk.daily[i]]));
    const days = acct.days.filter((d) => S.has(d));
    const sh = (xs: number[]) => {
      const m = xs.reduce((a, v) => a + v, 0) / xs.length;
      const sd = Math.sqrt(xs.reduce((a, v) => a + (v - m) ** 2, 0) / xs.length);
      return (m / sd) * Math.sqrt(365);
    };
    const A = new Map(acct.days.map((d, i) => [d, acct.daily[i]]));
    const tot = (xs: number[]) => xs.reduce((e, v) => e * (1 + v), 1) - 1;
    const line = `Locked year (${days.length} days): sleeve ${(tot(lk.daily) * 100).toFixed(1)}%, Sharpe ${lk.sharpe.toFixed(2)}, max DD ${(lk.maxDd * 100).toFixed(0)}% · account alone Sharpe ${sh(days.map((d) => A.get(d)!)).toFixed(2)} → with 10% sleeve ${sh(days.map((d) => 0.9 * A.get(d)! + 0.1 * S.get(d)!)).toFixed(2)}`;
    lines.push('', line);
    console.log(line);
  }
}
writeFileSync(join(import.meta.dirname, process.env.OUT ?? 'RESULTS-round7-patterns.md'), lines.join('\n') + '\n');
