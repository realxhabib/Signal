import { questions } from '../api/jev';
import type { IndicatorSet } from './strategy';
import type { Candle, Side, Signal } from './types';

/**
 * Jev (TypeSafe AI's System One model) is used as a judge on top of the
 * indicator engine: it never sees raw timestamps or absolute prices, only a
 * compact, pre-computed description of market context (Jev is weak at
 * arithmetic, so every number is derived here first). It returns calibrated
 * probabilities which we turn into an approve / veto decision.
 */

export interface JevThresholds {
  minDirectionProb: number; // Jev must pick the signal side with at least this probability
  maxTrapProb: number; // veto if P(false breakout / whipsaw) is above this
}

export const defaultJevThresholds: JevThresholds = { minDirectionProb: 0.55, maxTrapProb: 0.5 };

export interface JevVerdict {
  regime: string;
  regimeProbs: Record<string, number>;
  direction: string;
  directionProbs: Record<string, number>;
  trapProb: number;
  conviction: number; // 0..4 rubric score
  model: string;
}

const pct = (a: number, b: number) => round(((a - b) / b) * 100, 2);
const round = (v: number, d = 1) => Math.round(v * 10 ** d) / 10 ** d;

export function buildState(candles: Candle[], ind: IndicatorSet, sig: Signal, assetLabel: string, timeframe: string) {
  const i = sig.index;
  const c = ind.close;
  const back = (n: number) => Math.max(0, i - n);
  const hi20 = Math.max(...candles.slice(back(19), i + 1).map((b) => b.high));
  const lo20 = Math.min(...candles.slice(back(19), i + 1).map((b) => b.low));
  const atrAvg = ind.atr.slice(back(49), i + 1).filter((v) => !Number.isNaN(v));
  const atrMean = atrAvg.reduce((a, v) => a + v, 0) / atrAvg.length;
  const histNow = ind.macdHist[i];
  const histPrev = ind.macdHist[back(1)];
  const bar = candles[i];
  const range = bar.high - bar.low || 1;
  return {
    market: `${assetLabel} perpetual futures, ${timeframe} candles`,
    proposed_trade: sig.side,
    indicator_confluence: `${sig.score}/${sig.maxScore} filters agree: ${sig.reasons.join(', ')}`,
    trend: {
      price_vs_ema200_pct: pct(c[i], ind.trendEma[i]),
      ema200_change_last_20_bars_pct: pct(ind.trendEma[i], ind.trendEma[back(20)]),
      jurik_fast_vs_slow_spread_pct: pct(ind.jmaFast[i], ind.jmaSlow[i]),
      jurik_fast_change_last_3_bars_pct: pct(ind.jmaFast[i], ind.jmaFast[back(3)]),
    },
    momentum: {
      rsi: round(ind.rsi[i]),
      rsi_5_bars_ago: round(ind.rsi[back(5)]),
      macd_histogram: `${histNow >= 0 ? 'positive' : 'negative'} and ${Math.abs(histNow) >= Math.abs(histPrev) ? 'expanding' : 'contracting'}`,
    },
    trend_strength: {
      adx: round(ind.adx[i]),
      plus_di: round(ind.plusDI[i]),
      minus_di: round(ind.minusDI[i]),
    },
    volatility: {
      atr_pct_of_price: round((ind.atr[i] / c[i]) * 100, 2),
      atr_vs_50_bar_average: round(ind.atr[i] / atrMean, 2),
    },
    volume_vs_20_bar_average: round(ind.volume[i] / ind.volSma[i], 2),
    structure: {
      distance_below_20_bar_high_pct: pct(hi20, c[i]),
      distance_above_20_bar_low_pct: pct(c[i], lo20),
      signal_candle: `${bar.close >= bar.open ? 'bullish' : 'bearish'}, body ${round((Math.abs(bar.close - bar.open) / range) * 100, 0)}% of range, closed in the ${
        (bar.close - bar.low) / range > 0.66 ? 'top' : (bar.close - bar.low) / range < 0.33 ? 'bottom' : 'middle'
      } third`,
    },
    returns_pct: {
      last_bar: pct(c[i], c[back(1)]),
      last_5_bars: pct(c[i], c[back(5)]),
      last_20_bars: pct(c[i], c[back(20)]),
      last_50_bars: pct(c[i], c[back(50)]),
    },
    last_10_bar_returns_pct: Array.from({ length: 10 }, (_, k) => pct(c[i - 9 + k], c[back(10 - k)])),
  };
}

export { questions };

interface JevAnswer {
  type: string;
  noul?: number;
  choice?: string;
  score?: number;
  probabilities?: Record<string, number>;
}

export function parseVerdict(res: { model: string; answers: Record<string, JevAnswer> }): JevVerdict {
  const a = res.answers;
  return {
    regime: a.regime.choice ?? '',
    regimeProbs: a.regime.probabilities ?? {},
    direction: a.direction.choice ?? '',
    directionProbs: a.direction.probabilities ?? {},
    trapProb: a.trap.noul ?? 1,
    conviction: a.conviction.score ?? 0,
    model: res.model,
  };
}

export function approves(v: JevVerdict, side: Side, t: JevThresholds): boolean {
  const against = side === 'long' ? 'trending_down' : 'trending_up';
  return (
    (v.directionProbs[side] ?? 0) >= t.minDirectionProb &&
    v.trapProb <= t.maxTrapProb &&
    v.regime !== against &&
    v.regime !== 'choppy_volatile'
  );
}

const CACHE_VERSION = 'jev-v1';
const cacheKey = (key: string) => `${CACHE_VERSION}:${key}`;

function readCache(key: string): JevVerdict | null {
  try {
    const raw = localStorage.getItem(cacheKey(key));
    return raw ? (JSON.parse(raw) as JevVerdict) : null;
  } catch {
    return null;
  }
}

function writeCache(key: string, v: JevVerdict) {
  try {
    localStorage.setItem(cacheKey(key), JSON.stringify(v));
  } catch {
    /* storage full or unavailable: skip caching */
  }
}

export async function askJev(state: unknown, fetchImpl: typeof fetch = fetch): Promise<JevVerdict> {
  const res = await fetchImpl('/api/jev', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ state }),
  });
  if (!res.ok) throw new Error(`Jev ${res.status}: ${await res.text()}`);
  return parseVerdict(await res.json());
}

/** Judge every signal, with a small concurrency pool and a local cache. */
export async function judgeSignals(
  candles: Candle[],
  ind: IndicatorSet,
  signals: Signal[],
  ctx: { symbol: string; assetLabel: string; interval: string },
  onProgress?: (done: number, total: number) => void,
): Promise<Map<number, JevVerdict>> {
  const out = new Map<number, JevVerdict>();
  let done = 0;
  const queue = [...signals];
  const worker = async () => {
    for (let sig = queue.shift(); sig; sig = queue.shift()) {
      const key = `${ctx.symbol}:${ctx.interval}:${sig.time}:${sig.side}`;
      let v = readCache(key);
      if (!v) {
        v = await askJev(buildState(candles, ind, sig, ctx.assetLabel, ctx.interval));
        writeCache(key, v);
      }
      out.set(sig.index, v);
      onProgress?.(++done, signals.length);
    }
  };
  await Promise.all(Array.from({ length: 4 }, worker));
  return out;
}
