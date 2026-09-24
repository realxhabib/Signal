import { backtest, defaultRisk } from './backtest';
import { computeFeatures } from './features';
import { ema } from './indicators';
import {
  bandReversion,
  jmaConfluence,
  pullbackScalp,
  rsi2Pullback,
  stackedPullback,
  supertrendTrend,
  type StrategyDef,
} from './strategies';
import type { Candle, Signal } from './types';

/** Strategies that can vote in the composite (bit k of `mask` enables COMPONENTS[k]). */
export const COMPONENTS: StrategyDef[] = [supertrendTrend, rsi2Pullback, bandReversion, stackedPullback, pullbackScalp, jmaConfluence];

/**
 * A component's vote at the close of each bar: +1 while it holds (or has just
 * decided to open) a long, -1 for a short, 0 when flat. Derived from its own
 * backtest, so it only ever reflects information available at that close.
 */
export function votes(candles: Candle[], s: StrategyDef): Int8Array {
  const out = s.build(candles, s.defaults);
  const { trades, pending } = backtest(candles, out.signals, out.atr, { ...defaultRisk, ...out.risk }, out.rules);
  const v = new Int8Array(candles.length);
  const n = candles.length;
  for (const t of trades) {
    const dir = t.side === 'long' ? 1 : -1;
    // Decided at the close before entry; condition exits are decided at the close before the exit bar,
    // stops and targets are only known at the close of the exit bar.
    const decidedEarly = t.exitReason === 'exit' || t.exitReason === 'reverse';
    // A trade still open at the end keeps voting through the latest bar, unless it decided to exit on it.
    const stillOpen = t.exitReason === 'end';
    const exitingNow = stillOpen && (pending.exit || (pending.signal && pending.signal.side !== t.side));
    const last = stillOpen ? t.exitIndex - (exitingNow ? 1 : 0) : decidedEarly ? t.exitIndex - 2 : t.exitIndex - 1;
    for (let i = Math.max(0, t.entryIndex - 1); i <= last && i < n; i++) v[i] = dir;
  }
  // An entry decided on the latest close votes immediately.
  if (pending.signal) v[n - 1] = pending.signal.side === 'long' ? 1 : -1;
  return v;
}

const cache = new WeakMap<Candle[], { votes: Int8Array[]; regime: Int8Array; atr: number[] }>();
function componentVotes(candles: Candle[]) {
  let hit = cache.get(candles);
  if (!hit) {
    const f = computeFeatures(candles);
    hit = { votes: COMPONENTS.map((s) => votes(candles, s)), regime: f.regime, atr: f.atr };
    cache.set(candles, hit);
  }
  return hit;
}

/**
 * Signal Composite: goes long when at least `threshold` enabled strategies are
 * long (and the regime gate allows it), and exits when agreement falls below
 * the threshold. gate: 0 = none, 1 = not in a bear regime, 2 = bull regime only.
 */
export const composite: StrategyDef = {
  id: 'composite',
  name: 'Signal Composite',
  description:
    'Supertrend, RSI(2) pullback and band reversion vote every bar. It buys when any of them is long and the trend is not bearish, and sells when none are.',
  defaults: { mask: 0b000111, threshold: 1, gate: 1, shorts: 0, stopAtr: 3 },
  grid: {
    mask: Array.from({ length: 63 }, (_, k) => k + 1),
    threshold: [1, 2, 3],
    gate: [0, 1, 2],
    shorts: [0],
    stopAtr: [3],
  },
  build(c, p) {
    const { votes: all, regime, atr } = componentVotes(c);
    const enabled = all.filter((_, k) => p.mask & (1 << k));
    const names = COMPONENTS.filter((_, k) => p.mask & (1 << k)).map((s) => s.name);
    const n = c.length;
    const score = new Int8Array(n);
    for (const v of enabled) for (let i = 0; i < n; i++) score[i] += v[i];
    const gateLong = (i: number) => (p.gate === 2 ? regime[i] === 1 : p.gate === 1 ? regime[i] !== -1 : true);
    const gateShort = (i: number) => (p.gate === 2 ? regime[i] === -1 : p.gate === 1 ? regime[i] !== 1 : true);
    const wantLong = (i: number) => score[i] >= p.threshold && gateLong(i);
    const wantShort = (i: number) => !!p.shorts && -score[i] >= p.threshold && gateShort(i);

    const signals: Signal[] = [];
    for (let i = 1; i < n; i++) {
      const reasons = (dir: number) => names.filter((_, k) => enabled[k][i] === dir);
      if (wantLong(i) && !wantLong(i - 1))
        signals.push({ index: i, time: c[i].time, side: 'long', score: score[i], maxScore: enabled.length, reasons: reasons(1) });
      else if (wantShort(i) && !wantShort(i - 1))
        signals.push({ index: i, time: c[i].time, side: 'short', score: -score[i], maxScore: enabled.length, reasons: reasons(-1) });
    }
    const close = c.map((b) => b.close);
    return {
      signals,
      atr,
      rules: {
        exitLong: Array.from({ length: n }, (_, i) => !wantLong(i)),
        exitShort: Array.from({ length: n }, (_, i) => !wantShort(i)),
      },
      risk: { stopAtr: p.stopAtr, takeProfitR: 0, trailAtr: 0 },
      lines: [
        { name: 'EMA 50', color: '#4aa3ff', values: ema(close, 50) },
        { name: 'EMA 200', color: '#6b7684', values: ema(close, 200) },
      ],
    };
  },
};
