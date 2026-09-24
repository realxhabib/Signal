import { backtest, defaultRisk, type ExitRules } from '../src/backtest';
import type { StrategyDef } from '../src/strategies';
import type { Candle, RiskParams, Trade } from '../src/types';
import { funding, fundingPerBar } from './futures';
import { history } from './history';
import { summarizeR } from './walkforward-stats';

export const DAY = 86_400;
export const limitRisk: RiskParams = { ...defaultRisk, leverage: 3, riskPct: 1, feePct: 0.02, slippagePct: 0 };

export interface Dataset {
  symbol: string;
  interval: string;
  candles: Candle[];
  funding: Float64Array;
  testStart: number; // first two years are reserved for tuning
}

export async function dataset(symbol: string, interval: string): Promise<Dataset> {
  const candles = await history(symbol, interval);
  const barSec = candles[1].time - candles[0].time;
  const f = fundingPerBar(candles.map((c) => c.time), barSec, await funding(symbol));
  return { symbol, interval, candles, funding: f, testStart: candles[0].time + 730 * DAY };
}

export function run(d: Dataset, s: StrategyDef, params = s.defaults, extraRules: ExitRules = {}, risk = limitRisk): Trade[] {
  const out = s.build(d.candles, params);
  return backtest(d.candles, out.signals, out.atr, { ...risk, ...out.risk }, { ...out.rules, funding: d.funding, ...extraRules }).trades;
}

export const inTest = (d: Dataset, trades: Trade[]) => trades.filter((t) => t.entryTime >= d.testStart);
export const years = (d: Dataset) => (d.candles[d.candles.length - 1].time - d.testStart) / (365 * DAY);
export { summarizeR };

export const fmt = (v: number, d = 2) => (Number.isFinite(v) ? v.toFixed(d) : '∞');
