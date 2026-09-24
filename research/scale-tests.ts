// More coins, and 1h + 4h together (research period only).
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { accountTrades, pct, PYRAMID, runAccount } from './account';
import { perf, type Daily } from './sleeves';
import { EXTRA, UNIVERSE } from './universe';

const DAY = 86_400;
const years = ['2020', '2021', '2022', '2023', '2024', '2025'];
const lines = ['# Scale tests (pyramid base, research period)\n', `| Test | CAGR | Max DD | Sharpe | ${years.join(' | ')} |`, `|---|---|---|---|${years.map(() => '---').join('|')}|`];
const row = (name: string, cagr: number, dd: number, sh: number, ys: Map<string, number>) => {
  lines.push(`| ${name} | ${pct(cagr)} | ${(dd * 100).toFixed(1)}% | ${sh.toFixed(2)} | ${years.map((y) => pct(ys.get(y) ?? NaN)).join(' | ')} |`);
  console.log(lines[lines.length - 1]);
};
const daily = (curve: { time: number; equity: number }[]) => {
  const eod = new Map<number, number>();
  for (const p of curve) eod.set(Math.floor(p.time / DAY) * DAY, p.equity);
  const ds = [...eod.keys()].sort((a, b) => a - b);
  return new Map(ds.slice(1).map((d, i) => [d, eod.get(d)! / eod.get(ds[i])! - 1]));
};

const t4 = await accountTrades('4h', undefined, UNIVERSE, PYRAMID);
const a4 = await runAccount('4h', t4.trades, t4.candlesBySym);
row('4h · 20 coins (base)', a4.cagr, a4.maxDd, a4.sharpe, a4.years);

const t33 = await accountTrades('4h', undefined, [...UNIVERSE, ...EXTRA], PYRAMID);
const a33 = await runAccount('4h', t33.trades, t33.candlesBySym);
row('4h · 33 coins', a33.cagr, a33.maxDd, a33.sharpe, a33.years);
const onlyExtra = await accountTrades('4h', undefined, EXTRA, PYRAMID);
const ae = await runAccount('4h', onlyExtra.trades, onlyExtra.candlesBySym);
row('4h · the 13 new coins alone (out-of-sample coins)', ae.cagr, ae.maxDd, ae.sharpe, ae.years);

const t1 = await accountTrades('1h', undefined, UNIVERSE, PYRAMID);
const a1 = await runAccount('1h', t1.trades, t1.candlesBySym);
row('1h · 20 coins', a1.cagr, a1.maxDd, a1.sharpe, a1.years);

const d4 = daily(a4.curve);
const d1 = daily(a1.curve);
const common = [...d4.keys()].filter((d) => d1.has(d)).sort((a, b) => a - b);
for (const w1 of [0.3, 0.5]) {
  const xs: Daily[] = common.map((d) => ({ time: d, ret: (1 - w1) * d4.get(d)! + w1 * d1.get(d)! }));
  const p = perf(xs);
  row(`4h + 1h split ${Math.round((1 - w1) * 100)}/${Math.round(w1 * 100)} (from ${new Date(common[0] * 1000).getUTCFullYear()})`, p.cagr, p.maxDd, p.sharpe, p.years);
}
{
  const a = common.map((d) => d4.get(d)!);
  const b = common.map((d) => d1.get(d)!);
  const m = (x: number[]) => x.reduce((s, v) => s + v, 0) / x.length;
  const ma = m(a), mb = m(b);
  let n = 0, da = 0, db = 0;
  for (let i = 0; i < a.length; i++) { n += (a[i] - ma) * (b[i] - mb); da += (a[i] - ma) ** 2; db += (b[i] - mb) ** 2; }
  lines.push(`\nDaily correlation 4h vs 1h accounts: ${(n / Math.sqrt(da * db)).toFixed(2)}`);
  console.log(lines[lines.length - 1]);
}
writeFileSync(join(import.meta.dirname, 'RESULTS-scale-tests.md'), lines.join('\n') + '\n');
