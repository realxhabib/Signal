// Gold alerts: is there a stricter subset of the shipped signals that wins much more often?
// Replays exactly what the alerts send (composite line-up per timeframe, Bitcoin market-mode gate, levels),
// tags each trade with conditions known at the signal candle's close, and compares win rates on the
// research years and on the locked final year.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { backtest } from '../src/backtest';
import { composite, LEVELS, lineupFor, modeOf } from '../src/composite';
import { computeFeatures } from '../src/features';
import { gradeSignals } from '../src/grade';
import { alignRegime, applyBtcGate, btcRegimeByTime } from '../src/scan';
import type { Signal } from '../src/types';
import { HOLDOUT_START } from './account';
import { dataset, limitRisk } from './lib';
import { history } from './history';
import { UNIVERSE } from './universe';

const SEC: Record<string, number> = { '1h': 3600, '4h': 14_400, '1d': 86_400 };

interface Row {
  iv: string;
  sym: string;
  time: number;
  side: 'long' | 'short';
  r: number; // result in R, net of fees and funding
  hit1R: boolean; // reached +1R before the stop
  tags: Set<string>;
  bracket: Record<string, number>; // result in R of a fixed target/stop bracket, keyed `target/stop` in ATRs
  gross: Record<string, number>; // the same before fees
  priceAtr: number; // entry price / ATR, to re-price fees
}
const BRACKETS = [[1, 3], [1.5, 3], [2, 3], [1, 2], [1.5, 2], [0.75, 1.5], [1, 1.5]] as const;
const MAX_BARS = 30;
function bracket(c: { open: number; high: number; low: number; close: number }[], i: number, dir: number, atr: number, tgt: number, stp: number, fee: number) {
  const e = c[i].open;
  const T = e + dir * tgt * atr;
  const S = e - dir * stp * atr;
  let exit = c[Math.min(i + MAX_BARS - 1, c.length - 1)].close;
  for (let k = i; k < Math.min(i + MAX_BARS, c.length); k++) {
    if (dir === 1 ? c[k].low <= S : c[k].high >= S) { exit = S; break; } // stop first when both touch
    if (dir === 1 ? c[k].high >= T : c[k].low <= T) { exit = T; break; }
  }
  return (dir * (exit - e) - 2 * fee * e) / (stp * atr);
}

// Grade model re-trained on trades closed before the locked year (research/ml.ts with CUTOFF), so the
// locked-year check of Grade A signals is clean. Falls back to the shipped model if it hasn't been built.
const cleanFile = join(import.meta.dirname, '.cache', 'signalModel-preholdout.json');
const cleanModel = existsSync(cleanFile) ? JSON.parse(readFileSync(cleanFile, 'utf8')) : undefined;
const rows: Row[] = [];
const btc4 = btcRegimeByTime(await history('BTCUSDT', '4h'));
for (const iv of ['4h', '1h']) {
  for (const sym of UNIVERSE) {
    const d = await dataset(sym, iv);
    const c = d.candles;
    const times = c.map((b) => b.time);
    const regime = iv === '4h' ? btc4 : alignRegime(times, SEC[iv], btc4, SEC['4h']);
    const out = composite.build(c, lineupFor(iv));
    const signals = applyBtcGate(out.signals, sym, regime);
    const risk = { ...limitRisk, ...out.risk, ...LEVELS };
    const res = backtest(c, signals, out.atr, risk, { ...out.rules, funding: d.funding });
    const bySig = new Map<number, Signal>(signals.map((s) => [s.index, s]));
    const grades = gradeSignals(c, signals);
    const gradesClean = cleanModel ? gradeSignals(c, signals, cleanModel) : new Map();
    const own = computeFeatures(c).regime;
    // Higher timeframe of the coin itself: 1d for 4h trades, 4h for 1h trades.
    const htfIv = iv === '4h' ? '1d' : '4h';
    const htfMap = btcRegimeByTime(await history(sym, htfIv));
    const htf = alignRegime(times, SEC[iv], htfMap, SEC[htfIv]);
    for (const t of res.trades) {
      if (t.exitReason === 'end' || t.entryIndex < 300) continue;
      const si = t.entryIndex - 1;
      const sig = bySig.get(si);
      if (!sig) continue;
      const dir = t.side === 'long' ? 1 : -1;
      const mode = modeOf(regime.get(c[si].time));
      const tags = new Set<string>([`side:${t.side}`, `mode:${mode}`]);
      if ((dir === 1 && mode === 'bull') || (dir === -1 && mode === 'bear')) tags.add('with-btc');
      if (own[si] === dir) tags.add('coin-trend');
      if (htf.get(c[si].time) === dir) tags.add('htf-trend');
      if (sig.score >= 2) tags.add('votes>=2');
      if (sig.score >= 3) tags.add('votes>=3');
      const g = grades.get(si);
      if (g) tags.add(`grade:${g}`);
      if (cleanModel && gradesClean.get(si) === 'A') tags.add('clean:A');
      // +1R before the stop (a bar touching both counts as a loss).
      const dist = risk.stopAtr * out.atr[si];
      let hit = false;
      for (let k = t.entryIndex; k <= t.exitIndex; k++) {
        const adverse = dir === 1 ? c[k].low <= t.entryPrice - dist : c[k].high >= t.entryPrice + dist;
        if (adverse) break;
        if (dir === 1 ? c[k].high >= t.entryPrice + dist : c[k].low <= t.entryPrice - dist) {
          hit = true;
          break;
        }
      }
      const br: Record<string, number> = {};
      const gross: Record<string, number> = {};
      for (const [tg, st] of BRACKETS) {
        br[`${tg}/${st}`] = bracket(c, t.entryIndex, dir, out.atr[si], tg, st, 0.0002);
        gross[`${tg}/${st}`] = bracket(c, t.entryIndex, dir, out.atr[si], tg, st, 0);
      }
      rows.push({ iv, sym, time: t.entryTime, side: t.side, r: t.rMultiple, hit1R: hit, tags, bracket: br, gross, priceAtr: c[t.entryIndex].open / out.atr[si] });
    }
  }
}

const filters: [string, (r: Row) => boolean][] = [
  ['All signals (today)', () => true],
  ['With BTC (long in bull / short in bear)', (r) => r.tags.has('with-btc')],
  ['Coin trend agrees', (r) => r.tags.has('coin-trend')],
  ['Higher timeframe agrees', (r) => r.tags.has('htf-trend')],
  ['2+ strategies agree', (r) => r.tags.has('votes>=2')],
  ['3+ strategies agree', (r) => r.tags.has('votes>=3')],
  ['Grade A (longs)', (r) => r.tags.has('grade:A')],
  ['Grade A, model trained before the locked year', (r) => r.tags.has('clean:A')],
  ['With BTC + higher TF', (r) => r.tags.has('with-btc') && r.tags.has('htf-trend')],
  ['With BTC + 2+ agree', (r) => r.tags.has('with-btc') && r.tags.has('votes>=2')],
  ['Higher TF + 2+ agree', (r) => r.tags.has('htf-trend') && r.tags.has('votes>=2')],
  ['With BTC + higher TF + 2+ agree', (r) => r.tags.has('with-btc') && r.tags.has('htf-trend') && r.tags.has('votes>=2')],
  ['With BTC + higher TF + coin trend', (r) => r.tags.has('with-btc') && r.tags.has('htf-trend') && r.tags.has('coin-trend')],
  ['Grade A + with BTC', (r) => r.tags.has('grade:A') && r.tags.has('with-btc')],
  ['Grade A + higher TF', (r) => r.tags.has('grade:A') && r.tags.has('htf-trend')],
];

function stats(rs: Row[], months: number) {
  const n = rs.length;
  const win = rs.filter((r) => r.r > 0).length / n;
  const hit = rs.filter((r) => r.hit1R).length / n;
  const avg = rs.reduce((a, r) => a + r.r, 0) / n;
  return { n, perMonth: n / months, win, hit, avg };
}
const p = (v: number) => `${(v * 100).toFixed(0)}%`;
const lastTime = Math.max(...rows.map((r) => r.time));
const firstTime = (iv: string) => Math.min(...rows.filter((r) => r.iv === iv).map((r) => r.time));
const lines = ['# Gold alerts: stricter signal subsets\n'];
lines.push('Win = trade closed in profit after fees and funding. +1R = price reached one stop-distance of profit before the stop. Per month = across all 20 coins.\n');
for (const iv of ['4h', '1h']) {
  const resMonths = (HOLDOUT_START - firstTime(iv)) / (30.44 * 86_400);
  const holdMonths = (lastTime - HOLDOUT_START) / (30.44 * 86_400);
  lines.push(`\n## ${iv}\n`, '| Filter | Research: per month / win / +1R / avg R | **Locked year**: per month / win / +1R / avg R |', '|---|---|---|');
  for (const [name, f] of filters) {
    const sel = rows.filter((r) => r.iv === iv && f(r));
    const a = stats(sel.filter((r) => r.time < HOLDOUT_START), resMonths);
    const b = stats(sel.filter((r) => r.time >= HOLDOUT_START), holdMonths);
    const cell = (s: typeof a) => (s.n ? `${s.perMonth.toFixed(1)} / ${p(s.win)} / ${p(s.hit)} / ${s.avg.toFixed(2)}R (n=${s.n})` : '—');
    lines.push(`| ${name} | ${cell(a)} | **${cell(b)}** |`);
    console.log(iv, lines[lines.length - 1]);
  }
}
lines.push('\n## Fixed target/stop brackets (in ATRs, max 30 bars) on the same signals\n');
lines.push('A near target raises the win rate by geometry alone: with a random entry, target 1 / stop 3 wins about 75% of the time and makes nothing. The edge is the win rate above that break-even line.\n');
for (const iv of ['4h', '1h']) {
  lines.push(`\n### ${iv}\n`, '| Filter | Bracket | Break-even win | Research: win / avg R | **Locked year**: win / avg R |', '|---|---|---|---|---|');
  for (const [name, f] of filters) {
    for (const [tg, st] of BRACKETS) {
      const k = `${tg}/${st}`;
      const sel = rows.filter((r) => r.iv === iv && f(r));
      const cell = (rs: Row[]) => rs.length ? `${p(rs.filter((r) => r.bracket[k] > 0).length / rs.length)} / ${(rs.reduce((a, r) => a + r.bracket[k], 0) / rs.length).toFixed(3)}R (n=${rs.length})` : '—';
      lines.push(`| ${name} | ${tg} / ${st} | ${p(st / (tg + st))} | ${cell(sel.filter((r) => r.time < HOLDOUT_START))} | **${cell(sel.filter((r) => r.time >= HOLDOUT_START))}** |`);
    }
  }
}
// Robustness of the one candidate that held up in both periods: 1h Grade A longs with a 3-ATR stop.
lines.push('\n## Candidate: 1h Grade A longs, 3-ATR stop — by year and by fee\n');
lines.push('Fees per side: 0.02% (limit orders) and 0.05% (market orders).\n');
lines.push('| Year | n | T1.5: win / avg R @0.02% / @0.05% | T1: win / avg R @0.02% / @0.05% | T2: win / avg R @0.02% / @0.05% |', '|---|---|---|---|---|');
const cand = rows.filter((r) => r.iv === '1h' && r.tags.has(process.env.CLEAN ? 'clean:A' : 'grade:A'));
const yearsOf = [...new Set(cand.map((r) => new Date(r.time * 1000).getUTCFullYear()))].sort();
const net = (r: Row, k: string, fee: number) => r.gross[k] - (2 * fee * r.priceAtr) / 3;
const cellY = (rs: Row[], k: string) =>
  `${p(rs.filter((r) => r.gross[k] - (2 * 0.0002 * r.priceAtr) / 3 > 0).length / rs.length)} / ${(rs.reduce((a, r) => a + net(r, k, 0.0002), 0) / rs.length).toFixed(3)} / ${(rs.reduce((a, r) => a + net(r, k, 0.0005), 0) / rs.length).toFixed(3)}`;
for (const y of [...yearsOf, 'locked year'] as (number | string)[]) {
  const rs = y === 'locked year' ? cand.filter((r) => r.time >= HOLDOUT_START) : cand.filter((r) => new Date(r.time * 1000).getUTCFullYear() === y);
  lines.push(`| ${y} | ${rs.length} | ${cellY(rs, '1.5/3')} | ${cellY(rs, '1/3')} | ${cellY(rs, '2/3')} |`);
}
writeFileSync(join(import.meta.dirname, 'RESULTS-gold.md'), lines.join('\n') + '\n');
