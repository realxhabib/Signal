import { computeFeatures, moonAge, moonPhase } from './features.js';
import { ema } from './indicators.js';
import quantRules from './quantRules.json' with { type: 'json' };
import type { StrategyDef } from './strategies.js';
import type { Candle, Side, Signal } from './types.js';

interface RuleSet {
  profile: { sl: number; tp: number; hold: number };
  oos: Record<string, { trades: number; perYear: number; winRate: number; profitFactor: number; avgR: number }>;
  rules: Record<string, { side: Side; conds: string[]; trainWin: number; trainN: number }[]>;
}

export const QUANT_PROFILES = ['high-hit', 'symmetric'] as const;

export function quantRuleSet(profile: string, symbol: string, interval: string): RuleSet | undefined {
  return (quantRules as Record<string, RuleSet>)[`${profile}:${symbol}:${interval}`];
}

/**
 * Signals from mined condition rules (see research/mine.ts). Rules were chosen
 * on the full history for a target training win rate; the unseen-data results
 * of the same selection process are in the rule set's `oos` table.
 */
export const quantStrategy: StrategyDef = {
  id: 'quant-rules',
  name: 'Quant mined rules',
  description:
    'Fires when mined combinations of regime, momentum, volatility, persistence, calendar and moon conditions agree. Target: 2 ATR stop, 1 ATR target.',
  defaults: { profile: 0, target: 0.75 },
  grid: {},
  build(c, p, ctx) {
    const profile = QUANT_PROFILES[p.profile] ?? 'high-hit';
    const set = ctx && quantRuleSet(profile, ctx.symbol, ctx.interval);
    const f = computeFeatures(c);
    const close = c.map((b) => b.close);
    const rules = set?.rules[String(p.target)] ?? [];
    const signals: Signal[] = [];
    for (let i = 1; i < c.length; i++) {
      const fired = rules.filter((r) => r.conds.every((k) => f.conditions.get(k)?.[i]));
      if (!fired.length) continue;
      const longs = fired.filter((r) => r.side === 'long').length;
      if (longs && longs < fired.length) continue; // conflicting rules: stand aside
      signals.push({
        index: i,
        time: c[i].time,
        side: longs ? 'long' : 'short',
        score: fired.length,
        maxScore: rules.length,
        reasons: fired[0].conds,
      });
    }
    const prof = set?.profile ?? { sl: 2, tp: 1, hold: 12 };
    return {
      signals,
      atr: f.atr,
      rules: { maxBars: prof.hold },
      risk: { stopAtr: prof.sl, takeProfitR: prof.tp / prof.sl, trailAtr: 0 },
      lines: [
        { name: 'EMA 50', color: '#4aa3ff', values: ema(close, 50) },
        { name: 'EMA 200', color: '#6b7684', values: ema(close, 200) },
      ],
    };
  },
};

export interface MarketContext {
  regime: 'bullish' | 'bearish' | 'neutral';
  dailyRegime: 'bullish' | 'bearish' | 'neutral' | null;
  moon: string;
  moonIllumination: number;
  daysToFull: number;
  active: string[];
}

/** Snapshot of the latest closed bar's conditions, for the context panel. */
export function marketContext(c: Candle[]): MarketContext {
  const f = computeFeatures(c);
  const i = c.length - 1;
  const on = (k: string) => !!f.conditions.get(k)?.[i];
  const barSec = c.length > 1 ? c[1].time - c[0].time : 86_400;
  const t = c[i].time + barSec;
  const age = moonAge(t);
  return {
    regime: f.regime[i] === 1 ? 'bullish' : f.regime[i] === -1 ? 'bearish' : 'neutral',
    dailyRegime: f.conditions.has('daily:bull') ? (on('daily:bull') ? 'bullish' : on('daily:bear') ? 'bearish' : 'neutral') : null,
    moon: moonPhase(t),
    moonIllumination: (1 - Math.cos(2 * Math.PI * age)) / 2,
    daysToFull: ((0.5 - age + 1) % 1) * 29.530588853,
    active: [...f.conditions.keys()].filter(on),
  };
}
