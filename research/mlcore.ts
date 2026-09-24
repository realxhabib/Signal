// Walk-forward profit-model scores for composite longs (see research/ml.ts).
import { COMPONENTS, votes } from '../src/composite';
import { computeFeatures } from '../src/features';
import type { Candle } from '../src/types';
import { DAY } from './lib';
import type { PTrade } from './portfolio';

export interface Score { z: number; a: number; c: number } // prediction and the A / C cut-offs from training data

export function oosScores(trades: PTrade[]): Map<PTrade, Score> {
  const longs = trades.filter((t) => t.side === 'long').sort((a, b) => a.entryTime - b.entryTime);
  const cache = new Map<Candle[], { cols: Uint8Array[]; v: Int8Array[] }>();
  const X = longs.map((t) => {
    let f = cache.get(t.candles);
    if (!f) {
      const fs = computeFeatures(t.candles);
      const names = [...fs.conditions.keys()].filter((k) => !/^(moon|day|session):/.test(k));
      f = { cols: names.map((k) => fs.conditions.get(k)!), v: COMPONENTS.slice(0, 3).map((s) => votes(t.candles, s)) };
      cache.set(t.candles, f);
    }
    const i = t.entryIndex - 1;
    return [...f.cols.map((c) => c[i]), ...f.v.map((v) => (v[i] === 1 ? 1 : 0))];
  });
  const y = longs.map((t) => Math.max(-1.5, Math.min(5, t.rMultiple)));
  const dim = X[0].length;
  const train = (idx: number[]) => {
    const w = new Float64Array(dim + 1);
    for (let e = 0; e < 300; e++) {
      const g = new Float64Array(dim + 1);
      for (const k of idx) {
        let z = w[dim];
        for (let j = 0; j < dim; j++) z += w[j] * X[k][j];
        const err = z - y[k];
        for (let j = 0; j < dim; j++) g[j] += err * X[k][j];
        g[dim] += err;
      }
      for (let j = 0; j <= dim; j++) w[j] -= 0.02 * (g[j] / idx.length + (j < dim ? (50 * w[j]) / idx.length : 0));
    }
    return (k: number) => {
      let z = w[dim];
      for (let j = 0; j < dim; j++) z += w[j] * X[k][j];
      return z;
    };
  };
  const out = new Map<PTrade, Score>();
  const first = longs[0].entryTime;
  const last = longs[longs.length - 1].entryTime;
  for (let ws = first + 730 * DAY; ws < last; ws += 182 * DAY) {
    const idx = longs.map((t, k) => (t.exitTime < ws ? k : -1)).filter((k) => k >= 0);
    if (idx.length < 300) continue;
    const f = train(idx);
    const inS = idx.map(f).sort((a, b) => a - b);
    const a = inS[Math.floor(inS.length * 0.8)];
    const c = inS[Math.floor(inS.length * 0.2)];
    longs.forEach((t, k) => {
      if (t.entryTime >= ws && t.entryTime < ws + 182 * DAY) out.set(t, { z: f(k), a, c });
    });
  }
  return out;
}
