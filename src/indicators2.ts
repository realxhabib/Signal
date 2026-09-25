// Additional classic indicators for the indicator tournament. All causal: bar i uses bars <= i only.
import { atr, ema, rsi, sma, stdev } from './indicators.js';

export function wma(src: number[], len: number): number[] {
  const den = (len * (len + 1)) / 2;
  return src.map((_, i) => {
    if (i < len - 1) return NaN;
    let s = 0;
    for (let k = 0; k < len; k++) s += src[i - k] * (len - k);
    return s / den;
  });
}

/** Hull moving average. */
export function hma(src: number[], len: number): number[] {
  const half = wma(src, Math.max(1, Math.floor(len / 2)));
  const full = wma(src, len);
  const diff = half.map((v, i) => 2 * v - full[i]);
  const first = diff.findIndex((v) => !Number.isNaN(v));
  const out = new Array<number>(src.length).fill(NaN);
  if (first < 0) return out;
  const h = wma(diff.slice(first), Math.max(1, Math.floor(Math.sqrt(len))));
  h.forEach((v, k) => (out[first + k] = v));
  return out;
}

/** Kaufman adaptive moving average. */
export function kama(src: number[], len = 10, fast = 2, slow = 30): number[] {
  const out = new Array<number>(src.length).fill(NaN);
  const fc = 2 / (fast + 1);
  const sc = 2 / (slow + 1);
  for (let i = len; i < src.length; i++) {
    let vol = 0;
    for (let k = i - len + 1; k <= i; k++) vol += Math.abs(src[k] - src[k - 1]);
    const er = vol ? Math.abs(src[i] - src[i - len]) / vol : 0;
    const a = (er * (fc - sc) + sc) ** 2;
    const prev = Number.isNaN(out[i - 1]) ? src[i - 1] : out[i - 1];
    out[i] = prev + a * (src[i] - prev);
  }
  return out;
}

export function keltner(high: number[], low: number[], close: number[], len = 20, mult = 1.5) {
  const mid = ema(close, len);
  const a = atr(high, low, close, len);
  return { mid, upper: mid.map((m, i) => m + mult * a[i]), lower: mid.map((m, i) => m - mult * a[i]) };
}

/** Ichimoku lines. The cloud at bar i is the span values computed 26 bars earlier (no look-ahead). */
export function ichimoku(high: number[], low: number[], conv = 9, base = 26, spanB = 52, shift = 26) {
  const mid = (len: number) =>
    high.map((_, i) => {
      if (i < len - 1) return NaN;
      let h = -Infinity;
      let l = Infinity;
      for (let k = i - len + 1; k <= i; k++) [h, l] = [Math.max(h, high[k]), Math.min(l, low[k])];
      return (h + l) / 2;
    });
  const tenkan = mid(conv);
  const kijun = mid(base);
  const a = tenkan.map((t, i) => (t + kijun[i]) / 2);
  const b = mid(spanB);
  const lag = (x: number[]) => x.map((_, i) => (i >= shift ? x[i - shift] : NaN));
  return { tenkan, kijun, cloudA: lag(a), cloudB: lag(b) };
}

/** Parabolic SAR; dir 1 = long, -1 = short. */
export function psar(high: number[], low: number[], step = 0.02, max = 0.2) {
  const n = high.length;
  const sar = new Array<number>(n).fill(NaN);
  const dir = new Array<number>(n).fill(NaN);
  if (n < 2) return { sar, dir };
  let d = high[1] > high[0] ? 1 : -1;
  let s = d === 1 ? low[0] : high[0];
  let ep = d === 1 ? high[1] : low[1];
  let af = step;
  for (let i = 1; i < n; i++) {
    s = s + af * (ep - s);
    if (d === 1) {
      s = Math.min(s, low[i - 1], i > 1 ? low[i - 2] : low[i - 1]);
      if (low[i] < s) {
        d = -1;
        s = ep;
        ep = low[i];
        af = step;
      } else if (high[i] > ep) {
        ep = high[i];
        af = Math.min(max, af + step);
      }
    } else {
      s = Math.max(s, high[i - 1], i > 1 ? high[i - 2] : high[i - 1]);
      if (high[i] > s) {
        d = 1;
        s = ep;
        ep = high[i];
        af = step;
      } else if (low[i] < ep) {
        ep = low[i];
        af = Math.min(max, af + step);
      }
    }
    sar[i] = s;
    dir[i] = d;
  }
  return { sar, dir };
}

/** Stochastic RSI %K (smoothed). */
export function stochRsi(close: number[], len = 14, stochLen = 14, smooth = 3): number[] {
  const r = rsi(close, len);
  const raw = r.map((v, i) => {
    if (i < stochLen - 1 || Number.isNaN(v)) return NaN;
    const w = r.slice(i - stochLen + 1, i + 1);
    if (w.some(Number.isNaN)) return NaN;
    const hi = Math.max(...w);
    const lo = Math.min(...w);
    return hi === lo ? 50 : ((v - lo) / (hi - lo)) * 100;
  });
  return sma(raw.map((v) => (Number.isNaN(v) ? 0 : v)), smooth).map((v, i) => (Number.isNaN(raw[i]) ? NaN : v));
}

export function cci(high: number[], low: number[], close: number[], len = 20): number[] {
  const tp = close.map((c, i) => (high[i] + low[i] + c) / 3);
  const m = sma(tp, len);
  return tp.map((v, i) => {
    if (Number.isNaN(m[i])) return NaN;
    let md = 0;
    for (let k = i - len + 1; k <= i; k++) md += Math.abs(tp[k] - m[i]);
    md /= len;
    return md ? (v - m[i]) / (0.015 * md) : 0;
  });
}

export function aroon(high: number[], low: number[], len = 25) {
  const up = high.map((_, i) => {
    if (i < len) return NaN;
    let k = 0;
    for (let j = 1; j <= len; j++) if (high[i - j] > high[i - k]) k = j;
    return ((len - k) / len) * 100;
  });
  const down = low.map((_, i) => {
    if (i < len) return NaN;
    let k = 0;
    for (let j = 1; j <= len; j++) if (low[i - j] < low[i - k]) k = j;
    return ((len - k) / len) * 100;
  });
  return { up, down };
}

export function heikinAshi(open: number[], high: number[], low: number[], close: number[]) {
  const n = close.length;
  const hc = close.map((c, i) => (open[i] + high[i] + low[i] + c) / 4);
  const ho = new Array<number>(n);
  ho[0] = (open[0] + close[0]) / 2;
  for (let i = 1; i < n; i++) ho[i] = (ho[i - 1] + hc[i - 1]) / 2;
  return { open: ho, close: hc };
}

/** Rolling volume-weighted average price with standard-deviation bands. */
export function rollingVwap(high: number[], low: number[], close: number[], volume: number[], len: number, mult = 2) {
  const tp = close.map((c, i) => (high[i] + low[i] + c) / 3);
  const vwap = tp.map((_, i) => {
    if (i < len - 1) return NaN;
    let pv = 0;
    let v = 0;
    for (let k = i - len + 1; k <= i; k++) [pv, v] = [pv + tp[k] * volume[k], v + volume[k]];
    return v ? pv / v : NaN;
  });
  const sd = stdev(tp, len);
  return { vwap, upper: vwap.map((m, i) => m + mult * sd[i]), lower: vwap.map((m, i) => m - mult * sd[i]) };
}

/**
 * Causal zig-zag swings: a swing high/low is only known once price has reversed `mult` × ATR away from it.
 * At bar i, `lastHigh[i]` / `lastLow[i]` are the most recent swing extremes confirmed by bar i, and `leg[i]`
 * is 1 while the latest confirmed swing is a low (price in an up-leg), -1 after a confirmed high.
 */
export function zigzag(high: number[], low: number[], close: number[], mult = 3, atrLen = 14) {
  const n = close.length;
  const a = atr(high, low, close, atrLen);
  const lastHigh = new Array<number>(n).fill(NaN);
  const lastLow = new Array<number>(n).fill(NaN);
  const leg = new Array<number>(n).fill(0);
  let mode = 0; // 1 = tracking a potential high, -1 = tracking a potential low
  let extHigh = high[0];
  let extLow = low[0];
  let confHigh = NaN;
  let confLow = NaN;
  let curLeg = 0;
  for (let i = 0; i < n; i++) {
    const t = a[i];
    if (!Number.isNaN(t)) {
      if (mode >= 0) {
        extHigh = Math.max(extHigh, high[i]);
        if (extHigh - low[i] >= mult * t) {
          confHigh = extHigh;
          curLeg = -1;
          mode = -1;
          extLow = low[i];
        }
      }
      if (mode <= 0) {
        extLow = Math.min(extLow, low[i]);
        if (high[i] - extLow >= mult * t) {
          confLow = extLow;
          curLeg = 1;
          mode = 1;
          extHigh = high[i];
        }
      }
    }
    lastHigh[i] = confHigh;
    lastLow[i] = confLow;
    leg[i] = curLeg;
  }
  return { lastHigh, lastLow, leg };
}
