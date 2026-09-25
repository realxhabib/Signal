// Pattern basket (research round 7, research/RESULTS-round7.md): chart-shape patterns the app learned itself
// (k-means on 24-bar paths, scored by what followed them) set market-neutral weights across all coins. The
// target is the average of the last 18 four-hour signals (3 days), traded once a day at 00:00 UTC.
import { featuresAt, neutralWeights, rollVol, type Panel } from './patternFeatures.js';
import model from './patternModel.json' with { type: 'json' };
import type { Candle } from './types.js';

export const PATTERN_BASKET = { share: 0.1, holdBars: model.holdBars, trainedThrough: model.trainedThrough };
const BAR = 14_400;

/** Align 4h candles of every coin on Bitcoin's timeline. */
export function toPanel(candlesBySym: Map<string, Candle[]>): Panel | null {
  const btc = candlesBySym.get('BTCUSDT');
  if (!btc?.length) return null;
  const times = btc.map((b) => b.time);
  const at = new Map(times.map((t, i) => [t, i]));
  const p: Panel = { syms: [...candlesBySym.keys()], times, close: [], volume: [], high: [], low: [] };
  for (const s of p.syms) {
    const mk = () => new Float64Array(times.length).fill(NaN);
    const c = mk(), v = mk(), h = mk(), l = mk();
    for (const b of candlesBySym.get(s)!) {
      const i = at.get(b.time);
      if (i === undefined) continue;
      c[i] = b.close; v[i] = b.volume; h[i] = b.high; l[i] = b.low;
    }
    p.close.push(c); p.volume.push(v); p.high.push(h); p.low.push(l);
  }
  return p;
}

/** Pattern (cluster) and its learned score for coin `s` at bar `t`. */
function patternAt(p: Panel, vols: Float64Array[], s: number, t: number): { pattern: number; score: number } | null {
  const x = featuresAt(p, vols, s, t);
  if (!x) return null;
  const z = x.map((v, j) => (v - model.mu[j]) / model.sd[j]);
  let best = 0;
  let bd = Infinity;
  model.centroids.forEach((c, k) => {
    let d = 0;
    for (let j = 0; j < c.length; j++) d += (z[j] - c[j]) ** 2;
    if (d < bd) {
      bd = d;
      best = k;
    }
  });
  return { pattern: best, score: model.scores[best] };
}

export interface Basket {
  asOf: number; // close time (unix s) of the 4h bar the target was set on (00:00 UTC)
  next: number; // next rebalance
  rows: { symbol: string; weight: number; pattern: number | null; score: number | null }[];
}

/**
 * Today's target basket: the average of the market-neutral pattern weights over the 18 bars ending at the last
 * 4h bar that closed at 00:00 UTC. Weights are fractions of the sleeve's capital (longs +, shorts −; gross ≤ 1).
 */
export function patternBasket(candlesBySym: Map<string, Candle[]>, now = Date.now() / 1000): Basket | null {
  const p = toPanel(candlesBySym);
  if (!p) return null;
  const vols = p.close.map((c) => rollVol(c));
  // Last bar that closed at 00:00 UTC by `now`.
  let end = -1;
  for (let t = p.times.length - 1; t >= 0; t--)
    if (p.times[t] + BAR <= now && (p.times[t] + BAR) % 86_400 === 0) {
      end = t;
      break;
    }
  if (end < 200) return null;
  const hold = model.holdBars;
  const sum = new Float64Array(p.syms.length);
  for (let t = end - hold + 1; t <= end; t++) {
    const w = neutralWeights(p.syms.map((_, s) => patternAt(p, vols, s, t)?.score ?? null));
    if (w) w.forEach((v, s) => (sum[s] += v / hold));
  }
  const rows = p.syms.map((symbol, s) => {
    const pa = patternAt(p, vols, s, end);
    return { symbol, weight: sum[s], pattern: pa?.pattern ?? null, score: pa?.score ?? null };
  });
  rows.sort((a, b) => b.weight - a.weight);
  const asOf = p.times[end] + BAR;
  return { asOf, next: asOf + 86_400, rows };
}

/** Plain-text basket for Telegram / SMS. */
export function formatBasket(b: Basket, top = 5): string {
  const pct = (w: number) => `${(Math.abs(w) * 100).toFixed(1)}%`;
  const longs = b.rows.filter((r) => r.weight > 0.005).slice(0, top);
  const shorts = b.rows.filter((r) => r.weight < -0.005).slice(-top).reverse();
  return [
    '🧩 PATTERN BASKET · daily rebalance',
    `LONG: ${longs.map((r) => `${r.symbol.replace('USDT', '')} ${pct(r.weight)}`).join(', ') || '—'}`,
    `SHORT: ${shorts.map((r) => `${r.symbol.replace('USDT', '')} ${pct(r.weight)}`).join(', ') || '—'}`,
    `% of the basket's capital (suggested ${PATTERN_BASKET.share * 100}% of the account). Full list in the app. Use limit orders.`,
  ].join('\n');
}
