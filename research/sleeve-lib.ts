// Round 7 harness for new strategies ("sleeves") that hold weights across all coins: a strategy sets a weight per
// coin per bar at that bar's close (positive = long, negative = short, gross ≤ 1 = at most 1× the sleeve's
// capital), earns the next bar's close-to-close move, and pays fees on every change in weight. Scored on the
// research years alone and blended with the shipped account; every variant goes into the trial registry.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { HOLDOUT_START } from './account';
import { history } from './history';
import { evaluate, pct } from './round6-lib';
import { UNIVERSE } from './universe';
import { recordTrial } from './validation';

const DAY = 86_400;
export const ROUND = 7;

export interface Panel { iv: string; syms: string[]; times: number[]; close: Float64Array[]; volume: Float64Array[]; high: Float64Array[]; low: Float64Array[] }
const panels = new Map<string, Panel>();
/** All coins aligned on Bitcoin's timeline (NaN where a coin has no bar yet). */
export async function panel(iv: string, syms: string[] = UNIVERSE): Promise<Panel> {
  const key = `${iv}|${syms.join(',')}`;
  let p = panels.get(key);
  if (p) return p;
  const btc = await history('BTCUSDT', iv);
  const times = btc.map((b) => b.time);
  const at = new Map(times.map((t, i) => [t, i]));
  const mk = () => new Float64Array(times.length).fill(NaN);
  p = { iv, syms: [...syms], times, close: [], volume: [], high: [], low: [] };
  for (const s of syms) {
    const c = mk(), v = mk(), h = mk(), l = mk();
    for (const b of await history(s, iv)) {
      const i = at.get(b.time);
      if (i === undefined) continue;
      c[i] = b.close; v[i] = b.volume; h[i] = b.high; l[i] = b.low;
    }
    p.close.push(c); p.volume.push(v); p.high.push(h); p.low.push(l);
  }
  panels.set(key, p);
  return p;
}

export interface SleeveResult { name: string; days: number[]; daily: number[]; cagr: number; maxDd: number; sharpe: number; turnoverPerDay: number; exposure: number }

/** Run weights (per coin per bar) through the market with `fee` per unit of weight traded. */
export function simulate(p: Panel, w: Float64Array[], fee: number, name: string, from = Date.UTC(2019, 0, 1) / 1000, to = HOLDOUT_START): SleeveResult {
  const n = p.times.length;
  const byDay = new Map<number, number>();
  let turnover = 0;
  let expo = 0;
  let bars = 0;
  const prev = new Float64Array(p.syms.length);
  for (let t = 0; t < n - 1; t++) {
    if (p.times[t] < from || p.times[t + 1] >= to) continue;
    let r = 0;
    let g = 0;
    for (let k = 0; k < p.syms.length; k++) {
      const c0 = p.close[k][t];
      const c1 = p.close[k][t + 1];
      const wk = Number.isFinite(w[k][t]) && Number.isFinite(c0) && Number.isFinite(c1) ? w[k][t] : 0;
      if (wk) r += wk * (c1 / c0 - 1);
      const dw = Math.abs(wk - prev[k]);
      r -= fee * dw;
      turnover += dw;
      g += Math.abs(wk);
      prev[k] = wk;
    }
    expo += g;
    bars++;
    const d = Math.floor(p.times[t + 1] / DAY) * DAY;
    byDay.set(d, (1 + (byDay.get(d) ?? 0)) * (1 + r) - 1);
  }
  const days = [...byDay.keys()].sort((a, b) => a - b);
  const daily = days.map((d) => byDay.get(d)!);
  let eq = 1, peak = 1, dd = 0;
  for (const r of daily) {
    eq *= 1 + r;
    peak = Math.max(peak, eq);
    dd = Math.max(dd, 1 - eq / peak);
  }
  const m = daily.reduce((a, v) => a + v, 0) / daily.length;
  const sd = Math.sqrt(daily.reduce((a, v) => a + (v - m) ** 2, 0) / daily.length);
  return { name, days, daily, cagr: eq ** (365 / daily.length) - 1, maxDd: dd, sharpe: sd ? (m / sd) * Math.sqrt(365) : 0, turnoverPerDay: turnover / (days.length || 1), exposure: expo / (bars || 1) };
}

let main: Awaited<ReturnType<typeof evaluate>> | null = null;
/** Sleeve alone, its correlation with the shipped account, and the account with 20% of capital in the sleeve. */
export async function report(r: SleeveResult, record = true) {
  if (!main) main = await evaluate({ name: 'Baseline' }, 'research', false);
  if (record) recordTrial(ROUND, r.name, r.daily);
  saveSeries(r);
  const sm = new Map(r.days.map((d, i) => [d, r.daily[i]]));
  const both = main.days.filter((d) => sm.has(d));
  const mi = new Map(main.days.map((d, i) => [d, main!.daily[i]]));
  const a = both.map((d) => mi.get(d)!);
  const b = both.map((d) => sm.get(d)!);
  const ma = a.reduce((x, v) => x + v, 0) / a.length;
  const mb = b.reduce((x, v) => x + v, 0) / b.length;
  const corr = a.reduce((x, v, i) => x + (v - ma) * (b[i] - mb), 0) / Math.sqrt(a.reduce((x, v) => x + (v - ma) ** 2, 0) * b.reduce((x, v) => x + (v - mb) ** 2, 0));
  const blend = both.map((d) => 0.8 * mi.get(d)! + 0.2 * sm.get(d)!);
  const alone = both.map((d) => mi.get(d)!);
  const sh = (xs: number[]) => {
    const m = xs.reduce((x, v) => x + v, 0) / xs.length;
    const sd = Math.sqrt(xs.reduce((x, v) => x + (v - m) ** 2, 0) / xs.length);
    return (m / sd) * Math.sqrt(365);
  };
  return `| ${r.name} | ${pct(r.cagr)} | ${(r.maxDd * 100).toFixed(0)}% | ${r.sharpe.toFixed(2)} | ${corr.toFixed(2)} | ${sh(alone).toFixed(2)} → **${sh(blend).toFixed(2)}** | ${r.turnoverPerDay.toFixed(2)} |`;
}
const slug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
/** Daily returns of a sleeve, kept for later comparisons (research/.cache/sleeve-<name>.json). */
export function saveSeries(r: SleeveResult) {
  writeFileSync(join(import.meta.dirname, '.cache', `sleeve-${slug(r.name)}.json`), JSON.stringify({ name: r.name, days: r.days, daily: r.daily }));
}
export function loadSeries(name: string): { name: string; days: number[]; daily: number[] } {
  return JSON.parse(readFileSync(join(import.meta.dirname, '.cache', `sleeve-${slug(name)}.json`), 'utf8'));
}

export const HEADER = '| Sleeve | CAGR | Max DD | Sharpe | Corr. with account | Account Sharpe → with 20% sleeve | Turnover / day |\n|---|---|---|---|---|---|---|';

/** Average of the last `h` signals (holding each signal for h bars, overlapping). */
export function hold(w: Float64Array, h: number) {
  const out = new Float64Array(w.length);
  let s = 0;
  for (let t = 0; t < w.length; t++) {
    s += Number.isFinite(w[t]) ? w[t] : 0;
    if (t >= h) s -= Number.isFinite(w[t - h]) ? w[t - h] : 0;
    out[t] = s / h;
  }
  return out;
}

/** Scale weights so gross exposure is at most 1 at every bar. */
export function capGross(ws: Float64Array[]) {
  const n = ws[0].length;
  for (let t = 0; t < n; t++) {
    let g = 0;
    for (const w of ws) g += Math.abs(w[t] || 0);
    if (g > 1) for (const w of ws) w[t] /= g;
  }
  return ws;
}

/** Log returns over `k` bars ending at t (NaN when missing). */
export const logRet = (c: Float64Array, t: number, k: number) => (t >= k && c[t] > 0 && c[t - k] > 0 ? Math.log(c[t] / c[t - k]) : NaN);

/** EWMA beta of each coin to BTC and residual vol, on `k`-bar returns, updated after each bar (causal). */
export function betas(p: Panel, k: number, halfLife: number) {
  const a = 1 - Math.pow(0.5, 1 / halfLife);
  const b = p.syms.indexOf('BTCUSDT');
  const n = p.times.length;
  const beta = p.syms.map(() => new Float64Array(n).fill(NaN));
  const resVol = p.syms.map(() => new Float64Array(n).fill(NaN));
  const btcVol = new Float64Array(n).fill(NaN);
  let vb = NaN;
  const cov = p.syms.map(() => NaN);
  const rv = p.syms.map(() => NaN);
  for (let t = k; t < n; t++) {
    // Values at t use data up to t-1 (then update with bar t).
    btcVol[t] = Math.sqrt(vb);
    for (let s = 0; s < p.syms.length; s++) {
      beta[s][t] = cov[s] / vb;
      resVol[s][t] = Math.sqrt(rv[s]);
    }
    const rb = logRet(p.close[b], t, 1);
    if (!Number.isFinite(rb)) continue;
    vb = Number.isNaN(vb) ? rb * rb : (1 - a) * vb + a * rb * rb;
    for (let s = 0; s < p.syms.length; s++) {
      const r = logRet(p.close[s], t, 1);
      if (!Number.isFinite(r)) continue;
      cov[s] = Number.isNaN(cov[s]) ? r * rb : (1 - a) * cov[s] + a * r * rb;
      const e = r - (Number.isFinite(beta[s][t]) ? beta[s][t] : 1) * rb;
      rv[s] = Number.isNaN(rv[s]) ? e * e : (1 - a) * rv[s] + a * e * e;
    }
  }
  return { beta, resVol, btcVol, btc: b };
}

