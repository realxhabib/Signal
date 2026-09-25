// Round 6 · Order flow: does aggressive buying/selling (taker volume) or the futures basis at the signal candle
// say anything about the trade? Features are signed by the trade's side (positive = flow agrees with the trade)
// and read at the signal candle's close. Research years only; filters are then tested on the whole account.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { HOLDOUT_START } from './account';
import type { PTrade } from './portfolio';
import { evaluate, header, row, shippedTrades } from './round6-lib';

const CACHE = join(import.meta.dirname, '.cache');
type Feat = Record<string, number>;
const featCache = new Map<string, Map<number, Feat>>();

function features(sym: string, iv: string, candles: PTrade['candles']): Map<number, Feat> {
  const key = `${sym}|${iv}`;
  let f = featCache.get(key);
  if (f) return f;
  f = new Map();
  featCache.set(key, f);
  const rows: [number, number, number][] = JSON.parse(readFileSync(join(CACHE, `${sym}-${iv}-taker.json`), 'utf8'));
  const byTime = new Map(rows.map((r) => [r[0], r]));
  const prem: { time: number; p: number }[] = existsSync(join(CACHE, `${sym}-premium-1h.json`)) ? JSON.parse(readFileSync(join(CACHE, `${sym}-premium-1h.json`), 'utf8')) : [];
  const premAt = new Map(prem.map((x) => [x.time, x.p]));
  const barSec = candles[1].time - candles[0].time;
  const n = candles.length;
  const vol = new Float64Array(n);
  const net = new Float64Array(n); // taker buy − taker sell
  for (let i = 0; i < n; i++) {
    const r = byTime.get(candles[i].time);
    if (r) {
      vol[i] = r[1];
      net[i] = 2 * r[2] - r[1];
    }
  }
  const flow = (i: number, k: number) => {
    let a = 0;
    let v = 0;
    for (let j = Math.max(0, i - k + 1); j <= i; j++) {
      a += net[j];
      v += vol[j];
    }
    return v ? a / v : 0;
  };
  const flow24 = Float64Array.from({ length: n }, (_, i) => flow(i, 24));
  // Premium (basis) as a rolling z-score over the last 30 days of hourly readings.
  const premSeries = prem.map((x) => x.p);
  const premIdx = new Map(prem.map((x, i) => [x.time, i]));
  for (let i = 500; i < n; i++) {
    const hist = flow24.subarray(i - 500, i);
    const m = hist.reduce((a, v) => a + v, 0) / hist.length;
    const sd = Math.sqrt(hist.reduce((a, v) => a + (v - m) ** 2, 0) / hist.length) || 1;
    const ret24 = Math.log(candles[i].close / candles[Math.max(0, i - 24)].close);
    const hourKey = candles[i].time + barSec - 3600; // last hourly premium closed by this candle's close
    const pi = premIdx.get(hourKey);
    let premZ = NaN;
    if (pi !== undefined && pi > 720) {
      const w = premSeries.slice(pi - 720, pi);
      const pm = w.reduce((a, v) => a + v, 0) / w.length;
      const ps = Math.sqrt(w.reduce((a, v) => a + (v - pm) ** 2, 0) / w.length) || 1;
      premZ = (premAt.get(hourKey)! - pm) / ps;
    }
    f.set(i, {
      flow6: flow(i, 6),
      flow24: flow24[i],
      flowZ: (flow24[i] - m) / sd,
      divergence: Math.sign(ret24) * (flow24[i] - m) / sd, // price and flow in the same direction > 0
      premZ,
    });
  }
  return f;
}

const NAMES: [string, string][] = [
  ['flow6', 'Taker flow, last 6 bars'],
  ['flow24', 'Taker flow, last 24 bars'],
  ['flowZ', 'Taker flow z-score (24 vs last 500 bars)'],
  ['divergence', 'Price/flow agreement (24 bars)'],
  ['premZ', 'Futures basis z-score (30 days)'],
];
const { t4, t1 } = await shippedTrades();
const signed = (t: PTrade, iv: string, k: string) => {
  const f = features(t.sym, iv, t.candles).get(t.entryIndex - 1);
  const v = f?.[k];
  if (v === undefined || Number.isNaN(v)) return NaN;
  // Divergence is already "agreement"; the others flip for shorts so positive = supports the trade.
  return k === 'divergence' ? v : (t.side === 'long' ? 1 : -1) * v;
};

const lines = ['# Round 6 · Order flow and futures basis\n', 'Average result (R) of the shipped signals by quintile of each feature at the signal candle, research years only. Features are signed so higher = flow supports the trade (for the basis: higher = futures priced richer in the trade direction, i.e. more crowded).\n'];
const cutoffs: Record<string, Record<string, number[]>> = {};
for (const [iv, set] of [['4h', t4.trades], ['1h', t1.trades]] as const) {
  lines.push(`\n## ${iv}\n`, '| Feature | Q1 (against) | Q2 | Q3 | Q4 | Q5 (with) | Q5 − Q1 |', '|---|---|---|---|---|---|---|');
  cutoffs[iv] = {};
  for (const [k, label] of NAMES) {
    const xs = set.filter((t) => t.entryTime < HOLDOUT_START).map((t) => ({ v: signed(t, iv, k), r: t.rMultiple })).filter((x) => !Number.isNaN(x.v));
    xs.sort((a, b) => a.v - b.v);
    const q = [0, 1, 2, 3, 4].map((j) => xs.slice(Math.floor((j * xs.length) / 5), Math.floor(((j + 1) * xs.length) / 5)));
    cutoffs[iv][k] = [1, 2, 3, 4].map((j) => xs[Math.floor((j * xs.length) / 5)].v);
    const avg = q.map((b) => b.reduce((a, x) => a + x.r, 0) / b.length);
    const win = q.map((b) => b.filter((x) => x.r > 0).length / b.length);
    lines.push(`| ${label} | ${avg.map((a, j) => `${a.toFixed(2)}R · ${(win[j] * 100).toFixed(0)}%`).join(' | ')} | ${(avg[4] - avg[0] >= 0 ? '+' : '') + (avg[4] - avg[0]).toFixed(2)}R |`);
    console.log(iv, lines[lines.length - 1]);
  }
}

// Account-level filters, chosen from the table's shape: skip the quintile where flow is most against the trade,
// or where the basis is most crowded in the trade's direction.
lines.push('\n## Whole account with a flow filter (research years)\n', header);
const base = await evaluate({ name: 'Baseline' });
lines.push(row(base));
const filters: [string, string, 'low' | 'high'][] = [
  ['Skip trades with taker flow (24) most against them (bottom 20%)', 'flow24', 'low'],
  ['Skip trades with flow z-score most against them (bottom 20%)', 'flowZ', 'low'],
  ['Skip trades where price and flow disagree most (bottom 20%)', 'divergence', 'low'],
  ['Skip trades with the most crowded basis (top 20%)', 'premZ', 'high'],
];
for (const [name, k, side] of filters) {
  const keep = (iv: string) => (t: PTrade) => {
    const v = signed(t, iv, k);
    if (Number.isNaN(v)) return true;
    return side === 'low' ? v >= cutoffs[iv][k][0] : v <= cutoffs[iv][k][3];
  };
  const r = await evaluate({ name, filter4: keep('4h'), filter1: keep('1h') });
  lines.push(row(r, base));
  console.log(lines[lines.length - 1]);
}
writeFileSync(join(import.meta.dirname, 'RESULTS-round6-orderflow.md'), lines.join('\n') + '\n');
