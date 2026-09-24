// Ways to cut correlated drawdowns in the multi-coin account.
import { computeFeatures } from '../src/features';
import { history } from './history';
import { fmt } from './lib';
import { collectTrades, curveStats, monthly, simulate, stress, type SimOptions } from './portfolio';

const iv = process.env.INTERVALS ?? '4h';
const { trades, candlesBySym } = await collectTrades(iv);
const btc = await history('BTCUSDT', iv);
const btcRegime = computeFeatures(btc).regime;
const btcIdx = new Map(btc.map((b, i) => [b.time, i]));
// BTC regime at the close before each trade's entry bar.
const btcGate = (t: (typeof trades)[number]) => {
  const i = btcIdx.get(t.candles[t.entryIndex - 1].time);
  return i === undefined || btcRegime[i] !== -1 ? 1 : 0;
};
const rows: [string, SimOptions][] = [
  ['0.5% risk, open risk ≤ 5%', { riskPct: 0.5, sizing: 'risk', maxOpenRiskPct: 5 }],
  ['0.5% risk, max 5 positions', { riskPct: 0.5, sizing: 'risk', maxPositions: 5 }],
  ['0.5% risk, max 8 positions', { riskPct: 0.5, sizing: 'risk', maxPositions: 8 }],
  ['0.5% risk + BTC not bearish', { riskPct: 0.5, sizing: 'risk', maxOpenRiskPct: 5, weight: btcGate }],
  ['0.5% risk + BTC not bearish, max 8', { riskPct: 0.5, sizing: 'risk', maxPositions: 8, weight: btcGate }],
  ['1% risk + BTC not bearish, max 5', { riskPct: 1, sizing: 'risk', maxPositions: 5, weight: btcGate }],
];
console.log(`${iv}: ${trades.length} trades\n| Setup | CAGR | Max DD | Sharpe | Avg lev | Peak lev | Taken | Stress: median DD | Stress: 95th pct DD | Stress: P(DD≥50%) |`);
for (const [name, o] of rows) {
  const r = simulate(trades, candlesBySym, o);
  const s = curveStats(r.curve);
  const st = stress(monthly(r.curve).map((x) => x), 1);
  console.log(`| ${name} | ${fmt(s.cagr * 100, 1)}% | ${fmt(s.maxDd * 100, 1)}% | ${fmt(s.sharpe)} | ${fmt(r.avgLev, 2)}x | ${fmt(r.maxLev, 2)}x | ${r.taken} | ${fmt(st.ddMedian * 100, 1)}% | ${fmt(st.ddP95 * 100, 1)}% | ${fmt(st.pDd50 * 100, 1)}% |`);
}
