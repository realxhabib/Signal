// k-means++ clustering and the pattern-scoring rule shared by research/patterns.ts and research/export-patterns.ts.

export function kmeans(X: number[][], k: number, iters = 25, seed = 1) {
  let s = seed;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const d = X[0].length;
  // k-means++ start.
  const C: number[][] = [X[Math.floor(rnd() * X.length)]];
  const dist2 = (a: number[], b: number[]) => a.reduce((acc, v, j) => acc + (v - b[j]) ** 2, 0);
  const dmin = X.map((x) => dist2(x, C[0]));
  while (C.length < k) {
    const tot = dmin.reduce((a, v) => a + v, 0);
    let r = rnd() * tot;
    let i = 0;
    while (i < X.length - 1 && (r -= dmin[i]) > 0) i++;
    C.push([...X[i]]);
    for (let j = 0; j < X.length; j++) dmin[j] = Math.min(dmin[j], dist2(X[j], C[C.length - 1]));
  }
  const assign = new Int32Array(X.length);
  for (let it = 0; it < iters; it++) {
    for (let i = 0; i < X.length; i++) {
      let best = 0, bd = Infinity;
      for (let c = 0; c < k; c++) {
        const dd = dist2(X[i], C[c]);
        if (dd < bd) { bd = dd; best = c; }
      }
      assign[i] = best;
    }
    const sum = Array.from({ length: k }, () => new Float64Array(d));
    const cnt = new Int32Array(k);
    for (let i = 0; i < X.length; i++) {
      cnt[assign[i]]++;
      for (let j = 0; j < d; j++) sum[assign[i]][j] += X[i][j];
    }
    for (let c = 0; c < k; c++) if (cnt[c]) C[c] = Array.from(sum[c], (v) => v / cnt[c]);
  }
  const nearest = (x: number[]) => {
    let best = 0, bd = Infinity;
    for (let c = 0; c < k; c++) {
      const dd = dist2(x, C[c]);
      if (dd < bd) { bd = dd; best = c; }
    }
    return best;
  };
  return { C, assign, nearest };
}

/**
 * Score each cluster by the average relative move that followed it: only clusters with |t| > 2 (and at least
 * 50 samples) count, shrunk toward zero by n / (n + 200).
 */
export function scoreClusters(rows: { c: number; y: number }[], k: number) {
  const stat = Array.from({ length: k }, () => ({ n: 0, s: 0, s2: 0 }));
  for (const r of rows) {
    stat[r.c].n++;
    stat[r.c].s += r.y;
    stat[r.c].s2 += r.y * r.y;
  }
  return stat.map((st) => {
    if (st.n < 50) return 0;
    const m = st.s / st.n;
    const v = st.s2 / st.n - m * m;
    const tstat = m / Math.sqrt(v / st.n);
    return Math.abs(tstat) > 2 ? (m * st.n) / (st.n + 200) : 0;
  });
}
