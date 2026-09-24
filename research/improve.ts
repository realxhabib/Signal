// Round 4: signal priority by grade, grade-based sizing and a drawdown brake, on top of
// the long + half-size shorts account. Grades come from the walk-forward model (blind).
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { composite } from '../src/composite';
import { computeFeatures } from '../src/features';
import { history } from './history';
import { fmt } from './lib';
import { oosScores } from './mlcore';
import { collectTrades, curveStats, monthly, simulate, stress, type PTrade, type SimOptions } from './portfolio';

const iv = '4h';
const btc = await history('BTCUSDT', iv);
const reg = computeFeatures(btc).regime;
const idx = new Map(btc.map((b, i) => [b.time, i]));
const btcOk = (t: PTrade) => reg[idx.get(t.candles[t.entryIndex - 1].time) ?? -1] !== -1;

const { trades: all, candlesBySym } = await collectTrades(iv, { ...composite.defaults, shorts: 1, shortGate: 1, shortMask: 0b111 });
const scores = oosScores(all);
const start = Math.min(...[...scores.keys()].map((t) => t.entryTime));
const trades = all.filter((t) => t.entryTime >= start && (t.side === 'short' || scores.has(t)));
const grade = (t: PTrade) => {
  const s = scores.get(t);
  return !s ? 'B' : s.z >= s.a ? 'A' : s.z < s.c ? 'C' : 'B';
};
const SIZE = { A: 1.5, B: 1, C: 0.5 } as const;
const base = (t: PTrade) => (t.side === 'long' ? (btcOk(t) ? 1 : 0) : 0.5);
const common: SimOptions = { riskPct: 1, sizing: 'risk', maxPositions: 5, maxShorts: 3 };
const variants: [string, SimOptions][] = [
  ['Base: longs + half-size shorts', { ...common, weight: base }],
  ['+ take A-grades first', { ...common, weight: base, priority: (t) => scores.get(t)?.z ?? 0 }],
  ['+ size by grade (A 1.5× / B 1× / C 0.5×)', { ...common, weight: (t) => base(t) * (t.side === 'long' ? SIZE[grade(t)] : 1) }],
  ['+ skip C-grades', { ...common, weight: (t) => (grade(t) === 'C' && t.side === 'long' ? 0 : base(t)) }],
  ['+ A first + size by grade', { ...common, weight: (t) => base(t) * (t.side === 'long' ? SIZE[grade(t)] : 1), priority: (t) => scores.get(t)?.z ?? 0 }],
  ['+ drawdown brake 10%→25%, half risk', { ...common, weight: base, ddBrake: { start: 0.1, full: 0.25, minMult: 0.5 } }],
  ['+ drawdown brake 15%→30%, half risk', { ...common, weight: base, ddBrake: { start: 0.15, full: 0.3, minMult: 0.5 } }],
  ['+ drawdown brake 10%→30%, quarter risk', { ...common, weight: base, ddBrake: { start: 0.1, full: 0.3, minMult: 0.25 } }],
];
const lines = [`# Round 4: priority, grade sizing, drawdown brake (20 coins, 4h, from ${new Date(start * 1000).toISOString().slice(0, 10)})\n`, '| Variant | CAGR | Max DD | Sharpe | 2022 | Stress: bad-case DD |', '|---|---|---|---|---|---|'];
for (const [name, o] of variants) {
  const r = simulate(trades, candlesBySym, o);
  const s = curveStats(r.curve);
  const yr = (y: number) => {
    const pts = r.curve.filter((x) => new Date(x.time * 1000).getUTCFullYear() === y);
    const prev = r.curve.filter((x) => new Date(x.time * 1000).getUTCFullYear() < y).pop() ?? pts[0];
    return pts[pts.length - 1].equity / prev.equity - 1;
  };
  const st = stress(monthly(r.curve), 1);
  lines.push(`| ${name} | ${fmt(s.cagr * 100, 1)}% | ${fmt(s.maxDd * 100, 1)}% | ${fmt(s.sharpe)} | ${fmt(yr(2022) * 100, 1)}% | ${fmt(st.ddP95 * 100, 1)}% |`);
  console.log(lines[lines.length - 1]);
}
writeFileSync(join(import.meta.dirname, 'RESULTS-round4.md'), lines.join('\n') + '\n');
