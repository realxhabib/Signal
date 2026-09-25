import { describe, expect, it } from 'vitest';
import { ASSETS } from '../src/data';
import { featuresAt, neutralWeights, rollVol } from '../src/patternFeatures';
import model from '../src/patternModel.json';
import { formatBasket, patternBasket, toPanel } from '../src/patterns';
import type { Candle } from '../src/types';

function coin(seed: number, n: number, start: number): Candle[] {
  let s = seed;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647) - 0.5;
  let p = 100 + seed;
  return Array.from({ length: n }, (_, i) => {
    const o = p;
    p *= 1 + rnd() * 0.04;
    return { time: start + i * 14_400, open: o, high: Math.max(o, p) * 1.005, low: Math.min(o, p) * 0.995, close: p, volume: 1000 + Math.abs(rnd()) * 500 };
  });
}
const start = 1_700_006_400; // 00:00 UTC
const all = new Map(Object.keys(ASSETS).map((s, k) => [s, coin(k + 3, 400, start)]));

describe('pattern basket', () => {
  it('model matches the feature layout', () => {
    const p = toPanel(all)!;
    const x = featuresAt(p, p.close.map((c) => rollVol(c)), 1, 300)!;
    expect(x).toHaveLength(model.mu.length);
    expect(model.centroids[0]).toHaveLength(model.mu.length);
    expect(model.scores).toHaveLength(model.centroids.length);
  });

  it('is market neutral with gross exposure at most 1, set at a 00:00 UTC close', () => {
    const b = patternBasket(all, start + 400 * 14_400 + 60)!;
    expect(b).not.toBeNull();
    expect(b.asOf % 86_400).toBe(0);
    expect(b.next - b.asOf).toBe(86_400);
    const sum = b.rows.reduce((a, r) => a + r.weight, 0);
    const gross = b.rows.reduce((a, r) => a + Math.abs(r.weight), 0);
    expect(Math.abs(sum)).toBeLessThan(1e-9);
    expect(gross).toBeLessThanOrEqual(1 + 1e-9);
    expect(formatBasket(b)).toContain('PATTERN BASKET');
  });

  it('only uses bars that had closed by now (no look-ahead)', () => {
    const now = start + 380 * 14_400 + 60;
    const cut = new Map([...all].map(([s, c]) => [s, c.filter((b) => b.time + 14_400 <= now)]));
    expect(patternBasket(all, now)).toEqual(patternBasket(cut, now));
  });

  it('neutral weights sum to zero', () => {
    const w = neutralWeights([1, 2, null, 3, 4, 5])!;
    expect(w.reduce((a, v) => a + v, 0)).toBeCloseTo(0);
    expect(w[2]).toBe(0);
    expect(neutralWeights([1, 1, 1, 1, 1])).toBeNull();
  });
});
