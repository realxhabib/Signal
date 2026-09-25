// Round 8 · Pattern-guided sizing of the Signal Composite: at each trade's signal, look up the coin's pattern score
// (walk-forward pattern library, cross-sectional z-score at the last closed 4h bar) and size the trade up when the
// pattern agrees with the trade's direction, down when it disagrees. Research years only.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { walkForwardScores } from './pattern-lib';
import type { PTrade } from './portfolio';
import { evaluate, header, row } from './round6-lib';
import { panel } from './sleeve-lib';

const p = await panel('4h');
const scored = walkForwardScores(p, 24, 32, 1, '20');
// Cross-sectional z-score per 4h bar.
const z = new Map<string, number>();
const byT = new Map<number, { s: number; score: number }[]>();
for (const x of scored) byT.set(x.t, [...(byT.get(x.t) ?? []), x]);
for (const [t, xs] of byT) {
  const m = xs.reduce((a, x) => a + x.score, 0) / xs.length;
  const sd = Math.sqrt(xs.reduce((a, x) => a + (x.score - m) ** 2, 0) / xs.length);
  for (const x of xs) z.set(`${p.times[t]}|${p.syms[x.s]}`, sd > 0 ? (x.score - m) / sd : 0);
}
/** Pattern z-score for a trade, signed so positive = the pattern agrees with the trade (NaN before 2020). */
function agree(t: PTrade) {
  const barSec = t.candles[1].time - t.candles[0].time;
  const close = t.candles[t.entryIndex - 1].time + barSec;
  const key = Math.floor(close / 14_400) * 14_400 - 14_400; // last 4h bar closed by the signal's close
  const v = z.get(`${key}|${t.sym}`);
  return v === undefined ? NaN : (t.side === 'long' ? 1 : -1) * v;
}
const lines = ['# Round 8 · Pattern-guided sizing of the Signal Composite\n', 'Research years. Size × clip(1 + k·z, lo, hi), where z = the coin\'s pattern z-score in the trade\'s direction at the signal.\n', header];
const base = await evaluate({ name: 'Baseline' });
lines.push(row(base));
for (const [name, f] of [
  ['Pattern sizing k=0.25 (0.5×–1.5×)', (v: number) => Math.min(1.5, Math.max(0.5, 1 + 0.25 * v))],
  ['Pattern sizing k=0.5 (0.5×–1.5×)', (v: number) => Math.min(1.5, Math.max(0.5, 1 + 0.5 * v))],
  ['Pattern sizing k=0.5 (0.25×–2×)', (v: number) => Math.min(2, Math.max(0.25, 1 + 0.5 * v))],
  ['Pattern veto: skip trades with z < −1', (v: number) => (v < -1 ? 0 : 1)],
] as const) {
  const sizeMult = (t: PTrade) => {
    const v = agree(t);
    return Number.isNaN(v) ? 1 : f(v);
  };
  const r = await evaluate({ name, o4: { sizeMult }, o1: { sizeMult } });
  lines.push(row(r, base));
  console.log(lines[lines.length - 1]);
}
writeFileSync(join(import.meta.dirname, 'RESULTS-round8-patternsize.md'), lines.join('\n') + '\n');
