// Exit research: which exit rules improve the composite? Blind walk-forward
// pooled across the 20-coin universe with real funding.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { backtest } from '../src/backtest';
import { composite } from '../src/composite';
import type { RiskParams, Trade } from '../src/types';
import { DAY, dataset, fmt, limitRisk, summarizeR, type Dataset } from './lib';
import { UNIVERSE } from './universe';

interface Variant { name: string; risk: Partial<RiskParams>; maxBars?: number }
const styles: Variant[] = [
  { name: 'composite exit', risk: {} },
  { name: 'trail 2.5 ATR', risk: { trailAtr: 2.5 } },
  { name: 'trail 4 ATR', risk: { trailAtr: 4 } },
  { name: 'half at 1R + breakeven', risk: { partialR: 1, partialFrac: 0.5, breakevenAfterPartial: true } },
  { name: 'half at 1.5R + breakeven', risk: { partialR: 1.5, partialFrac: 0.5, breakevenAfterPartial: true } },
  { name: 'full target 3R', risk: { takeProfitR: 3 } },
  { name: 'time limit 30 bars', risk: {}, maxBars: 30 },
  { name: 'time limit 60 bars', risk: {}, maxBars: 60 },
];
const variants: Variant[] = [2, 3, 4].flatMap((s) => styles.map((v) => ({ ...v, name: `stop ${s} ATR · ${v.name}`, risk: { stopAtr: s, ...v.risk } })));
const BASE = 'stop 3 ATR · composite exit';

function runVariant(d: Dataset, v: Variant): Trade[] {
  const out = composite.build(d.candles, composite.defaults);
  const risk = { ...limitRisk, ...out.risk, ...v.risk };
  return backtest(d.candles, out.signals, out.atr, risk, { ...out.rules, funding: d.funding, maxBars: v.maxBars }).trades;
}

const tstat = (rs: number[]) => {
  if (rs.length < 20) return -Infinity;
  const m = rs.reduce((a, r) => a + r, 0) / rs.length;
  const sd = Math.sqrt(rs.reduce((a, r) => a + (r - m) ** 2, 0) / rs.length);
  return sd ? (m / sd) * Math.sqrt(rs.length) : 0;
};

const lines: string[] = [];
for (const iv of (process.env.INTERVALS ?? '4h,1h').split(',')) {
  // trades[variant] = all trades across coins (only after each coin's first 2 years count as test)
  const all = new Map<string, Trade[]>(variants.map((v) => [v.name, []]));
  const testStartByTrade = new WeakMap<Trade, number>();
  for (const sym of UNIVERSE) {
    const d = await dataset(sym, iv);
    for (const v of variants)
      for (const t of runVariant(d, v)) {
        testStartByTrade.set(t, d.testStart);
        all.get(v.name)!.push(t);
      }
    process.stdout.write('.');
  }
  let first = Infinity;
  let last = -Infinity;
  for (const tr of all.values()) for (const t of tr) [first, last] = [Math.min(first, t.entryTime), Math.max(last, t.entryTime)];
  const oos: Trade[] = [];
  const baseOos: Trade[] = [];
  const picks: string[] = [];
  for (let ws = first + 730 * DAY; ws < last; ws += 182 * DAY) {
    const we = ws + 182 * DAY;
    let best = BASE;
    let bestScore = -Infinity;
    for (const [name, tr] of all) {
      // Pick by total profit (R) on everything before the window.
      const past = tr.filter((t) => t.entryTime < ws && t.exitTime < ws);
      const score = past.length < 20 ? -Infinity : past.reduce((a, t) => a + t.rMultiple, 0);
      if (score > bestScore) [best, bestScore] = [name, score];
    }
    picks.push(`${new Date(ws * 1000).toISOString().slice(0, 7)} → ${best}`);
    const inWin = (t: Trade) => t.entryTime >= ws && t.entryTime < we && t.entryTime >= testStartByTrade.get(t)!;
    oos.push(...all.get(best)!.filter(inWin));
    baseOos.push(...all.get(BASE)!.filter(inWin));
  }
  const row = (label: string, tr: Trade[]) => {
    const s = summarizeR(tr.sort((a, b) => a.exitTime - b.exitTime));
    return `| ${iv} | ${label} | ${s.n} | ${fmt(s.win * 100, 1)}% | ${fmt(s.pf)} | ${fmt(s.avgR, 3)} | ${fmt(s.totalR, 0)} | ${fmt(s.maxDdR, 1)} |`;
  };
  // Full-period (test years) league table for reference, sorted by t-stat.
  const league = [...all.entries()]
    .map(([name, tr]) => ({ name, tr: tr.filter((t) => t.entryTime >= testStartByTrade.get(t)!) }))
    .map((x) => ({ ...x, t: tstat(x.tr.map((t) => t.rMultiple)) }))
    .sort((a, b) => b.t - a.t);
  lines.push(`\n## ${iv}\n\n| TF | Exit | Trades | Win | PF | Avg R | Total R | Max DD (R) |\n|---|---|---|---|---|---|---|---|`);
  lines.push(row('**Walk-forward pick (blind)**', oos), row(`Baseline: ${BASE}`, baseOos));
  lines.push(`\nPicks per window: ${picks.join('; ')}\n\nAll variants over the test years (hindsight, for reference):\n\n| TF | Exit | Trades | Win | PF | Avg R | Total R | Max DD (R) |\n|---|---|---|---|---|---|---|---|`);
  for (const x of league) lines.push(row(x.name, x.tr));
  console.log(`\n${iv}\n` + lines.slice(-league.length - 6).join('\n'));
}
writeFileSync(join(import.meta.dirname, process.env.OUT ?? 'RESULTS-exits.md'), `# Exit research (20 coins, real funding, limit orders)\n${lines.join('\n')}\n`);
