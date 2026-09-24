// One account trading the composite on every coin in the universe.
// Bar-by-bar mark-to-market, position sizing by risk budget, optional caps,
// then a block-bootstrap stress test to choose risk per trade / leverage.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { backtest } from '../src/backtest';
import { composite } from '../src/composite';
import type { Params } from '../src/strategies';
import type { Candle } from '../src/types';
import type { RiskParams, Trade } from '../src/types';
import { DAY, dataset, fmt, limitRisk } from './lib';
import { UNIVERSE } from './universe';

export interface PTrade extends Trade { sym: string; stopDist: number; candles: Candle[] }

export async function collectTrades(iv: string, params: Params = composite.defaults, symbols = UNIVERSE, riskOverride: Partial<RiskParams> = {}) {
  const trades: PTrade[] = [];
  const candlesBySym = new Map<string, Candle[]>();
  for (const sym of symbols) {
    const d = await dataset(sym, iv);
    const out = composite.build(d.candles, params);
    const risk = { ...limitRisk, ...out.risk, ...riskOverride };
    for (const t of backtest(d.candles, out.signals, out.atr, risk, { ...out.rules, funding: d.funding }).trades) {
      if (t.entryTime < d.testStart || t.exitReason === 'end') continue;
      // Initial risk per unit, recovered exactly from the trade (also correct for swing stops).
      const stopDist = t.pnl !== 0 && t.rMultiple !== 0 ? t.pnl / t.rMultiple / t.qty : risk.stopAtr * out.atr[t.entryIndex - 1];
      trades.push({ ...t, sym, stopDist, candles: d.candles });
    }
    candlesBySym.set(sym, d.candles);
  }
  return { trades, candlesBySym };
}

export interface SimOptions {
  riskPct: number; // % of equity lost if a trade's stop is hit
  sizing: 'risk' | 'equal-notional'; // risk = vol-scaled via ATR stop; equal = same notional for every trade
  maxOpenRiskPct?: number; // skip new trades if total open risk would exceed this
  maxPositions?: number;
  maxShorts?: number; // separate slots for shorts (when set, maxPositions applies to longs only)
  caps?: (time: number) => { long: number; short: number }; // regime-dependent slots (overrides the two above)
  weight?: (t: PTrade) => number; // extra size multiplier (e.g. from a filter or model)
  priority?: (t: PTrade) => number; // order simultaneous entries (higher first)
  /** When slots are full, close the weakest open same-side position if the new trade scores higher by `margin`. */
  rotate?: { score: (t: PTrade) => number; margin: number };
  /** Cut risk while the account is in drawdown: full risk above `start`, `minMult` × risk at `full` drawdown or worse. */
  ddBrake?: { start: number; full: number; minMult: number };
}

export function simulate(trades: PTrade[], candlesBySym: Map<string, Candle[]>, o: SimOptions) {
  // Timeline of every bar start across coins.
  const times = [...new Set([...candlesBySym.values()].flatMap((c) => c.map((b) => b.time)))].sort((a, b) => a - b);
  const closeAt = new Map<string, Map<number, number>>();
  for (const [s, c] of candlesBySym) closeAt.set(s, new Map(c.map((b) => [b.time, b.close])));
  const byEntry = new Map<number, PTrade[]>();
  for (const t of trades) byEntry.set(t.entryTime, [...(byEntry.get(t.entryTime) ?? []), t]);
  const start = Math.min(...trades.map((t) => t.entryTime));
  const avgStopPct = trades.reduce((a, t) => a + t.stopDist / t.entryPrice, 0) / trades.length;

  let equity = 1;
  let peakEq = 1;
  type Open = { t: PTrade; qty: number; riskAmt: number; last: number };
  const mark = (p: Open, time: number) => {
    const c = closeAt.get(p.t.sym)!.get(time);
    if (c !== undefined) p.last = c;
    const dir = p.t.side === 'long' ? 1 : -1;
    if (!p.t.fills) return { value: dir * (p.last - p.t.entryPrice) * p.qty, notional: p.last * p.qty };
    // Multi-fill trade (scale-ins, pyramid adds, scale-outs): replay fills up to now.
    const scale = p.qty / p.t.qty;
    let q = 0;
    let avg = 0;
    let banked = 0;
    for (const f of p.t.fills) {
      if (p.t.candles[f.index].time > time) break;
      if (f.kind === 'entry' || f.kind === 'scale-in' || f.kind === 'add') {
        avg = (avg * q + f.price * f.qty) / (q + f.qty);
        q += f.qty;
      } else if (f.kind === 'scale-out') {
        banked += dir * (f.price - avg) * f.qty;
        q -= f.qty;
      }
    }
    return { value: (dir * (p.last - avg) * q + banked) * scale, notional: p.last * q * scale };
  };
  const open: Open[] = [];
  const curve: { time: number; equity: number }[] = [];
  let taken = 0;
  let skipped = 0;
  let rotations = 0;
  let maxLev = 0;
  let levSum = 0;
  let levN = 0;
  for (const time of times) {
    if (time < start) continue;
    // Exits whose exit bar starts now are realised during this bar (stop/target) or at its open.
    const settle = () => {
      for (let k = open.length - 1; k >= 0; k--) {
        const p = open[k];
        if (p.t.exitTime <= time) {
          equity += p.t.rMultiple * p.riskAmt;
          open.splice(k, 1);
        }
      }
    };
    settle();
    const entries = [...(byEntry.get(time) ?? [])];
    if (o.priority) entries.sort((a, b) => o.priority!(b) - o.priority!(a));
    // Drawdown brake uses the marked-to-market equity from the previous bar.
    const markedNow = curve.length ? curve[curve.length - 1].equity : equity;
    peakEq = Math.max(peakEq, markedNow);
    let brake = 1;
    if (o.ddBrake) {
      const dd = 1 - markedNow / peakEq;
      const { start, full, minMult } = o.ddBrake;
      brake = dd <= start ? 1 : dd >= full ? minMult : 1 - ((dd - start) / (full - start)) * (1 - minMult);
    }
    for (const t of entries) {
      const openRisk = open.reduce((a, p) => a + p.riskAmt, 0) / equity;
      const w = o.weight ? o.weight(t) : 1;
      if (w <= 0) continue;
      const riskFrac = (o.riskPct / 100) * w * brake;
      const perSide = o.maxShorts !== undefined || !!o.caps;
      const sameSide = perSide ? open.filter((p) => p.t.side === t.side).length : open.length;
      const dyn = o.caps?.(time);
      const cap = dyn ? (t.side === 'long' ? dyn.long : dyn.short) : o.maxShorts !== undefined && t.side === 'short' ? o.maxShorts : o.maxPositions;
      if (dyn && cap === 0) {
        skipped++;
        continue;
      }
      if (cap && sameSide >= cap && o.rotate) {
        const same = open.filter((p) => p.t.side === t.side);
        const weakest = same.reduce((w, p) => (o.rotate!.score(p.t) < o.rotate!.score(w.t) ? p : w), same[0]);
        if (weakest && o.rotate.score(t) > o.rotate.score(weakest.t) + o.rotate.margin) {
          // Close the weakest at the last close (plus a round of fees) to make room.
          const m = mark(weakest, time);
          equity += m.value - m.notional * 0.0004;
          open.splice(open.indexOf(weakest), 1);
          rotations++;
        }
      }
      const sameNow = perSide ? open.filter((p) => p.t.side === t.side).length : open.length;
      if ((cap && sameNow >= cap) || (o.maxOpenRiskPct && openRisk + riskFrac > o.maxOpenRiskPct / 100)) {
        skipped++;
        continue;
      }
      let qty: number;
      let riskAmt: number;
      if (o.sizing === 'risk') {
        riskAmt = equity * riskFrac;
        qty = riskAmt / t.stopDist;
      } else {
        // Same notional for every trade, sized so an average-volatility trade risks riskPct.
        const notional = (equity * riskFrac) / avgStopPct;
        qty = notional / t.entryPrice;
        riskAmt = qty * t.stopDist;
      }
      open.push({ t, qty, riskAmt, last: t.entryPrice });
      taken++;
    }
    // Trades stopped out on their entry bar close within the same bar.
    settle();
    // Mark open positions to this bar's close.
    let mtm = 0;
    let notional = 0;
    for (const p of open) {
      const m = mark(p, time);
      mtm += m.value;
      notional += m.notional;
    }
    const lev = notional / Math.max(equity + mtm, 1e-9);
    maxLev = Math.max(maxLev, lev);
    levSum += lev;
    levN++;
    curve.push({ time, equity: equity + mtm });
    if (equity + mtm <= 0) break;
  }
  return { curve, taken, skipped, rotations, maxLev, avgLev: levSum / levN };
}

export function curveStats(curve: { time: number; equity: number }[]) {
  const yrs = (curve[curve.length - 1].time - curve[0].time) / (365 * DAY);
  const end = curve[curve.length - 1].equity;
  let peak = -Infinity;
  let dd = 0;
  for (const p of curve) {
    peak = Math.max(peak, p.equity);
    dd = Math.max(dd, 1 - p.equity / peak);
  }
  // Daily returns for Sharpe.
  const daily: number[] = [];
  let lastDay = -1;
  let lastEq = curve[0].equity;
  for (const p of curve) {
    const d = Math.floor(p.time / DAY);
    if (d !== lastDay && lastDay !== -1) {
      daily.push(p.equity / lastEq - 1);
      lastEq = p.equity;
    }
    lastDay = d;
  }
  const m = daily.reduce((a, r) => a + r, 0) / daily.length;
  const sd = Math.sqrt(daily.reduce((a, r) => a + (r - m) ** 2, 0) / daily.length);
  return { cagr: end > 0 ? end ** (1 / yrs) - 1 : -1, maxDd: dd, sharpe: sd ? (m / sd) * Math.sqrt(365) : 0, end, yrs };
}

/** Monthly returns of an equity curve. */
export function monthly(curve: { time: number; equity: number }[]) {
  const out: number[] = [];
  let key = '';
  let startEq = curve[0].equity;
  let lastEq = startEq;
  for (const p of curve) {
    const k = new Date(p.time * 1000).toISOString().slice(0, 7);
    if (key && k !== key) {
      out.push(lastEq / startEq - 1);
      startEq = lastEq;
    }
    key = k;
    lastEq = p.equity;
  }
  out.push(lastEq / startEq - 1);
  return out;
}

/** Block bootstrap of monthly returns: distribution of CAGR and max drawdown over `years`. */
export function stress(monthlyAt1pct: number[], riskPct: number, years = 5, paths = 5000, block = 3) {
  const n = years * 12;
  const cagrs: number[] = [];
  const dds: number[] = [];
  let seed = 12345;
  const rand = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  for (let p = 0; p < paths; p++) {
    let eq = 1;
    let peak = 1;
    let dd = 0;
    for (let m = 0; m < n; ) {
      const s = Math.floor(rand() * (monthlyAt1pct.length - block));
      for (let b = 0; b < block && m < n; b++, m++) {
        // Scale the 1%-risk month to this risk level (compounding within the month is small).
        eq *= Math.max(0, 1 + monthlyAt1pct[s + b] * riskPct);
        peak = Math.max(peak, eq);
        dd = Math.max(dd, 1 - eq / peak);
      }
    }
    cagrs.push(eq ** (1 / years) - 1);
    dds.push(dd);
  }
  const q = (a: number[], x: number) => a.sort((u, v) => u - v)[Math.floor(x * (a.length - 1))];
  return {
    cagrMedian: q(cagrs, 0.5),
    cagrP5: q(cagrs, 0.05),
    ddMedian: q(dds, 0.5),
    ddP95: q(dds, 0.95),
    pDd50: dds.filter((d) => d >= 0.5).length / dds.length,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const lines: string[] = ['# Portfolio simulation (Signal Composite, 20 coins, real funding, limit orders)\n'];
  for (const iv of (process.env.INTERVALS ?? '4h,1h').split(',')) {
    for (const [label, params] of [
      ['long only', { ...composite.defaults, shorts: 0 }],
      ['long + short (not bull)', { ...composite.defaults, shorts: 1, shortGate: 1 }],
    ] as const) {
      const { trades, candlesBySym } = await collectTrades(iv, params);
      lines.push(`\n## ${iv} · ${label} (${trades.length} trades)\n\n| Sizing | Caps | CAGR | Max DD | Sharpe | Avg lev | Peak lev | Taken | Skipped |\n|---|---|---|---|---|---|---|---|---|`);
      const variants: [string, string, SimOptions][] = [
        ['equal notional', 'none', { riskPct: 1, sizing: 'equal-notional' }],
        ['risk-based (vol-scaled)', 'none', { riskPct: 1, sizing: 'risk' }],
        ['risk-based (vol-scaled)', 'open risk ≤ 10%', { riskPct: 1, sizing: 'risk', maxOpenRiskPct: 10 }],
        ['risk-based (vol-scaled)', 'open risk ≤ 6%', { riskPct: 1, sizing: 'risk', maxOpenRiskPct: 6 }],
      ];
      let base: ReturnType<typeof simulate> | null = null;
      for (const [sz, cap, o] of variants) {
        const r = simulate(trades, candlesBySym, o);
        const s = curveStats(r.curve);
        lines.push(`| ${sz} | ${cap} | ${fmt(s.cagr * 100, 1)}% | ${fmt(s.maxDd * 100, 1)}% | ${fmt(s.sharpe)} | ${fmt(r.avgLev, 2)}x | ${fmt(r.maxLev, 2)}x | ${r.taken} | ${r.skipped} |`);
        if (sz.startsWith('risk') && cap === 'open risk ≤ 10%') base = r;
      }
      // Stress test at different risk levels using the capped, vol-scaled account.
      const m = monthly(base!.curve);
      lines.push(`\nStress test (block bootstrap of ${m.length} monthly returns, 5,000 five-year paths; open risk capped at 10× the per-trade risk):\n\n| Risk per trade | Median CAGR | Bad case CAGR (5th pct) | Median max DD | Bad case max DD (95th pct) | P(drawdown ≥ 50%) | Avg leverage |\n|---|---|---|---|---|---|---|`);
      for (const rp of [0.5, 1, 1.5, 2, 3]) {
        const st = stress(m, rp);
        lines.push(`| ${rp}% | ${fmt(st.cagrMedian * 100, 1)}% | ${fmt(st.cagrP5 * 100, 1)}% | ${fmt(st.ddMedian * 100, 1)}% | ${fmt(st.ddP95 * 100, 1)}% | ${fmt(st.pDd50 * 100, 1)}% | ${fmt(base!.avgLev * rp, 2)}x |`);
      }
      console.log(lines.slice(-14).join('\n'));
    }
  }
  writeFileSync(join(import.meta.dirname, 'RESULTS-portfolio.md'), lines.join('\n') + '\n');
}
