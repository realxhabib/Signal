// Round 7 · Residual momentum robustness: rank coins by the part of their move Bitcoin doesn't explain, long the
// strongest and short the weakest (market neutral). Neighbouring lookbacks and holds, slow limit-order version.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { betas, HEADER, hold, logRet, panel, report, simulate } from './sleeve-lib';

const p = await panel('4h');
const { beta, btc } = betas(p, 1, 180);
const lines = ['# Round 7 · Residual momentum (4h, market neutral)\n', 'Research years. Weights ∝ cross-sectional residual return (vs Bitcoin beta), gross 1×.\n', HEADER];
for (const [look, H, fee] of [[42, 42, 0.0005], [21, 42, 0.0005], [84, 42, 0.0005], [42, 18, 0.0005], [84, 84, 0.0005], [42, 42, 0.0002], [84, 42, 0.0002]] as const) {
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
    for (const [s, e] of res) w[s][t] = g ? (e - m) / g : 0;
  }
  const r = simulate(p, w.map((x) => hold(x, H)), fee, `Residual momentum: ${look}-bar residual, hold ${H} bars, fee ${fee * 100}%`);
  lines.push(await report(r));
  console.log(lines[lines.length - 1]);
}
writeFileSync(join(import.meta.dirname, 'RESULTS-round7-resmom.md'), lines.join('\n') + '\n');
