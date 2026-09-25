// Round 6 · Boosted trees for picking gold trades. Every 1h Signal Composite long (as the alerts see them) gets a
// triple-barrier label: did the gold bracket (take profit 1.5 ATR, stop 3 ATR, 30-hour limit) end in profit?
// Purged walk-forward: for each 6-month window, train only on trades whose bracket had finished a day before the
// window starts, and pick the window's top fifth by the training set's own 80th-percentile score (no peeking).
// Compared with a linear (L2 logistic) model on the same features and with the shipped Grade A.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { composite, GOLD, lineupFor, COMPONENTS, votes } from '../src/composite';
import { computeFeatures } from '../src/features';
import { gradeSignals } from '../src/grade';
import { alignRegime, applyBtcGate, btcRegimeByTime } from '../src/scan';
import { HOLDOUT_START } from './account';
import { fitGbm, predictGbm } from './gbm';
import { history } from './history';
import { dataset } from './lib';
import { UNIVERSE } from './universe';

const DAY = 86_400;
const FEE = 0.0002;
interface Row { time: number; end: number; x: number[]; y: number; r: number; gradeA: boolean }
const rows: Row[] = [];
let names: string[] = [];
const btc4 = btcRegimeByTime(await history('BTCUSDT', '4h'));
for (const sym of UNIVERSE) {
  const c = (await dataset(sym, '1h')).candles;
  const regime = alignRegime(c.map((b) => b.time), 3600, btc4, 14_400);
  const out = composite.build(c, lineupFor('1h'));
  const sigs = applyBtcGate(out.signals, sym, regime).filter((s) => s.side === 'long' && s.index > 300 && s.index + 1 + GOLD.maxBars < c.length);
  const f = computeFeatures(c);
  const condNames = [...f.conditions.keys()].filter((k) => !/^(moon|day|session):/.test(k));
  const v = COMPONENTS.slice(0, 3).map((s) => votes(c, s));
  const grades = gradeSignals(c, sigs);
  names = [...condNames, 'vote:supertrend', 'vote:rsi2', 'vote:bands', 'atr%', 'ret24', 'ret120', 'vol z'];
  for (const s of sigs) {
    const i = s.index;
    const e = c[i + 1].open;
    const atr = out.atr[i];
    const T = e + GOLD.targetAtr * atr;
    const S = e - GOLD.stopAtr * atr;
    let exit = c[i + GOLD.maxBars].close;
    for (let k = i + 1; k <= i + GOLD.maxBars; k++) {
      if (c[k].low <= S) { exit = S; break; }
      if (c[k].high >= T) { exit = T; break; }
    }
    const r = (exit - e - 2 * FEE * e) / (GOLD.stopAtr * atr);
    let vs = 0;
    let vs2 = 0;
    for (let k = i - 49; k <= i; k++) {
      vs += c[k].volume;
      vs2 += c[k].volume ** 2;
    }
    const vm = vs / 50;
    const vsd = Math.sqrt(Math.max(1e-12, vs2 / 50 - vm * vm));
    rows.push({
      time: c[i].time,
      end: c[i + GOLD.maxBars].time,
      x: [
        ...condNames.map((k) => f.conditions.get(k)![i]),
        ...v.map((a) => (a[i] === 1 ? 1 : 0)),
        atr / c[i].close,
        Math.log(c[i].close / c[i - 24].close),
        Math.log(c[i].close / c[i - 120].close),
        (c[i].volume - vm) / vsd,
      ],
      y: r > 0 ? 1 : 0,
      r,
      gradeA: grades.get(i) === 'A',
    });
  }
}
rows.sort((a, b) => a.time - b.time);
console.log('rows', rows.length, 'features', names.length);

function fitLogistic(X: number[][], y: number[], l2 = 1, epochs = 200, lr = 0.1) {
  const d = X[0].length;
  const mu = Array.from({ length: d }, (_, j) => X.reduce((a, x) => a + x[j], 0) / X.length);
  const sd = Array.from({ length: d }, (_, j) => Math.sqrt(X.reduce((a, x) => a + (x[j] - mu[j]) ** 2, 0) / X.length) || 1);
  const Z = X.map((x) => x.map((v, j) => (v - mu[j]) / sd[j]));
  const w = new Float64Array(d + 1);
  for (let e = 0; e < epochs; e++) {
    const g = new Float64Array(d + 1);
    for (let i = 0; i < Z.length; i++) {
      let z = w[d];
      for (let j = 0; j < d; j++) z += w[j] * Z[i][j];
      const err = 1 / (1 + Math.exp(-z)) - y[i];
      for (let j = 0; j < d; j++) g[j] += err * Z[i][j];
      g[d] += err;
    }
    for (let j = 0; j <= d; j++) w[j] -= lr * (g[j] / Z.length + (j < d ? (l2 * w[j]) / Z.length : 0));
  }
  return (x: number[]) => {
    let z = w[d];
    for (let j = 0; j < d; j++) z += (w[j] * (x[j] - mu[j])) / sd[j];
    return 1 / (1 + Math.exp(-z));
  };
}

type Pick = { rows: Row[] };
let firstWindow = Infinity;
const picks: Record<string, Pick> = { gbm: { rows: [] }, linear: { rows: [] } };
const research = rows.filter((r) => r.time < HOLDOUT_START);
for (let ws = Date.UTC(2020, 0, 1) / 1000; ws < HOLDOUT_START; ws += 182 * DAY) {
  const we = Math.min(ws + 182 * DAY, HOLDOUT_START);
  const train = research.filter((r) => r.end < ws - DAY); // purge: bracket finished, plus a one-day embargo
  const test = research.filter((r) => r.time >= ws && r.time < we);
  if (train.length < 2000 || !test.length) continue;
  firstWindow = Math.min(firstWindow, ws);
  const gbm = fitGbm(train.map((r) => r.x), train.map((r) => r.y), { trees: 120, depth: 3, lr: 0.05, minLeaf: 150 });
  const lin = fitLogistic(train.map((r) => r.x), train.map((r) => r.y));
  for (const [key, score] of [['gbm', (x: number[]) => predictGbm(gbm, x)], ['linear', lin]] as const) {
    const s = train.map((r) => score(r.x)).sort((a, b) => a - b);
    const cut = s[Math.floor(s.length * 0.8)];
    picks[key].rows.push(...test.filter((r) => score(r.x) >= cut));
  }
  console.log(new Date(ws * 1000).toISOString().slice(0, 7), 'train', train.length, 'test', test.length);
}
// Same months for every row of the table: from the first walk-forward window to the locked year.
const from2020 = research.filter((r) => r.time >= firstWindow);
const months = (HOLDOUT_START - firstWindow) / (30.44 * DAY);
const line = (name: string, rs: Row[]) =>
  `| ${name} | ${(rs.length / months).toFixed(1)} | ${((rs.filter((r) => r.y).length / rs.length) * 100).toFixed(1)}% | ${(rs.reduce((a, r) => a + r.r, 0) / rs.length).toFixed(3)}R |`;
const lines = [
  '# Round 6 · Boosted trees for gold picks (purged walk-forward)\n',
  `1h Signal Composite longs from ${new Date(firstWindow * 1000).toISOString().slice(0, 7)} to the locked year (${from2020.length} trades), each traded as the gold bracket. Models re-trained every 6 months on finished brackets only.\n`,
  '| Picks | Per month (20 coins) | Win rate | Avg per trade |',
  '|---|---|---|---|',
  line('All 1h longs', from2020),
  line('Shipped Grade A (model trained on 4h, all years)', from2020.filter((r) => r.gradeA)),
  line('Linear model, top 20% (walk-forward)', picks.linear.rows),
  line('Boosted trees, top 20% (walk-forward)', picks.gbm.rows),
];
console.log(lines.slice(4).join('\n'));
writeFileSync(join(import.meta.dirname, 'RESULTS-round6-boosting.md'), lines.join('\n') + '\n');
