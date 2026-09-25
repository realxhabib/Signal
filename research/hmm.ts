// Gaussian Hidden Markov Model with diagonal covariances: Baum-Welch fitting (scaled forward-backward) and a
// causal forward filter, so the state probability at bar t only uses observations up to t.

export interface Hmm { k: number; pi: number[]; a: number[][]; mu: number[][]; v: number[][] }

const logPdf = (x: number[], mu: number[], v: number[]) => {
  let s = 0;
  for (let j = 0; j < x.length; j++) s += -0.5 * (Math.log(2 * Math.PI * v[j]) + (x[j] - mu[j]) ** 2 / v[j]);
  return s;
};

function emissions(m: Hmm, X: number[][]) {
  return X.map((x) => {
    const l = m.mu.map((mu, k) => logPdf(x, mu, m.v[k]));
    const mx = Math.max(...l);
    return { p: l.map((v) => Math.exp(v - mx)), mx };
  });
}

/** Fit with Baum-Welch. States start ordered by the first feature (quantiles), which keeps labels stable. */
export function fitHmm(X: number[][], k: number, iters = 60): Hmm {
  const n = X.length;
  const d = X[0].length;
  const sorted = X.map((x, i) => [x[0], i]).sort((a, b) => a[0] - b[0]);
  const mu = Array.from({ length: k }, (_, s) => {
    const idx = sorted.slice(Math.floor((s * n) / k), Math.floor(((s + 1) * n) / k)).map((p) => p[1]);
    return Array.from({ length: d }, (_, j) => idx.reduce((a, i) => a + X[i][j], 0) / idx.length);
  });
  const varAll = Array.from({ length: d }, (_, j) => {
    const m = X.reduce((a, x) => a + x[j], 0) / n;
    return X.reduce((a, x) => a + (x[j] - m) ** 2, 0) / n;
  });
  let m: Hmm = {
    k,
    pi: Array(k).fill(1 / k),
    a: Array.from({ length: k }, (_, i) => Array.from({ length: k }, (_, j) => (i === j ? 0.95 : 0.05 / (k - 1)))),
    mu,
    v: Array.from({ length: k }, () => [...varAll]),
  };
  for (let it = 0; it < iters; it++) {
    const e = emissions(m, X);
    const alpha: number[][] = [];
    const c: number[] = [];
    for (let t = 0; t < n; t++) {
      const row = Array.from({ length: k }, (_, j) => (t === 0 ? m.pi[j] : alpha[t - 1].reduce((a, al, i) => a + al * m.a[i][j], 0)) * e[t].p[j]);
      const s = row.reduce((a, v) => a + v, 0) || 1e-300;
      c.push(s);
      alpha.push(row.map((v) => v / s));
    }
    const beta: number[][] = Array.from({ length: n }, () => Array(k).fill(1));
    for (let t = n - 2; t >= 0; t--)
      for (let i = 0; i < k; i++) {
        let s = 0;
        for (let j = 0; j < k; j++) s += m.a[i][j] * e[t + 1].p[j] * beta[t + 1][j];
        beta[t][i] = s / c[t + 1];
      }
    const gamma = alpha.map((al, t) => {
      const g = al.map((v, i) => v * beta[t][i]);
      const s = g.reduce((a, v) => a + v, 0) || 1e-300;
      return g.map((v) => v / s);
    });
    const xiSum = Array.from({ length: k }, () => Array(k).fill(0));
    for (let t = 0; t < n - 1; t++) {
      let s = 0;
      const xi = Array.from({ length: k }, (_, i) => Array.from({ length: k }, (_, j) => alpha[t][i] * m.a[i][j] * e[t + 1].p[j] * beta[t + 1][j]));
      for (const r of xi) for (const v of r) s += v;
      for (let i = 0; i < k; i++) for (let j = 0; j < k; j++) xiSum[i][j] += xi[i][j] / (s || 1e-300);
    }
    const gSum = Array.from({ length: k }, (_, i) => gamma.reduce((a, g) => a + g[i], 0));
    const next: Hmm = {
      k,
      pi: gamma[0],
      a: xiSum.map((r) => {
        const s = r.reduce((a, v) => a + v, 0) || 1;
        return r.map((v) => v / s);
      }),
      mu: Array.from({ length: k }, (_, i) => Array.from({ length: d }, (_, j) => gamma.reduce((a, g, t) => a + g[i] * X[t][j], 0) / (gSum[i] || 1))),
      v: [],
    };
    next.v = Array.from({ length: k }, (_, i) =>
      Array.from({ length: d }, (_, j) => Math.max(1e-4 * varAll[j], gamma.reduce((a, g, t) => a + g[i] * (X[t][j] - next.mu[i][j]) ** 2, 0) / (gSum[i] || 1))),
    );
    m = next;
  }
  return m;
}

/** Causal filtered state probabilities P(state_t | x_1..x_t), continuing from `prior` if given. */
export function filterHmm(m: Hmm, X: number[][], prior?: number[]): number[][] {
  const e = emissions(m, X);
  const out: number[][] = [];
  let prev = prior;
  for (let t = 0; t < X.length; t++) {
    const row = Array.from({ length: m.k }, (_, j) => (prev ? prev.reduce((a, p, i) => a + p * m.a[i][j], 0) : m.pi[j]) * e[t].p[j]);
    const s = row.reduce((a, v) => a + v, 0) || 1e-300;
    prev = row.map((v) => v / s);
    out.push(prev);
  }
  return out;
}
