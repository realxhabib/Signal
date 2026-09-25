import { backtest, defaultRisk } from './backtest.js';
import { ALLOCATION, composite, LEVELS, lineupFor, modeOf } from './composite.js';
import { computeFeatures } from './features.js';
import { gradeSignals } from './grade.js';
import { makePlan, type TradePlan } from './plan.js';
import type { Candle, Signal, Trade } from './types.js';

/** Bitcoin's trend regime by bar time (1 bull, -1 bear, 0 neutral). */
export function btcRegimeByTime(btc: Candle[]): Map<number, number> {
  const r = computeFeatures(btc).regime;
  return new Map(btc.map((b, i) => [b.time, r[i]]));
}

/**
 * Regime for lower-timeframe bars from a higher-timeframe regime map: each bar gets the regime of the latest
 * higher-timeframe bar that had closed by the bar's own close (no look-ahead). Used so 1h trades follow
 * Bitcoin's 4h trend, as in the research.
 */
export function alignRegime(times: number[], barSec: number, htf: Map<number, number>, htfSec: number): Map<number, number> {
  const out = new Map<number, number>();
  for (const t of times) {
    const key = Math.floor((t + barSec) / htfSec) * htfSec - htfSec;
    const v = htf.get(key);
    if (v !== undefined) out.set(t, v);
  }
  return out;
}

/**
 * Market mode from Bitcoin's trend decides which sides may open (see ALLOCATION):
 * no longs while Bitcoin is bearish, no shorts while it is bullish.
 */
export function applyBtcGate(signals: Signal[], _symbol: string, btcRegime: Map<number, number> | null): Signal[] {
  if (!btcRegime) return signals;
  return signals.filter((s) => {
    const a = ALLOCATION[modeOf(btcRegime.get(s.time))];
    return s.side === 'long' ? a.longRisk > 0 : a.shortRisk > 0;
  });
}

export type CoinStatus =
  | { kind: 'open-now'; side: 'long' | 'short'; price: number }
  | { kind: 'close-now'; side: 'long' | 'short'; pct: number }
  | { kind: 'in-trade'; side: 'long' | 'short'; pct: number; since: number }
  | { kind: 'flat'; lastPct: number | null };

/** Current Signal Composite status for one coin (used by the all-coins scanner). */
export function coinStatus(c: Candle[], symbol: string, btcRegime: Map<number, number> | null, allowShorts: boolean, interval = '4h'): CoinStatus {
  const lineup = lineupFor(interval);
  const p = allowShorts ? lineup : { ...lineup, shorts: 0 };
  const out = composite.build(c, p);
  const signals = applyBtcGate(out.signals, symbol, btcRegime);
  const res = backtest(c, signals, out.atr, { ...defaultRisk, feePct: 0.02, slippagePct: 0, ...out.risk, ...LEVELS }, out.rules);
  const last: Trade | undefined = res.trades[res.trades.length - 1];
  const open = last && last.exitReason === 'end' ? last : null;
  const price = c[c.length - 1].close;
  const pct = (t: Trade) => (((t.side === 'long' ? 1 : -1) * (price - t.entryPrice)) / t.entryPrice) * 100;
  if (open && (res.pending.exit || (res.pending.signal && res.pending.signal.side !== open.side)))
    return { kind: 'close-now', side: open.side, pct: pct(open) };
  if (res.pending.signal) return { kind: 'open-now', side: res.pending.signal.side, price };
  if (open) return { kind: 'in-trade', side: open.side, pct: pct(open), since: c[open.entryIndex].time };
  return { kind: 'flat', lastPct: last ? (((last.side === 'long' ? 1 : -1) * (last.exitPrice - last.entryPrice)) / last.entryPrice) * 100 : null };
}

/** Status plus the trade plan (entry, stop, targets) for the signal opening now, the open trade or the last one. */
export function coinPlan(
  c: Candle[],
  symbol: string,
  btcRegime: Map<number, number> | null,
  interval: string,
): { status: CoinStatus; plan?: TradePlan; entryIndex?: number; price: number } {
  const status = coinStatus(c, symbol, btcRegime, true, interval);
  const out = composite.build(c, lineupFor(interval));
  const signals = applyBtcGate(out.signals, symbol, btcRegime);
  const risk = { ...defaultRisk, feePct: 0.02, slippagePct: 0, ...out.risk, ...LEVELS };
  const res = backtest(c, signals, out.atr, risk, out.rules);
  const barSec = c[1].time - c[0].time;
  const last = c.length - 1;
  const price = c[last].close;
  const trade = res.trades[res.trades.length - 1];
  const open = trade && trade.exitReason === 'end' ? trade : null;
  const sig = res.pending.signal;
  if (sig && (!open || sig.side !== open.side)) {
    const grade = gradeSignals(c, [sig]).get(sig.index);
    return { status, price, entryIndex: last + 1, plan: makePlan({ side: sig.side, entry: price, entryTime: c[last].time + barSec, atr: out.atr[last], stopAtr: risk.stopAtr, barSec, interval, grade }) };
  }
  if (!trade) return { status, price };
  const grade = gradeSignals(c, signals.filter((x) => x.index === trade.entryIndex - 1)).get(trade.entryIndex - 1);
  return {
    status,
    price,
    entryIndex: trade.entryIndex,
    plan: makePlan({
      side: trade.side, entry: trade.entryPrice, entryTime: c[trade.entryIndex].time, atr: out.atr[trade.entryIndex - 1], stopAtr: risk.stopAtr,
      barSec, interval, grade, trade, breakevenAfterAdd: risk.breakevenAfterAdd,
    }),
  };
}
