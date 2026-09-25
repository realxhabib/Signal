// The shipped account rules (market modes by BTC trend) as a reusable research harness,
// with a locked holdout year for final validation.
import { ALLOCATION, modeOf, RECOMMENDED } from '../src/composite';
import { computeFeatures } from '../src/features';
import type { Params } from '../src/strategies';
import type { Candle, RiskParams } from '../src/types';
import { history } from './history';
import { collectTrades, curveStats, monthly, simulate, stress, type PTrade, type SimOptions } from './portfolio';
import { UNIVERSE } from './universe';
import { FORWARD_START } from './validation';

/** Everything from this date on is the locked final exam; research picks use earlier data only. */
export const HOLDOUT_START = Date.UTC(2025, 8, 24) / 1000;

export async function btcBars(iv: string) {
  return history('BTCUSDT', iv);
}

const btcCache = new Map<string, { reg: Int8Array; idx: Map<number, number>; barSec: number }>();
async function btcRegime(iv: string) {
  let b = btcCache.get(iv);
  if (!b) {
    const c = await history('BTCUSDT', iv);
    b = { reg: computeFeatures(c).regime, idx: new Map(c.map((x, i) => [x.time, i])), barSec: c[1].time - c[0].time };
    btcCache.set(iv, b);
  }
  return b;
}

export interface AccountOptions {
  riskPct?: number;
  slotMult?: number; // scales every slot count in ALLOCATION
  sizeMult?: (t: PTrade) => number; // extra per-trade size (e.g. grade)
  priority?: (t: PTrade) => number;
  rotate?: SimOptions['rotate'];
  regimeInterval?: string; // read the market mode from Bitcoin on this timeframe (e.g. 4h for a 1h account)
  /** Replace Bitcoin's EMA trend regime (1 bull, -1 bear, 0 neutral) with another, per Bitcoin bar on regimeInterval. */
  regime?: Int8Array;
  /** Extra risk multiplier by time (e.g. from a volatility forecast); applies to every new trade. */
  riskAt?: (time: number) => number;
}

export async function accountTrades(iv: string, params: Params = RECOMMENDED, symbols = UNIVERSE, risk: Partial<RiskParams> = {}) {
  return collectTrades(iv, params, symbols, risk);
}

export async function runAccount(
  iv: string,
  trades: PTrade[],
  candlesBySym: Map<string, Candle[]>,
  o: AccountOptions = {},
  period: 'research' | 'holdout' | 'forward' | 'all' = 'research',
) {
  const rIv = o.regimeInterval ?? iv;
  const b0 = await btcRegime(rIv);
  const b = o.regime ? { ...b0, reg: o.regime } : b0;
  const barSecTrade = (await btcRegime(iv)).barSec;
  // Regime of the most recent `rIv` bar that had closed by the close of the bar starting at t.
  const at = (t: number) => {
    const closeT = t + barSecTrade;
    const key = Math.floor(closeT / b.barSec) * b.barSec - b.barSec;
    return b.reg[b.idx.get(key) ?? -1];
  };
  const inPeriod = (t: PTrade) =>
    period === 'all' ? true : period === 'research' ? t.entryTime < HOLDOUT_START : period === 'forward' ? t.entryTime >= FORWARD_START : t.entryTime >= HOLDOUT_START;
  const sm = o.slotMult ?? 1;
  const sim: SimOptions = {
    riskPct: o.riskPct ?? 1,
    sizing: 'risk',
    weight: (t) => {
      const a = ALLOCATION[modeOf(at(t.candles[t.entryIndex - 1].time))];
      return (t.side === 'long' ? a.longRisk : a.shortRisk) * (o.sizeMult ? o.sizeMult(t) : 1) * (o.riskAt ? o.riskAt(t.candles[t.entryIndex - 1].time) : 1);
    },
    caps: (time) => {
      const a = ALLOCATION[modeOf(at(time - barSecTrade))];
      return { long: Math.round(a.longSlots * sm), short: Math.round(a.shortSlots * sm) };
    },
    priority: o.priority,
    rotate: o.rotate,
  };
  const r = simulate(trades.filter(inPeriod), candlesBySym, sim);
  const s = curveStats(r.curve);
  const years = new Map<string, number>();
  let y = '';
  let startEq = r.curve[0].equity;
  let last = startEq;
  for (const p of r.curve) {
    const k = new Date(p.time * 1000).getUTCFullYear().toString();
    if (y && k !== y) {
      years.set(y, last / startEq - 1);
      startEq = last;
    }
    y = k;
    last = p.equity;
  }
  years.set(y, last / startEq - 1);
  const qs = monthly(r.curve);
  return { ...s, years, taken: r.taken, avgLev: r.avgLev, maxLev: r.maxLev, curve: r.curve, stress: stress(qs, 1) };
}

/** A named level setup; PYRAMID is the base carried forward from the levels study. */
export const PYRAMID: Partial<RiskParams> = { pyramid: [{ r: 2, frac: 0.5 }], breakevenAfterAdd: true };

export const pct = (v: number, d = 0) => `${v >= 0 ? '+' : ''}${(v * 100).toFixed(d)}%`;
