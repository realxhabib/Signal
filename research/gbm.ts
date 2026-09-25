// Small gradient-boosted decision trees (logistic loss) for numeric features, with quantile-binned splits.

interface Node { f: number; t: number; l: Node | number; r: Node | number }
export interface Gbm { base: number; lr: number; trees: (Node | number)[] }

const predictTree = (n: Node | number, x: number[]): number => (typeof n === 'number' ? n : predictTree(x[n.f] <= n.t ? n.l : n.r, x));
export const predictGbm = (m: Gbm, x: number[]) => 1 / (1 + Math.exp(-(m.base + m.lr * m.trees.reduce((a, t) => a + predictTree(t, x), 0))));

/** Fit boosted trees on binary labels. Splits are searched over up to `bins` quantile thresholds per feature. */
export function fitGbm(X: number[][], y: number[], o: { trees?: number; depth?: number; lr?: number; minLeaf?: number; bins?: number } = {}): Gbm {
  const { trees = 150, depth = 3, lr = 0.05, minLeaf = 100, bins = 16 } = o;
  const n = X.length;
  const d = X[0].length;
  const pBar = Math.min(0.99, Math.max(0.01, y.reduce((a, v) => a + v, 0) / n));
  const base = Math.log(pBar / (1 - pBar));
  const thresholds = Array.from({ length: d }, (_, j) => {
    const vals = [...new Set(X.map((x) => x[j]))].sort((a, b) => a - b);
    if (vals.length <= bins) return vals.slice(0, -1);
    return Array.from({ length: bins - 1 }, (_, k) => vals[Math.floor(((k + 1) * vals.length) / bins)]);
  });
  const F = new Float64Array(n).fill(base);
  const out: Gbm = { base, lr, trees: [] };
  for (let t = 0; t < trees; t++) {
    const p = Array.from(F, (f) => 1 / (1 + Math.exp(-f)));
    const g = y.map((v, i) => v - p[i]); // negative gradient
    const h = p.map((v) => v * (1 - v)); // hessian
    const build = (idx: number[], lvl: number): Node | number => {
      const G = idx.reduce((a, i) => a + g[i], 0);
      const H = idx.reduce((a, i) => a + h[i], 0);
      const leaf = G / (H + 1);
      if (lvl >= depth || idx.length < 2 * minLeaf) return leaf;
      let best = { gain: 0, f: -1, t: 0 };
      const parent = (G * G) / (H + 1);
      for (let j = 0; j < d; j++)
        for (const th of thresholds[j]) {
          let gl = 0;
          let hl = 0;
          let nl = 0;
          for (const i of idx)
            if (X[i][j] <= th) {
              gl += g[i];
              hl += h[i];
              nl++;
            }
          if (nl < minLeaf || idx.length - nl < minLeaf) continue;
          const gain = (gl * gl) / (hl + 1) + ((G - gl) * (G - gl)) / (H - hl + 1) - parent;
          if (gain > best.gain) best = { gain, f: j, t: th };
        }
      if (best.f < 0) return leaf;
      return { f: best.f, t: best.t, l: build(idx.filter((i) => X[i][best.f] <= best.t), lvl + 1), r: build(idx.filter((i) => X[i][best.f] > best.t), lvl + 1) };
    };
    const tree = build(Array.from({ length: n }, (_, i) => i), 0);
    out.trees.push(tree);
    for (let i = 0; i < n; i++) F[i] += lr * predictTree(tree, X[i]);
  }
  return out;
}
