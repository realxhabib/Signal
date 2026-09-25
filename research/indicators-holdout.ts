// Locked-year check for the tournament's leading line-ups (evaluated once).
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { COMPONENTS, LEVELS, RECOMMENDED } from '../src/composite';
import { accountTrades, pct, runAccount } from './account';

const idOf = (id: string) => 2 ** COMPONENTS.findIndex((s) => s.id === id);
const base = RECOMMENDED.mask;
const lineups: [string, number][] = [
  ['Current (Supertrend + RSI2 + Bollinger reversion)', base],
  ['+ Hull MA', base + idOf('hma')],
  ['+ Squeeze breakout', base + idOf('squeeze')],
  ['+ Ichimoku', base + idOf('ichimoku')],
  ['+ Hull MA + Squeeze', base + idOf('hma') + idOf('squeeze')],
  ['+ Parabolic SAR', base + idOf('psar')],
];
const lines = ['# Indicator line-ups on the locked final year\n', '| Line-up | Research: CAGR / DD / Sharpe | **Locked year**: return / DD / Sharpe |', '|---|---|---|'];
for (const [name, mask] of lineups) {
  const { trades, candlesBySym } = await accountTrades('4h', { ...RECOMMENDED, mask, shortMask: mask }, undefined, LEVELS);
  const r = await runAccount('4h', trades, candlesBySym, {}, 'research');
  const h = await runAccount('4h', trades, candlesBySym, {}, 'holdout');
  const tot = h.curve[h.curve.length - 1].equity / h.curve[0].equity - 1;
  lines.push(`| ${name} | ${pct(r.cagr)} / ${(r.maxDd * 100).toFixed(0)}% / ${r.sharpe.toFixed(2)} | **${pct(tot, 1)}** / ${(h.maxDd * 100).toFixed(0)}% / ${h.sharpe.toFixed(2)} |`);
  console.log(lines[lines.length - 1]);
}
writeFileSync(join(import.meta.dirname, 'RESULTS-indicators-holdout.md'), lines.join('\n') + '\n');
