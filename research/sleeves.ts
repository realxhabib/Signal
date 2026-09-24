// Market-neutral sleeves on daily data for the 20-coin universe:
//  - cross-sectional momentum: long the strongest, short the weakest, dollar-neutral
//  - funding carry: long spot + short perpetual on coins paying positive funding
// Both use real Binance funding. Returns are per unit of capital, daily.
import type { Candle } from '../src/types';
import { funding as loadFunding, fundingPerBar } from './futures';
import { history } from './history';
import { UNIVERSE } from './universe';

const DAY = 86_400;
export interface Daily { time: number; ret: number }

async function load() {
  const coins: { sym: string; c: Candle[]; byTime: Map<number, number>; f: Map<number, number> }[] = [];
  for (const sym of UNIVERSE) {
    const c = await history(sym, '1d');
    const f = fundingPerBar(c.map((b) => b.time), DAY, await loadFunding(sym));
    coins.push({ sym, c, byTime: new Map(c.map((b, i) => [b.time, i])), f: new Map(c.map((b, i) => [b.time, f[i]])) });
  }
  const days = [...new Set(coins.flatMap((x) => x.c.map((b) => b.time)))].sort((a, b) => a - b);
  return { coins, days };
}
const dataP = load();

/** Dollar-neutral momentum: every `rebalance` days rank by `lookback`-day return (skipping the last day). */
export async function momentum(lookback: number, k = 4, rebalance = 7, sign = 1, feePct = 0.02): Promise<Daily[]> {
  const { coins, days } = await dataP;
  const out: Daily[] = [];
  let longs: typeof coins = [];
  let shorts: typeof coins = [];
  for (let d = 1; d < days.length; d++) {
    const t = days[d];
    const prev = days[d - 1];
    let ret = 0;
    // P&L of positions held from prev close to t close; funding: longs pay, shorts receive.
    const leg = (x: (typeof coins)[number], dir: number) => {
      const i = x.byTime.get(t);
      const j = x.byTime.get(prev);
      if (i === undefined || j === undefined) return 0;
      const f = x.f.get(t);
      return dir * (x.c[i].close / x.c[j].close - 1) - dir * (f === undefined || Number.isNaN(f) ? 0.0003 * dir : f);
    };
    for (const x of longs) ret += (0.5 / longs.length) * leg(x, 1);
    for (const x of shorts) ret += (0.5 / shorts.length) * leg(x, -1);
    if (d % rebalance === 0) {
      const ranked = coins
        .map((x) => {
          const i = x.byTime.get(t);
          if (i === undefined || i < lookback + 1) return null;
          return { x, m: x.c[i - 1].close / x.c[i - 1 - lookback].close - 1 };
        })
        .filter((v): v is { x: (typeof coins)[number]; m: number } => !!v)
        .sort((a, b) => sign * (b.m - a.m));
      if (ranked.length >= 2 * k) {
        const nl = ranked.slice(0, k).map((r) => r.x);
        const ns = ranked.slice(-k).map((r) => r.x);
        const changed = nl.filter((x) => !longs.includes(x)).length + ns.filter((x) => !shorts.includes(x)).length;
        ret -= ((changed / (2 * k)) * 2 * (feePct / 100)); // turnover cost (exit + entry) on the changed share
        [longs, shorts] = [nl, ns];
      }
    }
    if (longs.length) out.push({ time: t, ret });
  }
  return out;
}

/**
 * Cash-and-carry: hold spot and short the perpetual on coins whose trailing 3-day funding is above `minRate`
 * (per 8h). Capital per coin = notional × (1 + 1/perpLeverage). Price moves cancel; funding is the income.
 */
export async function carry(minRate = 0.0001, perpLeverage = 3, feePct = 0.02): Promise<Daily[]> {
  const { coins, days } = await dataP;
  const out: Daily[] = [];
  let held = new Set<string>();
  for (let d = 3; d < days.length; d++) {
    const t = days[d];
    let income = 0;
    for (const x of coins) if (held.has(x.sym)) {
      const f = x.f.get(t);
      if (f !== undefined && !Number.isNaN(f)) income += f / held.size;
    }
    // Decide tomorrow's holdings from the trailing 3 days of funding (known now).
    const next = new Set<string>();
    for (const x of coins) {
      const i = x.byTime.get(t);
      if (i === undefined || i < 3) continue;
      const fs = [0, 1, 2].map((k) => x.f.get(x.c[i - k].time)).filter((v): v is number => v !== undefined && !Number.isNaN(v));
      if (fs.length === 3 && fs.reduce((a, v) => a + v, 0) / 3 / 3 > minRate) next.add(x.sym); // daily sum → per-8h avg
    }
    const changed = [...next].filter((s) => !held.has(s)).length + [...held].filter((s) => !next.has(s)).length;
    const denom = Math.max(1, Math.max(next.size, held.size));
    const cost = (changed / denom) * 4 * (feePct / 100); // 2 legs × (open or close)
    const ret = (income - cost) / (1 + 1 / perpLeverage);
    if (held.size || next.size) out.push({ time: t, ret });
    else out.push({ time: t, ret: 0 });
    held = next;
  }
  return out.filter((x) => x.time >= Date.UTC(2020, 0, 1) / 1000);
}

export function perf(xs: Daily[]) {
  let eq = 1;
  let peak = 1;
  let dd = 0;
  const years = new Map<string, number>();
  for (const x of xs) {
    eq *= 1 + x.ret;
    peak = Math.max(peak, eq);
    dd = Math.max(dd, 1 - eq / peak);
    const y = new Date(x.time * 1000).getUTCFullYear().toString();
    years.set(y, (years.get(y) ?? 1) * (1 + x.ret));
  }
  const m = xs.reduce((a, x) => a + x.ret, 0) / xs.length;
  const sd = Math.sqrt(xs.reduce((a, x) => a + (x.ret - m) ** 2, 0) / xs.length);
  const yrs = xs.length / 365;
  return { cagr: eq ** (1 / yrs) - 1, maxDd: dd, sharpe: sd ? (m / sd) * Math.sqrt(365) : 0, years: new Map([...years].map(([k, v]) => [k, v - 1])) };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const f = (v: number) => (v * 100).toFixed(1) + '%';
  const row = (name: string, xs: Daily[]) => {
    const p = perf(xs);
    console.log(`${name.padEnd(38)} CAGR ${f(p.cagr)} DD ${f(p.maxDd)} Sharpe ${p.sharpe.toFixed(2)} | ${[...p.years].map(([y, v]) => `${y} ${f(v)}`).join(' ')}`);
  };
  console.log('Momentum (long top 4 / short bottom 4, weekly, 1x gross):');
  for (const L of [7, 14, 30, 60, 90]) for (const sign of [1, -1]) row(`${sign > 0 ? 'momentum' : 'reversal'} ${L}d`, await momentum(L, 4, 7, sign));
  console.log('\nFunding carry (spot + short perp, 3x perp leverage):');
  for (const th of [0, 0.0001, 0.0002, 0.0003]) row(`funding > ${(th * 100).toFixed(2)}%/8h`, await carry(th));
}
