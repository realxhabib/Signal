// Round 6 · Market modes from a Hidden Markov Model instead of Bitcoin's EMA trend rule.
// Features on Bitcoin 4h: 1-week log return and 1-week realised volatility (log), standardised on the training
// data. Walk-forward: first fit on everything before 2019, refit every 6 months on all earlier data, and read
// the state with the causal forward filter only. Picks are made on the research years.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { computeFeatures } from '../src/features';
import { history } from './history';
import { fitHmm, filterHmm } from './hmm';
import { evaluate, header, row, type Result } from './round6-lib';

const DAY = 86_400;
const c = await history('BTCUSDT', '4h');
const n = c.length;
const W = Number(process.env.HMM_W ?? 42); // 42 = one week of 4h bars, 180 = one month
const lr = c.map((b, i) => (i ? Math.log(b.close / c[i - 1].close) : 0));
const X: number[][] = c.map((b, i) => {
  if (i < W) return [0, 0];
  let s = 0;
  let s2 = 0;
  for (let k = i - W + 1; k <= i; k++) {
    s += lr[k];
    s2 += lr[k] ** 2;
  }
  const vol = Math.sqrt(Math.max(1e-12, s2 / W - (s / W) ** 2));
  return [Math.log(b.close / c[i - W].close), Math.log(vol)];
});
const ema = computeFeatures(c).regime;

/** Walk-forward filtered probabilities, states ordered bear → bull by their mean weekly return. */
function walkForward(k: number): (number[] | null)[] {
  const probs: (number[] | null)[] = Array(n).fill(null);
  const first = Date.UTC(2019, 0, 1) / 1000;
  for (let ws = first; ws < c[n - 1].time; ws += 182 * DAY) {
    const trainEnd = c.findIndex((b) => b.time >= ws);
    if (trainEnd < 0) break;
    const we = c.findIndex((b) => b.time >= ws + 182 * DAY);
    const winEnd = we < 0 ? n : we;
    const train = X.slice(W, trainEnd);
    const mean = [0, 1].map((j) => train.reduce((a, x) => a + x[j], 0) / train.length);
    const sd = [0, 1].map((j) => Math.sqrt(train.reduce((a, x) => a + (x[j] - mean[j]) ** 2, 0) / train.length));
    const z = (x: number[]) => x.map((v, j) => (v - mean[j]) / sd[j]);
    const m = fitHmm(train.map(z), k);
    const order = m.mu.map((mu, s) => [mu[0], s]).sort((a, b) => a[0] - b[0]).map((p) => p[1]);
    const f = filterHmm(m, X.slice(W, winEnd).map(z));
    for (let t = trainEnd; t < winEnd; t++) probs[t] = order.map((s) => f[t - W][s]);
  }
  return probs;
}

const toRegime = (probs: (number[] | null)[], rule: (p: number[], i: number) => number) =>
  Int8Array.from(probs.map((p, i) => (p ? rule(p, i) : ema[i])));

const p3 = walkForward(3);
const p2 = walkForward(2);
const argmax3 = (p: number[]) => [-1, 0, 1][p.indexOf(Math.max(...p))];
const variants: [string, Int8Array][] = [
  ['HMM 3 states (most likely state)', toRegime(p3, argmax3)],
  ['HMM 3 states, 60% confidence', toRegime(p3, (p) => (p[2] > 0.6 ? 1 : p[0] > 0.6 ? -1 : 0))],
  ['HMM 3 states AND EMA agree', toRegime(p3, (p, i) => (argmax3(p) === ema[i] ? ema[i] : 0))],
  ['HMM 2 states, 70% confidence', toRegime(p2, (p) => (p[1] > 0.7 ? 1 : p[0] > 0.7 ? -1 : 0))],
];

const base = await evaluate({ name: 'Baseline: EMA market mode' });
const lines = ['# Round 6 · Market modes from a Hidden Markov Model\n', 'Research years only (locked year untouched). 80% 4h + 20% 1h account, 1% base risk.\n', header, row(base)];
const results: Result[] = [];
for (const [name, reg] of variants) {
  const agree = reg.reduce((a, v, i) => a + (v === ema[i] ? 1 : 0), 0) / n;
  const r = await evaluate({ name: `${name}${W === 42 ? '' : `, ${W}-bar features`} (${(agree * 100).toFixed(0)}% same as EMA)`, o4: { regime: reg }, o1: { regime: reg } });
  results.push(r);
  lines.push(row(r, base));
  console.log(lines[lines.length - 1]);
}
const flips = (r: Int8Array) => r.reduce((a, v, i) => a + (i && v !== r[i - 1] ? 1 : 0), 0);
lines.push(`\nMode changes over the whole history: EMA ${flips(ema)}, ${variants.map(([nm, r]) => `${nm.split(' (')[0]} ${flips(r)}`).join(', ')}.`);
writeFileSync(join(import.meta.dirname, W === 42 ? 'RESULTS-round6-hmm.md' : `RESULTS-round6-hmm-${W}.md`), lines.join('\n') + '\n');
