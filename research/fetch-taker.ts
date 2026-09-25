// Downloads taker-buy volume (aggressive buyers, field 9 of Binance klines) for order-flow research.
// Stored next to the price cache as [time, volume, takerBuyVolume] rows.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { UNIVERSE } from './universe';

const CACHE = join(import.meta.dirname, '.cache');
const REST = 'https://data-api.binance.vision/api/v3/klines';
export type TakerRow = [number, number, number];

export async function taker(symbol: string, interval: string): Promise<TakerRow[]> {
  const file = join(CACHE, `${symbol}-${interval}-taker.json`);
  const out: TakerRow[] = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : [];
  let start = out.length ? out[out.length - 1][0] * 1000 + 1 : 0;
  for (;;) {
    let page: string[][] | null = null;
    for (let a = 0; a < 5 && !page; a++) {
      try {
        const r = await fetch(`${REST}?symbol=${symbol}&interval=${interval}&startTime=${start}&limit=1000`);
        if (r.ok) page = (await r.json()) as string[][];
      } catch {
        /* retry */
      }
      if (!page) await new Promise((res) => setTimeout(res, 1000 * 2 ** a));
    }
    if (!page) throw new Error(`taker fetch failed ${symbol} ${interval}`);
    if (!page.length) break;
    out.push(...page.map((k) => [Number(k[0]) / 1000, +k[5], +k[9]] as TakerRow));
    start = Number(page[page.length - 1][0]) + 1;
    if (page.length < 1000) break;
  }
  writeFileSync(file, JSON.stringify(out));
  return out;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  for (const iv of ['4h', '1h']) for (const s of UNIVERSE) console.log(s, iv, (await taker(s, iv)).length);
}
