// Buying and selling in levels: which level rules improve the account? Research period only.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { RiskParams } from '../src/types';
import { accountTrades, pct, runAccount } from './account';

const iv = process.env.INTERVALS ?? '4h';
const variants: [string, Partial<RiskParams>][] = [
  ['Baseline (single entry, strategy exit)', {}],
  ['Scale-in: ½ at signal, ½ on a limit 1 ATR better', { entryFrac: 0.5, scaleIn: [{ atr: 1, frac: 0.5, bars: 6 }] }],
  ['Scale-in: ⅓ + ⅓ at 1 ATR + ⅓ at 2 ATR', { entryFrac: 1 / 3, scaleIn: [{ atr: 1, frac: 1 / 3, bars: 6 }, { atr: 2, frac: 1 / 3, bars: 6 }] }],
  ['Pyramid: +½ at +1R, stop to breakeven', { pyramid: [{ r: 1, frac: 0.5 }], breakevenAfterAdd: true }],
  ['Pyramid: +½ at +1R and +½ at +2R, stop to breakeven', { pyramid: [{ r: 1, frac: 0.5 }, { r: 2, frac: 0.5 }], breakevenAfterAdd: true }],
  ['Pyramid: +½ at +2R, stop to breakeven', { pyramid: [{ r: 2, frac: 0.5 }], breakevenAfterAdd: true }],
  ['Scale-out far: ⅓ at 3R, ⅓ at 6R, rest rides', { scaleOut: [{ r: 3, frac: 1 / 3 }, { r: 6, frac: 1 / 3 }] }],
  ['Swing stop (10-bar extreme)', { swingStop: 10 }],
  ['Swing stop (20-bar extreme)', { swingStop: 20 }],
  ['Pyramid +½ at +1R + scale-out ⅓ at 4R', { pyramid: [{ r: 1, frac: 0.5 }], breakevenAfterAdd: true, scaleOut: [{ r: 4, frac: 1 / 3 }] }],
  ['Scale-in ½/½ + pyramid +½ at +2R', { entryFrac: 0.5, scaleIn: [{ atr: 1, frac: 0.5, bars: 6 }], pyramid: [{ r: 2, frac: 0.5 }], breakevenAfterAdd: true }],
];
const years = ['2020', '2021', '2022', '2023', '2024', '2025'];
const lines = [`# Levels study (${iv}, 20 coins, research period before the locked final year)\n`, `| Variant | Trades | Win | Avg R | CAGR | Max DD | Sharpe | ${years.join(' | ')} |`, `|---|---|---|---|---|---|---|${years.map(() => '---').join('|')}|`];
for (const [name, risk] of variants) {
  const { trades, candlesBySym } = await accountTrades(iv, undefined, undefined, risk);
  const res = trades.filter((t) => t.entryTime < Date.UTC(2025, 8, 24) / 1000);
  const wins = res.filter((t) => t.rMultiple > 0).length;
  const avgR = res.reduce((a, t) => a + t.rMultiple, 0) / res.length;
  const a = await runAccount(iv, trades, candlesBySym);
  lines.push(`| ${name} | ${res.length} | ${pct(wins / res.length)} | ${avgR.toFixed(3)} | ${pct(a.cagr)} | ${(a.maxDd * 100).toFixed(1)}% | ${a.sharpe.toFixed(2)} | ${years.map((y) => pct(a.years.get(y) ?? NaN)).join(' | ')} |`);
  console.log(lines[lines.length - 1]);
}
writeFileSync(join(import.meta.dirname, `RESULTS-levels-${iv}.md`), lines.join('\n') + '\n');
