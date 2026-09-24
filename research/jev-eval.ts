// Does Jev improve the Signal Composite? Run with TYPESAFE_API_KEY set:
//   TYPESAFE_API_KEY=... npm run jev-eval
// For each composite long on the chosen coins (test periods only), Jev judges
// the same market summary the app sends. Results are cached so re-runs are free.
// Output: the composite with and without the Jev veto, and by Jev conviction.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { forwardToJev } from '../api/jev';
import { composite } from '../src/composite';
import { approves, buildState, defaultJevThresholds, parseVerdict, type JevVerdict } from '../src/jev';
import { computeIndicators, defaultStrategy } from '../src/strategy';
import { ASSETS } from '../src/data';
import { dataset, fmt, inTest, run } from './lib';

if (!process.env.TYPESAFE_API_KEY) {
  console.log('Set TYPESAFE_API_KEY to run the Jev comparison.');
  process.exit(0);
}
const symbols = (process.env.SYMBOLS ?? 'BTCUSDT,ETHUSDT,SOLUSDT').split(',');
const iv = process.env.INTERVALS ?? '4h';
const cacheFile = join(import.meta.dirname, '.cache', `jev-${iv}.json`);
mkdirSync(join(import.meta.dirname, '.cache'), { recursive: true });
const cache: Record<string, JevVerdict> = existsSync(cacheFile) ? JSON.parse(readFileSync(cacheFile, 'utf8')) : {};

const rows: { r: number; v: JevVerdict; ok: boolean }[] = [];
for (const sym of symbols) {
  const d = await dataset(sym, iv);
  const ind = computeIndicators(d.candles, defaultStrategy);
  const out = composite.build(d.candles, composite.defaults);
  const trades = inTest(d, run(d, composite)).filter((t) => t.side === 'long' && t.exitReason !== 'end');
  const bySignal = new Map(out.signals.map((s) => [s.index, s]));
  let done = 0;
  const queue = [...trades];
  await Promise.all(
    Array.from({ length: 4 }, async () => {
      for (let t = queue.shift(); t; t = queue.shift()) {
        const sig = bySignal.get(t.entryIndex - 1);
        if (!sig) continue;
        const key = `${sym}:${sig.time}`;
        if (!cache[key]) {
          const state = buildState(d.candles, ind, sig, ASSETS[sym] ?? sym.replace('USDT', ''), iv);
          const res = await forwardToJev(JSON.stringify({ state }));
          if (!res.ok) throw new Error(`Jev ${res.status}: ${await res.text()}`);
          cache[key] = parseVerdict(await res.json());
        }
        rows.push({ r: t.rMultiple, v: cache[key], ok: approves(cache[key], 'long', defaultJevThresholds) });
        if (++done % 50 === 0) {
          writeFileSync(cacheFile, JSON.stringify(cache));
          console.log(sym, done, '/', trades.length);
        }
      }
    }),
  );
  writeFileSync(cacheFile, JSON.stringify(cache));
}

const stat = (xs: number[]) => {
  const w = xs.filter((r) => r > 0);
  const gw = w.reduce((a, r) => a + r, 0);
  const gl = -xs.filter((r) => r <= 0).reduce((a, r) => a + r, 0);
  return `n=${xs.length} win=${fmt((w.length / xs.length) * 100, 1)}% PF=${fmt(gw / gl)} avgR=${fmt((gw - gl) / xs.length, 3)} totalR=${fmt(gw - gl, 0)}`;
};
console.log(`\nComposite longs (${symbols.join(', ')}, ${iv}, test periods):`);
console.log('  all signals        ', stat(rows.map((x) => x.r)));
console.log('  Jev approves       ', stat(rows.filter((x) => x.ok).map((x) => x.r)));
console.log('  Jev vetoes         ', stat(rows.filter((x) => !x.ok).map((x) => x.r)));
for (const [lo, hi] of [[0, 1.5], [1.5, 2.5], [2.5, 5]])
  console.log(`  conviction ${lo}–${hi}`.padEnd(20), stat(rows.filter((x) => x.v.conviction >= lo && x.v.conviction < hi).map((x) => x.r)));
