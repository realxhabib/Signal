// Final exam: the locked last 12 months, evaluated once for the shipped setup and the candidates.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { accountTrades, HOLDOUT_START, pct, PYRAMID, runAccount } from './account';
import { perf, type Daily } from './sleeves';

const DAY = 86_400;
const daily = (curve: { time: number; equity: number }[]) => {
  const eod = new Map<number, number>();
  for (const p of curve) eod.set(Math.floor(p.time / DAY) * DAY, p.equity);
  const ds = [...eod.keys()].sort((a, b) => a - b);
  return new Map(ds.slice(1).map((d, i) => [d, eod.get(d)! / eod.get(ds[i])! - 1]));
};
const blend = (a: Map<number, number>, b: Map<number, number>, w: number) => {
  const common = [...a.keys()].filter((d) => b.has(d)).sort((x, y) => x - y);
  return perf(common.map((d): Daily => ({ time: d, ret: (1 - w) * a.get(d)! + w * b.get(d)! })));
};
const base = await accountTrades('4h');
const pyr4 = await accountTrades('4h', undefined, undefined, PYRAMID);
const pyr1 = await accountTrades('1h', undefined, undefined, PYRAMID);
const lines = [`# Final exam — locked period ${new Date(HOLDOUT_START * 1000).toISOString().slice(0, 10)} → today\n`, '| Setup | Period | Return (annualised) | Max DD | Sharpe |', '|---|---|---|---|---|'];
for (const period of ['research', 'holdout'] as const) {
  const a0 = await runAccount('4h', base.trades, base.candlesBySym, {}, period);
  const a1 = await runAccount('4h', pyr4.trades, pyr4.candlesBySym, {}, period);
  const h1 = await runAccount('1h', pyr1.trades, pyr1.candlesBySym, { regimeInterval: '4h' }, period);
  const c2 = blend(daily(a1.curve), daily(h1.curve), 0.2);
  const total = (curve: { equity: number }[]) => curve[curve.length - 1].equity / curve[0].equity - 1;
  for (const [name, r, extra] of [
    ['Shipped: 4h, single entry', a0, period === 'holdout' ? ` (total ${pct(total(a0.curve), 1)})` : ''],
    ['A: 4h + pyramid ½ at +2R', a1, period === 'holdout' ? ` (total ${pct(total(a1.curve), 1)})` : ''],
    ['B: 80% A + 20% 1h pyramid (mode from 4h)', c2, ''],
  ] as const)
    lines.push(`| ${name} | ${period === 'holdout' ? '**locked year**' : '2019 → Sep 2025'} | ${pct(r.cagr)}${extra} | ${(r.maxDd * 100).toFixed(1)}% | ${r.sharpe.toFixed(2)} |`);
}
console.log(lines.join('\n'));
writeFileSync(join(import.meta.dirname, 'RESULTS-final-exam.md'), lines.join('\n') + '\n');
