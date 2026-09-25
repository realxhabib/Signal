// Downloads and caches full kline history for research (not used by the app).
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Candle } from '../src/types';

const CACHE = join(import.meta.dirname, '.cache');
const REST = 'https://data-api.binance.vision/api/v3/klines';

export async function history(symbol: string, interval: string): Promise<Candle[]> {
  mkdirSync(CACHE, { recursive: true });
  const file = join(CACHE, `${symbol}-${interval}.json`);
  // A cache refreshed in the last 12 hours is used as is (no rewrite), so parallel research jobs never collide.
  if (existsSync(file) && Date.now() - statSync(file).mtimeMs < 12 * 3600_000) return JSON.parse(readFileSync(file, 'utf8'));
  let out: Candle[] = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : [];
  let start = out.length ? out[out.length - 1].time * 1000 + 1 : 0;
  for (;;) {
    let res: Response | null = null;
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        res = await fetch(`${REST}?symbol=${symbol}&interval=${interval}&startTime=${start}&limit=1000`);
        if (res.ok) break;
      } catch {
        /* retry */
      }
      await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
    }
    if (!res?.ok) throw new Error(`fetch failed ${symbol} ${interval}`);
    const page = (await res.json()) as [number, string, string, string, string, string][];
    if (!page.length) break;
    out.push(...page.map((k) => ({ time: k[0] / 1000, open: +k[1], high: +k[2], low: +k[3], close: +k[4], volume: +k[5] })));
    start = page[page.length - 1][0] + 1;
    if (page.length < 1000) break;
  }
  // Drop the still-forming bar.
  const intervalSec = { '1h': 3600, '4h': 14400, '1d': 86400 }[interval] ?? 0;
  out = out.filter((c) => c.time + intervalSec <= Date.now() / 1000);
  writeFileSync(file, JSON.stringify(out));
  return out;
}
