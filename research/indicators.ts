// Indicator tournament. Research period only (the last 12 months stay locked).
//  1. Standalone: each indicator as its own strategy on 20 coins (4h), longs + shorts, market-mode gate.
//  2. Team: add each indicator to the Signal Composite and measure the whole account.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { backtest } from '../src/backtest';
import { COMPONENTS, LEVELS, RECOMMENDED } from '../src/composite';
import { applyBtcGate, btcRegimeByTime } from '../src/scan';
import { accountTrades, HOLDOUT_START, pct, runAccount } from './account';
import { dataset, limitRisk } from './lib';
import { UNIVERSE } from './universe';

const iv = process.env.INTERVALS ?? '4h';
const lines: string[] = [`# Indicator tournament (${iv}, 20 coins, research period before ${new Date(HOLDOUT_START * 1000).toISOString().slice(0, 10)})\n`];

// ---- 1. standalone ------------------------------------------------------------------
const btc = (await dataset('BTCUSDT', iv)).candles;
const btcReg = btcRegimeByTime(btc);
const data = [];
for (const s of UNIVERSE) data.push(await dataset(s, iv));
lines.push('## 1. Each indicator on its own\n', '| # | Indicator | Trades | Win | Profit factor | Avg R | Total R | Coins profitable |', '|---|---|---|---|---|---|---|---|');
const standalone: { k: number; name: string; totalR: number }[] = [];
for (let k = 0; k < COMPONENTS.length; k++) {
  const s = COMPONENTS[k];
  const p = { ...s.defaults, ...('shorts' in s.defaults ? { shorts: 1 } : {}) };
  let rs: number[] = [];
  let coinsUp = 0;
  for (const d of data) {
    const out = s.build(d.candles, p);
    const sigs = applyBtcGate(out.signals, d.symbol, btcReg);
    const tr = backtest(d.candles, sigs, out.atr, { ...limitRisk, ...out.risk }, { ...out.rules, funding: d.funding }).trades.filter(
      (t) => t.entryTime >= d.testStart && t.entryTime < HOLDOUT_START && t.exitReason !== 'end',
    );
    const tot = tr.reduce((a, t) => a + t.rMultiple, 0);
    if (tot > 0) coinsUp++;
    rs = rs.concat(tr.map((t) => t.rMultiple));
  }
  const wins = rs.filter((r) => r > 0);
  const gw = wins.reduce((a, r) => a + r, 0);
  const gl = -rs.filter((r) => r <= 0).reduce((a, r) => a + r, 0);
  standalone.push({ k, name: s.name, totalR: gw - gl });
  lines.push(`| ${k} | ${s.name} | ${rs.length} | ${pct(wins.length / rs.length)} | ${(gw / gl).toFixed(2)} | ${((gw - gl) / rs.length).toFixed(3)} | ${(gw - gl).toFixed(0)} | ${coinsUp}/20 |`);
  console.log(lines[lines.length - 1]);
}

// ---- 2. team: add each to the composite -------------------------------------------------
lines.push('\n## 2. Added to the Signal Composite (whole account, pyramid, market modes)\n', '| Line-up | CAGR | Max DD | Sharpe | 2022 |', '|---|---|---|---|---|');
const account = async (mask: number) => {
  const { trades, candlesBySym } = await accountTrades(iv, { ...RECOMMENDED, mask, shortMask: mask }, undefined, LEVELS);
  return runAccount(iv, trades, candlesBySym);
};
const bit = (k: number) => 2 ** k;
const row = (name: string, a: Awaited<ReturnType<typeof account>>) => {
  lines.push(`| ${name} | ${pct(a.cagr)} | ${(a.maxDd * 100).toFixed(1)}% | ${a.sharpe.toFixed(2)} | ${pct(a.years.get('2022') ?? NaN)} |`);
  console.log(lines[lines.length - 1]);
};
const baseMask = RECOMMENDED.mask;
const baseRes = await account(baseMask);
row('Current: Supertrend + RSI(2) + Bollinger reversion', baseRes);
const results: { k: number; sharpe: number; cagr: number }[] = [];
for (let k = 3; k < COMPONENTS.length; k++) {
  if (COMPONENTS[k].id === 'fib-control') continue;
  const a = await account(baseMask + bit(k));
  results.push({ k, sharpe: a.sharpe, cagr: a.cagr });
  row(`+ ${COMPONENTS[k].name}`, a);
}
for (const k of [0, 1, 2]) row(`− ${COMPONENTS[k].name} (removed)`, await account(baseMask - bit(k)));

// ---- 3. greedy forward selection -------------------------------------------------------
lines.push('\n## 3. Greedy selection (add the best while Sharpe improves by ≥ 0.03 without lowering CAGR)\n');
let mask = baseMask;
let best = baseRes;
for (let round = 0; round < 4; round++) {
  let cand: { k: number; a: typeof best } | null = null;
  for (let k = 3; k < COMPONENTS.length; k++) {
    if (Math.floor(mask / bit(k)) % 2 || COMPONENTS[k].id === 'fib-control') continue;
    if (round === 0) {
      const r = results.find((x) => x.k === k)!;
      if (r.sharpe >= best.sharpe + 0.03 && r.cagr >= best.cagr && (!cand || r.sharpe > cand.a.sharpe)) cand = { k, a: await account(mask + bit(k)) };
      continue;
    }
    const a = await account(mask + bit(k));
    if (a.sharpe >= best.sharpe + 0.03 && a.cagr >= best.cagr && (!cand || a.sharpe > cand.a.sharpe)) cand = { k, a };
  }
  if (!cand) break;
  mask += bit(cand.k);
  best = cand.a;
  lines.push(`- Round ${round + 1}: add **${COMPONENTS[cand.k].name}** → CAGR ${pct(best.cagr)}, max DD ${(best.maxDd * 100).toFixed(1)}%, Sharpe ${best.sharpe.toFixed(2)}`);
  console.log(lines[lines.length - 1]);
}
lines.push(`\nSelected mask: ${mask} (${COMPONENTS.filter((_, k) => Math.floor(mask / bit(k)) % 2).map((s) => s.name).join(', ')})`);
console.log(lines[lines.length - 1]);
writeFileSync(join(import.meta.dirname, `RESULTS-indicators-${iv}.md`), lines.join('\n') + '\n');
