// Account-level ideas on top of the pyramid base (research period only):
// grade sizing (blind walk-forward grades), momentum priority / rotation, slot count.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { accountTrades, pct, PYRAMID, runAccount, type AccountOptions } from './account';
import { oosScores } from './mlcore';
import type { PTrade } from './portfolio';

const iv = '4h';
const { trades, candlesBySym } = await accountTrades(iv, undefined, undefined, PYRAMID);
const scores = oosScores(trades);
const grade = (t: PTrade) => {
  const s = scores.get(t);
  return !s ? 'B' : s.z >= s.a ? 'A' : s.z < s.c ? 'C' : 'B';
};
const SIZE = { A: 1.5, B: 1, C: 0.5 } as const;
// Coin momentum at the signal: 30-day return (180 × 4h bars); for shorts, weakness is strength.
const mom = (t: PTrade) => {
  const i = t.entryIndex - 1;
  const c = t.candles;
  const r = i >= 180 ? c[i].close / c[i - 180].close - 1 : 0;
  return t.side === 'long' ? r : -r;
};
const tests: [string, AccountOptions][] = [
  ['Pyramid base (5 long / 3–5 short slots)', {}],
  ['+ size by grade (A 1.5× / B 1× / C 0.5×)', { sizeMult: (t) => (t.side === 'long' ? SIZE[grade(t)] : 1) }],
  ['+ strongest-momentum signals first', { priority: mom }],
  ['+ rotate into stronger coins (margin 20%)', { rotate: { score: mom, margin: 0.2 } }],
  ['+ rotate into stronger coins (margin 50%)', { rotate: { score: mom, margin: 0.5 } }],
  ['slots × 0.6 (3 long)', { slotMult: 0.6 }],
  ['slots × 1.6 (8 long)', { slotMult: 1.6 }],
  ['slots × 2 (10 long)', { slotMult: 2 }],
  ['slots × 1.6, risk 0.8%', { slotMult: 1.6, riskPct: 0.8 }],
  ['slots × 2, risk 0.7%', { slotMult: 2, riskPct: 0.7 }],
];
const years = ['2020', '2021', '2022', '2023', '2024', '2025'];
const lines = ['# Account tests (4h, 20 coins, pyramid base, research period)\n', `| Test | CAGR | Max DD | Sharpe | Stress bad-case DD | ${years.join(' | ')} |`, `|---|---|---|---|---|${years.map(() => '---').join('|')}|`];
for (const [name, o] of tests) {
  const a = await runAccount(iv, trades, candlesBySym, o);
  lines.push(`| ${name} | ${pct(a.cagr)} | ${(a.maxDd * 100).toFixed(1)}% | ${a.sharpe.toFixed(2)} | ${(a.stress.ddP95 * 100).toFixed(0)}% | ${years.map((y) => pct(a.years.get(y) ?? NaN)).join(' | ')} |`);
  console.log(lines[lines.length - 1]);
}
writeFileSync(join(import.meta.dirname, 'RESULTS-account-tests.md'), lines.join('\n') + '\n');
