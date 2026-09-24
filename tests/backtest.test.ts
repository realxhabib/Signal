import { describe, expect, it } from 'vitest';
import { backtest, defaultRisk, summarize } from '../src/backtest';
import type { Candle, Signal } from '../src/types';

const bar = (time: number, o: number, h: number, l: number, c: number): Candle => ({ time, open: o, high: h, low: l, close: c, volume: 1 });
const flat = (n: number, p = 100) => Array.from({ length: n }, (_, i) => bar(i, p, p + 0.5, p - 0.5, p));
const sig = (index: number, side: 'long' | 'short'): Signal => ({ index, time: index, side, score: 5, maxScore: 5, reasons: [] });
const noCosts = { ...defaultRisk, feePct: 0, slippagePct: 0, trailAtr: 0 };
const atr1 = (n: number) => Array(n).fill(1);

describe('backtest', () => {
  it('fills at the next bar open and hits the target', () => {
    const c = flat(10);
    c[3] = bar(3, 101, 101, 101, 101);
    c[4] = bar(4, 101, 108, 100.5, 107);
    const res = backtest(c, [sig(2, 'long')], atr1(10), { ...noCosts, stopAtr: 2, takeProfitR: 3 });
    expect(res.trades).toHaveLength(1);
    const t = res.trades[0];
    expect(t.entryPrice).toBe(101); // open of bar 3, not close of bar 2
    expect(t.exitReason).toBe('target');
    expect(t.exitPrice).toBe(107);
    expect(t.rMultiple).toBeCloseTo(3);
  });

  it('assumes the stop fills first when stop and target share a bar', () => {
    const c = flat(10);
    c[4] = bar(4, 100, 110, 90, 100);
    const t = backtest(c, [sig(2, 'long')], atr1(10), { ...noCosts, stopAtr: 2, takeProfitR: 3 }).trades[0];
    expect(t.exitReason).toBe('stop');
    expect(t.rMultiple).toBeCloseTo(-1);
  });

  it('risks riskPct of equity per trade', () => {
    const c = flat(10);
    c[4] = bar(4, 100, 100, 90, 95);
    const res = backtest(c, [sig(2, 'long')], atr1(10), { ...noCosts, riskPct: 1, leverage: 20, stopAtr: 2 });
    expect(res.trades[0].pnl).toBeCloseTo(-100); // 1% of 10k
  });

  it('high leverage gets liquidated before a normal stop is reached', () => {
    const c = flat(10);
    c[4] = bar(4, 100, 100, 90, 95);
    // 100x: liquidation at 99.5 sits in front of the 2-ATR stop at 98.
    const t = backtest(c, [sig(2, 'long')], atr1(10), { ...noCosts, riskPct: 1, leverage: 100, stopAtr: 2 }).trades[0];
    expect(t.exitReason).toBe('liquidation');
  });

  it('liquidates when the stop sits beyond the liquidation price', () => {
    const c = flat(10);
    c[4] = bar(4, 100, 100, 80, 85);
    // 50x leverage -> liquidation ~1.5% away; 10-ATR stop is far wider.
    const res = backtest(c, [sig(2, 'long')], atr1(10), { ...noCosts, leverage: 50, stopAtr: 10, riskPct: 50 });
    expect(res.trades[0].exitReason).toBe('liquidation');
    expect(summarize(res, noCosts.startEquity).liquidations).toBe(1);
  });

  it('reverses on an opposite signal', () => {
    const res = backtest(flat(12), [sig(2, 'long'), sig(5, 'short')], atr1(12), { ...noCosts, takeProfitR: 0 });
    expect(res.trades.map((t) => [t.side, t.exitReason])).toEqual([
      ['long', 'reverse'],
      ['short', 'end'],
    ]);
  });

  it('charges fees on both sides', () => {
    const res = backtest(flat(8), [sig(2, 'long')], atr1(8), { ...noCosts, feePct: 0.1, takeProfitR: 0 });
    expect(res.trades[0].pnl).toBeLessThan(0);
  });
});
