// Causal futures features aligned to candle closes.
import type { Candle } from '../src/types';
import type { Funding, Metric } from './futures';

export interface FuturesFeatures {
  funding: Float64Array; // last settled funding rate at the bar close (fraction per period)
  fundingPct: Float64Array; // percentile of that rate vs the previous 90 days of settlements
  oiChange1d: Float64Array; // open-interest value change over 24h (fraction)
  oiChange7d: Float64Array;
  topRatio: Float64Array; // top traders long/short position ratio
  topRatioPct: Float64Array; // percentile vs previous 30 days
  globalRatio: Float64Array; // all-account long/short ratio (retail crowding)
  globalRatioPct: Float64Array;
  taker24h: Float64Array; // mean taker buy/sell ratio over 24h
}

function pctOf(value: number, window: number[]) {
  if (window.length < 10 || Number.isNaN(value)) return NaN;
  let below = 0;
  for (const v of window) if (v < value) below++;
  return below / window.length;
}

export function futuresFeatures(c: Candle[], funding: Funding[], metrics: Metric[]): FuturesFeatures {
  const n = c.length;
  const barSec = c[1].time - c[0].time;
  const mk = () => new Float64Array(n).fill(NaN);
  const f: FuturesFeatures = {
    funding: mk(), fundingPct: mk(), oiChange1d: mk(), oiChange7d: mk(),
    topRatio: mk(), topRatioPct: mk(), globalRatio: mk(), globalRatioPct: mk(), taker24h: mk(),
  };
  // Funding: settlements at or before the bar close.
  let k = -1;
  let lo = 0;
  let lastK = -2;
  let lastPct = NaN;
  for (let i = 0; i < n; i++) {
    const close = c[i].time + barSec;
    while (k + 1 < funding.length && funding[k + 1].time <= close) k++;
    if (k < 0) continue;
    f.funding[i] = funding[k].rate;
    if (k !== lastK) {
      while (funding[lo].time <= funding[k].time - 90 * 86_400) lo++;
      lastPct = pctOf(funding[k].rate, funding.slice(lo, k).map((x) => x.rate));
      lastK = k;
    }
    f.fundingPct[i] = lastPct;
  }
  // Metrics: hourly rows labelled by hour start; a row is complete at start + 1h.
  const idx = new Map(metrics.map((m, j) => [m.time, j]));
  let j = -1;
  for (let i = 0; i < n; i++) {
    const close = c[i].time + barSec;
    while (j + 1 < metrics.length && metrics[j + 1].time + 3600 <= close) j++;
    if (j < 0 || metrics[j].time + 3600 < close - 3 * 3600) continue; // stale / missing
    const m = metrics[j];
    const back = (h: number) => metrics[idx.get(m.time - h * 3600) ?? -1];
    const d1 = back(24);
    const d7 = back(168);
    if (d1 && d1.oiValue > 0) f.oiChange1d[i] = m.oiValue / d1.oiValue - 1;
    if (d7 && d7.oiValue > 0) f.oiChange7d[i] = m.oiValue / d7.oiValue - 1;
    f.topRatio[i] = m.topPositionRatio;
    f.globalRatio[i] = m.globalAccountRatio;
    const w30 = metrics.slice(Math.max(0, j - 720), j);
    f.topRatioPct[i] = pctOf(m.topPositionRatio, w30.map((x) => x.topPositionRatio).filter((v) => !Number.isNaN(v)));
    f.globalRatioPct[i] = pctOf(m.globalAccountRatio, w30.map((x) => x.globalAccountRatio).filter((v) => !Number.isNaN(v)));
    const t24 = metrics.slice(Math.max(0, j - 23), j + 1).map((x) => x.takerRatio).filter((v) => !Number.isNaN(v));
    if (t24.length) f.taker24h[i] = t24.reduce((a, v) => a + v, 0) / t24.length;
  }
  return f;
}
