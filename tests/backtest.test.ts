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

describe('exit rules', () => {
  it('exits at the next open when the exit condition fires', () => {
    const c = flat(10);
    c[6] = bar(6, 102, 102, 102, 102);
    const exitLong = c.map((_, i) => i === 5);
    const t = backtest(c, [sig(2, 'long')], atr1(10), { ...noCosts, takeProfitR: 0 }, { exitLong }).trades[0];
    expect(t.exitReason).toBe('exit');
    expect(t.exitIndex).toBe(6);
    expect(t.exitPrice).toBe(102);
  });

  it('closes after maxBars', () => {
    const t = backtest(flat(20), [sig(2, 'long')], atr1(20), { ...noCosts, takeProfitR: 0 }, { maxBars: 4 }).trades[0];
    expect(t.exitIndex - t.entryIndex).toBe(4);
  });

  it('charges funding while a position is open', () => {
    const c = flat(30).map((b, i) => ({ ...b, time: i * 28_800 })); // 8h bars
    const withFunding = backtest(c, [sig(2, 'long')], atr1(30), { ...noCosts, takeProfitR: 0, fundingPct8h: 0.01 }).trades[0];
    expect(withFunding.pnl).toBeLessThan(0);
  });
});

describe('partial take-profit', () => {
  it('banks half at 1R, moves the stop to breakeven, and exits the rest there', () => {
    const c = flat(12);
    c[4] = bar(4, 100, 102.5, 100, 102); // reaches +1R (stop 2 ATR = 2 -> 1R = 102)
    c[6] = bar(6, 101, 101, 99, 99.5); // falls back through entry
    const t = backtest(c, [sig(2, 'long')], atr1(12), {
      ...noCosts,
      takeProfitR: 0,
      stopAtr: 2,
      partialR: 1,
      partialFrac: 0.5,
      breakevenAfterPartial: true,
    }).trades[0];
    expect(t.exitReason).toBe('stop');
    expect(t.exitPrice).toBe(100);
    expect(t.rMultiple).toBeCloseTo(0.5); // half the position made 1R, the rest broke even
  });
});

describe('level-based position management', () => {
  const lv = { ...noCosts, takeProfitR: 0, stopAtr: 2 };

  it('scale-in: half at the signal, the rest on a limit 1 ATR lower', () => {
    const c = flat(12);
    c[4] = bar(4, 100, 100, 98.5, 99); // dips to 99 = entry(100) - 1 ATR
    c[8] = bar(8, 104, 104, 104, 104);
    const exitLong = c.map((_, i) => i === 7); // decided at bar 7's close, filled at bar 8's open (104)
    const t = backtest(c, [sig(2, 'long')], atr1(12), { ...lv, entryFrac: 0.5, scaleIn: [{ atr: 1, frac: 0.5, bars: 5 }] }, { exitLong }).trades[0];
    expect(t.fills!.map((f) => f.kind)).toEqual(['entry', 'scale-in', 'exit']);
    // avg entry 99.5, exit at next open 104: (4.5 × full) / (2 × full) = 2.25R
    expect(t.rMultiple).toBeCloseTo(2.25);
  });

  it('scale-in limit expires if not reached in time', () => {
    const c = flat(12);
    c[9] = bar(9, 100, 100, 98, 99);
    const t = backtest(c, [sig(2, 'long')], atr1(12), { ...lv, entryFrac: 0.5, scaleIn: [{ atr: 1, frac: 0.5, bars: 3 }] }).trades[0];
    expect(t.fills).toBeUndefined(); // only entry + exit
  });

  it('pyramid: adds at +1R and moves the stop to breakeven, capping risk', () => {
    const c = flat(12);
    c[4] = bar(4, 100, 102.5, 100, 102); // +1R (stop 2 ATR) → add half at 102, stop → 100
    c[6] = bar(6, 101, 101, 99, 99.5); // back through 100 → stopped
    const t = backtest(c, [sig(2, 'long')], atr1(12), { ...lv, pyramid: [{ r: 1, frac: 0.5 }], breakevenAfterAdd: true }).trades[0];
    expect(t.exitReason).toBe('stop');
    // original 1.0 at 100 → 100 (0), add 0.5 at 102 → 100 (−1 per unit × 0.5) = −1 / 2 = −0.5R
    expect(t.rMultiple).toBeCloseTo(-0.5);
  });

  it('scale-out: takes a third at 3R and a third at 6R, the rest rides', () => {
    const c = flat(14);
    c[4] = bar(4, 100, 106.5, 100, 106);
    c[6] = bar(6, 106, 112.5, 106, 112);
    c[10] = bar(10, 110, 110, 110, 110);
    const exitLong = c.map((_, i) => i === 9);
    const t = backtest(c, [sig(2, 'long')], atr1(14), { ...lv, scaleOut: [{ r: 3, frac: 1 / 3 }, { r: 6, frac: 1 / 3 }] }, { exitLong }).trades[0];
    // 1/3 × 6 + 1/3 × 12 + 1/3 × 10 = 9.33 per unit / 2 = 4.67R
    expect(t.rMultiple).toBeCloseTo(4.667, 2);
  });

  it('swing stop sits beyond the recent low (bounded to 1–5 ATR)', () => {
    const c = flat(12);
    c[1] = bar(1, 100, 100, 97, 100); // swing low 97 within the last 5 bars
    c[5] = bar(5, 100, 100, 96.5, 97); // 97 − 0.25 ATR = 96.75 is hit
    const t = backtest(c, [sig(2, 'long')], atr1(12), { ...lv, swingStop: 5 }).trades[0];
    expect(t.exitReason).toBe('stop');
    expect(t.exitPrice).toBeCloseTo(96.75);
    expect(t.rMultiple).toBeCloseTo(-1);
  });
});
