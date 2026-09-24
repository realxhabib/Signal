// Condition mining with walk-forward validation.
//
// 1. Every bar gets a triple-barrier label for a long and a short entered at
//    the next open: stop at SL x ATR, target at TP x ATR, time limit H bars,
//    costs included.
// 2. For each rolling test window, rules (single conditions, pairs, and triples
//    grown from the best pairs) are scored on all data BEFORE the window.
// 3. For each target win rate T, the rules whose Wilson lower bound clears T
//    are combined, and traded on the unseen window with the real backtester.
// The output is a frontier: how many signals per year you get at each win rate,
// measured out-of-sample.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { backtest, defaultRisk } from '../src/backtest';
import { computeFeatures } from '../src/features';
import type { Candle, Side, Signal, Trade } from '../src/types';
import { history } from './history';

const DAY = 86_400;
const TARGETS = [0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85];
const MAX_RULES = 10;
const PROFILES = {
  symmetric: { sl: 1.5, tp: 1.5 },
  'high-hit': { sl: 2, tp: 1 },
} as const;
const HOLD: Record<string, number> = { '1h': 24, '4h': 12, '1d': 10 };
const MIN_EVENTS: Record<string, number> = { '1h': 200, '4h': 80, '1d': 40 };
const risk = { ...defaultRisk, leverage: 5, riskPct: 1, feePct: 0.02, slippagePct: 0 };

// ---- bitsets ------------------------------------------------------------------
type Bits = Uint32Array;
const words = (n: number) => Math.ceil(n / 32);
function toBits(a: ArrayLike<number>): Bits {
  const b = new Uint32Array(words(a.length));
  for (let i = 0; i < a.length; i++) if (a[i]) b[i >> 5] |= 1 << (i & 31);
  return b;
}
const and = (x: Bits, y: Bits) => {
  const o = new Uint32Array(x.length);
  for (let k = 0; k < x.length; k++) o[k] = x[k] & y[k];
  return o;
};
function pop(v: number) {
  v -= (v >>> 1) & 0x55555555;
  v = (v & 0x33333333) + ((v >>> 2) & 0x33333333);
  return (((v + (v >>> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24;
}
function count(x: Bits, mask: Bits, lo: number, hi: number) {
  let s = 0;
  for (let k = lo; k < hi; k++) s += pop(x[k] & mask[k]);
  return s;
}

function wilsonLow(w: number, n: number, z = 1.96) {
  if (!n) return 0;
  const p = w / n;
  const d = 1 + (z * z) / n;
  return (p + (z * z) / (2 * n) - z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / d;
}

// ---- triple-barrier labels -----------------------------------------------------
function labels(c: Candle[], a: number[], side: Side, sl: number, tp: number, hold: number) {
  const n = c.length;
  const valid = new Uint8Array(n);
  const win = new Uint8Array(n);
  const dir = side === 'long' ? 1 : -1;
  const fee = risk.feePct / 100;
  for (let i = 0; i < n - hold - 1; i++) {
    if (!(a[i] > 0)) continue;
    const entry = c[i + 1].open;
    const stop = entry - dir * sl * a[i];
    const target = entry + dir * tp * a[i];
    let exit = c[i + hold].close;
    for (let j = i + 1; j <= i + hold; j++) {
      const b = c[j];
      if (dir === 1 ? b.low <= stop : b.high >= stop) {
        exit = dir === 1 ? Math.min(stop, b.open) : Math.max(stop, b.open);
        break;
      }
      if (dir === 1 ? b.high >= target : b.low <= target) {
        exit = dir === 1 ? Math.max(target, b.open) : Math.min(target, b.open);
        break;
      }
    }
    const pnl = dir * (exit - entry) - fee * (entry + exit);
    valid[i] = 1;
    win[i] = pnl > 0 ? 1 : 0;
  }
  return { valid: toBits(valid), win: toBits(win) };
}

interface Rule {
  side: Side;
  conds: string[];
  bits: Bits;
}

function stats(trades: Trade[]) {
  const rs = trades.map((t) => t.rMultiple);
  const wins = rs.filter((r) => r > 0);
  const gw = wins.reduce((a, r) => a + r, 0);
  const gl = -rs.filter((r) => r <= 0).reduce((a, r) => a + r, 0);
  return {
    n: rs.length,
    win: rs.length ? wins.length / rs.length : 0,
    pf: gl > 0 ? gw / gl : gw > 0 ? 99 : 0,
    avgR: rs.length ? rs.reduce((a, r) => a + r, 0) / rs.length : 0,
  };
}

type Frontier = Record<string, { trades: Trade[]; years: number; ruleUse: Map<string, number> }>;

function mine(c: Candle[], iv: string, profile: keyof typeof PROFILES) {
  const { sl, tp } = PROFILES[profile];
  const hold = HOLD[iv];
  const f = computeFeatures(c);
  const names = [...f.conditions.keys()];
  const cb = new Map(names.map((k) => [k, toBits(f.conditions.get(k)!)]));
  const lab = { long: labels(c, f.atr, 'long', sl, tp, hold), short: labels(c, f.atr, 'short', sl, tp, hold) };
  const family = (k: string) => k.split(':')[0];

  // Candidate rules: singles + pairs across different feature families.
  const base: { conds: string[]; bits: Bits }[] = names.map((k) => ({ conds: [k], bits: cb.get(k)! }));
  for (let x = 0; x < names.length; x++)
    for (let y = x + 1; y < names.length; y++)
      if (family(names[x]) !== family(names[y]))
        base.push({ conds: [names[x], names[y]], bits: and(cb.get(names[x])!, cb.get(names[y])!) });

  const first = c[0].time;
  const last = c[c.length - 1].time;
  const idxAt = (t: number) => {
    let lo = 0;
    let hi = c.length;
    while (lo < hi) {
      const m = (lo + hi) >> 1;
      if (c[m].time < t) lo = m + 1;
      else hi = m;
    }
    return lo;
  };
  const frontier: Frontier = Object.fromEntries(TARGETS.map((t) => [t, { trades: [] as Trade[], years: 0, ruleUse: new Map() }]));
  let finalRules: Record<string, { side: Side; conds: string[]; trainWin: number; trainN: number }[]> = {};

  const windows: [number, number][] = [];
  for (let s = first + 730 * DAY; s < last; s += 182 * DAY) windows.push([s, Math.min(s + 182 * DAY, last + 1)]);
  windows.push([last + 1, last + 1]); // final "live" window: rules trained on everything, for the app

  for (const [testStart, testEnd] of windows) {
    const trainEndIdx = Math.max(0, idxAt(testStart) - hold - 1); // labels must not peek into the test window
    const hiWord = trainEndIdx >> 5;
    const scored: (Rule & { n: number; w: number; lb: number })[] = [];
    for (const side of ['long', 'short'] as Side[]) {
      const L = lab[side];
      const validTrain = L.valid.slice(0, hiWord);
      const winTrain = L.win.slice(0, hiWord);
      const pairScores: { r: (typeof base)[number]; n: number; w: number; lb: number }[] = [];
      for (const r of base) {
        const n = count(r.bits, validTrain, 0, hiWord);
        if (n < MIN_EVENTS[iv]) continue;
        const w = count(r.bits, winTrain, 0, hiWord);
        pairScores.push({ r, n, w, lb: wilsonLow(w, n) });
      }
      pairScores.sort((a, b) => b.lb - a.lb);
      for (const p of pairScores) scored.push({ side, conds: p.r.conds, bits: p.r.bits, n: p.n, w: p.w, lb: p.lb });
      // Grow triples from the 150 strongest pairs.
      for (const p of pairScores.filter((p) => p.r.conds.length === 2).slice(0, 150)) {
        const fams = new Set(p.r.conds.map(family));
        for (const k of names) {
          if (fams.has(family(k))) continue;
          const bits = and(p.r.bits, cb.get(k)!);
          const n = count(bits, validTrain, 0, hiWord);
          if (n < MIN_EVENTS[iv]) continue;
          const w = count(bits, winTrain, 0, hiWord);
          scored.push({ side, conds: [...p.r.conds, k], bits, n, w, lb: wilsonLow(w, n) });
        }
      }
    }
    scored.sort((a, b) => b.lb - a.lb);

    const isLive = testStart > last;
    for (const T of TARGETS) {
      // Most signals at this win rate: qualifying rules, preferring the ones that fire most often.
      const picked: typeof scored = [];
      const seen = new Set<string>();
      for (const r of scored.filter((r) => r.lb >= T).sort((a, b) => b.n - a.n)) {
        const key = r.side + r.conds.slice().sort().join('&');
        if (seen.has(key)) continue;
        seen.add(key);
        picked.push(r);
        if (picked.length >= MAX_RULES) break;
      }
      if (isLive) {
        finalRules[T] = picked.map((r) => ({ side: r.side, conds: r.conds, trainWin: +(r.w / r.n).toFixed(3), trainN: r.n }));
        continue;
      }
      frontier[T].years += (testEnd - testStart) / (365 * DAY);
      if (!picked.length) continue;
      const lo = idxAt(testStart);
      const hi = idxAt(testEnd);
      const signals: Signal[] = [];
      for (let i = lo; i < hi; i++) {
        const fired = picked.filter((r) => r.bits[i >> 5] & (1 << (i & 31)));
        if (!fired.length) continue;
        const longs = fired.filter((r) => r.side === 'long').length;
        const shorts = fired.length - longs;
        if (longs && shorts) continue; // conflicting rules: stand aside
        signals.push({ index: i, time: c[i].time, side: longs ? 'long' : 'short', score: fired.length, maxScore: picked.length, reasons: fired[0].conds });
        for (const r of fired) for (const k of r.conds) frontier[T].ruleUse.set(family(k), (frontier[T].ruleUse.get(family(k)) ?? 0) + 1);
      }
      const trades = backtest(c, signals, f.atr, { ...risk, stopAtr: sl, takeProfitR: tp / sl, trailAtr: 0 }, { maxBars: hold }).trades;
      frontier[T].trades.push(...trades.filter((t) => t.entryIndex > lo && t.entryIndex <= hi));
    }
  }
  return { frontier, finalRules };
}

const fmt = (v: number, d = 1) => v.toFixed(d);
const symbols = (process.env.SYMBOLS ?? 'BTCUSDT,ETHUSDT,SOLUSDT').split(',');
const intervals = (process.env.INTERVALS ?? '4h,1h,1d').split(',');
const profiles = (process.env.PROFILES ?? 'symmetric,high-hit').split(',') as (keyof typeof PROFILES)[];
const lines: string[] = [];
const appRules: Record<string, unknown> = {};
const pooled = new Map<string, { trades: Trade[]; years: number }>();
for (const profile of profiles)
  for (const iv of intervals)
    for (const sym of symbols) {
      const t0 = Date.now();
      const c = await history(sym, iv);
      const { frontier, finalRules } = mine(c, iv, profile);
      const { sl, tp } = PROFILES[profile];
      const breakEven = sl / (sl + tp);
      lines.push(`\n### ${sym} ${iv} — ${profile} (stop ${sl} ATR, target ${tp} ATR, max ${HOLD[iv]} bars; break-even win rate ≈ ${fmt(breakEven * 100, 0)}% before costs)\n`);
      lines.push('| Target win rate (train) | OOS trades | Trades / year | OOS win rate | PF | Avg R | Features used most |');
      lines.push('|---|---|---|---|---|---|---|');
      const oosByT: Record<string, unknown> = {};
      for (const T of TARGETS) {
        const fr = frontier[T];
        const s = stats(fr.trades);
        const top = [...fr.ruleUse.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k]) => k).join(', ');
        lines.push(`| ≥${Math.round(T * 100)}% | ${s.n} | ${fmt(s.n / fr.years)} | ${fmt(s.win * 100)}% | ${fmt(s.pf, 2)} | ${fmt(s.avgR, 2)} | ${top} |`);
        oosByT[T] = { trades: s.n, perYear: +(s.n / fr.years).toFixed(1), winRate: +s.win.toFixed(3), profitFactor: +s.pf.toFixed(2), avgR: +s.avgR.toFixed(3) };
        const key = `${profile} ${iv} ≥${Math.round(T * 100)}%`;
        const p = pooled.get(key) ?? { trades: [], years: 0 };
        p.trades.push(...fr.trades);
        p.years += fr.years;
        pooled.set(key, p);
      }
      appRules[`${profile}:${sym}:${iv}`] = { profile: { ...PROFILES[profile], hold: HOLD[iv] }, oos: oosByT, rules: finalRules };
      console.log(sym, iv, profile, `${((Date.now() - t0) / 1000).toFixed(1)}s`);
    }

const pooledTable = [...pooled.entries()]
  .map(([k, p]) => {
    const s = stats(p.trades);
    return `| ${k} | ${s.n} | ${fmt(s.n / p.years)} | ${fmt(s.win * 100)}% | ${fmt(s.pf, 2)} | ${fmt(s.avgR, 2)} |`;
  })
  .join('\n');

writeFileSync(
  join(import.meta.dirname, 'QUANT.md'),
  `# Quant condition mining — walk-forward frontier

Generated ${new Date().toISOString().slice(0, 10)}. ~80 causal conditions (regime, daily trend, Supertrend, RSI, z-score,
momentum, drawdown, volatility regime, Bollinger width, variance ratio, efficiency ratio, skew, autocorrelation, volume
z-score, candle shape, day, session, moon phase). Rules = single conditions, pairs, and triples grown from the best pairs.
Rules are selected on all data before each 6-month test window (Wilson 95% lower bound of the train win rate ≥ target,
up to ${MAX_RULES} rules, preferring those that fire most often), then traded on the unseen window with the real backtester
(next-open fills, limit-order fees, funding, one position at a time). **Every trade below is out-of-sample.**

## Pooled across BTC, ETH, SOL (sums per-asset trades/year)

| Profile / TF / target | OOS trades | Trades / year | OOS win rate | PF | Avg R |
|---|---|---|---|---|---|
${pooledTable}

## Per asset
${lines.join('\n')}
`,
);
if (process.env.APP_JSON !== '0') writeFileSync(join(import.meta.dirname, '..', 'src', 'quantRules.json'), JSON.stringify(appRules) + '\n');
console.log('wrote research/QUANT.md');
