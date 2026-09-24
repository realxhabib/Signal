import { describe, expect, it, vi } from 'vitest';
import { approves, askJev, buildState, defaultJevThresholds, parseVerdict } from '../src/jev';
import { computeIndicators, defaultStrategy } from '../src/strategy';
import type { Candle } from '../src/types';

const response = {
  model: 'jev-1.13.0',
  answers: {
    regime: { type: 'choice', choice: 'trending_up', probabilities: { trending_up: 0.7, trending_down: 0.1, ranging: 0.1, choppy_volatile: 0.1 }, confidence: 0.8 },
    direction: { type: 'choice', choice: 'long', probabilities: { long: 0.72, short: 0.08, stand_aside: 0.2 }, confidence: 0.8 },
    trap: { type: 'noul', noul: 0.2 },
    conviction: { type: 'score', score: 3.1, probabilities: {}, confidence: 0.7 },
  },
  usage: { input_tokens: 500, output_tokens: 20 },
};

describe('jev', () => {
  it('approves only when direction, trap risk and regime agree', () => {
    const v = parseVerdict(response);
    expect(approves(v, 'long', defaultJevThresholds)).toBe(true);
    expect(approves(v, 'short', defaultJevThresholds)).toBe(false);
    expect(approves({ ...v, trapProb: 0.8 }, 'long', defaultJevThresholds)).toBe(false);
    expect(approves({ ...v, regime: 'choppy_volatile' }, 'long', defaultJevThresholds)).toBe(false);
  });

  it('builds a state without timestamps or absolute prices', () => {
    const candles: Candle[] = Array.from({ length: 300 }, (_, i) => {
      const p = 60000 + Math.sin(i / 10) * 2000 + i * 20;
      return { time: 1_700_000_000 + i * 3600, open: p, high: p + 150, low: p - 150, close: p + 50, volume: 100 + (i % 7) * 10 };
    });
    const ind = computeIndicators(candles, defaultStrategy);
    const state = buildState(candles, ind, { index: 299, time: candles[299].time, side: 'long', score: 4, maxScore: 5, reasons: ['x'] }, 'Bitcoin', '1h');
    const json = JSON.stringify(state);
    expect(json).not.toContain('1700');
    expect(json).not.toMatch(/6\d{4}\./); // no raw BTC prices
    expect(json).not.toContain('NaN');
  });

  it('posts typed questions to the proxy and parses the answer', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify(response)));
    const v = await askJev({ a: 1 }, fetchMock as unknown as typeof fetch);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('/api/jev');
    expect(JSON.parse(init.body as string)).toEqual({ state: { a: 1 } });
    expect(v.direction).toBe('long');
    expect(v.trapProb).toBe(0.2);
  });
});
