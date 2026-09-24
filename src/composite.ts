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
export function votes(candles: Candle[], s: StrategyDef, withShorts = false, overrides: Record<string, number> = {}): Int8Array {
  const params = { ...s.defaults, ...overrides, ...(withShorts && 'shorts' in s.defaults ? { shorts: 1 } : {}) };
  const out = s.build(candles, params);
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

/**
 * Component settings can be overridden through composite params named
 * "<component id>.<param>", e.g. { 'supertrend.stMult': 4 } (used by the robustness research).
 */
function overridesFor(p: Record<string, number>, id: string) {
  const o: Record<string, number> = {};
  for (const [k, v] of Object.entries(p)) if (k.startsWith(id + '.')) o[k.slice(id.length + 1)] = v;
  return o;
}

/**
 * The researched account setup (research/shorts-portfolio.ts, RESULTS-round4.md): longs from Supertrend,
 * RSI(2) pullback and band reversion when the coin isn't bearish; shorts from the same three when it
 * isn't bullish, at half the risk of a long and in their own 3 slots.
 */
export const RECOMMENDED = { mask: 0b000111, threshold: 1, gate: 1, shorts: 1, shortGate: 1, shortMask: 0b000111, stopAtr: 3 };
/**
 * Regime-adaptive allocation (research/regime-adaptive.ts, RESULTS-round5.md). Bitcoin's trend sets the
 * market mode; risk is a multiple of the base risk per trade (1% of the account).
 */
export type MarketMode = 'bull' | 'neutral' | 'bear';
export const ALLOCATION: Record<MarketMode, { longRisk: number; longSlots: number; shortRisk: number; shortSlots: number }> = {
  bull: { longRisk: 1, longSlots: 5, shortRisk: 0, shortSlots: 0 },
  neutral: { longRisk: 1, longSlots: 5, shortRisk: 0.5, shortSlots: 3 },
  bear: { longRisk: 0, longSlots: 0, shortRisk: 0.75, shortSlots: 5 },
};
export const modeOf = (regime: number | undefined): MarketMode => (regime === 1 ? 'bull' : regime === -1 ? 'bear' : 'neutral');

const cache = new WeakMap<Candle[], Map<string, { votes: Int8Array[]; regime: Int8Array; atr: number[] }>>();
const featureCache = new WeakMap<Candle[], ReturnType<typeof computeFeatures>>();
function componentVotes(candles: Candle[], withShorts: boolean, p: Record<string, number> = {}) {
  let byMode = cache.get(candles);
  if (!byMode) cache.set(candles, (byMode = new Map()));
  const key = `${withShorts}|${Object.entries(p).filter(([k]) => k.includes('.')).sort().join(';')}`;
  let hit = byMode.get(key);
  if (!hit) {
    let f = featureCache.get(candles);
    if (!f) featureCache.set(candles, (f = computeFeatures(candles)));
    hit = { votes: COMPONENTS.map((s) => votes(candles, s, withShorts, overridesFor(p, s.id))), regime: f.regime, atr: f.atr };
    byMode.set(key, hit);
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
  defaults: { mask: 0b000111, threshold: 1, gate: 1, shorts: 0, shortGate: 2, stopAtr: 3 },
  grid: {
    mask: Array.from({ length: 63 }, (_, k) => k + 1),
    threshold: [1, 2, 3],
    gate: [0, 1, 2],
    shorts: [0],
    stopAtr: [3],
  },
  build(c, p) {
    const { votes: all, regime, atr } = componentVotes(c, !!p.shorts, p);
    const enabled = all.filter((_, k) => p.mask & (1 << k));
    const names = COMPONENTS.filter((_, k) => p.mask & (1 << k)).map((s) => s.name);
    const n = c.length;
    // Longs are counted over `mask`; shorts over `shortMask` (defaults to the same strategies).
    const shortMask = p.shortMask ?? p.mask;
    const shortVoters = all.filter((_, k) => shortMask & (1 << k));
    const longCount = new Int8Array(n);
    const shortCount = new Int8Array(n);
    for (const v of enabled) for (let i = 0; i < n; i++) if (v[i] === 1) longCount[i]++;
    for (const v of shortVoters) for (let i = 0; i < n; i++) if (v[i] === -1) shortCount[i]++;
    const gateLong = (i: number) => (p.gate === 2 ? regime[i] === 1 : p.gate === 1 ? regime[i] !== -1 : true);
    // Shorts: shortGate 2 = bear regime only (default), 1 = anything but a bull regime.
    const gateShort = (i: number) => ((p.shortGate ?? 2) === 2 ? regime[i] === -1 : regime[i] !== 1);
    const wantLong = (i: number) => longCount[i] >= p.threshold && gateLong(i);
    const wantShort = (i: number) => !!p.shorts && shortCount[i] >= p.threshold && !wantLong(i) && gateShort(i);

    const signals: Signal[] = [];
    const shortNames = COMPONENTS.filter((_, k) => shortMask & (1 << k)).map((s) => s.name);
    for (let i = 1; i < n; i++) {
      const reasons = (dir: number) =>
        dir === 1 ? names.filter((_, k) => enabled[k][i] === 1) : shortNames.filter((_, k) => shortVoters[k][i] === -1);
      if (wantLong(i) && !wantLong(i - 1))
        signals.push({ index: i, time: c[i].time, side: 'long', score: longCount[i], maxScore: enabled.length, reasons: reasons(1) });
      else if (wantShort(i) && !wantShort(i - 1))
        signals.push({ index: i, time: c[i].time, side: 'short', score: shortCount[i], maxScore: shortVoters.length, reasons: reasons(-1) });
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
