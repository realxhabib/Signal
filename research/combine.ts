// Combine the regime-adaptive composite account with the market-neutral momentum sleeve.
// Momentum lookback is chosen blind every 6 months (best trailing 2-year Sharpe).
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { RECOMMENDED } from '../src/composite';
import { computeFeatures } from '../src/features';
import { history } from './history';
import { collectTrades, simulate, type PTrade } from './portfolio';
import { momentum, perf, type Daily } from './sleeves';

const DAY = 86_400;
// ---- main account (regime-adaptive) -> daily returns
const btc = await history('BTCUSDT', '4h');
const reg = computeFeatures(btc).regime;
const idx = new Map(btc.map((b, i) => [b.time, i]));
const regBefore = (time: number) => reg[idx.get(time - 14_400) ?? -1] ?? 0;
const regAt = (t: PTrade) => reg[idx.get(t.candles[t.entryIndex - 1].time) ?? -1] ?? 0;
const { trades, candlesBySym } = await collectTrades('4h', RECOMMENDED);
export const ADAPTIVE = { bearShortRisk: 0.75, bearShortSlots: 5, neutralShortRisk: 0.5, neutralShortSlots: 3, longSlots: 5 };
const sim = simulate(trades, candlesBySym, {
  riskPct: 1,
  sizing: 'risk',
  weight: (t) => { const r = regAt(t); return t.side === 'long' ? (r === -1 ? 0 : 1) : r === -1 ? ADAPTIVE.bearShortRisk : r === 0 ? ADAPTIVE.neutralShortRisk : 0; },
  caps: (time) => { const r = regBefore(time); return r === -1 ? { long: 0, short: ADAPTIVE.bearShortSlots } : r === 0 ? { long: ADAPTIVE.longSlots, short: ADAPTIVE.neutralShortSlots } : { long: ADAPTIVE.longSlots, short: 0 }; },
});
const mainDaily = new Map<number, number>();
{
  // Equity at the end of each UTC day, then day-over-day returns.
  const endOfDay = new Map<number, number>();
  for (const p of sim.curve) endOfDay.set(Math.floor(p.time / DAY) * DAY, p.equity);
  const days = [...endOfDay.keys()].sort((x, y) => x - y);
  for (let i = 1; i < days.length; i++) mainDaily.set(days[i], endOfDay.get(days[i])! / endOfDay.get(days[i - 1])! - 1);
}

// ---- momentum sleeve with blind lookback selection
const lookbacks = [7, 14, 30, 60, 90];
const series = new Map<number, Map<number, number>>();
for (const L of lookbacks) series.set(L, new Map((await momentum(L)).map((x) => [x.time, x.ret])));
const allDays = [...series.get(30)!.keys()].sort((a, b) => a - b);
const sharpeOf = (L: number, from: number, to: number) => {
  const xs = allDays.filter((d) => d >= from && d < to).map((d) => series.get(L)!.get(d) ?? 0);
  if (xs.length < 300) return -Infinity;
  const m = xs.reduce((a, v) => a + v, 0) / xs.length;
  const sd = Math.sqrt(xs.reduce((a, v) => a + (v - m) ** 2, 0) / xs.length);
  return sd ? m / sd : 0;
};
const momDaily = new Map<number, number>();
const picks: string[] = [];
for (let ws = allDays[0] + 730 * DAY; ws < allDays[allDays.length - 1]; ws += 182 * DAY) {
  const best = lookbacks.reduce((b, L) => (sharpeOf(L, ws - 730 * DAY, ws) > sharpeOf(b, ws - 730 * DAY, ws) ? L : b), 30);
  picks.push(`${new Date(ws * 1000).toISOString().slice(0, 7)}:${best}d`);
  for (const d of allDays) if (d >= ws && d < ws + 182 * DAY) momDaily.set(d, series.get(best)!.get(d) ?? 0);
}

// ---- blends (capital split), common period
const common = [...mainDaily.keys()].filter((d) => momDaily.has(d)).sort((a, b) => a - b);
const blend = (wMom: number): Daily[] => common.map((d) => ({ time: d, ret: (1 - wMom) * mainDaily.get(d)! + wMom * momDaily.get(d)! }));
const corr = (() => {
  const a = common.map((d) => mainDaily.get(d)!);
  const b = common.map((d) => momDaily.get(d)!);
  const ma = a.reduce((s, v) => s + v, 0) / a.length;
  const mb = b.reduce((s, v) => s + v, 0) / b.length;
  let num = 0, da = 0, db = 0;
  for (let i = 0; i < a.length; i++) { num += (a[i] - ma) * (b[i] - mb); da += (a[i] - ma) ** 2; db += (b[i] - mb) ** 2; }
  return num / Math.sqrt(da * db);
})();
const quarters = (xs: Daily[]) => {
  const q = new Map<string, number>();
  for (const x of xs) { const dt = new Date(x.time * 1000); const k = `${dt.getUTCFullYear()}Q${Math.floor(dt.getUTCMonth() / 3) + 1}`; q.set(k, (q.get(k) ?? 1) * (1 + x.ret)); }
  return [...q.values()].map((v) => v - 1);
};
const f = (v: number) => `${v >= 0 ? '+' : ''}${(v * 100).toFixed(0)}%`;
const lines = [
  `# Round 5: making money in bull and bear markets\n`,
  `Momentum lookback picks (blind, every 6 months): ${picks.join(', ')}. Daily correlation between the composite account and the momentum sleeve: ${corr.toFixed(2)}.\n`,
  `Common period ${new Date(common[0] * 1000).toISOString().slice(0, 10)} → ${new Date(common[common.length - 1] * 1000).toISOString().slice(0, 10)}.\n`,
  '| Capital split (composite / momentum) | CAGR | Max DD | Sharpe | Losing quarters | Worst quarter | ' + ['2020', '2021', '2022', '2023', '2024', '2025', '2026'].join(' | ') + ' |',
  '|---|---|---|---|---|---|---|---|---|---|---|---|---|',
];
for (const w of [0, 0.2, 0.3, 0.4, 0.5, 1]) {
  const xs = blend(w);
  const p = perf(xs);
  const qs = quarters(xs);
  lines.push(`| ${Math.round((1 - w) * 100)} / ${Math.round(w * 100)} | ${f(p.cagr)} | ${(p.maxDd * 100).toFixed(1)}% | ${p.sharpe.toFixed(2)} | ${qs.filter((v) => v < 0).length}/${qs.length} | ${f(Math.min(...qs))} | ${['2020', '2021', '2022', '2023', '2024', '2025', '2026'].map((y) => f(p.years.get(y) ?? NaN)).join(' | ')} |`);
}
console.log(lines.join('\n'));
writeFileSync(join(import.meta.dirname, 'RESULTS-round5.md'), lines.join('\n') + '\n');
