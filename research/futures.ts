// Binance USDT-perpetual data from the public archive (data.binance.vision):
// historical funding rates and 5-minute open-interest / long-short metrics.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const CACHE = join(import.meta.dirname, '.cache');
const BASE = 'https://data.binance.vision/data/futures/um';

async function fetchZipCsv(url: string): Promise<string | null> {
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(String(res.status));
      const tmp = join(CACHE, `tmp-${process.pid}-${Math.random().toString(36).slice(2)}.zip`);
      writeFileSync(tmp, Buffer.from(await res.arrayBuffer()));
      try {
        return execFileSync('unzip', ['-p', tmp], { maxBuffer: 64 * 1024 * 1024 }).toString();
      } finally {
        rmSync(tmp, { force: true });
      }
    } catch {
      await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
    }
  }
  return null;
}

async function pool<T>(items: T[], n: number, fn: (x: T) => Promise<void>) {
  const q = [...items];
  await Promise.all(Array.from({ length: n }, async () => { for (let x = q.shift(); x !== undefined; x = q.shift()) await fn(x); }));
}

const months = (from: string) => {
  const out: string[] = [];
  const d = new Date(`${from}-01T00:00:00Z`);
  const now = new Date();
  while (d < new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))) {
    out.push(d.toISOString().slice(0, 7));
    d.setUTCMonth(d.getUTCMonth() + 1);
  }
  return out;
};

export interface Funding { time: number; rate: number } // time: unix sec; rate: fraction per funding period

/** Funding rate history (every 8h, some coins 4h). */
export async function funding(symbol: string): Promise<Funding[]> {
  mkdirSync(CACHE, { recursive: true });
  const file = join(CACHE, `${symbol}-funding.json`);
  if (existsSync(file)) return JSON.parse(readFileSync(file, 'utf8'));
  const rows: Funding[] = [];
  await pool(months('2019-09'), 6, async (m) => {
    const csv = await fetchZipCsv(`${BASE}/monthly/fundingRate/${symbol}/${symbol}-fundingRate-${m}.zip`);
    if (!csv) return;
    for (const line of csv.trim().split('\n')) {
      const [t, , r] = line.split(',');
      if (!/^\d/.test(t)) continue;
      rows.push({ time: Math.floor(+t / 1000), rate: +r });
    }
  });
  rows.sort((a, b) => a.time - b.time);
  writeFileSync(file, JSON.stringify(rows));
  return rows;
}

export interface Metric {
  time: number; // hour start, unix sec
  oiValue: number; // open interest in USDT
  topPositionRatio: number; // top traders long/short (by position)
  globalAccountRatio: number; // all accounts long/short
  takerRatio: number; // taker buy/sell volume ratio (hour average)
}

/** Hourly open-interest and positioning metrics (from 5-minute data). */
export async function metrics(symbol: string, from = '2020-09-01'): Promise<Metric[]> {
  mkdirSync(CACHE, { recursive: true });
  const file = join(CACHE, `${symbol}-metrics.json`);
  if (existsSync(file)) return JSON.parse(readFileSync(file, 'utf8'));
  const days: string[] = [];
  for (let d = new Date(`${from}T00:00:00Z`); d.getTime() < Date.now() - 86_400_000; d.setUTCDate(d.getUTCDate() + 1))
    days.push(d.toISOString().slice(0, 10));
  const byHour = new Map<number, { oi: number; top: number; glob: number; taker: number[] }>();
  let done = 0;
  await pool(days, 16, async (day) => {
    const csv = await fetchZipCsv(`${BASE}/daily/metrics/${symbol}/${symbol}-metrics-${day}.zip`);
    if (++done % 250 === 0) console.log(symbol, 'metrics', done, '/', days.length);
    if (!csv) return;
    for (const line of csv.trim().split('\n')) {
      const p = line.split(',');
      if (!/^\d{4}-/.test(p[0])) continue;
      const t = Date.parse(p[0].replace(' ', 'T') + 'Z') / 1000;
      const hour = Math.floor(t / 3600) * 3600;
      const h = byHour.get(hour) ?? { oi: NaN, top: NaN, glob: NaN, taker: [] };
      if (p[3]) h.oi = +p[3];
      if (p[5]) h.top = +p[5];
      if (p[6]) h.glob = +p[6];
      if (p[7]) h.taker.push(+p[7]);
      byHour.set(hour, h);
    }
  });
  const out = [...byHour.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([time, h]) => ({
      time,
      oiValue: h.oi,
      topPositionRatio: h.top,
      globalAccountRatio: h.glob,
      takerRatio: h.taker.length ? h.taker.reduce((a, v) => a + v, 0) / h.taker.length : NaN,
    }));
  writeFileSync(file, JSON.stringify(out));
  return out;
}

/** Funding settled during each bar (open, close], as a fraction; NaN where no data exists. */
export function fundingPerBar(times: number[], barSec: number, rows: Funding[]): Float64Array {
  const out = new Float64Array(times.length).fill(NaN);
  if (!rows.length) return out;
  const first = rows[0].time;
  let k = 0;
  for (let i = 0; i < times.length; i++) {
    const open = times[i];
    const close = open + barSec;
    if (close <= first) continue;
    let sum = 0;
    while (k < rows.length && rows[k].time <= open) k++;
    let j = k;
    while (j < rows.length && rows[j].time <= close) sum += rows[j++].rate;
    out[i] = sum;
  }
  return out;
}
