// Entry, stop and target prices for a trade or a signal that opens at the next bar, shared by the chart and table.
import { GOLD, isGold } from './composite.js';
import type { Grade } from './grade.js';
import type { Side, Trade } from './types.js';

export interface TradePlan {
  status: 'opening' | 'open' | 'closed';
  side: Side;
  grade?: Grade;
  gold: boolean;
  entryTime: number; // bar open time of the entry (for 'opening': the next bar)
  entry: number;
  stop: number; // initial stop
  stopNow: number; // after the +2R add the stop sits at the entry
  r1: number; // +1R reference level
  r2: number; // +2R: add ½ and move the stop to the entry
  r3: number; // +3R reference level
  goldTp?: number; // gold take-profit
  closeBy?: number; // gold time limit (unix seconds)
  added: boolean;
  exit?: number;
  exitTime?: number;
  exitReason?: Trade['exitReason'];
  resultPct?: number;
}

export interface PlanInput {
  side: Side;
  entry: number;
  entryTime: number;
  atr: number; // ATR on the signal candle
  stopAtr: number;
  barSec: number;
  interval: string;
  grade?: Grade;
  trade?: Trade; // absent for a signal that opens at the next bar
  breakevenAfterAdd?: boolean;
}

export function makePlan(p: PlanInput): TradePlan {
  const dir = p.side === 'long' ? 1 : -1;
  const r = p.stopAtr * p.atr;
  const gold = isGold(p.interval, p.side, p.grade);
  const t = p.trade;
  const added = !!t?.fills?.some((f) => f.kind === 'add');
  const stop = p.entry - dir * r;
  const closed = !!t && t.exitReason !== 'end';
  return {
    status: !t ? 'opening' : closed ? 'closed' : 'open',
    side: p.side,
    grade: p.grade,
    gold,
    entryTime: p.entryTime,
    entry: p.entry,
    stop,
    stopNow: added && p.breakevenAfterAdd ? p.entry : stop,
    r1: p.entry + dir * r,
    r2: p.entry + dir * 2 * r,
    r3: p.entry + dir * 3 * r,
    goldTp: gold ? p.entry + dir * GOLD.targetAtr * p.atr : undefined,
    closeBy: gold ? p.entryTime + GOLD.maxBars * p.barSec : undefined,
    added,
    ...(closed
      ? { exit: t!.exitPrice, exitTime: t!.exitTime, exitReason: t!.exitReason, resultPct: ((dir * (t!.exitPrice - t!.entryPrice)) / t!.entryPrice) * 100 }
      : {}),
  };
}

/**
 * How a gold bracket played out from its entry bar: take profit, stop (checked first when one bar touches both),
 * closed at the time limit, or still running. Matches research/gold.ts.
 */
export function goldOutcome(
  candles: { high: number; low: number; close: number }[],
  entryIndex: number,
  p: Pick<TradePlan, 'side' | 'entry' | 'stop' | 'goldTp'>,
): { kind: 'tp' | 'stop' | 'time' | 'running'; price: number; pct: number } | undefined {
  if (p.goldTp === undefined) return undefined;
  const dir = p.side === 'long' ? 1 : -1;
  const pct = (x: number) => ((dir * (x - p.entry)) / p.entry) * 100;
  const end = entryIndex + GOLD.maxBars;
  for (let k = entryIndex; k < Math.min(end, candles.length); k++) {
    if (dir === 1 ? candles[k].low <= p.stop : candles[k].high >= p.stop) return { kind: 'stop', price: p.stop, pct: pct(p.stop) };
    if (dir === 1 ? candles[k].high >= p.goldTp : candles[k].low <= p.goldTp) return { kind: 'tp', price: p.goldTp, pct: pct(p.goldTp) };
  }
  if (end > candles.length) return { kind: 'running', price: candles[candles.length - 1].close, pct: pct(candles[candles.length - 1].close) };
  return { kind: 'time', price: candles[end - 1].close, pct: pct(candles[end - 1].close) };
}
