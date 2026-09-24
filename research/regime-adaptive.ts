// Regime-adaptive long/short allocation driven by Bitcoin's trend regime.
import { RECOMMENDED } from '../src/composite';
import { computeFeatures } from '../src/features';
import type { Params } from '../src/strategies';
import { history } from './history';
import { fmt } from './lib';
import { collectTrades, curveStats, simulate, type PTrade, type SimOptions } from './portfolio';

const iv = process.env.INTERVALS ?? '4h';
const btc = await history('BTCUSDT', iv);
const reg = computeFeatures(btc).regime;
const idx = new Map(btc.map((b, i) => [b.time, i]));
const barSec = btc[1].time - btc[0].time;
// Regime known at the close before a given bar start.
const regimeBefore = (time: number) => reg[(idx.get(time - barSec) ?? -1)] ?? 0;
const regimeAtEntry = (t: PTrade) => reg[idx.get(t.candles[t.entryIndex - 1].time) ?? -1] ?? 0;

type Alloc = Record<'bull' | 'neutral' | 'bear', { longRisk: number; longSlots: number; shortRisk: number; shortSlots: number }>;
const key = (r: number) => (r === 1 ? 'bull' : r === -1 ? 'bear' : 'neutral') as keyof Alloc;
const setups: [string, Params, Alloc][] = [
  ['current (static)', RECOMMENDED, {
    bull: { longRisk: 1, longSlots: 5, shortRisk: 0.5, shortSlots: 3 },
    neutral: { longRisk: 1, longSlots: 5, shortRisk: 0.5, shortSlots: 3 },
    bear: { longRisk: 0, longSlots: 5, shortRisk: 0.5, shortSlots: 3 },
  }],
  ['bear: full shorts ×5', RECOMMENDED, {
    bull: { longRisk: 1, longSlots: 5, shortRisk: 0.5, shortSlots: 3 },
    neutral: { longRisk: 1, longSlots: 5, shortRisk: 0.5, shortSlots: 3 },
    bear: { longRisk: 0, longSlots: 0, shortRisk: 1, shortSlots: 5 },
  }],
  ['bear: full shorts ×5, bull: no shorts', RECOMMENDED, {
    bull: { longRisk: 1, longSlots: 5, shortRisk: 0, shortSlots: 0 },
    neutral: { longRisk: 1, longSlots: 5, shortRisk: 0.5, shortSlots: 3 },
    bear: { longRisk: 0, longSlots: 0, shortRisk: 1, shortSlots: 5 },
  }],
  ['bear: 1.5× shorts ×5, bull: no shorts', RECOMMENDED, {
    bull: { longRisk: 1, longSlots: 5, shortRisk: 0, shortSlots: 0 },
    neutral: { longRisk: 1, longSlots: 5, shortRisk: 0.5, shortSlots: 3 },
    bear: { longRisk: 0, longSlots: 0, shortRisk: 1.5, shortSlots: 5 },
  }],
  ['bear: full shorts ×5, neutral: half both, bull: no shorts', RECOMMENDED, {
    bull: { longRisk: 1, longSlots: 5, shortRisk: 0, shortSlots: 0 },
    neutral: { longRisk: 0.5, longSlots: 4, shortRisk: 0.5, shortSlots: 4 },
    bear: { longRisk: 0, longSlots: 0, shortRisk: 1, shortSlots: 5 },
  }],
];
const years = ['2020', '2021', '2022', '2023', '2024', '2025', '2026'];
console.log(`| Setup | CAGR | Max DD | Sharpe | ${years.join(' | ')} |`);
for (const [name, p, alloc] of setups) {
  const { trades, candlesBySym } = await collectTrades(iv, p);
  const o: SimOptions = {
    riskPct: 1,
    sizing: 'risk',
    weight: (t) => { const a = alloc[key(regimeAtEntry(t))]; return t.side === 'long' ? a.longRisk : a.shortRisk; },
    caps: (time) => { const a = alloc[key(regimeBefore(time))]; return { long: a.longSlots, short: a.shortSlots }; },
  };
  const r = simulate(trades, candlesBySym, o);
  const s = curveStats(r.curve);
  const yr = (y: number) => {
    const pts = r.curve.filter((x) => new Date(x.time * 1000).getUTCFullYear() === y);
    const prev = r.curve.filter((x) => new Date(x.time * 1000).getUTCFullYear() < y).pop() ?? pts[0];
    return pts.length ? pts[pts.length - 1].equity / prev.equity - 1 : NaN;
  };
  console.log(`| ${name} | ${fmt(s.cagr * 100, 1)}% | ${fmt(s.maxDd * 100, 1)}% | ${fmt(s.sharpe)} | ${years.map((y) => fmt(yr(+y) * 100, 0) + '%').join(' | ')} |`);
}
