// Round 8 · Market-aware mix: when Bitcoin trends (bull or bear market mode), lean on the Signal Composite
// account; in the neutral mode (chop), lean on the market-neutral sleeves. The mode is read from Bitcoin's 4h trend
// at the previous day's close (causal). Research years pick; the locked year is shown.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { computeFeatures } from '../src/features';
import { HOLDOUT_START } from './account';
import { history } from './history';
import { dailyWeights, walkForwardScores } from './pattern-lib';
import { evaluate, pct } from './round6-lib';
import { panel, simulate } from './sleeve-lib';
import { momentum } from './sleeves';
import { recordTrial } from './validation';

const DAY = 86_400;
const acct = await evaluate({ name: 'Account' }, 'all', false);
const A = new Map(acct.days.map((d, i) => [d, acct.daily[i]]));
const M = new Map((await momentum(14)).map((x) => [Math.floor(x.time / DAY) * DAY, x.ret]));
const coins = process.env.BASKET_COINS ?? '20';
const p = await panel('4h');
const b = simulate(p, dailyWeights(p, walkForwardScores(p, 24, 32, 1, '20')), 0.0002, 'basket', Date.UTC(2020, 0, 1) / 1000, Infinity);
const B = new Map(b.days.map((d, i) => [d, b.daily[i]]));
const btc = await history('BTCUSDT', '4h');
const reg = computeFeatures(btc).regime;
const modeByDay = new Map<number, number>();
btc.forEach((bar, i) => {
  const closeDay = Math.floor((bar.time + 14_400) / DAY) * DAY;
  modeByDay.set(closeDay + DAY, reg[i]); // known at the start of the next day
});
const days = [...A.keys()].filter((d) => M.has(d) && B.has(d)).sort((a, b) => a - b);
const research = days.filter((d) => d < HOLDOUT_START);
const locked = days.filter((d) => d >= HOLDOUT_START);

type Mix = [number, number, number];
const ret = (d: number, trend: Mix, chop: Mix) => {
  const m = modeByDay.get(d) ?? 0;
  const w = m === 0 ? chop : trend;
  return w[0] * A.get(d)! + w[1] * M.get(d)! + w[2] * B.get(d)!;
};
function stats(xs: number[], ds: number[]) {
  let eq = 1, peak = 1, dd = 0;
  const years = new Map<string, number>();
  xs.forEach((r, i) => {
    eq *= 1 + r;
    peak = Math.max(peak, eq);
    dd = Math.max(dd, 1 - eq / peak);
    const y = ds[i] >= HOLDOUT_START ? 'Locked' : new Date(ds[i] * 1000).getUTCFullYear().toString();
    years.set(y, (1 + (years.get(y) ?? 0)) * (1 + r) - 1);
  });
  const m = xs.reduce((a, v) => a + v, 0) / xs.length;
  const sd = Math.sqrt(xs.reduce((a, v) => a + (v - m) ** 2, 0) / xs.length);
  return { cagr: eq ** (365 / xs.length) - 1, dd, sharpe: (m / sd) * Math.sqrt(365), years };
}
const chopShare = research.filter((d) => (modeByDay.get(d) ?? 0) === 0).length / research.length;
const lines = [
  '# Round 8 · Market-aware mix (trend vs chop)\n',
  `Neutral (chop) market mode on ${(chopShare * 100).toFixed(0)}% of research days. Weights = account / momentum / basket.\n`,
  '| Trend mix | Chop mix | Research: CAGR / DD / Sharpe | By year (research) | Locked year: return / DD |',
  '|---|---|---|---|---|',
];
const grid: Mix[] = [];
for (let a = 0.2; a <= 1.0001; a += 0.2) for (let m = 0; m <= 0.4001; m += 0.2) if (1 - a - m >= -1e-9) grid.push([+a.toFixed(2), +m.toFixed(2), +(1 - a - m).toFixed(2)]);
const results: { trend: Mix; chop: Mix; sharpe: number; minYear: number }[] = [];
for (const trend of grid)
  for (const chop of grid) {
    const xs = research.map((d) => ret(d, trend, chop));
    const s = stats(xs, research);
    results.push({ trend, chop, sharpe: s.sharpe, minYear: Math.min(...s.years.values()) });
  }
const fmt = (w: Mix) => w.map((v) => `${Math.round(v * 100)}%`).join(' / ');
const pickBest = results.filter((r) => r.minYear > 0).sort((a, b) => b.sharpe - a.sharpe);
const staticBest = results.filter((r) => r.minYear > 0 && r.trend.join() === r.chop.join()).sort((a, b) => b.sharpe - a.sharpe)[0];
for (const r of [staticBest, ...pickBest.slice(0, 5)]) {
  const xs = research.map((d) => ret(d, r.trend, r.chop));
  const s = stats(xs, research);
  recordTrial(8, `Mix trend ${fmt(r.trend)} chop ${fmt(r.chop)}`, xs);
  const l = stats(locked.map((d) => ret(d, r.trend, r.chop)), locked);
  lines.push(`| ${fmt(r.trend)} | ${fmt(r.chop)}${r === staticBest ? ' (static)' : ''} | ${pct(s.cagr)} / ${(s.dd * 100).toFixed(0)}% / ${s.sharpe.toFixed(2)} | ${[...s.years.values()].map((v) => pct(v)).join(' · ')} | ${pct(l.years.get('Locked') ?? 0)} / ${(l.dd * 100).toFixed(0)}% |`);
  console.log(lines[lines.length - 1]);
}
void coins;
writeFileSync(join(import.meta.dirname, 'RESULTS-round8-mix.md'), lines.join('\n') + '\n');
