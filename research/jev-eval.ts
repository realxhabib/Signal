// Does Jev (TypeSafe System One) improve the shipped Signal Composite? Needs TYPESAFE_API_KEY:
//   npx tsx research/jev-eval.ts                    → estimate the number of Jev calls, then stop
//   CONFIRM=1 npx tsx research/jev-eval.ts          → run (verdicts are cached, so re-runs are free)
// Options: SYMBOLS (default 5 major coins), INTERVALS (default 4h), FROM (default 2022-01-01), MAX_CALLS (1500).
// Every trade the shipped rules took (current line-ups, longs and shorts) gets Jev's verdict on the same market
// summary the app sends, at the signal candle's close. Reported separately for the research years and the locked
// final year: the trades Jev approves vs vetoes, and results by Jev conviction. Only if Jev helps on the research
// years AND the locked year should it become part of the rules (as a veto or as sizing).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { forwardToJev } from '../api/jev';
import { composite, lineupFor } from '../src/composite';
import { ASSETS } from '../src/data';
import { approves, buildState, defaultJevThresholds, parseVerdict, type JevVerdict } from '../src/jev';
import { computeIndicators, defaultStrategy } from '../src/strategy';
import type { Signal } from '../src/types';
import { HOLDOUT_START } from './account';
import { fmt } from './lib';
import { shippedTrades } from './round6-lib';

const symbols = (process.env.SYMBOLS ?? 'BTCUSDT,ETHUSDT,SOLUSDT,XRPUSDT,DOGEUSDT').split(',');
const intervals = (process.env.INTERVALS ?? '4h').split(',');
const from = Date.parse(`${process.env.FROM ?? '2022-01-01'}T00:00:00Z`) / 1000;
const maxCalls = Number(process.env.MAX_CALLS ?? 1500);
const cacheDir = join(import.meta.dirname, '.cache');
mkdirSync(cacheDir, { recursive: true });

const { t4, t1 } = await shippedTrades();
type Row = { sym: string; iv: string; time: number; side: 'long' | 'short'; r: number; sig: Signal; candles: (typeof t4.trades)[number]['candles'] };
const rows: Row[] = [];
for (const iv of intervals) {
  const set = iv === '4h' ? t4.trades : t1.trades;
  const sigCache = new Map<string, Map<number, Signal>>();
  for (const t of set) {
    if (!symbols.includes(t.sym) || t.entryTime < from) continue;
    let bySig = sigCache.get(t.sym);
    if (!bySig) {
      bySig = new Map(composite.build(t.candles, lineupFor(iv)).signals.map((s) => [s.index, s]));
      sigCache.set(t.sym, bySig);
    }
    const sig = bySig.get(t.entryIndex - 1);
    if (sig) rows.push({ sym: t.sym, iv, time: t.entryTime, side: t.side, r: t.rMultiple, sig, candles: t.candles });
  }
}
const caches = new Map<string, Record<string, JevVerdict>>();
const cacheOf = (iv: string) => {
  let c = caches.get(iv);
  if (!c) {
    const f = join(cacheDir, `jev-${iv}.json`);
    c = existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : {};
    caches.set(iv, c!);
  }
  return c!;
};
const keyOf = (x: Row) => `${x.sym}:${x.sig.time}:${x.side}`;
const needed = rows.filter((x) => !cacheOf(x.iv)[keyOf(x)]).length;
console.log(`${rows.length} trades (${symbols.length} coins, ${intervals.join('+')}, from ${process.env.FROM ?? '2022-01-01'}); ${needed} need a new Jev call (the rest are cached).`);
if (needed && !process.env.CONFIRM) {
  console.log('Set CONFIRM=1 to make the calls (TypeSafe usage applies).');
  process.exit(0);
}
if (needed > maxCalls) {
  console.log(`That is more than MAX_CALLS=${maxCalls}; narrow SYMBOLS/FROM or raise MAX_CALLS.`);
  process.exit(0);
}
if (needed && !process.env.TYPESAFE_API_KEY) {
  console.log('TYPESAFE_API_KEY is not set in this environment (it is read at session start).');
  process.exit(1);
}

const indCache = new Map<string, ReturnType<typeof computeIndicators>>();
let done = 0;
const queue = rows.filter((x) => !cacheOf(x.iv)[keyOf(x)]);
await Promise.all(
  Array.from({ length: 4 }, async () => {
    for (let x = queue.shift(); x; x = queue.shift()) {
      let ind = indCache.get(`${x.sym}|${x.iv}`);
      if (!ind) {
        ind = computeIndicators(x.candles, defaultStrategy);
        indCache.set(`${x.sym}|${x.iv}`, ind);
      }
      const state = buildState(x.candles, ind, x.sig, ASSETS[x.sym] ?? x.sym.replace('USDT', ''), x.iv);
      const res = await forwardToJev(JSON.stringify({ state }));
      if (!res.ok) throw new Error(`Jev ${res.status}: ${await res.text()}`);
      cacheOf(x.iv)[keyOf(x)] = parseVerdict(await res.json());
      if (++done % 25 === 0) {
        for (const iv of intervals) writeFileSync(join(cacheDir, `jev-${iv}.json`), JSON.stringify(cacheOf(iv)));
        console.log(done, '/', needed);
      }
    }
  }),
);
for (const iv of intervals) writeFileSync(join(cacheDir, `jev-${iv}.json`), JSON.stringify(cacheOf(iv)));

const stat = (xs: number[]) => {
  if (!xs.length) return 'n=0';
  const w = xs.filter((r) => r > 0);
  const gw = w.reduce((a, r) => a + r, 0);
  const gl = -xs.filter((r) => r <= 0).reduce((a, r) => a + r, 0);
  return `n=${xs.length} · win ${fmt((w.length / xs.length) * 100, 1)}% · PF ${fmt(gw / gl)} · avg ${fmt((gw - gl) / xs.length, 3)}R · total ${fmt(gw - gl, 0)}R`;
};
const lines = [`# Jev as a decision layer\n`, `${rows.length} shipped trades (${symbols.join(', ')}; ${intervals.join(', ')}; from ${process.env.FROM ?? '2022-01-01'}). Veto = the app's default thresholds.\n`];
for (const [label, sel] of [['Research years', (x: Row) => x.time < HOLDOUT_START], ['Locked final year', (x: Row) => x.time >= HOLDOUT_START]] as const) {
  const rs = rows.filter(sel).map((x) => ({ ...x, v: cacheOf(x.iv)[keyOf(x)] })).filter((x) => x.v);
  lines.push(`\n## ${label}\n`, '| Group | Result |', '|---|---|');
  lines.push(`| All trades | ${stat(rs.map((x) => x.r))} |`);
  lines.push(`| Jev approves | ${stat(rs.filter((x) => approves(x.v, x.side, defaultJevThresholds)).map((x) => x.r))} |`);
  lines.push(`| Jev vetoes | ${stat(rs.filter((x) => !approves(x.v, x.side, defaultJevThresholds)).map((x) => x.r))} |`);
  for (const [lo, hi] of [[0, 1.5], [1.5, 2.5], [2.5, 5]]) lines.push(`| Conviction ${lo}–${hi} | ${stat(rs.filter((x) => x.v.conviction >= lo && x.v.conviction < hi).map((x) => x.r))} |`);
  for (const side of ['long', 'short'] as const) lines.push(`| ${side}s: approved vs vetoed | ${stat(rs.filter((x) => x.side === side && approves(x.v, side, defaultJevThresholds)).map((x) => x.r))} vs ${stat(rs.filter((x) => x.side === side && !approves(x.v, side, defaultJevThresholds)).map((x) => x.r))} |`);
}
console.log(lines.join('\n'));
writeFileSync(join(import.meta.dirname, 'RESULTS-jev.md'), lines.join('\n') + '\n');
