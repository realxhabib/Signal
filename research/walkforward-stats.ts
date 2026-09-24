import type { Trade } from '../src/types';

export interface Summary {
  n: number;
  win: number;
  pf: number;
  avgR: number;
  totalR: number;
  maxDdR: number;
  worstR: number;
  maxLosingStreak: number;
  liq: number;
}

export function summarizeR(trades: Trade[]): Summary {
  const rs = trades.map((t) => t.rMultiple);
  const wins = rs.filter((r) => r > 0);
  const gw = wins.reduce((a, r) => a + r, 0);
  const gl = -rs.filter((r) => r <= 0).reduce((a, r) => a + r, 0);
  let cum = 0;
  let peak = 0;
  let dd = 0;
  let streak = 0;
  let maxStreak = 0;
  for (const r of rs) {
    cum += r;
    peak = Math.max(peak, cum);
    dd = Math.max(dd, peak - cum);
    streak = r <= 0 ? streak + 1 : 0;
    maxStreak = Math.max(maxStreak, streak);
  }
  return {
    n: rs.length,
    win: rs.length ? wins.length / rs.length : 0,
    pf: gl > 0 ? gw / gl : gw > 0 ? Infinity : 0,
    avgR: rs.length ? cum / rs.length : 0,
    totalR: cum,
    maxDdR: dd,
    worstR: rs.length ? Math.min(...rs) : 0,
    maxLosingStreak: maxStreak,
    liq: trades.filter((t) => t.exitReason === 'liquidation').length,
  };
}

