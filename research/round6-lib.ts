// Shared harness for round 6: the shipped account (80% 4h + 20% 1h Signal Composite, market modes, pyramid),
// scored on the research years unless asked otherwise, with each variant recorded in the trial registry.
import { LEVELS, lineupFor, SPLIT } from '../src/composite';
import type { Candle } from '../src/types';
import { accountTrades, runAccount, type AccountOptions } from './account';
import type { PTrade } from './portfolio';
import { deflatedSharpe, recordTrial, trials } from './validation';

export const ROUND = 6;
const DAY = 86_400;
type Period = 'research' | 'holdout' | 'forward' | 'all';

let cache: { t4: { trades: PTrade[]; candlesBySym: Map<string, Candle[]> }; t1: { trades: PTrade[]; candlesBySym: Map<string, Candle[]> } } | null = null;
export async function shippedTrades() {
  if (!cache) cache = { t4: await accountTrades('4h', lineupFor('4h'), undefined, LEVELS), t1: await accountTrades('1h', lineupFor('1h'), undefined, LEVELS) };
  return cache;
}

function dailyMap(curve: { time: number; equity: number }[]) {
  const eod = new Map<number, number>();
  for (const p of curve) eod.set(Math.floor(p.time / DAY) * DAY, p.equity);
  const ds = [...eod.keys()].sort((a, b) => a - b);
  return new Map(ds.slice(1).map((d, i) => [d, eod.get(d)! / eod.get(ds[i])! - 1]));
}

export interface Variant {
  name: string;
  o4?: AccountOptions;
  o1?: AccountOptions;
  filter4?: (t: PTrade) => boolean; // drop trades (a signal filter)
  filter1?: (t: PTrade) => boolean;
}

export interface Result { name: string; cagr: number; maxDd: number; sharpe: number; years: Map<string, number>; daily: number[]; days: number[]; trades4: number; trades1: number }

export async function evaluate(v: Variant, period: Period = 'research', record = period === 'research'): Promise<Result> {
  const { t4, t1 } = await shippedTrades();
  const a4 = await runAccount('4h', v.filter4 ? t4.trades.filter(v.filter4) : t4.trades, t4.candlesBySym, { riskPct: 1, ...v.o4 }, period);
  const a1 = await runAccount('1h', v.filter1 ? t1.trades.filter(v.filter1) : t1.trades, t1.candlesBySym, { riskPct: 1, regimeInterval: '4h', ...v.o1 }, period);
  const d4 = dailyMap(a4.curve);
  const d1 = dailyMap(a1.curve);
  const days = [...d4.keys()].sort((a, b) => a - b);
  const xs = days.map((d) => ({ time: d, ret: d1.has(d) ? SPLIT['4h'] * d4.get(d)! + SPLIT['1h'] * d1.get(d)! : d4.get(d)! }));
  let eq = 1;
  let peak = 1;
  let dd = 0;
  const years = new Map<string, number>();
  for (const x of xs) {
    eq *= 1 + x.ret;
    peak = Math.max(peak, eq);
    dd = Math.max(dd, 1 - eq / peak);
    const y = new Date(x.time * 1000).getUTCFullYear().toString();
    years.set(y, (1 + (years.get(y) ?? 0)) * (1 + x.ret) - 1);
  }
  const yrs = xs.length / 365;
  const daily = xs.map((x) => x.ret);
  const m = daily.reduce((a, r) => a + r, 0) / daily.length;
  const sd = Math.sqrt(daily.reduce((a, r) => a + (r - m) ** 2, 0) / daily.length);
  if (record) recordTrial(ROUND, v.name, daily);
  return { name: v.name, cagr: eq ** (1 / yrs) - 1, maxDd: dd, sharpe: sd ? (m / sd) * Math.sqrt(365) : 0, years, daily, days, trades4: a4.taken, trades1: a1.taken };
}

export const pct = (v: number, d = 0) => `${v >= 0 ? '+' : ''}${(v * 100).toFixed(d)}%`;
export const row = (r: Result, base?: Result) =>
  `| ${r.name} | ${pct(r.cagr)} | ${(r.maxDd * 100).toFixed(0)}% | ${r.sharpe.toFixed(2)}${base ? ` (${r.sharpe - base.sharpe >= 0 ? '+' : ''}${(r.sharpe - base.sharpe).toFixed(2)})` : ''} | ${[...r.years.values()].map((v) => pct(v)).join(' · ')} |`;
export const header = '| Variant | CAGR | Max DD | Sharpe | By year |\n|---|---|---|---|---|';

/** Deflated Sharpe of a result against every trial recorded so far (all rounds). */
export function deflate(r: Result) {
  const all = trials();
  return deflatedSharpe(r.daily, all.map((t) => t.sharpe), all.length);
}
