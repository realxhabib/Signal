// Round 7 data: open interest for every coin (liquidation study), total stablecoin supply (DefiLlama) and
// Deribit's implied-volatility index DVOL for BTC and ETH.
import { existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { metrics } from './futures';
import { UNIVERSE } from './universe';

const CACHE = join(import.meta.dirname, '.cache');
const what = process.argv[2] ?? 'all';

if (what === 'macro' || what === 'all') {
  const sc = (await (await fetch('https://stablecoins.llama.fi/stablecoincharts/all')).json()) as { date: string; totalCirculatingUSD?: { peggedUSD?: number } }[];
  const rows = sc.map((r) => ({ time: +r.date, usd: r.totalCirculatingUSD?.peggedUSD ?? NaN })).filter((r) => Number.isFinite(r.usd));
  writeFileSync(join(CACHE, 'stablecoins-daily.json'), JSON.stringify(rows));
  console.log('stablecoins', rows.length, new Date(rows[0].time * 1000).toISOString().slice(0, 10));
  for (const cur of ['BTC', 'ETH']) {
    const out: { time: number; close: number }[] = [];
    let end = Date.now();
    const startAll = Date.UTC(2021, 2, 1);
    while (end > startAll) {
      const start = Math.max(startAll, end - 900 * 3600_000);
      const j = (await (await fetch(`https://www.deribit.com/api/v2/public/get_volatility_index_data?currency=${cur}&start_timestamp=${start}&end_timestamp=${end}&resolution=3600`)).json()) as { result: { data: number[][] } };
      for (const d of j.result.data) out.push({ time: d[0] / 1000, close: d[4] });
      end = start - 1;
    }
    const uniq = [...new Map(out.map((x) => [x.time, x])).values()].sort((a, b) => a.time - b.time);
    writeFileSync(join(CACHE, `dvol-${cur}.json`), JSON.stringify(uniq));
    console.log('dvol', cur, uniq.length, new Date(uniq[0].time * 1000).toISOString().slice(0, 10));
  }
}
if (what === 'metrics' || what === 'all') {
  for (const s of UNIVERSE) {
    if (existsSync(join(CACHE, `${s}-metrics.json`))) continue;
    const m = await metrics(s);
    console.log(s, 'metrics hours', m.length);
  }
}
