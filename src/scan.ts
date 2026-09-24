import { backtest, defaultRisk } from './backtest';
import { ALLOCATION, composite, modeOf, RECOMMENDED } from './composite';
import { computeFeatures } from './features';
import type { Candle, Signal, Trade } from './types';

/** Bitcoin's trend regime by bar time (1 bull, -1 bear, 0 neutral). */
export function btcRegimeByTime(btc: Candle[]): Map<number, number> {
  const r = computeFeatures(btc).regime;
  return new Map(btc.map((b, i) => [b.time, r[i]]));
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
export function coinStatus(c: Candle[], symbol: string, btcRegime: Map<number, number> | null, allowShorts: boolean): CoinStatus {
  const p = allowShorts ? RECOMMENDED : { ...RECOMMENDED, shorts: 0 };
  const out = composite.build(c, p);
  const signals = applyBtcGate(out.signals, symbol, btcRegime);
  const res = backtest(c, signals, out.atr, { ...defaultRisk, feePct: 0.02, slippagePct: 0, ...out.risk }, out.rules);
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
