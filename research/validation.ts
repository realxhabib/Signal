// Validation protocol from round 6 on.
//
// 1. The locked final year (HOLDOUT_START in account.ts) has been looked at several times, so it is no longer a
//    clean exam. From now on research picks use the research years only; the locked year is a one-time second
//    opinion per finalist.
// 2. The real exam is forward data: the shipped rules were frozen on FORWARD_START and research/forward.ts scores
//    only what happened after it (signals never repaint, so the forward record can be rebuilt at any time; the
//    alert server can also log what it actually sent).
// 3. Every configuration tried is recorded in trials.json, and final picks are judged with the Deflated Sharpe
//    Ratio against the number of trials so far (Bailey & López de Prado, 2014).
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export const FORWARD_START = Date.UTC(2026, 8, 25) / 1000;

const FILE = join(import.meta.dirname, 'trials.json');
interface Trial { round: number; name: string; sharpe: number; days: number }

/** Daily returns → annualised Sharpe. */
export function sharpeOf(daily: number[]) {
  const m = daily.reduce((a, r) => a + r, 0) / daily.length;
  const sd = Math.sqrt(daily.reduce((a, r) => a + (r - m) ** 2, 0) / daily.length);
  return sd ? (m / sd) * Math.sqrt(365) : 0;
}

/** Record a configuration that was tried (same name in the same round overwrites). */
export function recordTrial(round: number, name: string, daily: number[]) {
  const all: Trial[] = existsSync(FILE) ? JSON.parse(readFileSync(FILE, 'utf8')) : [];
  const t = { round, name, sharpe: +sharpeOf(daily).toFixed(4), days: daily.length };
  const k = all.findIndex((x) => x.round === round && x.name === name);
  if (k >= 0) all[k] = t;
  else all.push(t);
  writeFileSync(FILE, JSON.stringify(all, null, 1) + '\n');
}

export const trials = (): Trial[] => (existsSync(FILE) ? JSON.parse(readFileSync(FILE, 'utf8')) : []);

// Inverse normal CDF (Acklam) and normal CDF.
export function invN(p: number) {
  const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239];
  const b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572];
  const c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416];
  const lo = 0.02425;
  if (p < lo || p > 1 - lo) {
    const q = Math.sqrt(-2 * Math.log(p < lo ? p : 1 - p));
    const v = (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
    return p < lo ? v : -v;
  }
  const r = p - 0.5;
  const s = r * r;
  return ((((((a[0] * s + a[1]) * s + a[2]) * s + a[3]) * s + a[4]) * s + a[5]) * r) / (((((b[0] * s + b[1]) * s + b[2]) * s + b[3]) * s + b[4]) * s + 1);
}
export const normCdf = (z: number) => 0.5 * (1 + Math.sign(z) * Math.sqrt(1 - Math.exp((-2 * z * z) / Math.PI)));

/**
 * Probability that a strategy's true Sharpe is above zero (PSR) and above the best Sharpe expected from luck
 * among `nTrials` tries whose Sharpes vary like `trialSharpes` (DSR). Sharpes are annualised from daily returns.
 */
export function deflatedSharpe(daily: number[], trialSharpes: number[], nTrials = trialSharpes.length) {
  const T = daily.length;
  const mu = daily.reduce((a, v) => a + v, 0) / T;
  const sd = Math.sqrt(daily.reduce((a, v) => a + (v - mu) ** 2, 0) / T);
  const sr = mu / sd; // per day
  const skew = daily.reduce((a, v) => a + ((v - mu) / sd) ** 3, 0) / T;
  const kurt = daily.reduce((a, v) => a + ((v - mu) / sd) ** 4, 0) / T;
  const denom = Math.sqrt(1 - skew * sr + ((kurt - 1) / 4) * sr * sr);
  const perDay = trialSharpes.map((s) => s / Math.sqrt(365));
  const m = perDay.reduce((a, v) => a + v, 0) / Math.max(1, perDay.length);
  const v = perDay.reduce((a, x) => a + (x - m) ** 2, 0) / Math.max(1, perDay.length);
  const g = 0.5772156649;
  const n = Math.max(2, nTrials);
  const sr0 = Math.sqrt(v) * ((1 - g) * invN(1 - 1 / n) + g * invN(1 - 1 / (n * Math.E)));
  return {
    sharpe: sr * Math.sqrt(365),
    psr: normCdf((sr * Math.sqrt(T - 1)) / denom),
    dsr: normCdf(((sr - sr0) * Math.sqrt(T - 1)) / denom),
    luckSharpe: sr0 * Math.sqrt(365),
    nTrials: n,
  };
}
