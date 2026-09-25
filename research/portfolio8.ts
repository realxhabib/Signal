// Round 8 · The whole portfolio across market cycles, and the risk dial.
// Components: the Signal Composite account (80% 4h + 20% 1h), the weekly momentum sleeve, the Pattern basket.
// The mix is chosen on the research years only (every year must be positive), then shown on the locked year.
// Risk dial: the account re-simulated at higher risk per trade (not linear scaling), plus a block-bootstrap of the
// mix's daily returns for the odds of deep drawdowns.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { HOLDOUT_START } from './account';
import { dailyWeights, ensemble, walkForwardScores } from './pattern-lib';
import { EXTRA, UNIVERSE } from './universe';
import { evaluate, pct } from './round6-lib';
import { panel, simulate } from './sleeve-lib';
import { momentum } from './sleeves';

const DAY = 86_400;
const BASKET = process.env.BASKET ?? '20';
const MEMBERS: [number, number, number][] = [[24, 32, 1], [24, 64, 1], [24, 32, 2], [48, 64, 1]];

async function components(riskPct: number) {
  const acct = await evaluate({ name: `Account ${riskPct}%`, o4: { riskPct }, o1: { riskPct } }, 'all', false);
  const A = new Map(acct.days.map((d, i) => [d, acct.daily[i]]));
  const M = new Map((await momentum(14)).map((x) => [Math.floor(x.time / DAY) * DAY, x.ret]));
  const p = BASKET.startsWith('33') ? await panel('4h', [...UNIVERSE, ...EXTRA]) : await panel('4h');
  const scores = BASKET.endsWith('ens')
    ? ensemble(MEMBERS.map(([L, K, s]) => walkForwardScores(p, L, K, s, String(p.syms.length))))
    : walkForwardScores(p, 24, 32, 1, String(p.syms.length));
  const b = simulate(p, dailyWeights(p, scores), 0.0002, 'basket', Date.UTC(2020, 0, 1) / 1000, Infinity);
  const B = new Map(b.days.map((d, i) => [d, b.daily[i]]));
  return { A, M, B };
}

type Mix = { a: number; m: number; b: number };
const periodOf = (d: number) => (d >= HOLDOUT_START ? 'Locked year' : new Date(d * 1000).getUTCFullYear().toString());
function series(c: Awaited<ReturnType<typeof components>>, mix: Mix, days: number[]) {
  return days.map((d) => ({ d, r: mix.a * c.A.get(d)! + mix.m * (c.M.get(d) ?? 0) + mix.b * (c.B.get(d) ?? 0) }));
}
function stats(xs: { d: number; r: number }[]) {
  let eq = 1, peak = 1, dd = 0;
  for (const x of xs) {
    eq *= 1 + x.r;
    peak = Math.max(peak, eq);
    dd = Math.max(dd, 1 - eq / peak);
  }
  const m = xs.reduce((a, x) => a + x.r, 0) / xs.length;
  const sd = Math.sqrt(xs.reduce((a, x) => a + (x.r - m) ** 2, 0) / xs.length);
  return { ret: eq - 1, cagr: eq ** (365 / xs.length) - 1, dd, sharpe: (m / sd) * Math.sqrt(365) };
}
function byPeriod(xs: { d: number; r: number }[]) {
  const g = new Map<string, { d: number; r: number }[]>();
  for (const x of xs) g.set(periodOf(x.d), [...(g.get(periodOf(x.d)) ?? []), x]);
  return g;
}

const c1 = await components(1);
const allDays = [...c1.A.keys()].filter((d) => c1.M.has(d)).sort((a, b) => a - b);
const research = allDays.filter((d) => d < HOLDOUT_START && d >= Date.UTC(2020, 0, 1) / 1000);
const locked = allDays.filter((d) => d >= HOLDOUT_START);

// 1. Components and mixes, cycle by cycle.
const mixes: [string, Mix][] = [
  ['Account only', { a: 1, m: 0, b: 0 }],
  ['Momentum sleeve only', { a: 0, m: 1, b: 0 }],
  ['Pattern basket only', { a: 0, m: 0, b: 1 }],
  ['Current guidance (70% account, 20% momentum, 10% basket)', { a: 0.7, m: 0.2, b: 0.1 }],
];
// Best research-years mix with every year positive.
let best: { mix: Mix; sharpe: number } | null = null;
for (let a = 0.4; a <= 1.0001; a += 0.05)
  for (let m = 0; m <= 0.4001; m += 0.05) {
    const b = 1 - a - m;
    if (b < -1e-9 || b > 0.4001) continue;
    const mix = { a, m, b: Math.max(0, b) };
    const xs = series(c1, mix, research);
    const years = [...byPeriod(xs).values()].map(stats);
    if (years.some((y) => y.ret <= 0)) continue;
    const s = stats(xs).sharpe;
    if (!best || s > best.sharpe) best = { mix, sharpe: s };
  }
if (best) mixes.push([`Best research-years mix (${Math.round(best.mix.a * 100)}% / ${Math.round(best.mix.m * 100)}% / ${Math.round(best.mix.b * 100)}%)`, best.mix]);

const periods = [...new Set([...research, ...locked].map(periodOf))];
const lines = [
  '# Round 8 · The whole portfolio across market cycles\n',
  '1% base risk per trade in the account. Each cell: return / max drawdown within the period. Mix weights are chosen on 2020 → Sep 2025 only (every year positive, best Sharpe); the locked year is shown, not used.\n',
  `| Mix | ${periods.join(' | ')} | 2020–Sep 2025: CAGR / DD / Sharpe |`,
  `|---|${periods.map(() => '---').join('|')}|---|`,
];
for (const [name, mix] of mixes) {
  const xs = series(c1, mix, [...research, ...locked]);
  const g = byPeriod(xs);
  const r = stats(series(c1, mix, research));
  lines.push(`| ${name} | ${periods.map((k) => { const s = stats(g.get(k)!); return `${pct(s.ret)} / ${(s.dd * 100).toFixed(0)}%`; }).join(' | ')} | ${pct(r.cagr)} / ${(r.dd * 100).toFixed(0)}% / ${r.sharpe.toFixed(2)} |`);
  console.log(lines[lines.length - 1]);
}

// 2. Risk dial on the chosen mix: re-simulate the account at higher risk per trade.
const mix = best?.mix ?? { a: 0.7, m: 0.2, b: 0.1 };
lines.push(
  `\n## Risk dial (mix ${Math.round(mix.a * 100)}% account / ${Math.round(mix.m * 100)}% momentum / ${Math.round(mix.b * 100)}% basket; sleeves scaled with the same multiple)\n`,
  'Bootstrap: 5,000 paths of one year built from 20-day blocks of the research-years daily returns.\n',
  '| Risk per trade | CAGR 2020–Sep 2025 | Worst drawdown | Locked year | Locked-year drawdown | Bootstrap: median 1-year return | Odds of a 50%+ drawdown within a year | Odds of losing money over a year |',
  '|---|---|---|---|---|---|---|---|',
);
const dial: { risk: number; cagr: number; dd: number; locked: number; lockedDd: number; medianYear: number; deepDdOdds: number; losingYearOdds: number }[] = [];
let seed = 42;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
for (const risk of [0.5, 1, 1.5, 2, 3]) {
  const c = risk === 1 ? c1 : await components(risk);
  const k = risk; // sleeves scale linearly with the same multiple
  const scaled: Mix = { a: mix.a, m: mix.m * k, b: mix.b * k };
  const xr = series(c, scaled, research);
  const xl = series(c, scaled, locked);
  const r = stats(xr);
  const l = stats(xl);
  const rs = xr.map((x) => x.r);
  const ends: number[] = [];
  let deep = 0;
  let losing = 0;
  for (let path = 0; path < 5000; path++) {
    let eq = 1, peak = 1, dd = 0;
    for (let day = 0; day < 365; day += 20) {
      const s = Math.floor(rnd() * (rs.length - 20));
      for (let j = 0; j < 20; j++) {
        eq *= 1 + rs[s + j];
        peak = Math.max(peak, eq);
        dd = Math.max(dd, 1 - eq / peak);
      }
    }
    ends.push(eq - 1);
    if (dd >= 0.5) deep++;
    if (eq < 1) losing++;
  }
  ends.sort((a, b) => a - b);
  dial.push({ risk, cagr: +r.cagr.toFixed(3), dd: +r.dd.toFixed(3), locked: +l.ret.toFixed(3), lockedDd: +l.dd.toFixed(3), medianYear: +ends[2500].toFixed(3), deepDdOdds: +(deep / 5000).toFixed(4), losingYearOdds: +(losing / 5000).toFixed(4) });
  lines.push(`| ${risk}% | ${pct(r.cagr)} | ${(r.dd * 100).toFixed(0)}% | ${pct(l.ret)} | ${(l.dd * 100).toFixed(0)}% | ${pct(ends[2500])} | ${((deep / 5000) * 100).toFixed(1)}% | ${((losing / 5000) * 100).toFixed(1)}% |`);
  console.log(lines[lines.length - 1]);
}
writeFileSync(join(import.meta.dirname, process.env.OUT ?? 'RESULTS-round8-portfolio.md'), lines.join('\n') + '\n');
if (process.env.EXPORT) {
  const yearsOf = (m: Mix) => Object.fromEntries([...byPeriod(series(c1, m, [...research, ...locked])).entries()].map(([k, v]) => [k, +stats(v).ret.toFixed(3)]));
  const plan = { basket: BASKET, mix, years: yearsOf(mix), dial, researchFrom: '2020-01-01', lockedFrom: new Date(HOLDOUT_START * 1000).toISOString().slice(0, 10) };
  writeFileSync(join(import.meta.dirname, '..', 'src', 'portfolioPlan.json'), JSON.stringify(plan) + '\n');
  console.log('exported src/portfolioPlan.json');
}
