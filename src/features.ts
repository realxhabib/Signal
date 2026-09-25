// Causal feature engine: every value at bar i uses only bars <= i.
// Features are discretised into named conditions ("rsi2<10", "moon:full", ...)
// so they can be mined for high-win-rate combinations and explained on the chart.
import { atr, bollinger, ema, higherTimeframe, rsi, sma, supertrend } from './indicators.js';
import type { Candle } from './types.js';

const SYNODIC_DAYS = 29.530588853;
const KNOWN_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14) / 1000;

/** Moon age as a fraction of the synodic month: 0 = new, 0.5 = full. */
export function moonAge(unixSec: number): number {
  const days = (unixSec - KNOWN_NEW_MOON) / 86_400;
  const f = (days / SYNODIC_DAYS) % 1;
  return f < 0 ? f + 1 : f;
}

export const MOON_PHASES = [
  'new',
  'waxing-crescent',
  'first-quarter',
  'waxing-gibbous',
  'full',
  'waning-gibbous',
  'last-quarter',
  'waning-crescent',
] as const;

export function moonPhase(unixSec: number): (typeof MOON_PHASES)[number] {
  return MOON_PHASES[Math.floor(((moonAge(unixSec) + 1 / 16) % 1) * 8)];
}

/** Rolling percentile rank (0..1) of src[i] among the previous `len` values. */
function pctRank(src: number[], len: number): number[] {
  return src.map((v, i) => {
    if (Number.isNaN(v) || i < len) return NaN;
    let below = 0;
    let n = 0;
    for (let j = i - len; j < i; j++) {
      if (Number.isNaN(src[j])) continue;
      n++;
      if (src[j] < v) below++;
    }
    return n ? below / n : NaN;
  });
}

function rolling(src: number[], len: number, fn: (w: number[]) => number): number[] {
  return src.map((_, i) => (i < len ? NaN : fn(src.slice(i - len + 1, i + 1))));
}

const mean = (w: number[]) => w.reduce((a, v) => a + v, 0) / w.length;
const std = (w: number[]) => {
  const m = mean(w);
  return Math.sqrt(w.reduce((a, v) => a + (v - m) ** 2, 0) / w.length);
};

export interface FeatureSet {
  /** condition name -> boolean per bar */
  conditions: Map<string, Uint8Array>;
  regime: Int8Array; // 1 bull, -1 bear, 0 neutral
  atr: number[];
}

export function computeFeatures(c: Candle[]): FeatureSet {
  const n = c.length;
  const close = c.map((b) => b.close);
  const high = c.map((b) => b.high);
  const low = c.map((b) => b.low);
  const vol = c.map((b) => b.volume);
  const time = c.map((b) => b.time);
  const barSec = n > 1 ? time[1] - time[0] : 86_400;
  const ret = close.map((v, i) => (i ? Math.log(v / close[i - 1]) : 0));

  const conds = new Map<string, Uint8Array>();
  const add = (name: string, pred: (i: number) => boolean) => {
    const a = new Uint8Array(n);
    for (let i = 0; i < n; i++) a[i] = pred(i) ? 1 : 0;
    conds.set(name, a);
  };
  const buckets = (prefix: string, vals: number[], edges: number[], labels: string[]) => {
    labels.forEach((label, k) =>
      add(`${prefix}:${label}`, (i) => {
        const v = vals[i];
        if (Number.isNaN(v)) return false;
        const lo = k === 0 ? -Infinity : edges[k - 1];
        const hi = k === labels.length - 1 ? Infinity : edges[k];
        return v >= lo && v < hi;
      }),
    );
  };
  const quintiles = (prefix: string, rank: number[]) =>
    buckets(prefix, rank, [0.2, 0.4, 0.6, 0.8], ['q1-lowest', 'q2', 'q3', 'q4', 'q5-highest']);

  // --- Regime: bullish / bearish trend structure -------------------------------
  const e50 = ema(close, 50);
  const e200 = ema(close, 200);
  const regime = new Int8Array(n);
  for (let i = 20; i < n; i++) {
    if (Number.isNaN(e200[i])) continue;
    const rising = e200[i] > e200[i - 20];
    if (close[i] > e50[i] && e50[i] > e200[i] && rising) regime[i] = 1;
    else if (close[i] < e50[i] && e50[i] < e200[i] && !rising) regime[i] = -1;
  }
  add('regime:bull', (i) => regime[i] === 1);
  add('regime:bear', (i) => regime[i] === -1);
  add('regime:neutral', (i) => regime[i] === 0 && !Number.isNaN(e200[i]));
  if (barSec < 86_400) {
    const d50 = higherTimeframe(time, barSec, 86_400, close, (x) => ema(x, 50));
    const d200 = higherTimeframe(time, barSec, 86_400, close, (x) => ema(x, 200));
    add('daily:bull', (i) => close[i] > d50[i] && d50[i] > d200[i]);
    add('daily:bear', (i) => close[i] < d50[i] && d50[i] < d200[i]);
  }
  const st = supertrend(high, low, close, 14, 3);
  add('supertrend:up', (i) => st.dir[i] === 1);
  add('supertrend:down', (i) => st.dir[i] === -1);

  // --- Momentum / mean reversion ------------------------------------------------
  const r2 = rsi(close, 2);
  const r14 = rsi(close, 14);
  buckets('rsi2', r2, [10, 30, 70, 90], ['<10', '10-30', '30-70', '70-90', '>90']);
  buckets('rsi14', r14, [30, 45, 55, 70], ['<30', '30-45', '45-55', '55-70', '>70']);
  const m20 = sma(close, 20);
  const sd20 = rolling(close, 20, std);
  const z = close.map((v, i) => (v - m20[i]) / sd20[i]);
  buckets('zscore20', z, [-2, -1, 1, 2], ['<-2', '-2..-1', '-1..1', '1..2', '>2']);
  const mom = close.map((v, i) => (i >= 20 ? v / close[i - 20] - 1 : NaN));
  quintiles('momentum20', pctRank(mom, 500));
  const hi90 = rolling(high, 90, (w) => Math.max(...w));
  quintiles('drawdown90', pctRank(close.map((v, i) => v / hi90[i] - 1), 500));
  let streak = 0;
  const downStreak = close.map((v, i) => (streak = i && v < close[i - 1] ? streak + 1 : 0));
  buckets('down-closes', downStreak, [1, 3], ['0', '1-2', '3+']);
  let ustreak = 0;
  const upStreak = close.map((v, i) => (ustreak = i && v > close[i - 1] ? ustreak + 1 : 0));
  buckets('up-closes', upStreak, [1, 3], ['0', '1-2', '3+']);

  // --- Quant: volatility, persistence, distribution -----------------------------
  const rv = rolling(ret, 20, std);
  quintiles('volatility', pctRank(rv, 500));
  const bb = bollinger(close, 20, 2);
  quintiles('bb-width', pctRank(bb.upper.map((u, i) => (u - bb.lower[i]) / bb.mid[i]), 500));
  // Variance ratio VR(4): >1 trending (persistent), <1 mean-reverting.
  const r4 = close.map((v, i) => (i >= 4 ? Math.log(v / close[i - 4]) : NaN));
  const vr = ret.map((_, i) => {
    if (i < 104) return NaN;
    const v1 = std(ret.slice(i - 99, i + 1)) ** 2;
    const v4 = std(r4.slice(i - 99, i + 1)) ** 2;
    return v1 > 0 ? v4 / (4 * v1) : NaN;
  });
  buckets('variance-ratio', vr, [0.85, 1.15], ['mean-reverting', 'random', 'trending']);
  // Kaufman efficiency ratio: net move / path length.
  const er = close.map((v, i) => {
    if (i < 20) return NaN;
    let path = 0;
    for (let j = i - 19; j <= i; j++) path += Math.abs(close[j] - close[j - 1]);
    return path ? Math.abs(v - close[i - 20]) / path : 0;
  });
  buckets('efficiency', er, [0.2, 0.4], ['choppy', 'mixed', 'directional']);
  const skew = rolling(ret, 50, (w) => {
    const m = mean(w);
    const s = std(w);
    return s ? w.reduce((a, v) => a + ((v - m) / s) ** 3, 0) / w.length : 0;
  });
  buckets('skew50', skew, [-0.5, 0.5], ['negative', 'neutral', 'positive']);
  const ac1 = rolling(ret, 50, (w) => {
    const m = mean(w);
    let num = 0;
    let den = 0;
    for (let k = 0; k < w.length; k++) {
      den += (w[k] - m) ** 2;
      if (k) num += (w[k] - m) * (w[k - 1] - m);
    }
    return den ? num / den : 0;
  });
  buckets('autocorr', ac1, [-0.1, 0.1], ['negative', 'neutral', 'positive']);
  const vm = sma(vol, 20);
  const vsd = rolling(vol, 20, std);
  buckets('volume-z', vol.map((v, i) => (v - vm[i]) / vsd[i]), [-1, 1, 2], ['<-1', '-1..1', '1..2', '>2']);
  add('candle:close-top-third', (i) => (close[i] - low[i]) / (high[i] - low[i] || 1) > 0.66);
  add('candle:close-bottom-third', (i) => (close[i] - low[i]) / (high[i] - low[i] || 1) < 0.33);

  // --- Calendar and moon -----------------------------------------------------------
  const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  // Use the bar's close time: that is when the signal is known.
  DAYS.forEach((d, k) => add(`day:${d}`, (i) => new Date((time[i] + barSec - 1) * 1000).getUTCDay() === k));
  if (barSec < 86_400) {
    const hour = (i: number) => new Date((time[i] + barSec) * 1000).getUTCHours();
    add('session:asia', (i) => hour(i) < 8);
    add('session:europe', (i) => hour(i) >= 8 && hour(i) < 16);
    add('session:us', (i) => hour(i) >= 16);
  }
  for (const p of MOON_PHASES) add(`moon:${p}`, (i) => moonPhase(time[i] + barSec) === p);
  add('moon:waxing', (i) => moonAge(time[i] + barSec) < 0.5);
  add('moon:waning', (i) => moonAge(time[i] + barSec) >= 0.5);

  return { conditions: conds, regime, atr: atr(high, low, close, 14) };
}
