import { adx, atr, ema, jma, macd, rsi, sma } from './indicators';
import type { Candle, Signal, StrategyParams } from './types';

export const defaultStrategy: StrategyParams = {
  jmaFastLen: 9,
  jmaSlowLen: 34,
  jmaPhase: 50,
  jmaPower: 2,
  trendEmaLen: 200,
  rsiLen: 14,
  adxLen: 14,
  adxMin: 20,
  atrLen: 14,
  volLen: 20,
  minScore: 4,
};

export interface IndicatorSet {
  close: number[];
  jmaFast: number[];
  jmaSlow: number[];
  trendEma: number[];
  rsi: number[];
  adx: number[];
  plusDI: number[];
  minusDI: number[];
  macdHist: number[];
  atr: number[];
  volume: number[];
  volSma: number[];
}

export function computeIndicators(candles: Candle[], p: StrategyParams): IndicatorSet {
  const close = candles.map((c) => c.close);
  const high = candles.map((c) => c.high);
  const low = candles.map((c) => c.low);
  const volume = candles.map((c) => c.volume);
  const dmi = adx(high, low, close, p.adxLen);
  return {
    close,
    jmaFast: jma(close, p.jmaFastLen, p.jmaPhase, p.jmaPower),
    jmaSlow: jma(close, p.jmaSlowLen, p.jmaPhase, p.jmaPower),
    trendEma: ema(close, p.trendEmaLen),
    rsi: rsi(close, p.rsiLen),
    adx: dmi.adx,
    plusDI: dmi.plusDI,
    minusDI: dmi.minusDI,
    macdHist: macd(close).hist,
    atr: atr(high, low, close, p.atrLen),
    volume,
    volSma: sma(volume, p.volLen),
  };
}

const MAX_SCORE = 5;

/**
 * Candidate signals from indicator confluence. The trigger is a Jurik MA
 * crossover; five independent filters are then scored and a candidate is
 * emitted only when at least `minScore` pass. Evaluated on closed bars only.
 */
export function generateSignals(candles: Candle[], ind: IndicatorSet, p: StrategyParams): Signal[] {
  const out: Signal[] = [];
  for (let i = 1; i < candles.length; i++) {
    const f = ind.jmaFast[i];
    const s = ind.jmaSlow[i];
    const fPrev = ind.jmaFast[i - 1];
    const sPrev = ind.jmaSlow[i - 1];
    const needed = [f, s, fPrev, sPrev, ind.trendEma[i], ind.rsi[i], ind.adx[i], ind.macdHist[i], ind.atr[i], ind.volSma[i]];
    if (needed.some(Number.isNaN)) continue;

    const crossUp = f > s && fPrev <= sPrev;
    const crossDown = f < s && fPrev >= sPrev;
    if (!crossUp && !crossDown) continue;

    const long = crossUp;
    const reasons: string[] = [];
    const c = ind.close[i];
    if (long ? c > ind.trendEma[i] : c < ind.trendEma[i]) reasons.push(long ? 'Above EMA trend' : 'Below EMA trend');
    if (ind.adx[i] >= p.adxMin && (long ? ind.plusDI[i] > ind.minusDI[i] : ind.minusDI[i] > ind.plusDI[i]))
      reasons.push(`ADX ${ind.adx[i].toFixed(0)} trending`);
    if (long ? ind.rsi[i] >= 45 && ind.rsi[i] <= 72 : ind.rsi[i] >= 28 && ind.rsi[i] <= 55)
      reasons.push(`RSI ${ind.rsi[i].toFixed(0)} in zone`);
    if (long ? ind.macdHist[i] > 0 : ind.macdHist[i] < 0) reasons.push('MACD momentum');
    if (ind.volume[i] > ind.volSma[i]) reasons.push('Volume expansion');

    if (reasons.length >= p.minScore) {
      out.push({
        index: i,
        time: candles[i].time,
        side: long ? 'long' : 'short',
        score: reasons.length,
        maxScore: MAX_SCORE,
        reasons,
      });
    }
  }
  return out;
}
