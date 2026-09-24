import { describe, expect, it } from 'vitest';
import { composite } from '../src/composite';
import { gradeSignals } from '../src/grade';
import { applyBtcGate, coinStatus } from '../src/scan';
import type { Candle, Signal } from '../src/types';

function series(n: number, barSec = 14_400): Candle[] {
  let seed = 11;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) - 0.5;
  let p = 100;
  return Array.from({ length: n }, (_, i) => {
    const o = p;
    p = p * (1 + rand() * 0.03 + Math.sin(i / 120) * 0.003);
    return { time: 1_600_000_000 + i * barSec, open: o, high: Math.max(o, p) * 1.005, low: Math.min(o, p) * 0.995, close: p, volume: 100 + Math.abs(rand()) * 80 };
  });
}
const sig = (index: number, side: 'long' | 'short', time = index): Signal => ({ index, time, side, score: 1, maxScore: 1, reasons: [] });

describe('market mode gate', () => {
  it('bear mode: shorts only; bull mode: longs only; neutral: both', () => {
    const regime = new Map([[1, -1], [2, 1], [3, 0]]);
    const s = [sig(1, 'long', 1), sig(1, 'short', 1), sig(2, 'long', 2), sig(2, 'short', 2), sig(3, 'long', 3), sig(3, 'short', 3)];
    expect(applyBtcGate(s, 'ETHUSDT', regime).map((x) => [x.time, x.side])).toEqual([[1, 'short'], [2, 'long'], [3, 'long'], [3, 'short']]);
  });
});

describe('signal grades', () => {
  it('grades composite longs A/B/C and never looks ahead', () => {
    const c = series(1500);
    const signals = composite.build(c, composite.defaults).signals;
    const full = gradeSignals(c, signals);
    expect(full.size).toBe(signals.filter((s) => s.side === 'long').length);
    expect([...full.values()].every((g) => ['A', 'B', 'C'].includes(g))).toBe(true);
    const cut = 1100;
    const prefix = gradeSignals(c.slice(0, cut), signals.filter((s) => s.index < cut));
    for (const [i, g] of prefix) expect(full.get(i)).toBe(g);
  });
});

describe('coin status', () => {
  it('reports a status for any coin', () => {
    const st = coinStatus(series(1000), 'ETHUSDT', null, false);
    expect(['open-now', 'close-now', 'in-trade', 'flat']).toContain(st.kind);
  });
});

import { lastMonday, momentumPicks } from '../src/momentum';

describe('momentum sleeve', () => {
  it('finds the Monday on or before a date', () => {
    expect(new Date(lastMonday(Date.UTC(2026, 8, 24, 15) / 1000) * 1000).toISOString()).toBe('2026-09-21T00:00:00.000Z');
    expect(new Date(lastMonday(Date.UTC(2026, 8, 21, 0) / 1000) * 1000).toISOString()).toBe('2026-09-21T00:00:00.000Z');
  });

  it('longs the strongest and shorts the weakest using only closed days', () => {
    const day = 86_400;
    const start = Date.UTC(2026, 7, 1) / 1000;
    const coin = (growth: number): Candle[] =>
      Array.from({ length: 40 }, (_, i) => ({ time: start + i * day, open: 1, high: 1, low: 1, close: growth ** i, volume: 1 }));
    const daily = new Map(Array.from({ length: 10 }, (_, k) => [`C${k}`, coin(1 + (k - 5) / 100)] as [string, Candle[]]));
    const p = momentumPicks(daily, start + 30 * day)!;
    expect(p.longs.map((x) => x.symbol)).toEqual(['C9', 'C8', 'C7', 'C6']);
    expect(p.shorts.map((x) => x.symbol)).toEqual(['C0', 'C1', 'C2', 'C3']);
  });
});
