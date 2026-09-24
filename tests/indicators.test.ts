import { describe, expect, it } from 'vitest';
import { atr, ema, jma, rsi, sma } from '../src/indicators';

describe('indicators', () => {
  it('sma', () => {
    expect(sma([1, 2, 3, 4, 5], 3).slice(2)).toEqual([2, 3, 4]);
  });

  it('ema seeds with sma then smooths', () => {
    const e = ema([1, 2, 3, 4], 3);
    expect(e[1]).toBeNaN();
    expect(e[2]).toBe(2);
    expect(e[3]).toBe(3); // 4*0.5 + 2*0.5
  });

  it('rsi is 100 on a straight rally and 0 on a straight decline', () => {
    const up = Array.from({ length: 30 }, (_, i) => 100 + i);
    expect(rsi(up, 14)[29]).toBe(100);
    expect(rsi([...up].reverse(), 14)[29]).toBe(0);
  });

  it('atr of constant-range bars equals the range', () => {
    const n = 30;
    const a = atr(Array(n).fill(11), Array(n).fill(9), Array(n).fill(10), 14);
    expect(a[n - 1]).toBeCloseTo(2);
  });

  it('jma tracks a constant and follows a step with little overshoot', () => {
    const src = [...Array(100).fill(100), ...Array(100).fill(110)];
    const j = jma(src, 14, 0, 2);
    expect(j[99]).toBeCloseTo(100, 6);
    expect(j[199]).toBeCloseTo(110, 1);
    expect(Math.max(...j.slice(100).filter((v) => !Number.isNaN(v)))).toBeLessThan(112);
  });

  it('never uses future data', () => {
    const src = Array.from({ length: 200 }, (_, i) => 100 + Math.sin(i / 5) * 10);
    const full = jma(src, 20, 50, 2);
    const cut = jma(src.slice(0, 150), 20, 50, 2);
    expect(cut[149]).toBe(full[149]);
  });
});
