import { backtest, defaultRisk } from './backtest';
import { composite } from './composite';
import { computeFeatures } from './features';
import type { Candle, Signal, Trade } from './types';

/** Bitcoin's trend regime by bar time (1 bull, -1 bear, 0 neutral). */
export function btcRegimeByTime(btc: Candle[]): Map<number, number> {
  const r = computeFeatures(btc).regime;
  return new Map(btc.map((b, i) => [b.time, r[i]]));
}

/**
 * Altcoin longs are skipped while Bitcoin itself is in a bearish regime: in the
 * 20-coin portfolio research this cut drawdowns without costing returns.
 */
export function applyBtcGate(signals: Signal[], symbol: string, btcRegime: Map<number, number> | null): Signal[] {
  if (symbol === 'BTCUSDT' || !btcRegime) return signals;
  return signals.filter((s) => s.side !== 'long' || btcRegime.get(s.time) !== -1);
}

export type CoinStatus =
  | { kind: 'open-now'; side: 'long' | 'short'; price: number }
  | { kind: 'close-now'; side: 'long' | 'short'; pct: number }
  | { kind: 'in-trade'; side: 'long' | 'short'; pct: number; since: number }
  | { kind: 'flat'; lastPct: number | null };

/** Current Signal Composite status for one coin (used by the all-coins scanner). */
export function coinStatus(c: Candle[], symbol: string, btcRegime: Map<number, number> | null, allowShorts: boolean): CoinStatus {
  const p = { ...composite.defaults, shorts: allowShorts ? 1 : 0, shortGate: 1 };
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
