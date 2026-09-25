// Classic indicators as trading rules, for the indicator tournament (research/indicators.ts).
// Every rule is evaluated on closed bars only; shorts mirror longs when `shorts` is 1.
import type { ExitRules } from './backtest';
import { atr, bollinger, highest, lowest, macd } from './indicators';
import { aroon, cci, heikinAshi, hma, ichimoku, kama, keltner, psar, rollingVwap, stochRsi, zigzag } from './indicators2';
import { cols, trendRegime, type Params, type StrategyDef, type StrategyOutput } from './strategies';
import type { Candle, Signal } from './types';

type Bool = (i: number) => boolean;

/** Signals on the first bar each entry condition turns true; exits when the exit condition holds. */
function rule(
  c: Candle[],
  p: Params,
  name: string,
  e: { long: Bool; short: Bool; exitLong: Bool; exitShort: Bool },
  lines: StrategyOutput['lines'] = [],
): StrategyOutput {
  const { high, low, close } = cols(c);
  const signals: Signal[] = [];
  const n = c.length;
  for (let i = 1; i < n; i++) {
    if (e.long(i) && !e.long(i - 1)) signals.push({ index: i, time: c[i].time, side: 'long', score: 1, maxScore: 1, reasons: [name] });
    else if (p.shorts && e.short(i) && !e.short(i - 1)) signals.push({ index: i, time: c[i].time, side: 'short', score: 1, maxScore: 1, reasons: [name] });
  }
  const rules: ExitRules = {
    exitLong: Array.from({ length: n }, (_, i) => e.exitLong(i)),
    exitShort: Array.from({ length: n }, (_, i) => e.exitShort(i)),
  };
  return { signals, atr: atr(high, low, close, 14), rules, risk: { stopAtr: p.stopAtr ?? 3, takeProfitR: 0, trailAtr: 0 }, lines };
}

const ok = (...xs: number[]) => xs.every((x) => !Number.isNaN(x));
const base = { shorts: 0, stopAtr: 3, htf: 0, trendLen: 100 };

export const donchian: StrategyDef = {
  id: 'donchian',
  name: 'Donchian breakout (turtle)',
  description: 'Close above the 20-bar high in an uptrend; exit below the 10-bar low.',
  defaults: { ...base, entryLen: 20, exitLen: 10 },
  grid: {},
  build(c, p) {
    const { high, low, close } = cols(c);
    const hi = highest(high, p.entryLen);
    const lo = lowest(low, p.entryLen);
    const xhi = highest(high, p.exitLen);
    const xlo = lowest(low, p.exitLen);
    const reg = trendRegime(c, close, p.trendLen, p.htf);
    return rule(c, p, 'Donchian breakout', {
      long: (i) => i > 0 && ok(hi[i - 1]) && close[i] > hi[i - 1] && reg[i] === 1,
      short: (i) => i > 0 && ok(lo[i - 1]) && close[i] < lo[i - 1] && reg[i] === -1,
      exitLong: (i) => i > 0 && close[i] < xlo[i - 1],
      exitShort: (i) => i > 0 && close[i] > xhi[i - 1],
    });
  },
};

export const squeeze: StrategyDef = {
  id: 'squeeze',
  name: 'Bollinger/Keltner squeeze breakout',
  description: 'After Bollinger Bands contract inside Keltner Channels, trade the breakout in the trend direction.',
  defaults: { ...base },
  grid: {},
  build(c, p) {
    const { high, low, close } = cols(c);
    const bb = bollinger(close, 20, 2);
    const kc = keltner(high, low, close, 20, 1.5);
    const inSq = (i: number) => bb.upper[i] < kc.upper[i] && bb.lower[i] > kc.lower[i];
    const recentSq = (i: number) => { for (let k = Math.max(0, i - 6); k < i; k++) if (inSq(k)) return true; return false; };
    const reg = trendRegime(c, close, p.trendLen, p.htf);
    return rule(c, p, 'Squeeze breakout', {
      long: (i) => ok(bb.upper[i], kc.upper[i]) && recentSq(i) && close[i] > bb.upper[i] && reg[i] === 1,
      short: (i) => ok(bb.lower[i], kc.lower[i]) && recentSq(i) && close[i] < bb.lower[i] && reg[i] === -1,
      exitLong: (i) => close[i] < bb.mid[i],
      exitShort: (i) => close[i] > bb.mid[i],
    });
  },
};

export const ichimokuTrend: StrategyDef = {
  id: 'ichimoku',
  name: 'Ichimoku cloud trend',
  description: 'Price above the cloud and Tenkan above Kijun; exit on a close below the Kijun.',
  defaults: { ...base },
  grid: {},
  build(c, p) {
    const { high, low, close } = cols(c);
    const ich = ichimoku(high, low);
    const top = (i: number) => Math.max(ich.cloudA[i], ich.cloudB[i]);
    const bot = (i: number) => Math.min(ich.cloudA[i], ich.cloudB[i]);
    return rule(c, p, 'Ichimoku', {
      long: (i) => ok(ich.cloudA[i], ich.cloudB[i], ich.kijun[i]) && close[i] > top(i) && ich.tenkan[i] > ich.kijun[i],
      short: (i) => ok(ich.cloudA[i], ich.cloudB[i], ich.kijun[i]) && close[i] < bot(i) && ich.tenkan[i] < ich.kijun[i],
      exitLong: (i) => close[i] < ich.kijun[i],
      exitShort: (i) => close[i] > ich.kijun[i],
    });
  },
};

export const macdTrend: StrategyDef = {
  id: 'macd',
  name: 'MACD cross (trend-filtered)',
  description: 'MACD crosses above its signal line in an uptrend; exit on the opposite cross.',
  defaults: { ...base },
  grid: {},
  build(c, p) {
    const { close } = cols(c);
    const m = macd(close);
    const reg = trendRegime(c, close, p.trendLen, p.htf);
    return rule(c, p, 'MACD cross', {
      long: (i) => ok(m.line[i], m.signal[i]) && m.line[i] > m.signal[i] && reg[i] === 1,
      short: (i) => ok(m.line[i], m.signal[i]) && m.line[i] < m.signal[i] && reg[i] === -1,
      exitLong: (i) => m.line[i] < m.signal[i],
      exitShort: (i) => m.line[i] > m.signal[i],
    });
  },
};

export const psarTrend: StrategyDef = {
  id: 'psar',
  name: 'Parabolic SAR (trend-filtered)',
  description: 'SAR flips below price in an uptrend; exit when it flips back.',
  defaults: { ...base },
  grid: {},
  build(c, p) {
    const { high, low, close } = cols(c);
    const s = psar(high, low);
    const reg = trendRegime(c, close, p.trendLen, p.htf);
    return rule(c, p, 'Parabolic SAR', {
      long: (i) => s.dir[i] === 1 && reg[i] === 1,
      short: (i) => s.dir[i] === -1 && reg[i] === -1,
      exitLong: (i) => s.dir[i] === -1,
      exitShort: (i) => s.dir[i] === 1,
    });
  },
};

const slopeRule = (id: string, name: string, desc: string, ma: (close: number[]) => number[]): StrategyDef => ({
  id,
  name,
  description: desc,
  defaults: { ...base },
  grid: {},
  build(c, p) {
    const { close } = cols(c);
    const m = ma(close);
    const reg = trendRegime(c, close, p.trendLen, p.htf);
    const up = (i: number) => i > 1 && ok(m[i], m[i - 1]) && m[i] > m[i - 1];
    const dn = (i: number) => i > 1 && ok(m[i], m[i - 1]) && m[i] < m[i - 1];
    return rule(c, p, name, { long: (i) => up(i) && close[i] > m[i] && reg[i] === 1, short: (i) => dn(i) && close[i] < m[i] && reg[i] === -1, exitLong: dn, exitShort: up });
  },
});
export const hmaTrend = slopeRule('hma', 'Hull MA trend', 'Hull MA(55) turns up with price above it in an uptrend; exit when it turns down.', (x) => hma(x, 55));
export const kamaTrend = slopeRule('kama', 'KAMA trend', 'Kaufman adaptive MA turns up with price above it in an uptrend; exit when it turns down.', (x) => kama(x, 10));

export const stochRsiPullback: StrategyDef = {
  id: 'stochrsi',
  name: 'Stochastic RSI pullback',
  description: 'Uptrend + Stochastic RSI crosses up from below 20; exit above 80.',
  defaults: { ...base },
  grid: {},
  build(c, p) {
    const { close } = cols(c);
    const k = stochRsi(close);
    const reg = trendRegime(c, close, p.trendLen, p.htf);
    return rule(c, p, 'Stoch RSI', {
      long: (i) => i > 0 && ok(k[i], k[i - 1]) && k[i - 1] < 20 && k[i] >= 20 && reg[i] === 1,
      short: (i) => i > 0 && ok(k[i], k[i - 1]) && k[i - 1] > 80 && k[i] <= 80 && reg[i] === -1,
      exitLong: (i) => k[i] > 80,
      exitShort: (i) => k[i] < 20,
    });
  },
};

export const cciPullback: StrategyDef = {
  id: 'cci',
  name: 'CCI pullback',
  description: 'Uptrend + CCI(20) crosses back above −100; exit above +100.',
  defaults: { ...base },
  grid: {},
  build(c, p) {
    const { high, low, close } = cols(c);
    const v = cci(high, low, close);
    const reg = trendRegime(c, close, p.trendLen, p.htf);
    return rule(c, p, 'CCI', {
      long: (i) => i > 0 && ok(v[i], v[i - 1]) && v[i - 1] < -100 && v[i] >= -100 && reg[i] === 1,
      short: (i) => i > 0 && ok(v[i], v[i - 1]) && v[i - 1] > 100 && v[i] <= 100 && reg[i] === -1,
      exitLong: (i) => v[i] > 100,
      exitShort: (i) => v[i] < -100,
    });
  },
};

export const aroonTrend: StrategyDef = {
  id: 'aroon',
  name: 'Aroon trend',
  description: 'Aroon Up above 70 and above Aroon Down; exit when Down crosses above Up.',
  defaults: { ...base },
  grid: {},
  build(c, p) {
    const { high, low } = cols(c);
    const a = aroon(high, low);
    return rule(c, p, 'Aroon', {
      long: (i) => ok(a.up[i], a.down[i]) && a.up[i] > 70 && a.up[i] > a.down[i],
      short: (i) => ok(a.up[i], a.down[i]) && a.down[i] > 70 && a.down[i] > a.up[i],
      exitLong: (i) => a.down[i] > a.up[i],
      exitShort: (i) => a.up[i] > a.down[i],
    });
  },
};

export const heikinAshiTrend: StrategyDef = {
  id: 'heikin-ashi',
  name: 'Heikin-Ashi trend',
  description: 'Two green Heikin-Ashi candles in an uptrend; exit on a red one.',
  defaults: { ...base },
  grid: {},
  build(c, p) {
    const { open, high, low, close } = cols(c);
    const ha = heikinAshi(open, high, low, close);
    const green = (i: number) => ha.close[i] > ha.open[i];
    const reg = trendRegime(c, close, p.trendLen, p.htf);
    return rule(c, p, 'Heikin-Ashi', {
      long: (i) => i > 0 && green(i) && green(i - 1) && reg[i] === 1,
      short: (i) => i > 0 && !green(i) && !green(i - 1) && reg[i] === -1,
      exitLong: (i) => !green(i),
      exitShort: (i) => green(i),
    });
  },
};

export const vwapReversion: StrategyDef = {
  id: 'vwap',
  name: 'VWAP band reversion',
  description: 'Uptrend + close below the lower rolling-VWAP band; exit back at VWAP.',
  defaults: { ...base, len: 42 },
  grid: {},
  build(c, p) {
    const { high, low, close } = cols(c);
    const v = rollingVwap(high, low, close, c.map((b) => b.volume), p.len, 2);
    const reg = trendRegime(c, close, p.trendLen, p.htf);
    return rule(c, p, 'VWAP band', {
      long: (i) => ok(v.lower[i]) && close[i] < v.lower[i] && reg[i] === 1,
      short: (i) => ok(v.upper[i]) && close[i] > v.upper[i] && reg[i] === -1,
      exitLong: (i) => close[i] > v.vwap[i],
      exitShort: (i) => close[i] < v.vwap[i],
    });
  },
};

/**
 * Fibonacci retracement bounce. In an up-leg (swing low confirmed, running high since), buy when a bar dips to a
 * retracement level and closes back above it; exit when price retests the high or breaks the swing low.
 * `levels` is the retracement set: the Fibonacci version uses 0.382 / 0.5 / 0.618, the control uses arbitrary ones.
 */
export function fibStrategy(id: string, name: string, levels: number[]): StrategyDef {
  return {
    id,
    name,
    description: `Bounce from ${levels.join(' / ')} retracements of the latest swing, in the trend direction.`,
    defaults: { ...base, swingAtr: 4 },
    grid: {},
    build(c, p) {
      const { high, low, close } = cols(c);
      const z = zigzag(high, low, close, p.swingAtr);
      const reg = trendRegime(c, close, p.trendLen, p.htf);
      const n = c.length;
      const runHigh = new Array<number>(n).fill(NaN);
      const runLow = new Array<number>(n).fill(NaN);
      for (let i = 0; i < n; i++) {
        const newLow = i === 0 || z.lastLow[i] !== z.lastLow[i - 1];
        const newHigh = i === 0 || z.lastHigh[i] !== z.lastHigh[i - 1];
        runHigh[i] = newLow || Number.isNaN(runHigh[i - 1]) ? high[i] : Math.max(runHigh[i - 1], high[i]);
        runLow[i] = newHigh || Number.isNaN(runLow[i - 1]) ? low[i] : Math.min(runLow[i - 1], low[i]);
      }
      const touch = (i: number, dir: 1 | -1) => {
        if (dir === 1) {
          const L = z.lastLow[i];
          const H = runHigh[i - 1];
          if (!ok(L, H) || z.leg[i] !== 1 || H <= L) return false;
          return levels.some((f) => { const r = H - f * (H - L); return low[i] <= r && close[i] > r; });
        }
        const H = z.lastHigh[i];
        const L = runLow[i - 1];
        if (!ok(L, H) || z.leg[i] !== -1 || H <= L) return false;
        return levels.some((f) => { const r = L + f * (H - L); return high[i] >= r && close[i] < r; });
      };
      return rule(c, p, name, {
        long: (i) => i > 0 && reg[i] === 1 && touch(i, 1),
        short: (i) => i > 0 && reg[i] === -1 && touch(i, -1),
        exitLong: (i) => close[i] >= runHigh[i - 1 < 0 ? 0 : i - 1] || close[i] < z.lastLow[i],
        exitShort: (i) => close[i] <= runLow[i - 1 < 0 ? 0 : i - 1] || close[i] > z.lastHigh[i],
      });
    },
  };
}
export const fibPullback = fibStrategy('fib', 'Fibonacci retracement bounce', [0.382, 0.5, 0.618]);
export const fibControl = fibStrategy('fib-control', 'Control: non-Fibonacci levels', [0.45, 0.55, 0.7]);

export const NEW_STRATEGIES: StrategyDef[] = [
  donchian, squeeze, ichimokuTrend, macdTrend, psarTrend, hmaTrend, kamaTrend, stochRsiPullback, cciPullback,
  aroonTrend, heikinAshiTrend, vwapReversion, fibPullback, fibControl,
];
