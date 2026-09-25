// Round 6 · Trend or mean reversion? The Hurst exponent (aggregated-variance method over the last 500 bars,
// scales 1–32) and the variance ratio VR(12) say whether a coin has recently trended (H > 0.5, VR > 1) or
// mean-reverted (H < 0.5, VR < 1). Idea: trust trend strategies (Supertrend, Hull MA) in trending coins and
// reversion strategies (RSI(2) pullback, Bollinger reversion) in mean-reverting ones. Research years only.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { COMPONENTS, lineupFor, votes } from '../src/composite';
import type { Candle } from '../src/types';
import { HOLDOUT_START } from './account';
import type { PTrade } from './portfolio';
import { evaluate, header, row, shippedTrades } from './round6-lib';

const TREND = new Set(['supertrend', 'hma']);
const WIN = 500;

const voteCache = new Map<Candle[], { id: string; v: Int8Array }[]>();
function componentVotes(c: Candle[], iv: string) {
  let v = voteCache.get(c);
  if (!v) {
    const mask = lineupFor(iv).mask;
    v = COMPONENTS.filter((_, k) => Math.floor(mask / 2 ** k) % 2 === 1).map((s) => ({ id: s.id, v: votes(c, s, true) }));
    voteCache.set(c, v);
  }
  return v;
}
/** Which kind of strategy opened the trade: trend, reversion, or both. */
function trigger(t: PTrade, iv: string): 'trend' | 'reversion' | 'both' {
  const dir = t.side === 'long' ? 1 : -1;
  const on = componentVotes(t.candles, iv).filter((x) => x.v[t.entryIndex - 1] === dir).map((x) => x.id);
  const tr = on.some((id) => TREND.has(id));
  const rv = on.some((id) => !TREND.has(id));
  return tr && rv ? 'both' : tr ? 'trend' : 'reversion';
}

const lrCache = new Map<Candle[], Float64Array>();
function stats(c: Candle[], i: number) {
  let lr = lrCache.get(c);
  if (!lr) {
    lr = Float64Array.from(c, (b, k) => (k ? Math.log(b.close / c[k - 1].close) : 0));
    lrCache.set(c, lr);
  }
  const from = Math.max(1, i - WIN + 1);
  const varQ = (q: number) => {
    const xs: number[] = [];
    for (let k = from; k + q - 1 <= i; k += q) {
      let s = 0;
      for (let j = k; j < k + q; j++) s += lr![j];
      xs.push(s);
    }
    const m = xs.reduce((a, v) => a + v, 0) / xs.length;
    return xs.reduce((a, v) => a + (v - m) ** 2, 0) / xs.length;
  };
  const qs = [1, 2, 4, 8, 16, 32];
  const ly = qs.map((q) => Math.log(varQ(q)));
  const lx = qs.map(Math.log);
  const mx = lx.reduce((a, v) => a + v, 0) / lx.length;
  const my = ly.reduce((a, v) => a + v, 0) / ly.length;
  const slope = lx.reduce((a, x, j) => a + (x - mx) * (ly[j] - my), 0) / lx.reduce((a, x) => a + (x - mx) ** 2, 0);
  const v1 = varQ(1);
  return { hurst: slope / 2, vr: varQ(12) / (12 * v1) };
}

const { t4, t1 } = await shippedTrades();
type Tagged = { t: PTrade; kind: ReturnType<typeof trigger>; hurst: number; vr: number };
const tag = (ts: PTrade[], iv: string): Tagged[] => ts.map((t) => ({ t, kind: trigger(t, iv), ...stats(t.candles, t.entryIndex - 1) }));
const tagged = { '4h': tag(t4.trades, '4h'), '1h': tag(t1.trades, '1h') };

const lines = ['# Round 6 · Trend vs mean reversion (Hurst exponent, variance ratio)\n', 'Average result (R) and win rate by Hurst quintile at the signal candle, split by which kind of strategy opened the trade. Research years only.\n'];
const cuts: Record<string, number[]> = {};
for (const iv of ['4h', '1h'] as const) {
  const rs = tagged[iv].filter((x) => x.t.entryTime < HOLDOUT_START);
  const hs = rs.map((x) => x.hurst).sort((a, b) => a - b);
  cuts[iv] = [1, 2, 3, 4].map((j) => hs[Math.floor((j * hs.length) / 5)]);
  lines.push(`\n## ${iv} (Hurst quintile edges ${cuts[iv].map((v) => v.toFixed(3)).join(', ')})\n`, '| Opened by | n | Q1 (reverting) | Q2 | Q3 | Q4 | Q5 (trending) |', '|---|---|---|---|---|---|---|');
  for (const kind of ['trend', 'reversion', 'both'] as const) {
    const sel = rs.filter((x) => x.kind === kind);
    const q = [0, 1, 2, 3, 4].map((j) => sel.filter((x) => (j === 0 || x.hurst >= cuts[iv][j - 1]) && (j === 4 || x.hurst < cuts[iv][j])));
    lines.push(`| ${kind} | ${sel.length} | ${q.map((b) => (b.length ? `${(b.reduce((a, x) => a + x.t.rMultiple, 0) / b.length).toFixed(2)}R · ${((b.filter((x) => x.t.rMultiple > 0).length / b.length) * 100).toFixed(0)}%` : '—')).join(' | ')} |`);
    console.log(iv, lines[lines.length - 1]);
  }
}

// Account filters: drop trend-only trades in the most mean-reverting fifth, and reversion-only trades in the most
// trending fifth (and the VR version of the same idea).
const byTrade = new Map<PTrade, Tagged>([...tagged['4h'], ...tagged['1h']].map((x) => [x.t, x]));
const vrCut: Record<string, [number, number]> = {};
for (const iv of ['4h', '1h'] as const) {
  const v = tagged[iv].filter((x) => x.t.entryTime < HOLDOUT_START).map((x) => x.vr).sort((a, b) => a - b);
  vrCut[iv] = [v[Math.floor(v.length * 0.2)], v[Math.floor(v.length * 0.8)]];
}
const gate = (iv: string, useVr: boolean, which: 'both' | 'trend' | 'reversion') => (t: PTrade) => {
  const x = byTrade.get(t)!;
  const lo = useVr ? vrCut[iv][0] : cuts[iv][0];
  const hi = useVr ? vrCut[iv][1] : cuts[iv][3];
  const val = useVr ? x.vr : x.hurst;
  if (x.kind === 'trend' && which !== 'reversion' && val < lo) return false;
  if (x.kind === 'reversion' && which !== 'trend' && val >= hi) return false;
  return true;
};
lines.push('\n## Whole account with the regime gate (research years)\n', header);
const base = await evaluate({ name: 'Baseline' });
lines.push(row(base));
for (const [name, useVr, which] of [
  ['Hurst gate: trend trades need H above bottom 20%, reversion trades below top 20%', false, 'both'],
  ['Hurst gate: trend trades only', false, 'trend'],
  ['Hurst gate: reversion trades only', false, 'reversion'],
  ['Variance-ratio gate (both kinds)', true, 'both'],
] as const) {
  const r = await evaluate({ name, filter4: gate('4h', useVr, which), filter1: gate('1h', useVr, which) });
  lines.push(row(r, base));
  console.log(lines[lines.length - 1]);
}
writeFileSync(join(import.meta.dirname, 'RESULTS-round6-hurst.md'), lines.join('\n') + '\n');
