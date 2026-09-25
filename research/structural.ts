// Round 7 · Structural edges across coins (not single-chart indicators).
//  1. Lead-lag: when Bitcoin makes a big hourly move, altcoins that under-reacted (vs their beta) tend to catch up.
//  2. Residual reversal: an altcoin's move that Bitcoin doesn't explain (its idiosyncratic residual) tends to
//     partly reverse; traded market-neutral across coins.
// Betas and volatilities are exponentially weighted using past bars only. Research years; market-order fees.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { betas, capGross, HEADER, hold, logRet, panel, report, simulate } from './sleeve-lib';

const FEE = 0.0005;

const lines = ['# Round 7 · Structural cross-coin edges\n', 'Research years (2019 → Sep 2025). Market-order fees 0.05% per side on every change in weight. Sleeve gross exposure ≤ 1×.\n', HEADER];

// 1. Lead-lag on 1h.
{
  const p = await panel('1h');
  const { beta, resVol, btcVol, btc } = betas(p, 1, 720);
  for (const [thr, H] of [[1.5, 1], [1.5, 3], [2.5, 3], [2.5, 6]] as const) {
    const w = p.syms.map((_, s) => {
      const x = new Float64Array(p.times.length);
      if (s === btc) return x;
      for (let t = 1; t < p.times.length; t++) {
        const rb = logRet(p.close[btc], t, 1);
        const r = logRet(p.close[s], t, 1);
        if (!(Math.abs(rb) > thr * btcVol[t]) || !Number.isFinite(r) || !(resVol[s][t] > 0)) continue;
        const gap = (beta[s][t] * rb - r) / resVol[s][t]; // > 0: coin lagged an up-move (or fell more in a down-move... signed)
        x[t] = Math.max(-2, Math.min(2, gap)) / 2 / (p.syms.length - 1);
      }
      return x;
    });
    const held = capGross(w.map((x) => hold(x, H)).map((x) => x.map((v) => v * H)));
    const r = simulate(p, held, FEE, `Lead-lag 1h: BTC move > ${thr}σ, hold ${H}h`);
    lines.push(await report(r));
    console.log(lines[lines.length - 1]);
  }
}

// 2. Residual reversal on 4h, market neutral.
{
  const p = await panel('4h');
  const { beta, btc } = betas(p, 1, 180);
  for (const [look, H, sign] of [[1, 6, -1], [6, 6, -1], [6, 12, -1], [42, 42, -1], [42, 42, 1]] as const) {
    const n = p.times.length;
    const w = p.syms.map(() => new Float64Array(n));
    for (let t = look; t < n; t++) {
      const rb = logRet(p.close[btc], t, look);
      const res: [number, number][] = [];
      for (let s = 0; s < p.syms.length; s++) {
        if (s === btc) continue;
        const r = logRet(p.close[s], t, look);
        if (Number.isFinite(r) && Number.isFinite(beta[s][t]) && Number.isFinite(rb)) res.push([s, r - beta[s][t] * rb]);
      }
      if (res.length < 5) continue;
      const m = res.reduce((a, x) => a + x[1], 0) / res.length;
      const g = res.reduce((a, x) => a + Math.abs(x[1] - m), 0);
      for (const [s, e] of res) w[s][t] = g ? (sign * (e - m)) / g : 0;
    }
    const held = w.map((x) => hold(x, H));
    const r = simulate(p, held, FEE, `${sign < 0 ? 'Residual reversal' : 'Residual momentum'} 4h: ${look}-bar residual, hold ${H} bars, market neutral`);
    lines.push(await report(r));
    console.log(lines[lines.length - 1]);
  }
}
writeFileSync(join(import.meta.dirname, 'RESULTS-round7-structural.md'), lines.join('\n') + '\n');
