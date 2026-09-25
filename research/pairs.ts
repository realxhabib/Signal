// Round 6 · Pairs trading (statistical arbitrage) as a market-neutral sleeve. Every 6 months, on the previous
// year of daily closes, fit each coin pair's hedge ratio (OLS of log prices) and the spread's mean-reversion
// half-life (AR(1)); keep the 5 pairs that revert fastest (2–30 days). Over the next 6 months trade each with a
// fixed hedge ratio: enter when the spread's 60-day z-score passes ±2, exit at ±0.5, after 30 days, or at ±4
// (stop). Equal notional per leg, market fees 0.05% per leg per side. Decisions at the daily close, filled at
// the next close. Research years, then the combination with the main account.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { HOLDOUT_START } from './account';
import { history } from './history';
import { evaluate, pct } from './round6-lib';
import { UNIVERSE } from './universe';
import { recordTrial } from './validation';

const DAY = 86_400;
const FEE = 0.0005;
const closes = new Map<string, Map<number, number>>();
for (const s of UNIVERSE) closes.set(s, new Map((await history(s, '1d')).map((b) => [b.time, b.close])));
const allDays = [...new Set([...closes.values()].flatMap((m) => [...m.keys()]))].sort((a, b) => a - b);
const px = (s: string, d: number) => closes.get(s)!.get(d);

function fitPair(a: string, b: string, days: number[]) {
  const xs: [number, number][] = [];
  for (const d of days) {
    const pa = px(a, d);
    const pb = px(b, d);
    if (pa && pb) xs.push([Math.log(pb), Math.log(pa)]);
  }
  if (xs.length < 300) return null;
  const mx = xs.reduce((s, p) => s + p[0], 0) / xs.length;
  const my = xs.reduce((s, p) => s + p[1], 0) / xs.length;
  const beta = xs.reduce((s, p) => s + (p[0] - mx) * (p[1] - my), 0) / xs.reduce((s, p) => s + (p[0] - mx) ** 2, 0);
  const sp = xs.map((p) => p[1] - beta * p[0]);
  // AR(1) on the spread: s_t − s_{t−1} = λ (s_{t−1} − mean) + e → half-life = −ln 2 / λ.
  const m = sp.reduce((s, v) => s + v, 0) / sp.length;
  let num = 0;
  let den = 0;
  for (let t = 1; t < sp.length; t++) {
    num += (sp[t] - sp[t - 1]) * (sp[t - 1] - m);
    den += (sp[t - 1] - m) ** 2;
  }
  const lambda = num / den;
  return { beta, halfLife: lambda < 0 ? -Math.log(2) / lambda : Infinity };
}

interface Opts { entry: number; exit: number; stop: number; maxDays: number; nPairs: number }
function runSleeve(o: Opts) {
  const ret = new Map<number, number>();
  const first = Date.UTC(2019, 0, 1) / 1000;
  for (let ws = first; ws < allDays[allDays.length - 1]; ws += 182 * DAY) {
    const trainDays = allDays.filter((d) => d < ws && d >= ws - 365 * DAY);
    const cands: { a: string; b: string; beta: number; halfLife: number }[] = [];
    for (let i = 0; i < UNIVERSE.length; i++)
      for (let j = i + 1; j < UNIVERSE.length; j++) {
        const f = fitPair(UNIVERSE[i], UNIVERSE[j], trainDays);
        if (f && f.halfLife >= 2 && f.halfLife <= 30 && f.beta > 0) cands.push({ a: UNIVERSE[i], b: UNIVERSE[j], ...f });
      }
    cands.sort((x, y) => x.halfLife - y.halfLife);
    const chosen = cands.slice(0, o.nPairs);
    const winDays = allDays.filter((d) => d >= ws && d < ws + 182 * DAY);
    for (const p of chosen) {
      // Spread history (with this window's fixed beta) for the rolling z-score.
      const spread = (d: number) => {
        const pa = px(p.a, d);
        const pb = px(p.b, d);
        return pa && pb ? Math.log(pa) - p.beta * Math.log(pb) : undefined;
      };
      const hist = allDays.filter((d) => d >= ws - 60 * DAY && d < ws + 182 * DAY);
      let pos = 0; // +1 = long spread (long a, short b)
      let held = 0;
      for (let k = 60; k < hist.length - 1; k++) {
        const d = hist[k];
        if (d < ws) continue;
        const w = hist.slice(k - 59, k + 1).map(spread).filter((v): v is number => v !== undefined);
        const s = spread(d);
        if (s === undefined || w.length < 50) continue;
        const m = w.reduce((a, v) => a + v, 0) / w.length;
        const sd = Math.sqrt(w.reduce((a, v) => a + (v - m) ** 2, 0) / w.length) || 1;
        const z = (s - m) / sd;
        // Position decided at this close earns the next day's move.
        let next = pos;
        if (pos === 0 && Math.abs(z) > o.entry && Math.abs(z) < o.stop) next = z > 0 ? -1 : 1;
        else if (pos !== 0 && (Math.abs(z) < o.exit || Math.abs(z) > o.stop || held >= o.maxDays || Math.sign(z) === pos)) next = 0;
        const nd = hist[k + 1];
        const ra = (px(p.a, nd) ?? 0) / (px(p.a, d) ?? 1) - 1;
        const rb = (px(p.b, nd) ?? 0) / (px(p.b, d) ?? 1) - 1;
        const cost = next !== pos ? (next === 0 || pos === 0 ? 2 : 4) * FEE : 0; // two legs, open or close (flip = both)
        const r = (next * (ra - rb)) / 2 - cost / 2; // half the pair's capital in each leg
        held = next === 0 ? 0 : next === pos ? held + 1 : 1;
        pos = next;
        ret.set(nd, (ret.get(nd) ?? 0) + r / o.nPairs);
      }
    }
  }
  return ret;
}

const stats = (xs: { t: number; r: number }[]) => {
  let eq = 1;
  let peak = 1;
  let dd = 0;
  for (const x of xs) {
    eq *= 1 + x.r;
    peak = Math.max(peak, eq);
    dd = Math.max(dd, 1 - eq / peak);
  }
  const m = xs.reduce((a, x) => a + x.r, 0) / xs.length;
  const sd = Math.sqrt(xs.reduce((a, x) => a + (x.r - m) ** 2, 0) / xs.length);
  return { cagr: eq ** (365 / xs.length) - 1, dd, sharpe: sd ? (m / sd) * Math.sqrt(365) : 0 };
};

const main = await evaluate({ name: 'Baseline' }, 'research', false);
const mainByDay = new Map(main.days.map((d, i) => [d, main.daily[i]]));
const lines = [
  '# Round 6 · Pairs trading sleeve\n',
  'Research years only. Pair sleeve alone (1× notional per pair, split across 5 pairs), its correlation with the main account, and the main account with 10% or 20% of capital moved to the sleeve.\n',
  '| Setting | Sleeve CAGR | Sleeve max DD | Sleeve Sharpe | Corr. with main | Main + 10% pairs: CAGR / DD / Sharpe | Main + 20% pairs |',
  '|---|---|---|---|---|---|---|',
];
const ms = stats(main.days.map((d, i) => ({ t: d, r: main.daily[i] })));
lines.push(`| Main account alone | | | | | ${pct(ms.cagr)} / ${(ms.dd * 100).toFixed(0)}% / ${ms.sharpe.toFixed(2)} | |`);
const settings: [string, Opts][] = [
  ['z ±2 → ±0.5, stop ±4, 30 days, 5 pairs', { entry: 2, exit: 0.5, stop: 4, maxDays: 30, nPairs: 5 }],
  ['z ±1.5 → 0, stop ±3.5, 20 days, 5 pairs', { entry: 1.5, exit: 0, stop: 3.5, maxDays: 20, nPairs: 5 }],
  ['z ±2.5 → ±0.5, stop ±4.5, 30 days, 5 pairs', { entry: 2.5, exit: 0.5, stop: 4.5, maxDays: 30, nPairs: 5 }],
  ['z ±2 → ±0.5, stop ±4, 30 days, 10 pairs', { entry: 2, exit: 0.5, stop: 4, maxDays: 30, nPairs: 10 }],
];
for (const [name, o] of settings) {
  const r = runSleeve(o);
  const xs = [...r.entries()].filter(([d]) => d < HOLDOUT_START).sort((a, b) => a[0] - b[0]).map(([t, v]) => ({ t, r: v }));
  const s = stats(xs);
  recordTrial(6, `Pairs sleeve: ${name}`, xs.map((x) => x.r));
  const both = main.days.filter((d) => r.has(d));
  const a = both.map((d) => mainByDay.get(d)!);
  const b = both.map((d) => r.get(d)!);
  const ma = a.reduce((x, v) => x + v, 0) / a.length;
  const mb = b.reduce((x, v) => x + v, 0) / b.length;
  const corr = a.reduce((x, v, i) => x + (v - ma) * (b[i] - mb), 0) / Math.sqrt(a.reduce((x, v) => x + (v - ma) ** 2, 0) * b.reduce((x, v) => x + (v - mb) ** 2, 0));
  const blend = (w: number) => stats(main.days.map((d, i) => ({ t: d, r: (1 - w) * main.daily[i] + w * (r.get(d) ?? 0) })));
  const b10 = blend(0.1);
  const b20 = blend(0.2);
  lines.push(
    `| ${name} | ${pct(s.cagr)} | ${(s.dd * 100).toFixed(0)}% | ${s.sharpe.toFixed(2)} | ${corr.toFixed(2)} | ${pct(b10.cagr)} / ${(b10.dd * 100).toFixed(0)}% / ${b10.sharpe.toFixed(2)} | ${pct(b20.cagr)} / ${(b20.dd * 100).toFixed(0)}% / ${b20.sharpe.toFixed(2)} |`,
  );
  console.log(lines[lines.length - 1]);
}
writeFileSync(join(import.meta.dirname, 'RESULTS-round6-pairs.md'), lines.join('\n') + '\n');
