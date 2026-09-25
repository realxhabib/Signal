// Round 6 summary: every variant tried this round, and the Deflated Sharpe of the shipped account.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { evaluate } from './round6-lib';
import { deflatedSharpe, trials } from './validation';

const base = await evaluate({ name: 'Baseline' }, 'research', false);
// Variants of the account itself; the pairs sleeves are a different strategy family and would inflate the spread.
const all = trials().filter((t) => t.round === 6 && !t.name.startsWith('Pairs'));
const sh = all.map((t) => t.sharpe);
const d = deflatedSharpe(base.daily, sh, all.length);
const d1000 = deflatedSharpe(base.daily, sh, 1000);
const lines = [
  '# Round 6 · Deflated Sharpe of the shipped account\n',
  `Research years, daily returns, ${base.daily.length} days. Annualised Sharpe ${d.sharpe.toFixed(2)}.\n`,
  '| Trials assumed | Sharpe the luckiest trial would reach by chance | Probability the edge is real |',
  '|---|---|---|',
  `| ${all.length} (account variants tried this round) | ${d.luckSharpe.toFixed(2)} | **${(d.dsr * 100).toFixed(1)}%** |`,
  `| 1000 (everything tried in the project, conservative) | ${d1000.luckSharpe.toFixed(2)} | **${(d1000.dsr * 100).toFixed(1)}%** |`,
  `\nProbability the Sharpe is above zero with no selection penalty (PSR): ${(d.psr * 100).toFixed(2)}%.`,
  `\nSharpe of all ${all.length} variants this round: min ${Math.min(...sh).toFixed(2)}, median ${[...sh].sort((a, b) => a - b)[Math.floor(sh.length / 2)].toFixed(2)}, max ${Math.max(...sh).toFixed(2)}.`,
];
console.log(lines.join('\n'));
writeFileSync(join(import.meta.dirname, 'RESULTS-round6-dsr.md'), lines.join('\n') + '\n');
