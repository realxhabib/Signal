// All indicators return arrays aligned with the input; warm-up values are NaN.
// Every value at index i uses only data from bars <= i (no look-ahead).

export function sma(src: number[], len: number): number[] {
  const out = new Array<number>(src.length).fill(NaN);
  let sum = 0;
  for (let i = 0; i < src.length; i++) {
    sum += src[i];
    if (i >= len) sum -= src[i - len];
    if (i >= len - 1) out[i] = sum / len;
  }
  return out;
}

export function ema(src: number[], len: number): number[] {
  const out = new Array<number>(src.length).fill(NaN);
  const k = 2 / (len + 1);
  let prev = NaN;
  for (let i = 0; i < src.length; i++) {
    if (i < len - 1) continue;
    if (Number.isNaN(prev)) {
      let s = 0;
      for (let j = i - len + 1; j <= i; j++) s += src[j];
      prev = s / len;
    } else {
      prev = src[i] * k + prev * (1 - k);
    }
    out[i] = prev;
  }
  return out;
}

// Wilder's smoothing (RMA), used by RSI / ATR / ADX.
export function rma(src: number[], len: number): number[] {
  const out = new Array<number>(src.length).fill(NaN);
  let prev = NaN;
  let seed = 0;
  let count = 0;
  for (let i = 0; i < src.length; i++) {
    const v = src[i];
    if (Number.isNaN(v)) continue;
    if (Number.isNaN(prev)) {
      seed += v;
      count++;
      if (count === len) {
        prev = seed / len;
        out[i] = prev;
      }
    } else {
      prev = (prev * (len - 1) + v) / len;
      out[i] = prev;
    }
  }
  return out;
}

export function rsi(close: number[], len: number): number[] {
  const up = new Array<number>(close.length).fill(NaN);
  const dn = new Array<number>(close.length).fill(NaN);
  for (let i = 1; i < close.length; i++) {
    const d = close[i] - close[i - 1];
    up[i] = Math.max(d, 0);
    dn[i] = Math.max(-d, 0);
  }
  const au = rma(up, len);
  const ad = rma(dn, len);
  return au.map((u, i) => {
    const d = ad[i];
    if (Number.isNaN(u) || Number.isNaN(d)) return NaN;
    if (d === 0) return 100;
    return 100 - 100 / (1 + u / d);
  });
}

export function trueRange(high: number[], low: number[], close: number[]): number[] {
  return high.map((h, i) =>
    i === 0
      ? h - low[i]
      : Math.max(h - low[i], Math.abs(h - close[i - 1]), Math.abs(low[i] - close[i - 1])),
  );
}

export function atr(high: number[], low: number[], close: number[], len: number): number[] {
  return rma(trueRange(high, low, close), len);
}

export function adx(high: number[], low: number[], close: number[], len: number) {
  const n = high.length;
  const plusDM = new Array<number>(n).fill(NaN);
  const minusDM = new Array<number>(n).fill(NaN);
  for (let i = 1; i < n; i++) {
    const upMove = high[i] - high[i - 1];
    const downMove = low[i - 1] - low[i];
    plusDM[i] = upMove > downMove && upMove > 0 ? upMove : 0;
    minusDM[i] = downMove > upMove && downMove > 0 ? downMove : 0;
  }
  const tr = trueRange(high, low, close);
  tr[0] = NaN;
  const trS = rma(tr, len);
  const pS = rma(plusDM, len);
  const mS = rma(minusDM, len);
  const plusDI = trS.map((t, i) => (100 * pS[i]) / t);
  const minusDI = trS.map((t, i) => (100 * mS[i]) / t);
  const dx = plusDI.map((p, i) => {
    const s = p + minusDI[i];
    return Number.isNaN(s) ? NaN : s === 0 ? 0 : (100 * Math.abs(p - minusDI[i])) / s;
  });
  return { adx: rma(dx, len), plusDI, minusDI };
}

export function macd(close: number[], fast = 12, slow = 26, signal = 9) {
  const f = ema(close, fast);
  const s = ema(close, slow);
  const line = f.map((v, i) => v - s[i]);
  const firstValid = line.findIndex((v) => !Number.isNaN(v));
  const sig = new Array<number>(close.length).fill(NaN);
  if (firstValid >= 0) {
    const e = ema(line.slice(firstValid), signal);
    for (let i = 0; i < e.length; i++) sig[firstValid + i] = e[i];
  }
  return { line, signal: sig, hist: line.map((v, i) => v - sig[i]) };
}

/**
 * Jurik Moving Average (JMA) — the widely used public approximation of Mark
 * Jurik's adaptive filter. Very low lag with little overshoot.
 *   phase: -100..100 (higher = more responsive / more overshoot)
 *   power: smoothing exponent (1..3 typical)
 */
export function jma(src: number[], len: number, phase = 0, power = 2): number[] {
  const out = new Array<number>(src.length).fill(NaN);
  const phaseRatio = phase < -100 ? 0.5 : phase > 100 ? 2.5 : phase / 100 + 1.5;
  const beta = (0.45 * (len - 1)) / (0.45 * (len - 1) + 2);
  const alpha = Math.pow(beta, power);
  let e0 = 0;
  let e1 = 0;
  let e2 = 0;
  let prev = 0;
  let started = false;
  for (let i = 0; i < src.length; i++) {
    const x = src[i];
    if (!started) {
      e0 = x;
      prev = x;
      started = true;
    }
    e0 = (1 - alpha) * x + alpha * e0;
    e1 = (x - e0) * (1 - beta) + beta * e1;
    e2 = (e0 + phaseRatio * e1 - prev) * Math.pow(1 - alpha, 2) + alpha * alpha * e2;
    prev = e2 + prev;
    // Discard the warm-up so the filter state has settled.
    if (i >= len) out[i] = prev;
  }
  return out;
}
