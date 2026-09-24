// Recommended account setup: year-by-year results and stress test, stored for the app.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { MAX_LONGS, MAX_SHORTS, RECOMMENDED, SHORT_RISK } from '../src/composite';
import { computeFeatures } from '../src/features';
import { history } from './history';
import { fmt } from './lib';
import { collectTrades, curveStats, monthly, simulate, stress } from './portfolio';

const iv = '4h';
const { trades, candlesBySym } = await collectTrades(iv, RECOMMENDED);
const btc = await history('BTCUSDT', iv);
const reg = computeFeatures(btc).regime;
const idx = new Map(btc.map((b, i) => [b.time, i]));
const gate = (t: (typeof trades)[number]) => {
  const i = idx.get(t.candles[t.entryIndex - 1].time);
  if (t.side === 'short') return SHORT_RISK;
  return i === undefined || reg[i] !== -1 ? 1 : 0;
};
const setups = { conservative: 0.5, balanced: 1 } as const;
const report: Record<string, unknown> = { coins: candlesBySym.size, interval: iv, maxPositions: MAX_LONGS, maxShorts: MAX_SHORTS };
for (const [name, riskPct] of Object.entries(setups)) {
  const r = simulate(trades, candlesBySym, { riskPct, sizing: 'risk', maxPositions: MAX_LONGS, maxShorts: MAX_SHORTS, weight: gate });
  const s = curveStats(r.curve);
  const years: Record<string, number> = {};
  let y = '';
  let startEq = r.curve[0].equity;
  let lastEq = startEq;
  for (const p of r.curve) {
    const k = new Date(p.time * 1000).toISOString().slice(0, 4);
    if (y && k !== y) {
      years[y] = +(lastEq / startEq - 1).toFixed(3);
      startEq = lastEq;
    }
    y = k;
    lastEq = p.equity;
  }
  years[`${y} YTD`] = +(lastEq / startEq - 1).toFixed(3);
  const st = stress(monthly(r.curve), 1);
  report[name] = {
    riskPct,
    cagr: +s.cagr.toFixed(3),
    maxDrawdown: +s.maxDd.toFixed(3),
    sharpe: +s.sharpe.toFixed(2),
    avgLeverage: +r.avgLev.toFixed(2),
    peakLeverage: +r.maxLev.toFixed(2),
    years,
    stress: { medianCagr: +st.cagrMedian.toFixed(3), badCaseCagr: +st.cagrP5.toFixed(3), medianDrawdown: +st.ddMedian.toFixed(3), badCaseDrawdown: +st.ddP95.toFixed(3) },
  };
  console.log(name, fmt(s.cagr * 100, 1) + '%/yr', 'maxDD', fmt(s.maxDd * 100, 1) + '%', 'sharpe', fmt(s.sharpe), JSON.stringify(years));
}
writeFileSync(join(import.meta.dirname, '..', 'src', 'portfolioStats.json'), JSON.stringify(report) + '\n');
