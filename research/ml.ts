// Meta-labelling: a regularised logistic regression predicts whether each
// composite long will win, from the ~80 quant/regime/calendar conditions plus
// which strategies voted. Walk-forward: train on all trades before each
// 6-month window (pooled across 20 coins), score the window's trades blind.
import { COMPONENTS, votes } from '../src/composite';
import { computeFeatures } from '../src/features';
import { DAY, fmt } from './lib';
import { collectTrades, curveStats, simulate, type PTrade } from './portfolio';

const iv = process.env.INTERVALS ?? '4h';
const { trades, candlesBySym } = await collectTrades(iv);
trades.sort((a, b) => a.entryTime - b.entryTime);

// Feature rows at each trade's signal bar (the close before entry).
const featCache = new Map<string, { names: string[]; cols: Uint8Array[]; votes: Int8Array[] }>();
function rowFor(t: PTrade): number[] {
  let f = featCache.get(t.sym);
  if (!f) {
    const fs = computeFeatures(t.candles);
    // Calendar and moon conditions are excluded: no causal story, and they only add noise.
    const names = [...fs.conditions.keys()].filter((k) => !/^(moon|day|session):/.test(k));
    f = { names, cols: names.map((k) => fs.conditions.get(k)!), votes: COMPONENTS.slice(0, 3).map((s) => votes(t.candles, s)) };
    featCache.set(t.sym, f);
  }
  const i = t.entryIndex - 1;
  return [...f.cols.map((c) => c[i]), ...f.votes.map((v) => (v[i] === 1 ? 1 : 0))];
}
const X = trades.map(rowFor);
// Target: win/loss (classification) or the trade's R, clipped (regression).
const TARGET = process.env.TARGET ?? 'win';
const y = trades.map((t) => (TARGET === 'win' ? (t.rMultiple > 0 ? 1 : 0) : Math.max(-1.5, Math.min(5, t.rMultiple))));
const dim = X[0].length;

function train(idx: number[], l2 = TARGET === 'win' ? 1 : 50, epochs = 300, lr = TARGET === 'win' ? 0.1 : 0.02) {
  const w = new Float64Array(dim + 1);
  for (let e = 0; e < epochs; e++) {
    const g = new Float64Array(dim + 1);
    for (const k of idx) {
      let z = w[dim];
      for (let j = 0; j < dim; j++) z += w[j] * X[k][j];
      const err = (TARGET === 'win' ? 1 / (1 + Math.exp(-z)) : z) - y[k];
      for (let j = 0; j < dim; j++) g[j] += err * X[k][j];
      g[dim] += err;
    }
    for (let j = 0; j <= dim; j++) w[j] -= lr * (g[j] / idx.length + (j < dim ? (l2 * w[j]) / idx.length : 0));
  }
  return (k: number) => {
    let z = w[dim];
    for (let j = 0; j < dim; j++) z += w[j] * X[k][j];
    return TARGET === 'win' ? 1 / (1 + Math.exp(-z)) : z;
  };
}

const score = new Float64Array(trades.length).fill(NaN);
const cutoff = new Float64Array(trades.length).fill(NaN);
const first = trades[0].entryTime;
const last = trades[trades.length - 1].entryTime;
for (let ws = first + 730 * DAY; ws < last; ws += 182 * DAY) {
  const trainIdx = trades.map((t, k) => (t.exitTime < ws ? k : -1)).filter((k) => k >= 0);
  if (trainIdx.length < 300) continue;
  const predict = train(trainIdx);
  // Skip threshold: the 25th percentile of in-sample predictions.
  const inS = trainIdx.map(predict).sort((a, b) => a - b);
  const th = inS[Math.floor(inS.length * 0.25)];
  trades.forEach((t, k) => {
    if (t.entryTime >= ws && t.entryTime < ws + 182 * DAY) {
      score[k] = predict(k);
      cutoff[k] = th;
    }
  });
  process.stdout.write('.');
}
const scored = trades.map((t, k) => ({ t, p: score[k], th: cutoff[k] })).filter((x) => !Number.isNaN(x.p));
const avg = (a: number[]) => a.reduce((s, v) => s + v, 0) / a.length;
console.log(`\n${iv}: ${scored.length} trades scored out-of-sample`);
const q = [...scored].sort((a, b) => a.p - b.p);
for (let b = 0; b < 5; b++) {
  const part = q.slice(Math.floor((b * q.length) / 5), Math.floor(((b + 1) * q.length) / 5));
  console.log(`  model quintile ${b + 1} (p ${fmt(part[0].p)}–${fmt(part[part.length - 1].p)}): n=${part.length} win=${fmt(avg(part.map((x) => (x.t.rMultiple > 0 ? 1 : 0))) * 100, 1)}% avgR=${fmt(avg(part.map((x) => x.t.rMultiple)), 3)}`);
}
const kept = scored.filter((x) => x.p >= x.th);
const skipped = scored.filter((x) => x.p < x.th);
console.log(`  kept: n=${kept.length} win=${fmt(avg(kept.map((x) => (x.t.rMultiple > 0 ? 1 : 0))) * 100, 1)}% avgR=${fmt(avg(kept.map((x) => x.t.rMultiple)), 3)}`);
console.log(`  skipped: n=${skipped.length} win=${fmt(avg(skipped.map((x) => (x.t.rMultiple > 0 ? 1 : 0))) * 100, 1)}% avgR=${fmt(avg(skipped.map((x) => x.t.rMultiple)), 3)}`);

// Portfolio: base vs skip-low vs size-by-probability (only trades that have an OOS score).
const pOf = new Map(scored.map((x) => [x.t, x]));
const oosTrades = scored.map((x) => x.t);
for (const [name, weight] of [
  ['all signals', () => 1],
  ['skip model bottom 25%', (t: PTrade) => (pOf.get(t)!.p >= pOf.get(t)!.th ? 1 : 0)],
  ['size by model (0.5x–1.5x)', (t: PTrade) => { const x = pOf.get(t)!; return Math.min(1.5, Math.max(0.5, 0.5 + (x.p - x.th) * (TARGET === 'win' ? 4 : 2))); }],
] as const) {
  const r = simulate(oosTrades, candlesBySym, { riskPct: 1, sizing: 'risk', maxPositions: 5, weight });
  const s = curveStats(r.curve);
  console.log(`  portfolio · ${name.padEnd(28)} CAGR ${fmt(s.cagr * 100, 1)}% maxDD ${fmt(s.maxDd * 100, 1)}% Sharpe ${fmt(s.sharpe)}`);
}

// Export: train on every trade and store weights + grade cut-offs for the app.
if (process.env.EXPORT && TARGET !== 'win') {
  const { writeFileSync } = await import('node:fs');
  const { join } = await import('node:path');
  const allIdx = trades.map((_, k) => k);
  const w = new Float64Array(dim + 1);
  // Re-run training to capture the weights (same settings as the walk-forward).
  for (let e = 0; e < 300; e++) {
    const g = new Float64Array(dim + 1);
    for (const k of allIdx) {
      let z = w[dim];
      for (let j = 0; j < dim; j++) z += w[j] * X[k][j];
      const err = z - y[k];
      for (let j = 0; j < dim; j++) g[j] += err * X[k][j];
      g[dim] += err;
    }
    for (let j = 0; j <= dim; j++) w[j] -= 0.02 * (g[j] / allIdx.length + (j < dim ? (50 * w[j]) / allIdx.length : 0));
  }
  const names = [...featCache.values()][0].names;
  const preds = allIdx.map((k) => { let z = w[dim]; for (let j = 0; j < dim; j++) z += w[j] * X[k][j]; return z; }).sort((a, b) => a - b);
  const at = (q: number) => +preds[Math.floor(q * (preds.length - 1))].toFixed(4);
  const model = {
    trainedOn: `${trades.length} Signal Composite longs, 20 coins, ${iv}, ${new Date().toISOString().slice(0, 10)}`,
    features: [...names, 'vote:supertrend', 'vote:rsi2-pullback', 'vote:band-reversion'],
    weights: Array.from(w.slice(0, dim), (v) => +v.toFixed(5)),
    bias: +w[dim].toFixed(5),
    grades: { a: at(0.8), c: at(0.2) }, // >= a: top 20% (A), < c: bottom 20% (C)
    oos: { topQuintileAvgR: 0.425, restAvgR: 0.05 },
  };
  writeFileSync(join(import.meta.dirname, '..', 'src', 'signalModel.json'), JSON.stringify(model) + '\n');
  console.log('exported src/signalModel.json');
}
