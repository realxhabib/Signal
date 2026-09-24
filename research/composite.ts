// Scores the app's fixed Signal Composite on every period after the first two
// years of each asset's history, for both order types, and stores the result
// for the app's performance panel.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { backtest, defaultRisk } from '../src/backtest';
import { composite } from '../src/composite';
import { history } from './history';
import { summarizeR } from './walkforward-stats';

const file = join(import.meta.dirname, '..', 'src', 'walkforward.json');
const wf = JSON.parse(readFileSync(file, 'utf8'));
const costs = { limit: { feePct: 0.02, slippagePct: 0 }, market: { feePct: 0.05, slippagePct: 0.02 } } as const;
for (const sym of ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'])
  for (const iv of ['1d', '4h', '1h']) {
    const c = await history(sym, iv);
    const start = c[0].time + 730 * 86_400;
    const years = (c[c.length - 1].time - start) / (365 * 86_400);
    const out = composite.build(c, composite.defaults);
    for (const [kind, cost] of Object.entries(costs)) {
      const risk = { ...defaultRisk, leverage: 5, riskPct: 1, ...cost, ...out.risk };
      const st = summarizeR(backtest(c, out.signals, out.atr, risk, out.rules).trades.filter((t) => t.entryTime >= start));
      wf[kind][`composite:${sym}:${iv}`] = {
        trades: st.n,
        winRate: +st.win.toFixed(3),
        profitFactor: Number.isFinite(st.pf) ? +st.pf.toFixed(2) : 99,
        avgR: +st.avgR.toFixed(3),
        perYear: +(st.n / years).toFixed(1),
      };
      console.log(sym, iv, kind, JSON.stringify(wf[kind][`composite:${sym}:${iv}`]));
    }
  }
writeFileSync(file, JSON.stringify(wf) + '\n');
