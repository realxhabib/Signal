import { describe, expect, it } from 'vitest';
import { simulate, type PTrade } from '../research/portfolio';
import type { Candle } from '../src/types';

const candles: Candle[] = Array.from({ length: 10 }, (_, i) => ({ time: i * 100, open: 100, high: 101, low: 99, close: 100, volume: 1 }));
const trade = (entryIndex: number, exitIndex: number, r: number): PTrade => ({
  sym: 'X', side: 'long', entryIndex, entryTime: entryIndex * 100, entryPrice: 100, exitIndex, exitTime: exitIndex * 100,
  exitPrice: 100 + r, exitReason: 'stop', qty: 1, pnl: r, rMultiple: r, stopDist: 1, candles,
});

describe('portfolio simulator', () => {
  it('closes trades that exit on their entry bar and frees the slot', () => {
    const trades = [trade(1, 1, -1), trade(2, 3, 1), trade(4, 4, -1), trade(5, 6, 1)];
    const r = simulate(trades, new Map([['X', candles]]), { riskPct: 1, sizing: 'risk', maxPositions: 1 });
    expect(r.taken).toBe(4);
    const end = r.curve[r.curve.length - 1].equity;
    expect(end).toBeCloseTo(0.99 * 1.0099 * 0.99 * 1.0099 * (1 / 1), 3); // -1%, +1%, -1%, +1% compounding
  });
});
