// Pattern-library features, shared by the research (research/patterns.ts), the app and the alert server so they
// all compute exactly the same numbers. For one coin at one 4h bar: its last 24 bars' path in volatility units
// (every 2 bars), Bitcoin's path, a volume ratio, the bar's range, the distance from its 42-bar high and low, and
// its volatility regime. Everything uses bars up to and including t only.

/** Coins aligned on a common 4h timeline (NaN where a coin has no bar). */
export interface Panel { syms: string[]; times: number[]; close: Float64Array[]; volume: Float64Array[]; high: Float64Array[]; low: Float64Array[] }

export const PATTERN_L = 24;
export const PATTERN_STEP = 2;

const logRet1 = (c: Float64Array, t: number) => (t >= 1 && c[t] > 0 && c[t - 1] > 0 ? Math.log(c[t] / c[t - 1]) : NaN);

/** Rolling std of 1-bar log returns over the previous `n` bars (causal). */
export function rollVol(c: Float64Array, n = 100) {
  const out = new Float64Array(c.length).fill(NaN);
  let s = 0, s2 = 0, k = 0;
  const r = Float64Array.from(c, (_, t) => logRet1(c, t));
  for (let t = 1; t < c.length; t++) {
    if (Number.isFinite(r[t])) { s += r[t]; s2 += r[t] ** 2; k++; }
    if (t > n && Number.isFinite(r[t - n])) { s -= r[t - n]; s2 -= r[t - n] ** 2; k--; }
    if (k > n / 2) out[t] = Math.sqrt(Math.max(1e-12, s2 / k - (s / k) ** 2));
  }
  return out;
}

export function featureNames(L = PATTERN_L, step = PATTERN_STEP) {
  const names: string[] = [];
  for (let j = step; j <= L; j += step) names.push(`path-${j}`);
  for (let j = step * 2; j <= L; j += step * 2) names.push(`btc-${j}`);
  names.push('volume ratio', 'range', 'dist 42-bar high', 'dist 42-bar low', 'vol regime');
  return names;
}

/** Feature vector for coin `s` at bar `t`, or null if any input is missing. `vols` = rollVol of every coin. */
export function featuresAt(p: Panel, vols: Float64Array[], s: number, t: number, L = PATTERN_L, step = PATTERN_STEP): number[] | null {
  const btc = p.syms.indexOf('BTCUSDT');
  const c = p.close[s];
  const v = vols[s][t];
  if (t < Math.max(L, 120) || !(v > 0) || !Number.isFinite(c[t - L])) return null;
  const x: number[] = [];
  for (let j = step; j <= L; j += step) x.push(Math.log(c[t] / c[t - j]) / (v * Math.sqrt(j)));
  const vb = vols[btc][t];
  for (let j = step * 2; j <= L; j += step * 2) x.push(Math.log(p.close[btc][t] / p.close[btc][t - j]) / (vb * Math.sqrt(j)));
  let v6 = 0, v100 = 0, hi = -Infinity, lo = Infinity;
  for (let k = t - 99; k <= t; k++) {
    v100 += p.volume[s][k] || 0;
    if (k > t - 6) v6 += p.volume[s][k] || 0;
    if (k > t - 42) { hi = Math.max(hi, p.high[s][k]); lo = Math.min(lo, p.low[s][k]); }
  }
  x.push(Math.log((v6 / 6 + 1e-9) / (v100 / 100 + 1e-9)));
  x.push(Math.log(p.high[s][t] / p.low[s][t]) / v);
  x.push(Math.log(hi / c[t]) / (v * Math.sqrt(42)));
  x.push(Math.log(c[t] / lo) / (v * Math.sqrt(42)));
  x.push(Math.log(v / (vols[s][t - 100] || v)));
  return x.every((z) => Number.isFinite(z)) ? x : null;
}

/** Market-neutral weights (sum 0, gross 1) from scores across coins; null when every score is equal. */
export function neutralWeights(scores: (number | null)[]): number[] | null {
  const valid = scores.filter((v): v is number => v !== null);
  if (valid.length < 5) return null;
  const m = valid.reduce((a, v) => a + v, 0) / valid.length;
  const g = valid.reduce((a, v) => a + Math.abs(v - m), 0);
  if (!g) return null;
  return scores.map((v) => (v === null ? 0 : (v - m) / g));
}
