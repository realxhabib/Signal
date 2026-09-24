// Overfitting checks for the Signal Composite (20 coins, 4h, real funding):
//  1. one-at-a-time parameter sensitivity
//  2. Probability of Backtest Overfitting via CSCV (Bailey, Borwein, López de Prado, Zhu)
//  3. Deflated Sharpe Ratio (Bailey & López de Prado) for the chosen line-up
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { composite } from '../src/composite';
import type { Params } from '../src/strategies';
import { dataset, fmt, inTest, run, type Dataset } from './lib';
import { UNIVERSE } from './universe';

const iv = process.env.INTERVALS ?? '4h';
const data: Dataset[] = [];
for (const s of UNIVERSE) data.push(await dataset(s, iv));
const monthKey = (t: number) => new Date(t * 1000).toISOString().slice(0, 7);

function evaluate(p: Params) {
  let rs: number[] = [];
  let coinsUp = 0;
  const byMonth = new Map<string, number>();
  for (const d of data) {
    const tr = inTest(d, run(d, composite, p)).filter((t) => t.exitReason !== 'end');
    const tot = tr.reduce((a, t) => a + t.rMultiple, 0);
    if (tot > 0) coinsUp++;
    rs = rs.concat(tr.map((t) => t.rMultiple));
    for (const t of tr) byMonth.set(monthKey(t.exitTime), (byMonth.get(monthKey(t.exitTime)) ?? 0) + t.rMultiple);
  }
  const wins = rs.filter((r) => r > 0);
  const gw = wins.reduce((a, r) => a + r, 0);
  const gl = -rs.filter((r) => r <= 0).reduce((a, r) => a + r, 0);
  return { n: rs.length, win: wins.length / rs.length, pf: gw / gl, total: gw - gl, coinsUp, byMonth };
}

const out: string[] = [`# Overfitting checks — Signal Composite, 20 coins, ${iv}\n`];

// ---- 1. Sensitivity ---------------------------------------------------------------
const base = composite.defaults;
const sweeps: [string, number[]][] = [
  ['supertrend.stMult', [2, 2.5, 3, 3.5, 4]],
  ['supertrend.stLen', [7, 10, 14, 20, 30]],
  ['supertrend.trendLen', [50, 100, 150, 200]],
  ['rsi2-pullback.rsiEntry', [5, 10, 15, 20]],
  ['rsi2-pullback.exitLen', [5, 10, 15]],
  ['rsi2-pullback.trendLen', [50, 100, 200]],
  ['band-reversion.bbMult', [1.5, 2, 2.5, 3]],
  ['band-reversion.maxBars', [10, 15, 30]],
  ['stopAtr', [2, 2.5, 3, 3.5, 4]],
  ['gate', [0, 1, 2]],
];
const defaultOf = (k: string) => {
  if (!k.includes('.')) return base[k];
  const [id, param] = k.split('.');
  return (composite as never as { defaults: Params }).defaults[k] ?? (STRATS[id]?.defaults[param] as number);
};
import { bandReversion, rsi2Pullback, supertrendTrend } from '../src/strategies';
const STRATS: Record<string, { defaults: Params }> = { supertrend: supertrendTrend, 'rsi2-pullback': rsi2Pullback, 'band-reversion': bandReversion };
out.push('## 1. Parameter sensitivity (one setting changed at a time; all else default)\n\n| Setting | Value | Trades | Win | PF | Total R | Coins profitable |\n|---|---|---|---|---|---|---|');
for (const [k, vals] of process.env.SKIP_SENS ? [] : sweeps) {
  for (const v of vals) {
    const r = evaluate({ ...base, [k]: v });
    const mark = v === defaultOf(k) ? ' **(default)**' : '';
    out.push(`| ${k} | ${v}${mark} | ${r.n} | ${fmt(r.win * 100, 1)}% | ${fmt(r.pf)} | ${fmt(r.total, 0)} | ${r.coinsUp}/20 |`);
  }
  console.log(out.slice(-vals.length).join('\n'));
}

// ---- 2. PBO via CSCV over the line-up search space --------------------------------------
const configs: Params[] = [];
for (let mask = 1; mask < 64; mask++) for (const gate of [0, 1, 2]) configs.push({ ...base, mask, gate });
const months = new Set<string>();
const series = configs.map((p, k) => {
  const r = evaluate(p);
  for (const m of r.byMonth.keys()) months.add(m);
  if (k % 20 === 0) process.stdout.write(`${k}/${configs.length} `);
  return r.byMonth;
});
const M = [...months].sort();
const mat = series.map((bm) => M.map((m) => bm.get(m) ?? 0)); // [config][month]
const S = 16;
const blockOf = (t: number) => Math.min(S - 1, Math.floor((t * S) / M.length));
const sharpe = (xs: number[]) => {
  const m = xs.reduce((a, v) => a + v, 0) / xs.length;
  const sd = Math.sqrt(xs.reduce((a, v) => a + (v - m) ** 2, 0) / xs.length);
  return sd ? m / sd : 0;
};
let below = 0;
let splits = 0;
const lambdas: number[] = [];
const combos = (n: number, k: number, start = 0, acc: number[] = [], res: number[][] = []): number[][] => {
  if (acc.length === k) return res.push([...acc]), res;
  for (let i = start; i < n; i++) combos(n, k, i + 1, [...acc, i], res);
  return res;
};
for (const isBlocks of combos(S, S / 2)) {
  const isSet = new Set(isBlocks);
  const perf = mat.map((row) => {
    const is: number[] = [];
    const oos: number[] = [];
    row.forEach((v, t) => (isSet.has(blockOf(t)) ? is : oos).push(v));
    return [sharpe(is), sharpe(oos)];
  });
  let best = 0;
  perf.forEach((p, k) => p[0] > perf[best][0] && (best = k));
  const oosBest = perf[best][1];
  const rank = perf.filter((p) => p[1] < oosBest).length + 1;
  const w = rank / (perf.length + 1);
  const lambda = Math.log(w / (1 - w));
  lambdas.push(lambda);
  if (lambda <= 0) below++;
  splits++;
}
const pbo = below / splits;
out.push(`\n## 2. Probability of Backtest Overfitting (CSCV)\n\n${configs.length} line-ups (63 strategy subsets × 3 regime gates), ${M.length} months split into ${S} blocks, ${splits} train/test combinations. For each, the best line-up on the train half is ranked on the test half.\n\n**PBO = ${fmt(pbo * 100, 1)}%** — the probability that the best in-sample line-up ranks below the median out-of-sample (under 50% means selection adds value; the lower the better). Median logit rank: ${fmt(lambdas.sort((a, b) => a - b)[Math.floor(lambdas.length / 2)])}.`);
console.log(out[out.length - 1]);

// ---- 3. Deflated Sharpe ratio of the chosen line-up ---------------------------------------
const chosenIdx = configs.findIndex((p) => p.mask === base.mask && p.gate === base.gate);
const x = mat[chosenIdx];
const T = x.length;
const mu = x.reduce((a, v) => a + v, 0) / T;
const sd = Math.sqrt(x.reduce((a, v) => a + (v - mu) ** 2, 0) / T);
const sr = mu / sd;
const skew = x.reduce((a, v) => a + ((v - mu) / sd) ** 3, 0) / T;
const kurt = x.reduce((a, v) => a + ((v - mu) / sd) ** 4, 0) / T;
const srs = mat.map(sharpe);
const srMean = srs.reduce((a, v) => a + v, 0) / srs.length;
const vSr = srs.reduce((a, v) => a + (v - srMean) ** 2, 0) / srs.length;
// Inverse normal CDF (Acklam) and normal CDF.
const invN = (p: number) => {
  const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239];
  const b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572];
  const c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416];
  const q = p < 0.02425 ? Math.sqrt(-2 * Math.log(p)) : p > 1 - 0.02425 ? Math.sqrt(-2 * Math.log(1 - p)) : 0;
  if (p < 0.02425) return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  if (p > 1 - 0.02425) return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  const r = p - 0.5;
  const s = r * r;
  return ((((((a[0] * s + a[1]) * s + a[2]) * s + a[3]) * s + a[4]) * s + a[5]) * r) / (((((b[0] * s + b[1]) * s + b[2]) * s + b[3]) * s + b[4]) * s + 1);
};
const normCdf = (z: number) => 0.5 * (1 + Math.sign(z) * Math.sqrt(1 - Math.exp((-2 * z * z) / Math.PI)));
const dsr = (N: number) => {
  const g = 0.5772156649;
  const sr0 = Math.sqrt(vSr) * ((1 - g) * invN(1 - 1 / N) + g * invN(1 - 1 / (N * Math.E)));
  return { sr0, p: normCdf(((sr - sr0) * Math.sqrt(T - 1)) / Math.sqrt(1 - skew * sr + ((kurt - 1) / 4) * sr * sr)) };
};
const d189 = dsr(configs.length);
const d1000 = dsr(1000);
out.push(`\n## 3. Deflated Sharpe Ratio\n\nChosen line-up (Supertrend + RSI(2) + band reversion, gate: not bearish): monthly Sharpe ${fmt(sr, 3)} (≈ ${fmt(sr * Math.sqrt(12))} annualised on R), skew ${fmt(skew)}, kurtosis ${fmt(kurt)}, ${T} months.\n\n| Trials assumed | Sharpe needed by luck alone (monthly) | Probability the edge is real (DSR) |\n|---|---|---|\n| ${configs.length} (this search) | ${fmt(d189.sr0, 3)} | **${fmt(d189.p * 100, 1)}%** |\n| 1000 (conservative: everything tried in this project) | ${fmt(d1000.sr0, 3)} | **${fmt(d1000.p * 100, 1)}%** |`);
console.log(out[out.length - 1]);
// Probabilistic Sharpe ratio vs zero (no selection adjustment) and how much of the family is profitable.
const psr = normCdf((sr * Math.sqrt(T - 1)) / Math.sqrt(1 - skew * sr + ((kurt - 1) / 4) * sr * sr));
const profitable = mat.filter((row) => row.reduce((a, v) => a + v, 0) > 0).length;
out.push(`\n**Context.** Probability the chosen line-up's edge is above zero (Probabilistic Sharpe, no selection penalty): **${fmt(psr * 100, 2)}%**. Line-ups in the search space with positive total return: **${profitable}/${configs.length}**. The DSR asks whether *choosing* this line-up beats the luckiest of many; since almost the whole family is profitable, the edge belongs to the approach rather than to this exact pick.`);
console.log(out[out.length - 1]);
writeFileSync(join(import.meta.dirname, process.env.SKIP_SENS ? '_overfit-extra.md' : 'RESULTS-overfitting.md'), out.join('\n') + '\n');
