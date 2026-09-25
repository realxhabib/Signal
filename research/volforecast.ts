// Round 6 · Volatility forecasting for account risk. Bitcoin's daily realised volatility (from 1h returns) is
// forecast with HAR-RV (Corsi 2009: yesterday, last week, last month, in logs) and with GARCH(1,1) on daily
// returns, both refit monthly on past data only. The account's risk per trade is scaled by
// (typical forecast / today's forecast), clipped, so it trades smaller before turbulent days.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { history } from './history';
import { evaluate, header, row } from './round6-lib';

const DAY = 86_400;
const h = await history('BTCUSDT', '1h');
// Daily realised variance and close-to-close return.
const rv = new Map<number, number>();
const close = new Map<number, number>();
for (let i = 1; i < h.length; i++) {
  const d = Math.floor(h[i].time / DAY) * DAY;
  rv.set(d, (rv.get(d) ?? 0) + Math.log(h[i].close / h[i - 1].close) ** 2);
  close.set(d, h[i].close);
}
const days = [...rv.keys()].sort((a, b) => a - b);
const lrv = days.map((d) => Math.log(rv.get(d)! + 1e-10));
const ret = days.map((d, i) => (i ? Math.log(close.get(d)! / close.get(days[i - 1])!) : 0));
const mean = (a: number[]) => a.reduce((s, v) => s + v, 0) / a.length;

// Ordinary least squares via normal equations (small systems).
function ols(X: number[][], y: number[]) {
  const k = X[0].length;
  const A = Array.from({ length: k }, (_, i) => Array.from({ length: k }, (_, j) => X.reduce((s, x) => s + x[i] * x[j], 0)));
  const b = Array.from({ length: k }, (_, i) => X.reduce((s, x, t) => s + x[i] * y[t], 0));
  for (let i = 0; i < k; i++) {
    const p = A[i][i] || 1e-12;
    for (let j = i + 1; j < k; j++) {
      const f = A[j][i] / p;
      for (let c = i; c < k; c++) A[j][c] -= f * A[i][c];
      b[j] -= f * b[i];
    }
  }
  const w = Array(k).fill(0);
  for (let i = k - 1; i >= 0; i--) w[i] = (b[i] - A[i].slice(i + 1).reduce((s, v, j) => s + v * w[i + 1 + j], 0)) / (A[i][i] || 1e-12);
  return w;
}

const harX = (i: number) => [1, lrv[i], mean(lrv.slice(i - 6, i + 1)), mean(lrv.slice(i - 29, i + 1))];
/** Forecast of day i+1 log-variance made at the end of day i, for every day, refit monthly on earlier days. */
function harForecasts(): Float64Array {
  const f = new Float64Array(days.length).fill(NaN);
  let w: number[] | null = null;
  for (let i = 400; i < days.length - 1; i++) {
    if (!w || i % 30 === 0) {
      const idx = Array.from({ length: i - 30 }, (_, k) => k + 30).filter((k) => k + 1 <= i);
      w = ols(idx.map(harX), idx.map((k) => lrv[k + 1]));
    }
    f[i] = harX(i).reduce((s, v, j) => s + v * w![j], 0);
  }
  return f;
}

/** GARCH(1,1) with variance targeting, fit by grid search on the Gaussian likelihood, refit monthly. */
function garchForecasts(): Float64Array {
  const f = new Float64Array(days.length).fill(NaN);
  let par: { a: number; b: number; v: number } | null = null;
  const run = (a: number, b: number, v: number, upto: number) => {
    let s2 = v;
    let ll = 0;
    for (let t = 1; t <= upto; t++) {
      s2 = v * (1 - a - b) + a * ret[t - 1] ** 2 + b * s2;
      ll += -0.5 * (Math.log(s2) + ret[t] ** 2 / s2);
    }
    return { ll, s2 };
  };
  for (let i = 400; i < days.length - 1; i++) {
    if (!par || i % 30 === 0) {
      const v = mean(ret.slice(1, i + 1).map((r) => r * r));
      let best = { ll: -Infinity, a: 0.1, b: 0.85 };
      for (let a = 0.02; a <= 0.3; a += 0.02)
        for (let b = 0.5; a + b < 0.995; b += 0.02) {
          const { ll } = run(a, b, v, i);
          if (ll > best.ll) best = { ll, a, b };
        }
      par = { a: best.a, b: best.b, v };
    }
    // One-step forecast for day i+1 from information through day i.
    const { s2 } = run(par.a, par.b, par.v, i);
    f[i] = Math.log(par.v * (1 - par.a - par.b) + par.a * ret[i] ** 2 + par.b * s2);
  }
  return f;
}

const har = harForecasts();
const garch = garchForecasts();
// Forecast accuracy on log realised variance (research years): correlation with what happened.
const corr = (f: Float64Array) => {
  const pairs = days.map((d, i) => [f[i], lrv[i + 1], d] as const).filter((p) => !Number.isNaN(p[0]) && p[1] !== undefined && p[2] < Date.UTC(2025, 8, 24) / 1000);
  const mx = mean(pairs.map((p) => p[0]));
  const my = mean(pairs.map((p) => p[1]));
  const c = pairs.reduce((s, p) => s + (p[0] - mx) * (p[1] - my), 0);
  return c / Math.sqrt(pairs.reduce((s, p) => s + (p[0] - mx) ** 2, 0) * pairs.reduce((s, p) => s + (p[1] - my) ** 2, 0));
};

/** Risk multiplier at a trade's signal candle: uses the forecast made at the end of the last full day. */
function scaler(f: Float64Array, lo: number, hi: number) {
  const idx = new Map(days.map((d, i) => [d, i]));
  // Typical level = median of all earlier forecasts (expanding, so no look-ahead).
  const med = new Float64Array(days.length).fill(NaN);
  const seen: number[] = [];
  for (let i = 0; i < days.length; i++) {
    if (!Number.isNaN(f[i])) {
      seen.push(f[i]);
      if (seen.length > 60 && i % 7 === 0) {
        const s = [...seen].sort((a, b) => a - b);
        med[i] = s[Math.floor(s.length / 2)];
      } else if (i) med[i] = med[i - 1];
    }
  }
  return (time: number) => {
    const i = idx.get(Math.floor(time / DAY) * DAY - DAY);
    if (i === undefined || Number.isNaN(f[i]) || Number.isNaN(med[i])) return 1;
    const volRatio = Math.exp((med[i] - f[i]) / 2); // typical vol / forecast vol
    return Math.min(hi, Math.max(lo, volRatio));
  };
}

const lines = [
  '# Round 6 · Volatility forecasts for account risk\n',
  `Forecast quality (correlation of forecast with next-day log realised variance, research years): HAR-RV ${corr(har).toFixed(2)}, GARCH(1,1) ${corr(garch).toFixed(2)}, yesterday's value ${corr(Float64Array.from(lrv)).toFixed(2)}.\n`,
  'Risk per trade × (typical vol / forecast vol), clipped. Research years only.\n',
  header,
];
const base = await evaluate({ name: 'Baseline (fixed risk)' });
lines.push(row(base));
const variants: [string, Float64Array, number, number][] = [
  ['HAR-RV, 0.5×–1.5×', har, 0.5, 1.5],
  ['HAR-RV, cut only (0.5×–1×)', har, 0.5, 1],
  ['HAR-RV, 0.25×–2×', har, 0.25, 2],
  ['GARCH(1,1), 0.5×–1.5×', garch, 0.5, 1.5],
];
for (const [name, f, lo, hi] of variants) {
  const s = scaler(f, lo, hi);
  const r = await evaluate({ name, o4: { riskAt: s }, o1: { riskAt: s } });
  lines.push(row(r, base));
  console.log(lines[lines.length - 1]);
}
writeFileSync(join(import.meta.dirname, 'RESULTS-round6-vol.md'), lines.join('\n') + '\n');
