import type { Candle, RiskParams, Signal, Trade } from './types';

export const defaultRisk: RiskParams = {
  leverage: 5,
  riskPct: 1,
  stopAtr: 2,
  takeProfitR: 3,
  trailAtr: 3,
  feePct: 0.05,
  slippagePct: 0.02,
  maintenanceMarginPct: 0.5,
  fundingPct8h: 0.01,
  startEquity: 10_000,
};

export interface ExitRules {
  /** Close a long/short at the next open when true on a closed bar. */
  exitLong?: boolean[];
  exitShort?: boolean[];
  /** Close after this many bars in the trade (0 = off). */
  maxBars?: number;
  /**
   * Actual perpetual funding per bar (sum of funding rates settled during the bar, as a fraction; NaN = unknown).
   * Longs pay positive funding and shorts receive it. Unknown bars fall back to `fundingPct8h`, always paid.
   */
  funding?: Float64Array;
}

interface Position {
  side: 'long' | 'short';
  entryIndex: number;
  signalIndex: number;
  firstEntry: number;
  avgEntry: number;
  planned: number; // full planned size; R is measured against planned × initial risk
  qty: number;
  stop: number;
  trail: number;
  target: number;
  liq: number;
  riskPerUnit: number;
  extreme: number; // best price since entry, for the trailing stop
  fees: number;
  funding: number;
  realized: number; // P&L banked by scale-outs
  inDone: boolean[];
  addDone: boolean[];
  outDone: boolean[];
  fills: NonNullable<Trade['fills']>;
}

export interface BacktestResult {
  trades: Trade[];
  equity: { time: number; value: number }[];
  /** Decisions made on the final bar's close that would fill at the next open. */
  pending: { exit: boolean; signal: Signal | null };
}

/**
 * Bar-by-bar simulation of a leveraged, isolated-margin futures account.
 *  - Signals confirmed on bar i are filled at the open of bar i+1 (no look-ahead).
 *  - Within a bar: scale-in limits fill first, then the stop is checked, then
 *    scale-outs, pyramid adds, the target and the trailing stop (conservative:
 *    adverse events come before favourable ones).
 *  - A stop placed beyond the liquidation price is pre-empted by liquidation,
 *    which loses the whole position margin.
 */
export function backtest(
  candles: Candle[],
  signals: Signal[],
  atrSeries: number[],
  r: RiskParams,
  rules: ExitRules = {},
): BacktestResult {
  const bySignalBar = new Map(signals.map((s) => [s.index, s]));
  const trades: Trade[] = [];
  const equityCurve: { time: number; value: number }[] = [];
  let equity = r.startEquity;
  let pos: Position | null = null;
  let pending: Signal | null = null;
  const feeRate = r.feePct / 100;
  const slip = r.slippagePct / 100;
  const barSec = candles.length > 1 ? candles[1].time - candles[0].time : 0;
  // Funding is charged to the position holder every bar (conservative: always paid, never received).
  const fundingPerBar = ((r.fundingPct8h ?? 0) / 100) * (barSec / 28_800);
  let pendingExit = false;
  // Backwards compatible single partial take-profit.
  const scaleOut = r.scaleOut ?? (r.partialR ? [{ r: r.partialR, frac: r.partialFrac ?? 0.5 }] : []);
  const breakevenAfterOut = r.breakevenAfterPartial ?? false;
  const mmr = r.maintenanceMarginPct / 100;

  const addQty = (p: Position, i: number, price: number, q: number, kind: 'scale-in' | 'add', fee: number) => {
    p.avgEntry = (p.avgEntry * p.qty + price * q) / (p.qty + q);
    p.qty += q;
    p.fees += q * price * fee;
    const dir = p.side === 'long' ? 1 : -1;
    p.liq = p.avgEntry * (1 - dir * (1 / r.leverage - mmr));
    p.fills.push({ index: i, price, qty: q, kind });
  };

  const close = (i: number, rawPrice: number, reason: Trade['exitReason']) => {
    if (!pos) return;
    const dir = pos.side === 'long' ? 1 : -1;
    let pnl: number;
    let exitPrice: number;
    if (reason === 'liquidation') {
      exitPrice = pos.liq;
      pnl = -(pos.qty * pos.avgEntry) / r.leverage - pos.fees - pos.funding + pos.realized;
    } else {
      exitPrice = rawPrice * (1 - dir * slip);
      const exitFee = pos.qty * exitPrice * feeRate;
      pnl = dir * (exitPrice - pos.avgEntry) * pos.qty - pos.fees - exitFee - pos.funding + pos.realized;
    }
    if (pos.qty > 0) pos.fills.push({ index: i, price: exitPrice, qty: pos.qty, kind: 'exit' });
    equity += pnl;
    trades.push({
      side: pos.side,
      entryIndex: pos.entryIndex,
      entryTime: candles[pos.entryIndex].time,
      entryPrice: pos.firstEntry,
      exitIndex: i,
      exitTime: candles[i].time,
      exitPrice,
      exitReason: reason,
      qty: pos.planned,
      pnl,
      rMultiple: pnl / (pos.riskPerUnit * pos.planned),
      fills: pos.fills.length > 2 ? pos.fills : undefined,
    });
    pos = null;
  };

  for (let i = 0; i < candles.length; i++) {
    const bar = candles[i];

    // 1) Act on decisions made at the previous bar's close, at this bar's open.
    if (pendingExit && pos) close(i, bar.open, 'exit');
    pendingExit = false;
    if (pending) {
      const sig = pending;
      pending = null;
      if (pos && pos.side !== sig.side) close(i, bar.open, 'reverse');
      const a = atrSeries[sig.index];
      if (!pos && equity > 0 && a > 0) {
        const dir: number = sig.side === 'long' ? 1 : -1;
        const entry: number = bar.open * (1 + dir * slip);
        let stopDist = r.stopAtr * a;
        if (r.swingStop) {
          // Just beyond the recent swing extreme, bounded to 1–5 ATR.
          let ext = dir === 1 ? Infinity : -Infinity;
          for (let k = Math.max(0, sig.index - r.swingStop + 1); k <= sig.index; k++)
            ext = dir === 1 ? Math.min(ext, candles[k].low) : Math.max(ext, candles[k].high);
          stopDist = Math.min(5 * a, Math.max(a, dir * (entry - ext) + 0.25 * a));
        }
        const maxQty = (equity * r.leverage) / entry;
        const planned = Math.min((equity * r.riskPct) / 100 / stopDist, maxQty);
        const qty = planned * (r.entryFrac ?? 1);
        pos = {
          side: sig.side,
          entryIndex: i,
          signalIndex: sig.index,
          firstEntry: entry,
          avgEntry: entry,
          planned,
          qty,
          stop: entry - dir * stopDist,
          trail: entry - dir * stopDist,
          target: r.takeProfitR > 0 ? entry + dir * stopDist * r.takeProfitR : NaN,
          liq: entry * (1 - dir * (1 / r.leverage - mmr)),
          riskPerUnit: stopDist,
          extreme: entry,
          fees: qty * entry * feeRate,
          funding: 0,
          realized: 0,
          inDone: (r.scaleIn ?? []).map(() => false),
          addDone: (r.pyramid ?? []).map(() => false),
          outDone: scaleOut.map(() => false),
          fills: [{ index: i, price: entry, qty, kind: 'entry' }],
        };
      }
    }

    // 2) Manage an open position against this bar's range.
    if (pos) {
      const p: Position = pos;
      const f = rules.funding?.[i];
      p.funding +=
        f === undefined || Number.isNaN(f)
          ? p.qty * bar.open * fundingPerBar
          : (p.side === 'long' ? 1 : -1) * p.qty * bar.open * f;
      const long = p.side === 'long';
      const dir = long ? 1 : -1;
      const held = i - p.entryIndex;

      // a) Scale-in limit orders below (long) / above (short) the first entry.
      (r.scaleIn ?? []).forEach((lvl, k) => {
        if (p.inDone[k] || held > lvl.bars) return;
        const px = p.firstEntry - dir * lvl.atr * atrSeries[p.signalIndex];
        if (long ? bar.low <= px : bar.high >= px) {
          addQty(p, i, long ? Math.min(px, bar.open) : Math.max(px, bar.open), p.planned * lvl.frac, 'scale-in', feeRate);
          p.inDone[k] = true;
        }
      });

      const activeStop = long ? Math.max(p.stop, p.trail) : Math.min(p.stop, p.trail);
      const stopIsTrail = activeStop !== p.stop;
      const liqFirst = long ? p.liq >= activeStop : p.liq <= activeStop;
      const adverse = long ? bar.low : bar.high;
      if (liqFirst && (long ? adverse <= p.liq : adverse >= p.liq)) {
        close(i, p.liq, 'liquidation');
      } else if (long ? adverse <= activeStop : adverse >= activeStop) {
        // Gap through the stop fills at the open.
        close(i, long ? Math.min(activeStop, bar.open) : Math.max(activeStop, bar.open), stopIsTrail ? 'trail' : 'stop');
      } else {
        // b) Scale out at profit levels.
        let flat = false;
        scaleOut.forEach((lvl, k) => {
          if (flat || p.outDone[k]) return;
          if (!Number.isNaN(p.target) && lvl.r >= (dir * (p.target - p.firstEntry)) / p.riskPerUnit) return;
          const px = p.firstEntry + dir * p.riskPerUnit * lvl.r;
          if (!(long ? bar.high >= px : bar.low <= px)) return;
          const exitPx = (long ? Math.max(px, bar.open) : Math.min(px, bar.open)) * (1 - dir * slip);
          const q = Math.min(p.qty, p.planned * lvl.frac);
          p.realized += dir * (exitPx - p.avgEntry) * q - q * exitPx * feeRate;
          p.qty -= q;
          p.fills.push({ index: i, price: exitPx, qty: q, kind: 'scale-out' });
          p.outDone[k] = true;
          if (breakevenAfterOut) p.stop = long ? Math.max(p.stop, p.firstEntry) : Math.min(p.stop, p.firstEntry);
          if (p.qty <= p.planned * 1e-9) flat = true;
        });
        if (flat) {
          close(i, bar.close, 'target');
        } else {
          // c) Pyramid: add as the trade proves itself.
          (r.pyramid ?? []).forEach((lvl, k) => {
            if (p.addDone[k]) return;
            const px = p.firstEntry + dir * p.riskPerUnit * lvl.r;
            if (!(long ? bar.high >= px : bar.low <= px)) return;
            addQty(p, i, (long ? Math.max(px, bar.open) : Math.min(px, bar.open)) * (1 + dir * slip), p.planned * lvl.frac, 'add', feeRate);
            p.addDone[k] = true;
            if (r.breakevenAfterAdd) p.stop = long ? Math.max(p.stop, p.firstEntry) : Math.min(p.stop, p.firstEntry);
          });
          if (!Number.isNaN(p.target) && (long ? bar.high >= p.target : bar.low <= p.target)) {
            close(i, long ? Math.max(p.target, bar.open) : Math.min(p.target, bar.open), 'target');
          } else if (r.trailAtr > 0 && atrSeries[i] > 0) {
            p.extreme = long ? Math.max(p.extreme, bar.high) : Math.min(p.extreme, bar.low);
            const t = p.extreme - dir * r.trailAtr * atrSeries[i];
            p.trail = long ? Math.max(p.trail, t) : Math.min(p.trail, t);
          }
        }
      }
    }

    // 3) Queue exits and signals confirmed on this bar's close.
    if (pos) {
      const held = i - pos.entryIndex + 1;
      const exitArr = pos.side === 'long' ? rules.exitLong : rules.exitShort;
      if (exitArr?.[i] || (rules.maxBars && held >= rules.maxBars)) pendingExit = true;
    }
    const sig = bySignalBar.get(i);
    if (sig && (!pos || pos.side !== sig.side)) pending = sig;

    const open = pos as Position | null;
    const mark = open ? (open.side === 'long' ? 1 : -1) * (bar.close - open.avgEntry) * open.qty + open.realized : 0;
    equityCurve.push({ time: bar.time, value: equity + mark });
  }

  const pendingState = { exit: pendingExit, signal: pending as Signal | null };
  if (pos) close(candles.length - 1, candles[candles.length - 1].close, 'end');
  return { trades, equity: equityCurve, pending: pendingState };
}

export interface Stats {
  trades: number;
  winRate: number;
  profitFactor: number;
  netReturnPct: number;
  maxDrawdownPct: number;
  avgR: number;
  liquidations: number;
}

export function summarize(result: BacktestResult, startEquity: number): Stats {
  const { trades, equity } = result;
  const wins = trades.filter((t) => t.pnl > 0);
  const grossWin = wins.reduce((a, t) => a + t.pnl, 0);
  const grossLoss = -trades.filter((t) => t.pnl <= 0).reduce((a, t) => a + t.pnl, 0);
  let peak = startEquity;
  let maxDd = 0;
  for (const p of equity) {
    peak = Math.max(peak, p.value);
    maxDd = Math.max(maxDd, (peak - p.value) / peak);
  }
  const net = trades.reduce((a, t) => a + t.pnl, 0);
  return {
    trades: trades.length,
    winRate: trades.length ? wins.length / trades.length : 0,
    profitFactor: grossLoss > 0 ? grossWin / grossLoss : grossWin > 0 ? Infinity : 0,
    netReturnPct: (net / startEquity) * 100,
    maxDrawdownPct: maxDd * 100,
    avgR: trades.length ? trades.reduce((a, t) => a + t.rMultiple, 0) / trades.length : 0,
    liquidations: trades.filter((t) => t.exitReason === 'liquidation').length,
  };
}
