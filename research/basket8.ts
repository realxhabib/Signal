// Round 8 · Pattern basket upgrades: more coins, an ensemble of pattern libraries, a no-trade band and volatility
// targeting. All variants trade the daily target with limit-order fees; research years only (the locked year is
// looked at once, for the final pick, with LOCKED=1 PICK=<name>).
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { HOLDOUT_START } from './account';
import { dailyWeights, ensemble, volTarget, walkForwardScores, type Scored } from './pattern-lib';
import { evaluate } from './round6-lib';
import { HEADER, panel, report, simulate } from './sleeve-lib';
import { EXTRA, UNIVERSE } from './universe';

const FEE = 0.0002;
const FROM = Date.UTC(2020, 0, 1) / 1000;
const p20 = await panel('4h');
const p33 = await panel('4h', [...UNIVERSE, ...EXTRA]);
const MEMBERS: [number, number, number][] = [[24, 32, 1], [24, 64, 1], [24, 32, 2], [48, 64, 1]];
const single = (p: typeof p20) => walkForwardScores(p, 24, 32, 1, String(p.syms.length));
const ens = (p: typeof p20): Scored => ensemble(MEMBERS.map(([L, K, s]) => walkForwardScores(p, L, K, s, String(p.syms.length))));

type V = { name: string; p: typeof p20; w: () => Float64Array[] };
const variants: V[] = [
  { name: 'R8 basket: 20 coins, 1 library (shipped)', p: p20, w: () => dailyWeights(p20, single(p20)) },
  { name: 'R8 basket: 33 coins, 1 library', p: p33, w: () => dailyWeights(p33, single(p33)) },
  { name: 'R8 basket: 20 coins, ensemble of 4', p: p20, w: () => dailyWeights(p20, ens(p20)) },
  { name: 'R8 basket: 33 coins, ensemble of 4', p: p33, w: () => dailyWeights(p33, ens(p33)) },
  { name: 'R8 basket: 33 coins, ensemble of 4, 1% band', p: p33, w: () => dailyWeights(p33, ens(p33), 18, 0.01) },
  { name: 'R8 basket: 33 coins, ensemble of 4, 2% band', p: p33, w: () => dailyWeights(p33, ens(p33), 18, 0.02) },
  { name: 'R8 basket: 33 coins, ensemble of 4, vol target 20%', p: p33, w: () => volTarget(p33, dailyWeights(p33, ens(p33)), 0.2) },
  { name: 'R8 basket: 20 coins, ensemble of 4, vol target 20%', p: p20, w: () => volTarget(p20, dailyWeights(p20, ens(p20)), 0.2) },
];
const lines = ['# Round 8 · Pattern basket upgrades\n', 'Daily rebalance at the 00:00 UTC close, limit-order fees 0.02%, research years from 2020 (locked year untouched unless noted).\n', HEADER];
const only = process.env.ONLY?.split('|');
for (const v of variants) {
  if (only && !only.includes(v.name)) continue;
  const w = v.w();
  const r = simulate(v.p, w, FEE, v.name, FROM);
  lines.push(await report(r));
  console.log(lines[lines.length - 1]);
  if (process.env.LOCKED && v.name === process.env.PICK) {
    const lk = simulate(v.p, w, FEE, `${v.name} · LOCKED`, HOLDOUT_START, Infinity);
    const acct = await evaluate({ name: 'Baseline' }, 'holdout', false);
    const S = new Map(lk.days.map((d, i) => [d, lk.daily[i]]));
    const days = acct.days.filter((d) => S.has(d));
    const A = new Map(acct.days.map((d, i) => [d, acct.daily[i]]));
    const sh = (xs: number[]) => {
      const m = xs.reduce((a, x) => a + x, 0) / xs.length;
      const sd = Math.sqrt(xs.reduce((a, x) => a + (x - m) ** 2, 0) / xs.length);
      return (m / sd) * Math.sqrt(365);
    };
    const tot = lk.daily.reduce((e, x) => e * (1 + x), 1) - 1;
    const line = `Locked year: ${(tot * 100).toFixed(1)}%, Sharpe ${lk.sharpe.toFixed(2)}, max DD ${(lk.maxDd * 100).toFixed(0)}% · account ${sh(days.map((d) => A.get(d)!)).toFixed(2)} → with 10% basket ${sh(days.map((d) => 0.9 * A.get(d)! + 0.1 * S.get(d)!)).toFixed(2)}`;
    lines.push('', line);
    console.log(line);
  }
}
writeFileSync(join(import.meta.dirname, process.env.OUT ?? 'RESULTS-round8-basket.md'), lines.join('\n') + '\n');
