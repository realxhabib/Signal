import type { ExitRules } from './backtest';
import { atr, bollinger, ema, higherTimeframe, rsi, sma, supertrend } from './indicators';
import { computeIndicators, defaultStrategy, generateSignals } from './strategy';
import type { Candle, RiskParams, Side, Signal } from './types';

export interface StrategyOutput {
  signals: Signal[];
  atr: number[];
  rules: ExitRules;
  risk: Partial<RiskParams>;
  lines: { name: string; color: string; values: number[] }[];
}

export type Params = Record<string, number>;

export interface StrategyDef {
  id: string;
  name: string;
  description: string;
  defaults: Params;
  grid: Record<string, number[]>;
  build(candles: Candle[], p: Params, ctx?: { symbol: string; interval: string }): StrategyOutput;
}

export const cols = (c: Candle[]) => ({
  time: c.map((b) => b.time),
  open: c.map((b) => b.open),
  high: c.map((b) => b.high),
  low: c.map((b) => b.low),
  close: c.map((b) => b.close),
});

const barSeconds = (c: Candle[]) => (c.length > 1 ? c[1].time - c[0].time : 86_400);

/** Trend regime per bar: 1 up, -1 down, 0 none. Uses a same-timeframe EMA plus a daily EMA when intraday. */
export function trendRegime(c: Candle[], close: number[], len: number, useHtf: number): number[] {
  const e = ema(close, len);
  const sec = barSeconds(c);
  const daily =
    useHtf && sec < 86_400 ? higherTimeframe(c.map((b) => b.time), sec, 86_400, close, (x) => ema(x, 50)) : null;
  return close.map((v, i) => {
    if (Number.isNaN(e[i]) || i < 10) return 0;
    const slope = e[i] - e[i - 10];
    const htfUp = !daily || (!Number.isNaN(daily[i]) && v > daily[i]);
    const htfDown = !daily || (!Number.isNaN(daily[i]) && v < daily[i]);
    if (v > e[i] && slope > 0 && htfUp) return 1;
    if (v < e[i] && slope < 0 && htfDown) return -1;
    return 0;
  });
}

const sig = (c: Candle[], i: number, side: Side, reasons: string[]): Signal => ({
  index: i,
  time: c[i].time,
  side,
  score: reasons.length,
  maxScore: reasons.length,
  reasons,
});

/** Buy sharp dips inside an established uptrend (Connors-style RSI(2)); exit on the first bounce. */
export const rsi2Pullback: StrategyDef = {
  id: 'rsi2-pullback',
  name: 'Trend pullback (RSI 2)',
  description: 'Uptrend + deeply oversold 2-period RSI; exits on the bounce above a short average. High win rate by design.',
  defaults: { trendLen: 100, rsiEntry: 10, exitLen: 10, stopAtr: 2, maxBars: 10, shorts: 0, htf: 1 },
  grid: { trendLen: [100, 200], rsiEntry: [5, 10, 15], exitLen: [5, 10], stopAtr: [2, 3, 4], maxBars: [10], shorts: [0, 1], htf: [0, 1] },
  build(c, p) {
    const { high, low, close } = cols(c);
    const r2 = rsi(close, 2);
    const exitMa = sma(close, p.exitLen);
    const regime = trendRegime(c, close, p.trendLen, p.htf);
    const signals: Signal[] = [];
    for (let i = 1; i < c.length; i++) {
      if (Number.isNaN(r2[i])) continue;
      if (regime[i] === 1 && r2[i] < p.rsiEntry && r2[i - 1] >= p.rsiEntry)
        signals.push(sig(c, i, 'long', ['Uptrend', `RSI(2) ${r2[i].toFixed(0)} oversold`]));
      if (p.shorts && regime[i] === -1 && r2[i] > 100 - p.rsiEntry && r2[i - 1] <= 100 - p.rsiEntry)
        signals.push(sig(c, i, 'short', ['Downtrend', `RSI(2) ${r2[i].toFixed(0)} overbought`]));
    }
    return {
      signals,
      atr: atr(high, low, close, 14),
      rules: {
        exitLong: close.map((v, i) => v > exitMa[i]),
        exitShort: close.map((v, i) => v < exitMa[i]),
        maxBars: p.maxBars,
      },
      risk: { stopAtr: p.stopAtr, takeProfitR: 0, trailAtr: 0 },
      lines: [
        { name: `EMA ${p.trendLen}`, color: '#6b7684', values: ema(close, p.trendLen) },
        { name: `SMA ${p.exitLen}`, color: '#f5a623', values: exitMa },
      ],
    };
  },
};

/**
 * "A+" pullback: only trades when several independent oversold readings agree
 * inside a confirmed uptrend (same-timeframe EMA + daily EMA). Fewer trades,
 * aimed at the highest hit rate.
 */
export const stackedPullback: StrategyDef = {
  id: 'stacked-pullback',
  name: 'A+ stacked pullback',
  description: 'Uptrend on two timeframes + RSI(2) washout + close under the lower Bollinger band + stretched below the 20 EMA; exits on the bounce.',
  defaults: { trendLen: 200, rsiEntry: 5, bbMult: 2, stretchAtr: 1.5, exitLen: 5, stopAtr: 3, maxBars: 10 },
  grid: { trendLen: [100, 200], rsiEntry: [5, 10], bbMult: [1.5, 2], stretchAtr: [1, 1.5, 2], exitLen: [3, 5], stopAtr: [2, 3, 4], maxBars: [10] },
  build(c, p) {
    const { high, low, close } = cols(c);
    const r2 = rsi(close, 2);
    const bb = bollinger(close, 20, p.bbMult);
    const e20 = ema(close, 20);
    const a = atr(high, low, close, 14);
    const exitMa = sma(close, p.exitLen);
    const regime = trendRegime(c, close, p.trendLen, 1);
    const signals: Signal[] = [];
    let armed = true;
    for (let i = 1; i < c.length; i++) {
      if ([r2[i], bb.lower[i], e20[i], a[i]].some(Number.isNaN)) continue;
      const setup =
        regime[i] === 1 && r2[i] < p.rsiEntry && close[i] < bb.lower[i] && e20[i] - close[i] > p.stretchAtr * a[i];
      if (setup && armed) {
        signals.push(sig(c, i, 'long', ['Uptrend (2 timeframes)', `RSI(2) ${r2[i].toFixed(0)}`, 'Below lower band', 'Stretched below EMA 20']));
        armed = false;
      }
      if (!setup) armed = true;
    }
    return {
      signals,
      atr: a,
      rules: { exitLong: close.map((v, i) => v > exitMa[i]), maxBars: p.maxBars },
      risk: { stopAtr: p.stopAtr, takeProfitR: 0, trailAtr: 0 },
      lines: [
        { name: `EMA ${p.trendLen}`, color: '#6b7684', values: ema(close, p.trendLen) },
        { name: 'BB lower', color: '#4aa3ff', values: bb.lower },
        { name: `SMA ${p.exitLen}`, color: '#f5a623', values: exitMa },
      ],
    };
  },
};

/** Close below the lower Bollinger band inside an uptrend; exit back at the mid band. */
export const bandReversion: StrategyDef = {
  id: 'band-reversion',
  name: 'Trend band reversion',
  description: 'Uptrend + close outside the lower Bollinger band; exits at the mid band.',
  defaults: { trendLen: 200, bbLen: 20, bbMult: 2, stopAtr: 3, maxBars: 15, shorts: 0, htf: 1 },
  grid: { trendLen: [100, 200], bbLen: [20], bbMult: [2, 2.5], stopAtr: [2, 3, 4], maxBars: [10, 20], shorts: [0, 1], htf: [0, 1] },
  build(c, p) {
    const { high, low, close } = cols(c);
    const bb = bollinger(close, p.bbLen, p.bbMult);
    const regime = trendRegime(c, close, p.trendLen, p.htf);
    const signals: Signal[] = [];
    for (let i = 1; i < c.length; i++) {
      if (Number.isNaN(bb.lower[i])) continue;
      if (regime[i] === 1 && close[i] < bb.lower[i] && close[i - 1] >= bb.lower[i - 1])
        signals.push(sig(c, i, 'long', ['Uptrend', 'Close below lower band']));
      if (p.shorts && regime[i] === -1 && close[i] > bb.upper[i] && close[i - 1] <= bb.upper[i - 1])
        signals.push(sig(c, i, 'short', ['Downtrend', 'Close above upper band']));
    }
    return {
      signals,
      atr: atr(high, low, close, 14),
      rules: {
        exitLong: close.map((v, i) => v > bb.mid[i]),
        exitShort: close.map((v, i) => v < bb.mid[i]),
        maxBars: p.maxBars,
      },
      risk: { stopAtr: p.stopAtr, takeProfitR: 0, trailAtr: 0 },
      lines: [
        { name: 'BB upper', color: '#4aa3ff', values: bb.upper },
        { name: 'BB mid', color: '#6b7684', values: bb.mid },
        { name: 'BB lower', color: '#4aa3ff', values: bb.lower },
      ],
    };
  },
};

/** Pullback entry with a close take-profit and a wider stop: trades win rate for payoff size. */
export const pullbackScalp: StrategyDef = {
  id: 'pullback-scalp',
  name: 'Trend pullback, fixed target',
  description: 'Uptrend + RSI(14) dip; fixed target at a fraction of the stop distance.',
  defaults: { trendLen: 200, rsiEntry: 40, stopAtr: 2, targetR: 0.5, maxBars: 20, shorts: 0, htf: 1 },
  grid: { trendLen: [100, 200], rsiEntry: [35, 40], stopAtr: [1.5, 2, 3], targetR: [0.33, 0.5, 0.75], maxBars: [20], shorts: [0, 1], htf: [0, 1] },
  build(c, p) {
    const { high, low, close } = cols(c);
    const r = rsi(close, 14);
    const regime = trendRegime(c, close, p.trendLen, p.htf);
    const signals: Signal[] = [];
    for (let i = 1; i < c.length; i++) {
      if (Number.isNaN(r[i])) continue;
      if (regime[i] === 1 && r[i] < p.rsiEntry && r[i - 1] >= p.rsiEntry)
        signals.push(sig(c, i, 'long', ['Uptrend', `RSI ${r[i].toFixed(0)} dip`]));
      if (p.shorts && regime[i] === -1 && r[i] > 100 - p.rsiEntry && r[i - 1] <= 100 - p.rsiEntry)
        signals.push(sig(c, i, 'short', ['Downtrend', `RSI ${r[i].toFixed(0)} rip`]));
    }
    return {
      signals,
      atr: atr(high, low, close, 14),
      rules: { maxBars: p.maxBars },
      risk: { stopAtr: p.stopAtr, takeProfitR: p.targetR, trailAtr: 0 },
      lines: [{ name: `EMA ${p.trendLen}`, color: '#6b7684', values: ema(close, p.trendLen) }],
    };
  },
};

/** Supertrend flips in the direction of the higher-timeframe trend; exit on the opposite flip. */
export const supertrendTrend: StrategyDef = {
  id: 'supertrend',
  name: 'Supertrend trend-follow',
  description: 'Supertrend flip aligned with the EMA trend; rides the move until the next flip.',
  defaults: { stLen: 14, stMult: 3, trendLen: 100, stopAtr: 3, shorts: 0, htf: 0 },
  grid: { stLen: [10, 14], stMult: [2, 3, 4], trendLen: [100, 200], stopAtr: [3], shorts: [0, 1], htf: [0, 1] },
  build(c, p) {
    const { high, low, close } = cols(c);
    const st = supertrend(high, low, close, p.stLen, p.stMult);
    const regime = trendRegime(c, close, p.trendLen, p.htf);
    const signals: Signal[] = [];
    for (let i = 1; i < c.length; i++) {
      if (st.dir[i] === 1 && st.dir[i - 1] === -1 && regime[i] === 1)
        signals.push(sig(c, i, 'long', ['Supertrend flip up', 'Uptrend']));
      if (p.shorts && st.dir[i] === -1 && st.dir[i - 1] === 1 && regime[i] === -1)
        signals.push(sig(c, i, 'short', ['Supertrend flip down', 'Downtrend']));
    }
    return {
      signals,
      atr: atr(high, low, close, 14),
      rules: { exitLong: st.dir.map((d) => d === -1), exitShort: st.dir.map((d) => d === 1) },
      risk: { stopAtr: p.stopAtr, takeProfitR: 0, trailAtr: 0 },
      lines: [{ name: 'Supertrend', color: '#f5a623', values: st.line }],
    };
  },
};

/** The original Jurik MA confluence strategy. */
export const jmaConfluence: StrategyDef = {
  id: 'jma-confluence',
  name: 'Jurik MA confluence',
  description: 'Jurik MA crossover scored against trend, ADX, RSI, MACD and volume filters.',
  defaults: { minScore: 4, jmaFastLen: 9, jmaSlowLen: 34 },
  grid: { minScore: [3, 4, 5], jmaFastLen: [7, 9, 14], jmaSlowLen: [34, 55] },
  build(c, p) {
    const sp = { ...defaultStrategy, minScore: p.minScore, jmaFastLen: p.jmaFastLen, jmaSlowLen: p.jmaSlowLen };
    const ind = computeIndicators(c, sp);
    return {
      signals: generateSignals(c, ind, sp),
      atr: ind.atr,
      rules: {},
      risk: { stopAtr: 2, takeProfitR: 3, trailAtr: 3 },
      lines: [
        { name: 'JMA fast', color: '#4aa3ff', values: ind.jmaFast },
        { name: 'JMA slow', color: '#f5a623', values: ind.jmaSlow },
        { name: 'EMA 200', color: '#6b7684', values: ind.trendEma },
      ],
    };
  },
};

export const STRATEGIES: StrategyDef[] = [rsi2Pullback, supertrendTrend, stackedPullback, bandReversion, pullbackScalp, jmaConfluence];

export function expandGrid(grid: Record<string, number[]>): Params[] {
  return Object.entries(grid).reduce<Params[]>(
    (acc, [k, vals]) => acc.flatMap((p) => vals.map((v) => ({ ...p, [k]: v }))),
    [{}],
  );
}
