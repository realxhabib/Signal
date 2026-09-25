import { describe, expect, it } from 'vitest';
import { GOLD } from '../src/composite';
import { goldOutcome, makePlan } from '../src/plan';
import type { Trade } from '../src/types';

const base = { entry: 100, entryTime: 3600 * 10, atr: 2, stopAtr: 3, barSec: 3600 };

describe('trade plan levels', () => {
  it('puts stop and R targets on the right side for longs and shorts', () => {
    const l = makePlan({ ...base, side: 'long', interval: '4h' });
    expect([l.stop, l.r1, l.r2, l.r3]).toEqual([94, 106, 112, 118]);
    expect(l.status).toBe('opening');
    expect(l.goldTp).toBeUndefined();
    const s = makePlan({ ...base, side: 'short', interval: '4h' });
    expect([s.stop, s.r1, s.r2, s.r3]).toEqual([106, 94, 88, 82]);
  });

  it('moves the stop to the entry after the +2R add and reports the exit', () => {
    const trade = {
      side: 'long', entryIndex: 1, entryTime: 0, entryPrice: 100, exitIndex: 5, exitTime: 9, exitPrice: 110, exitReason: 'exit', qty: 1, pnl: 10, rMultiple: 1,
      fills: [{ index: 3, price: 112, qty: 0.5, kind: 'add' }],
    } as Trade;
    const p = makePlan({ ...base, side: 'long', interval: '4h', trade, breakevenAfterAdd: true });
    expect(p.stopNow).toBe(100);
    expect(p.added).toBe(true);
    expect(p.status).toBe('closed');
    expect(p.resultPct).toBeCloseTo(10);
  });

  it('adds the gold take-profit and deadline for 1h Grade A longs', () => {
    const p = makePlan({ ...base, side: 'long', interval: '1h', grade: 'A' });
    expect(p.gold).toBe(true);
    expect(p.goldTp).toBe(100 + GOLD.targetAtr * 2);
    expect(p.closeBy).toBe(base.entryTime + GOLD.maxBars * 3600);
  });
});

describe('gold outcome', () => {
  const bar = (low: number, high: number, close = (low + high) / 2) => ({ low, high, close });
  const p = { side: 'long' as const, entry: 100, stop: 94, goldTp: 103 };
  it('hits the take-profit', () => expect(goldOutcome([bar(99, 101), bar(100, 103.5)], 0, p)?.kind).toBe('tp'));
  it('counts a bar touching both as the stop', () => expect(goldOutcome([bar(93, 104)], 0, p)?.kind).toBe('stop'));
  it('closes at the time limit', () => {
    const c = Array.from({ length: GOLD.maxBars + 5 }, () => bar(99, 101, 101));
    expect(goldOutcome(c, 0, p)).toMatchObject({ kind: 'time', price: 101 });
  });
  it('is still running before the time limit', () => expect(goldOutcome([bar(99, 101)], 0, p)?.kind).toBe('running'));
});
