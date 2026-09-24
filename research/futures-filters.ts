// Do futures positioning extremes predict which composite longs fail?
// For each filter we look at the trades it would remove, split into the first
// and second half of the data: a real filter removes losing trades in BOTH halves.
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { composite } from '../src/composite';
import type { Trade } from '../src/types';
import { funding as loadFunding, metrics as loadMetrics, type Metric } from './futures';
import { futuresFeatures, type FuturesFeatures } from './futures-features';
import { dataset, fmt, run } from './lib';
import { UNIVERSE } from './universe';

type Filter = { name: string; skip: (f: FuturesFeatures, i: number) => boolean | null; needsMetrics?: boolean };
const filters: Filter[] = [
  { name: 'funding > 0.05%/8h (hot longs)', skip: (f, i) => (Number.isNaN(f.funding[i]) ? null : f.funding[i] > 0.0005) },
  { name: 'funding > 0.03%/8h', skip: (f, i) => (Number.isNaN(f.funding[i]) ? null : f.funding[i] > 0.0003) },
  { name: 'funding in top 10% of 90d', skip: (f, i) => (Number.isNaN(f.fundingPct[i]) ? null : f.fundingPct[i] > 0.9) },
  { name: 'funding negative (shorts paying)', skip: (f, i) => (Number.isNaN(f.funding[i]) ? null : f.funding[i] < 0) },
  { name: 'OI +10% in 24h (leverage surge)', needsMetrics: true, skip: (f, i) => (Number.isNaN(f.oiChange1d[i]) ? null : f.oiChange1d[i] > 0.1) },
  { name: 'OI +25% in 7d', needsMetrics: true, skip: (f, i) => (Number.isNaN(f.oiChange7d[i]) ? null : f.oiChange7d[i] > 0.25) },
  { name: 'OI falling >10% in 7d (deleveraging)', needsMetrics: true, skip: (f, i) => (Number.isNaN(f.oiChange7d[i]) ? null : f.oiChange7d[i] < -0.1) },
  { name: 'retail long/short in top 10% of 30d', needsMetrics: true, skip: (f, i) => (Number.isNaN(f.globalRatioPct[i]) ? null : f.globalRatioPct[i] > 0.9) },
  { name: 'retail long/short in bottom 10%', needsMetrics: true, skip: (f, i) => (Number.isNaN(f.globalRatioPct[i]) ? null : f.globalRatioPct[i] < 0.1) },
  { name: 'top traders net short-ish (bottom 10%)', needsMetrics: true, skip: (f, i) => (Number.isNaN(f.topRatioPct[i]) ? null : f.topRatioPct[i] < 0.1) },
  { name: 'top traders in top 10%', needsMetrics: true, skip: (f, i) => (Number.isNaN(f.topRatioPct[i]) ? null : f.topRatioPct[i] > 0.9) },
  { name: 'taker selling (24h ratio < 0.9)', needsMetrics: true, skip: (f, i) => (Number.isNaN(f.taker24h[i]) ? null : f.taker24h[i] < 0.9) },
];

const hasMetrics = (s: string) => existsSync(join(import.meta.dirname, '.cache', `${s}-metrics.json`));
for (const iv of (process.env.INTERVALS ?? '4h,1h').split(',')) {
  // Per filter: R of trades removed / kept, by half, over trades where the feature is known.
  const acc = filters.map(() => ({ removed: [[], []] as number[][], kept: [[], []] as number[][] }));
  for (const sym of process.env.SYMBOLS ? process.env.SYMBOLS.split(',') : UNIVERSE) {
    const d = await dataset(sym, iv);
    const m: Metric[] = hasMetrics(sym) ? await loadMetrics(sym) : [];
    const ff = futuresFeatures(d.candles, await loadFunding(sym), m);
    const trades: Trade[] = run(d, composite).filter((t) => t.side === 'long');
    const known = trades.filter((t) => !Number.isNaN(ff.funding[t.entryIndex - 1]));
    if (!known.length) continue;
    const mid = known[Math.floor(known.length / 2)].entryTime;
    filters.forEach((flt, k) => {
      if (flt.needsMetrics && !m.length) return;
      for (const t of known) {
        const v = flt.skip(ff, t.entryIndex - 1);
        if (v === null) continue;
        const half = t.entryTime < mid ? 0 : 1;
        (v ? acc[k].removed : acc[k].kept)[half].push(t.rMultiple);
      }
    });
    process.stdout.write('.');
  }
  const avg = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : NaN);
  console.log(`\n== ${iv}  (avg R per trade; a useful filter removes trades with avg R well below the kept ones, in both halves)`);
  console.log('filter'.padEnd(40), 'removed(1st half)'.padEnd(22), 'removed(2nd half)'.padEnd(22), 'kept(1st)'.padEnd(16), 'kept(2nd)');
  filters.forEach((flt, k) => {
    const a = acc[k];
    const cell = (x: number[]) => `${fmt(avg(x), 3)} (n=${x.length})`;
    console.log(flt.name.padEnd(40), cell(a.removed[0]).padEnd(22), cell(a.removed[1]).padEnd(22), cell(a.kept[0]).padEnd(16), cell(a.kept[1]));
  });
}
