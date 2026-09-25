import { describe, expect, it } from 'vitest';
import { higherTimeframe } from '../src/indicators';
import { composite } from '../src/composite';
import { STRATEGIES as BASE } from '../src/strategies';

const STRATEGIES = [...BASE, composite];
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

import { computeFeatures, moonPhase } from '../src/features';

describe('features', () => {
  it('computes moon phases for known dates', () => {
    expect(moonPhase(Date.UTC(2024, 3, 8, 18) / 1000)).toBe('new'); // eclipse new moon 8 Apr 2024
    expect(moonPhase(Date.UTC(2024, 8, 18, 3) / 1000)).toBe('full'); // full moon 18 Sep 2024
    expect(moonPhase(Date.UTC(2025, 0, 6, 23) / 1000)).toBe('first-quarter'); // 6 Jan 2025
  });

  it('features never use future bars', () => {
    const c = series(1400);
    const full = computeFeatures(c).conditions;
    const cut = computeFeatures(c.slice(0, 1000)).conditions;
    for (const [name, arr] of cut) expect(Array.from(arr), name).toEqual(Array.from(full.get(name)!.slice(0, 1000)));
  });
});

import { quantStrategy } from '../src/quant';

describe('quant mined rules', () => {
  it('never repaints', () => {
    const c = series(1500, 14_400);
    const ctx = { symbol: 'BTCUSDT', interval: '4h' };
    const full = quantStrategy.build(c, quantStrategy.defaults, ctx).signals.filter((s) => s.index < 1100);
    const prefix = quantStrategy.build(c.slice(0, 1100), quantStrategy.defaults, ctx).signals;
    expect(prefix.map((s) => [s.index, s.side])).toEqual(full.map((s) => [s.index, s.side]));
  });
});

import { votes } from '../src/composite';

describe('composite votes', () => {
  it('match on every bar whether or not later bars exist', () => {
    const c = series(1500, 14_400);
    for (const s of BASE) {
      const full = votes(c, s);
      for (let cut = 600; cut < 1500; cut += 7) {
        const prefix = votes(c.slice(0, cut), s);
        expect(Array.from(prefix), `${s.id} @${cut}`).toEqual(Array.from(full.slice(0, cut)));
      }
    }
  });
});

import { RECOMMENDED } from '../src/composite';

describe('recommended long + short composite', () => {
  const c = series(2000, 14_400);
  const out = composite.build(c, RECOMMENDED);

  it('produces both sides and never repaints', () => {
    const cut = 1500;
    const prefix = composite.build(c.slice(0, cut), RECOMMENDED).signals;
    expect(prefix.map((s) => [s.index, s.side])).toEqual(out.signals.filter((s) => s.index < cut).map((s) => [s.index, s.side]));
  });

  it('never wants a long and a short on the same bar', () => {
    const exitL = out.rules.exitLong!;
    const exitS = out.rules.exitShort!;
    for (let i = 0; i < c.length; i++) expect(!exitL[i] && !exitS[i]).toBe(false);
  });
});

import { NEW_STRATEGIES } from '../src/strategies2';
import { zigzag } from '../src/indicators2';

describe('indicator tournament strategies', () => {
  const c = series(1600, 14_400);
  for (const s of NEW_STRATEGIES) {
    it(`${s.id} never repaints (longs and shorts)`, () => {
      const p = { ...s.defaults, shorts: 1 };
      const full = s.build(c, p).signals.filter((x) => x.index < 1200);
      const prefix = s.build(c.slice(0, 1200), p).signals;
      expect(prefix.map((x) => [x.index, x.side])).toEqual(full.map((x) => [x.index, x.side]));
      const exitsFull = s.build(c, p).rules.exitLong!.slice(0, 1200);
      expect(s.build(c.slice(0, 1200), p).rules.exitLong).toEqual(exitsFull);
    });
  }

  it('zig-zag swings are only known after they are confirmed', () => {
    const { high, low, close } = { high: c.map((b) => b.high), low: c.map((b) => b.low), close: c.map((b) => b.close) };
    const full = zigzag(high, low, close, 3);
    const cut = zigzag(high.slice(0, 900), low.slice(0, 900), close.slice(0, 900), 3);
    expect(cut.lastHigh).toEqual(full.lastHigh.slice(0, 900));
    expect(cut.leg).toEqual(full.leg.slice(0, 900));
  });
});

import { COMPONENTS, lineupFor } from '../src/composite';

describe('line-up per timeframe', () => {
  it('adds Hull MA on 4h only', () => {
    const hma = 2 ** COMPONENTS.findIndex((s) => s.id === 'hma');
    expect(Math.floor(lineupFor('4h').mask / hma) % 2).toBe(1);
    expect(Math.floor(lineupFor('1h').mask / hma) % 2).toBe(0);
    expect(lineupFor('1h')).toEqual(RECOMMENDED);
  });

  it('4h line-up never repaints', () => {
    const c = series(1600, 14_400);
    const full = composite.build(c, lineupFor('4h')).signals.filter((s) => s.index < 1200);
    const prefix = composite.build(c.slice(0, 1200), lineupFor('4h')).signals;
    expect(prefix.map((s) => [s.index, s.side])).toEqual(full.map((s) => [s.index, s.side]));
  });
});
