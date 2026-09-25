// Forward test: the shipped rules scored only on data after they were frozen (FORWARD_START).
// Re-run any time after refreshing the data cache; nothing here was used to pick the rules.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { evaluate, header, row } from './round6-lib';
import { FORWARD_START } from './validation';

const days = (Date.now() / 1000 - FORWARD_START) / 86_400;
const lines = [`# Forward test since ${new Date(FORWARD_START * 1000).toISOString().slice(0, 10)} (${days.toFixed(0)} days)\n`];
try {
  const r = await evaluate({ name: 'Shipped account (1% base risk)' }, 'forward', false);
  lines.push(header, row(r), `\nTrades taken: ${r.trades4} on 4h, ${r.trades1} on 1h.`);
  if (days < 180) lines.push('\nUnder 6 months of forward data: too early to judge; a Sharpe estimate this short is mostly noise.');
} catch {
  lines.push('No trades since the freeze yet.');
}
console.log(lines.join('\n'));
writeFileSync(join(import.meta.dirname, 'RESULTS-forward.md'), lines.join('\n') + '\n');
