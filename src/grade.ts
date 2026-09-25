import { COMPONENTS, votes } from './composite.js';
import { computeFeatures } from './features.js';
import model from './signalModel.json' with { type: 'json' };
import type { Candle, Signal } from './types.js';

export type Grade = 'A' | 'B' | 'C';

/** Suggested size multiplier per grade (the research sized trades 0.5x–1.5x by model score). */
export const GRADE_SIZE: Record<Grade, number> = { A: 1.5, B: 1, C: 0.5 };

/**
 * Signal-strength grade for Signal Composite longs, from a ridge-regression
 * model that predicts each trade's profit (in R) from the quant conditions and
 * which strategies voted (research/ml.ts). A = top 20% of historical scores,
 * C = bottom 20%. Out of sample, A-grade trades averaged ~0.4R vs ~0.05R for the rest.
 */
export function gradeSignals(c: Candle[], signals: Signal[]): Map<number, Grade> {
  const out = new Map<number, Grade>();
  if (!signals.length) return out;
  const f = computeFeatures(c);
  const v = COMPONENTS.slice(0, 3).map((s) => votes(c, s));
  const voteIdx: Record<string, number> = { 'vote:supertrend': 0, 'vote:rsi2-pullback': 1, 'vote:band-reversion': 2 };
  for (const s of signals) {
    if (s.side !== 'long') continue;
    let z = model.bias;
    model.features.forEach((name, j) => {
      const x = name in voteIdx ? (v[voteIdx[name]][s.index] === 1 ? 1 : 0) : (f.conditions.get(name)?.[s.index] ?? 0);
      z += model.weights[j] * x;
    });
    out.set(s.index, z >= model.grades.a ? 'A' : z < model.grades.c ? 'C' : 'B');
  }
  return out;
}
