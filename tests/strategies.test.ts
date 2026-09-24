import { describe, expect, it } from 'vitest';
import { higherTimeframe } from '../src/indicators';
import { STRATEGIES } from '../src/strategies';
import type { Candle } from '../src/types';

// Deterministic random walk with trends and pullbacks.
function series(n: number, barSec = 3600): Candle[] {
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) - 0.5;
  let p = 100;
  return Array.from({ length: n }, (_, i) => {
    const o = p;
    p = p * (1 + rand() * 0.03 + Math.sin(i / 150) * 0.002);
    const h = Math.max(o, p) * (1 + Math.abs(rand()) * 0.01);
    const l = Math.min(o, p) * (1 - Math.abs(rand()) * 0.01);
    return { time: 1_600_000_000 + i * barSec, open: o, high: h, low: l, close: p, volume: 100 + Math.abs(rand()) * 50 };
  });
}

describe('strategies', () => {
  const candles = series(1500);
  for (const s of STRATEGIES) {
    it(`${s.id} never repaints: signals on a prefix match the full history`, () => {
      const full = s.build(candles, s.defaults).signals;
      const cut = 1100;
      const prefix = s.build(candles.slice(0, cut), s.defaults).signals;
      const fullBefore = full.filter((x) => x.index < cut);
      expect(prefix.map((x) => [x.index, x.side])).toEqual(fullBefore.map((x) => [x.index, x.side]));
    });
  }

  it('produces signals on realistic data', () => {
    const counts = STRATEGIES.map((s) => s.build(candles, s.defaults).signals.length);
    expect(counts.some((c) => c > 0)).toBe(true);
  });
});

describe('higherTimeframe', () => {
  it('only exposes a daily value after the day has closed', () => {
    const hours = Array.from({ length: 72 }, (_, i) => i * 3600);
    const close = hours.map((_, i) => Math.floor(i / 24)); // day index as the close
    const out = higherTimeframe(hours, 3600, 86_400, close, (x) => x);
    expect(out[22]).toBeNaN(); // day 0 still forming
    expect(out[23]).toBe(0); // last hour of day 0 closes the day
    expect(out[30]).toBe(0); // during day 1 we only know day 0
    expect(out[47]).toBe(1);
  });
});
