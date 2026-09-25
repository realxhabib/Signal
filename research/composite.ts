// Scores the app's fixed Signal Composite on every period after the first two
// years of each asset's history, for both order types, and stores the result
// for the app's performance panel.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { backtest, defaultRisk } from '../src/backtest';
import { composite, LEVELS, lineupFor } from '../src/composite';
import { applyBtcGate, btcRegimeByTime } from '../src/scan';
import { dataset } from './lib';
import { UNIVERSE } from './universe';
import { summarizeR } from './walkforward-stats';

const file = join(import.meta.dirname, '..', 'src', 'walkforward.json');
const wf = JSON.parse(readFileSync(file, 'utf8'));
const costs = { limit: { feePct: 0.02, slippagePct: 0 }, market: { feePct: 0.05, slippagePct: 0.02 } } as const;
for (const sym of UNIVERSE)
  for (const iv of ['1d', '4h', '1h']) {
    const d = await dataset(sym, iv);
    const c = d.candles;
    const start = d.testStart;
    const years = (c[c.length - 1].time - start) / (365 * 86_400);
    const out = composite.build(c, lineupFor(iv));
    const btcC = sym === 'BTCUSDT' ? c : (await dataset('BTCUSDT', iv)).candles;
    out.signals = applyBtcGate(out.signals, sym, btcRegimeByTime(btcC));
    for (const [kind, cost] of Object.entries(costs)) {
      const risk = { ...defaultRisk, leverage: 5, riskPct: 1, ...cost, ...out.risk, ...LEVELS };
      const st = summarizeR(backtest(c, out.signals, out.atr, risk, { ...out.rules, funding: d.funding }).trades.filter((t) => t.entryTime >= start));
      wf[kind][`composite:${sym}:${iv}`] = {
        trades: st.n,
        winRate: +st.win.toFixed(3),
        profitFactor: Number.isFinite(st.pf) ? +st.pf.toFixed(2) : 99,
        avgR: +st.avgR.toFixed(3),
        perYear: +(st.n / years).toFixed(1),
      };
      if (kind === 'limit') console.log(sym, iv, JSON.stringify(wf[kind][`composite:${sym}:${iv}`]));
    }
  }
writeFileSync(file, JSON.stringify(wf) + '\n');
