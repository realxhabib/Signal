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
  startEquity: 10_000,
};

interface Position {
  side: 'long' | 'short';
  entryIndex: number;
  entryPrice: number;
  qty: number;
  stop: number;
  trail: number;
  target: number;
  liq: number;
  riskPerUnit: number;
  extreme: number; // best price since entry, for the trailing stop
  entryFee: number;
}

export interface BacktestResult {
  trades: Trade[];
  equity: { time: number; value: number }[];
}

/**
 * Bar-by-bar simulation of a leveraged, isolated-margin futures account.
 *  - Signals confirmed on bar i are filled at the open of bar i+1 (no look-ahead).
 *  - When stop and target are both touched inside one bar, the stop is assumed
 *    to fill first (conservative).
 *  - A stop placed beyond the liquidation price is pre-empted by liquidation,
 *    which loses the whole position margin.
 */
export function backtest(candles: Candle[], signals: Signal[], atrSeries: number[], r: RiskParams): BacktestResult {
  const bySignalBar = new Map(signals.map((s) => [s.index, s]));
  const trades: Trade[] = [];
  const equityCurve: { time: number; value: number }[] = [];
  let equity = r.startEquity;
  let pos: Position | null = null;
  let pending: Signal | null = null;
  const feeRate = r.feePct / 100;
  const slip = r.slippagePct / 100;

  const close = (i: number, rawPrice: number, reason: Trade['exitReason']) => {
    if (!pos) return;
    const dir = pos.side === 'long' ? 1 : -1;
    let pnl: number;
    let exitPrice: number;
    if (reason === 'liquidation') {
      exitPrice = pos.liq;
      pnl = -(pos.qty * pos.entryPrice) / r.leverage - pos.entryFee;
    } else {
      exitPrice = rawPrice * (1 - dir * slip);
      const exitFee = pos.qty * exitPrice * feeRate;
      pnl = dir * (exitPrice - pos.entryPrice) * pos.qty - pos.entryFee - exitFee;
    }
    equity += pnl;
    trades.push({
      side: pos.side,
      entryIndex: pos.entryIndex,
      entryTime: candles[pos.entryIndex].time,
      entryPrice: pos.entryPrice,
      exitIndex: i,
      exitTime: candles[i].time,
      exitPrice,
      exitReason: reason,
      qty: pos.qty,
      pnl,
      rMultiple: pnl / (pos.riskPerUnit * pos.qty),
    });
    pos = null;
  };

  for (let i = 0; i < candles.length; i++) {
    const bar = candles[i];

    // 1) Fill a signal confirmed on the previous bar at this bar's open.
    if (pending) {
      const sig = pending;
      pending = null;
      if (pos && pos.side !== sig.side) close(i, bar.open, 'reverse');
      const a = atrSeries[sig.index];
      if (!pos && equity > 0 && a > 0) {
        const dir: number = sig.side === 'long' ? 1 : -1;
        const entry: number = bar.open * (1 + dir * slip);
        const stopDist = r.stopAtr * a;
        const maxQty = (equity * r.leverage) / entry;
        const qty = Math.min((equity * r.riskPct) / 100 / stopDist, maxQty);
        const mmr = r.maintenanceMarginPct / 100;
        pos = {
          side: sig.side,
          entryIndex: i,
          entryPrice: entry,
          qty,
          stop: entry - dir * stopDist,
          trail: entry - dir * stopDist,
          target: r.takeProfitR > 0 ? entry + dir * stopDist * r.takeProfitR : NaN,
          liq: entry * (1 - dir * (1 / r.leverage - mmr)),
          riskPerUnit: stopDist,
          extreme: entry,
          entryFee: qty * entry * feeRate,
        };
      }
    }

    // 2) Manage an open position against this bar's range.
    if (pos) {
      const long = pos.side === 'long';
      const activeStop = long ? Math.max(pos.stop, pos.trail) : Math.min(pos.stop, pos.trail);
      const stopIsTrail = activeStop !== pos.stop;
      const liqFirst = long ? pos.liq >= activeStop : pos.liq <= activeStop;
      const adverse = long ? bar.low : bar.high;
      if (liqFirst && (long ? adverse <= pos.liq : adverse >= pos.liq)) {
        close(i, pos.liq, 'liquidation');
      } else if (long ? adverse <= activeStop : adverse >= activeStop) {
        // Gap through the stop fills at the open.
        const fill = long ? Math.min(activeStop, bar.open) : Math.max(activeStop, bar.open);
        close(i, fill, stopIsTrail ? 'trail' : 'stop');
      } else if (!Number.isNaN(pos.target) && (long ? bar.high >= pos.target : bar.low <= pos.target)) {
        const fill = long ? Math.max(pos.target, bar.open) : Math.min(pos.target, bar.open);
        close(i, fill, 'target');
      } else if (r.trailAtr > 0 && atrSeries[i] > 0) {
        pos.extreme = long ? Math.max(pos.extreme, bar.high) : Math.min(pos.extreme, bar.low);
        const t = pos.extreme - (long ? 1 : -1) * r.trailAtr * atrSeries[i];
        pos.trail = long ? Math.max(pos.trail, t) : Math.min(pos.trail, t);
      }
    }

    // 3) Queue any signal confirmed on this bar's close.
    const sig = bySignalBar.get(i);
    if (sig && (!pos || pos.side !== sig.side)) pending = sig;

    const open = pos as Position | null;
    const mark = open ? (open.side === 'long' ? 1 : -1) * (bar.close - open.entryPrice) * open.qty : 0;
    equityCurve.push({ time: bar.time, value: equity + mark });
  }

  if (pos) close(candles.length - 1, candles[candles.length - 1].close, 'end');
  return { trades, equity: equityCurve };
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
