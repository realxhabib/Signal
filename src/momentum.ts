import type { Candle } from './types';

/**
 * Market-neutral momentum sleeve (research/sleeves.ts, RESULTS-round5.md): once a week, long the 4 coins
 * with the strongest return over LOOKBACK days and short the 4 weakest, equal dollars on each side.
 * The lookback is the latest blind walk-forward pick. Suggested size: 20% of the account.
 */
export const MOMENTUM = { lookbackDays: 14, perSide: 4, share: 0.2 };

export interface MomentumPicks {
  asOf: number; // Monday 00:00 UTC the ranking refers to
  longs: { symbol: string; ret: number }[];
  shorts: { symbol: string; ret: number }[];
}

/** Monday 00:00 UTC on or before `t` (unix seconds). */
export function lastMonday(t: number): number {
  const d = new Date(t * 1000);
  const day = (d.getUTCDay() + 6) % 7; // Monday = 0
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - day) / 1000;
}

/**
 * Rank on daily closes known at `asOf`, skipping the most recent day (as in the research):
 * return from the close LOOKBACK+1 days before asOf to the close 1 day before asOf.
 */
export function momentumPicks(daily: Map<string, Candle[]>, asOf: number, cfg = MOMENTUM): MomentumPicks | null {
  const ranked: { symbol: string; ret: number }[] = [];
  for (const [symbol, c] of daily) {
    const closed = c.filter((b) => b.time + 86_400 <= asOf);
    const n = closed.length;
    if (n < cfg.lookbackDays + 2) continue;
    ranked.push({ symbol, ret: closed[n - 2].close / closed[n - 2 - cfg.lookbackDays].close - 1 });
  }
  if (ranked.length < cfg.perSide * 2) return null;
  ranked.sort((a, b) => b.ret - a.ret);
  return { asOf, longs: ranked.slice(0, cfg.perSide), shorts: ranked.slice(-cfg.perSide).reverse() };
}
