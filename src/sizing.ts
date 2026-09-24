/**
 * Highest isolated-margin leverage whose liquidation price stays beyond the stop. Liquidation sits roughly
 * (1/leverage − maintenance margin) away from entry, so we need 1/lev − mm > stop distance; a 20% buffer is
 * kept and the result capped at `cap`.
 */
export function safeLeverage(entry: number, stop: number, maintenance = 0.005, cap = 20): number {
  const stopFrac = Math.abs(entry - stop) / entry;
  if (!stopFrac) return 1;
  return Math.max(1, Math.min(cap, Math.floor(0.8 / (stopFrac + maintenance))));
}
