// Numbers shown in the app: the shipped account (80% 4h + 20% 1h Signal Composite, market modes,
// pyramid at +2R) over the full history, by year, with a stress test.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ALLOCATION, LEVELS, SPLIT } from '../src/composite';
import { accountTrades, runAccount } from './account';
import { stress } from './portfolio';
import { perf, type Daily } from './sleeves';
import { UNIVERSE } from './universe';

const DAY = 86_400;
const daily = (curve: { time: number; equity: number }[]) => {
  const eod = new Map<number, number>();
  for (const p of curve) eod.set(Math.floor(p.time / DAY) * DAY, p.equity);
  const ds = [...eod.keys()].sort((a, b) => a - b);
  return new Map(ds.slice(1).map((d, i) => [d, eod.get(d)! / eod.get(ds[i])! - 1]));
};
const t4 = await accountTrades('4h', undefined, undefined, LEVELS);
const t1 = await accountTrades('1h', undefined, undefined, LEVELS);
const report: Record<string, unknown> = { coins: UNIVERSE.length, allocation: ALLOCATION, split: SPLIT, levels: LEVELS };
for (const [name, riskPct] of [['conservative', 0.5], ['balanced', 1]] as const) {
  const a4 = await runAccount('4h', t4.trades, t4.candlesBySym, { riskPct }, 'all');
  const a1 = await runAccount('1h', t1.trades, t1.candlesBySym, { riskPct, regimeInterval: '4h' }, 'all');
  const d4 = daily(a4.curve);
  const d1 = daily(a1.curve);
  // Before the 1h sleeve has history, the whole account runs on 4h.
  const xs: Daily[] = [...d4.keys()].sort((a, b) => a - b).map((d) => ({ time: d, ret: d1.has(d) ? SPLIT['4h'] * d4.get(d)! + SPLIT['1h'] * d1.get(d)! : d4.get(d)! }));
  const p = perf(xs);
  const years: Record<string, number> = {};
  const lastYear = new Date(xs[xs.length - 1].time * 1000).getUTCFullYear().toString();
  for (const [y, v] of p.years) years[y === lastYear ? `${y} YTD` : y] = +v.toFixed(3);
  const months = new Map<string, number>();
  for (const x of xs) {
    const k = new Date(x.time * 1000).toISOString().slice(0, 7);
    months.set(k, (months.get(k) ?? 1) * (1 + x.ret));
  }
  const st = stress([...months.values()].map((v) => v - 1), 1);
  report[name] = {
    riskPct,
    cagr: +p.cagr.toFixed(3),
    maxDrawdown: +p.maxDd.toFixed(3),
    sharpe: +p.sharpe.toFixed(2),
    avgLeverage: +(SPLIT['4h'] * a4.avgLev + SPLIT['1h'] * a1.avgLev).toFixed(2),
    peakLeverage: +Math.max(a4.maxLev, a1.maxLev).toFixed(2),
    years,
    stress: { medianCagr: +st.cagrMedian.toFixed(3), badCaseCagr: +st.cagrP5.toFixed(3), medianDrawdown: +st.ddMedian.toFixed(3), badCaseDrawdown: +st.ddP95.toFixed(3) },
  };
  console.log(name, JSON.stringify(report[name]));
}
writeFileSync(join(import.meta.dirname, '..', 'src', 'portfolioStats.json'), JSON.stringify(report) + '\n');
