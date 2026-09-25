// Round 7 · Forced-trading and liquidity edges.
//  1. Liquidation flush: a sharp 4h drop while open interest falls means leveraged longs were forced out; buy the
//     flush (and the mirror: fade a squeeze where price spikes while shorts are forced out). 1h bars, all coins.
//  2. Stablecoin liquidity: total stablecoin supply growth (DefiLlama) as a filter on the account's longs.
//  3. Options fear: Deribit's BTC implied-volatility index (DVOL) and the implied-minus-realised gap as filters.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { PTrade } from './portfolio';
import { evaluate, header, row } from './round6-lib';
import { rollVol } from './ml-features';
import { capGross, HEADER, hold, logRet, panel, report, simulate } from './sleeve-lib';

const CACHE = join(import.meta.dirname, '.cache');
const DAY = 86_400;
const lines = ['# Round 7 · Liquidations, stablecoin liquidity and options fear\n', '## 1. Liquidation flush sleeve (1h, research years, market-order fees)\n', HEADER];

{
  const p = await panel('1h');
  const oi = p.syms.map((s) => {
    const m: { time: number; oiValue: number }[] = JSON.parse(readFileSync(join(CACHE, `${s}-metrics.json`), 'utf8'));
    const at = new Map(m.map((x) => [x.time, x.oiValue]));
    return Float64Array.from(p.times, (t) => at.get(t) ?? NaN);
  });
  const vol = p.close.map((c) => rollVol(c, 500));
  for (const [thrOi, H, sides] of [[0.02, 12, 'long'], [0.04, 12, 'long'], [0.02, 24, 'long'], [0.02, 6, 'long'], [0.02, 12, 'both']] as const) {
    const w = p.syms.map((_, s) => {
      const x = new Float64Array(p.times.length);
      for (let t = 4; t < p.times.length; t++) {
        const r4 = logRet(p.close[s], t, 4);
        const o = oi[s][t] / oi[s][t - 4] - 1;
        const sd = vol[s][t] * 2;
        if (!Number.isFinite(r4) || !Number.isFinite(o) || !(sd > 0)) continue;
        if (r4 < -2 * sd && o < -thrOi) x[t] = 0.2; // longs flushed out → buy
        else if (sides === 'both' && r4 > 2 * sd && o < -thrOi) x[t] = -0.2; // shorts squeezed out → fade
      }
      return x;
    });
    const held = capGross(w.map((x) => hold(x, H).map((v) => v * H)));
    const r = simulate(p, held, 0.0005, `Liquidation flush: 4h drop > 2σ with OI −${thrOi * 100}%, hold ${H}h${sides === 'both' ? ', both sides' : ''}`, Date.UTC(2021, 0, 1) / 1000);
    lines.push(await report(r));
    console.log(lines[lines.length - 1]);
  }
}

// 2 & 3: filters on the shipped account's long trades.
const sc: { time: number; usd: number }[] = JSON.parse(readFileSync(join(CACHE, 'stablecoins-daily.json'), 'utf8'));
const scAt = new Map(sc.map((x) => [Math.floor(x.time / DAY) * DAY, x.usd]));
/** 30-day stablecoin supply growth known at time t (uses the previous full day). */
const scGrowth = (t: number) => {
  const d = Math.floor(t / DAY) * DAY - DAY;
  const a = scAt.get(d);
  const b = scAt.get(d - 30 * DAY);
  return a && b ? a / b - 1 : NaN;
};
const dv: { time: number; close: number }[] = JSON.parse(readFileSync(join(CACHE, 'dvol-BTC.json'), 'utf8'));
const dvAt = new Map(dv.map((x) => [x.time, x.close]));
const dvSeries = dv.map((x) => x.close);
const dvIdx = new Map(dv.map((x, i) => [x.time, i]));
const btc1h = await panel('1h');
const bIdx = btc1h.syms.indexOf('BTCUSDT');
const btcT = new Map(btc1h.times.map((t, i) => [t, i]));
/** DVOL z-score over the last 90 days and implied − realised (30-day, annualised %) at the last closed hour. */
function fear(t: number) {
  const h = Math.floor(t / 3600) * 3600;
  const i = dvIdx.get(h);
  if (i === undefined || i < 2160) return { z: NaN, vrp: NaN };
  const w = dvSeries.slice(i - 2160, i);
  const m = w.reduce((a, v) => a + v, 0) / w.length;
  const s = Math.sqrt(w.reduce((a, v) => a + (v - m) ** 2, 0) / w.length) || 1;
  const bi = btcT.get(h);
  let rv = NaN;
  if (bi !== undefined && bi > 720) {
    let s2 = 0;
    for (let k = bi - 719; k <= bi; k++) s2 += logRet(btc1h.close[bIdx], k, 1) ** 2;
    rv = Math.sqrt((s2 / 720) * 24 * 365) * 100;
  }
  return { z: (dvAt.get(h)! - m) / s, vrp: dvAt.get(h)! - rv };
}
const at = (t: PTrade) => t.candles[t.entryIndex - 1].time + (t.candles[1].time - t.candles[0].time);
const keepLong = (f: (time: number) => boolean) => (t: PTrade) => t.side !== 'long' || f(at(t));
lines.push('\n## 2–3. Filters on the account\'s long trades (research years)\n', header);
const base = await evaluate({ name: 'Baseline' });
lines.push(row(base));
const filters: [string, (time: number) => boolean][] = [
  ['Longs only while stablecoin supply grew over 30 days', (t) => !(scGrowth(t) < 0)],
  ['Longs only while stablecoin supply grew > 1% over 30 days', (t) => !(scGrowth(t) < 0.01)],
  ['Skip longs when DVOL is extreme (90-day z > 1.5)', (t) => !(fear(t).z > 1.5)],
  ['Skip longs when DVOL is very low (90-day z < −1)', (t) => !(fear(t).z < -1)],
  ['Skip longs when realised vol exceeds implied (DVOL − RV < 0)', (t) => !(fear(t).vrp < 0)],
];
for (const [name, f] of filters) {
  const r = await evaluate({ name, filter4: keepLong(f), filter1: keepLong(f) });
  lines.push(row(r, base));
  console.log(lines[lines.length - 1]);
}
writeFileSync(join(import.meta.dirname, 'RESULTS-round7-liquidity.md'), lines.join('\n') + '\n');
