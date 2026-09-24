import type { Candle } from './types';

// Binance public market-data mirrors (no key, works where api.binance.com is geo-blocked).
const REST = 'https://data-api.binance.vision/api/v3/klines';
const WS = 'wss://data-stream.binance.vision/ws';

export const INTERVALS = ['15m', '1h', '4h', '1d'] as const;
export type Interval = (typeof INTERVALS)[number];

export const ASSETS: Record<string, string> = {
  BTCUSDT: 'Bitcoin',
  ETHUSDT: 'Ethereum',
  SOLUSDT: 'Solana',
};

type RawKline = [number, string, string, string, string, string, ...unknown[]];

const toCandle = (k: RawKline): Candle => ({
  time: Math.floor(k[0] / 1000),
  open: +k[1],
  high: +k[2],
  low: +k[3],
  close: +k[4],
  volume: +k[5],
});

/** Loads the most recent `total` bars, paging backwards 1000 at a time. */
export async function loadCandles(symbol: string, interval: Interval, total = 3000): Promise<Candle[]> {
  let out: Candle[] = [];
  let endTime: number | undefined;
  while (out.length < total) {
    const limit = Math.min(1000, total - out.length);
    const url = `${REST}?symbol=${symbol}&interval=${interval}&limit=${limit}${endTime ? `&endTime=${endTime}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Market data ${res.status}`);
    const page = ((await res.json()) as RawKline[]).map(toCandle);
    if (!page.length) break;
    out = [...page, ...out];
    endTime = page[0].time * 1000 - 1;
    if (page.length < limit) break;
  }
  return out;
}

/** Streams kline updates; `closed` is true once the bar is final. */
export function streamCandles(symbol: string, interval: Interval, onBar: (c: Candle, closed: boolean) => void) {
  let ws: WebSocket | null = null;
  let stopped = false;
  const connect = () => {
    ws = new WebSocket(`${WS}/${symbol.toLowerCase()}@kline_${interval}`);
    ws.onmessage = (e) => {
      const k = JSON.parse(e.data).k;
      onBar({ time: Math.floor(k.t / 1000), open: +k.o, high: +k.h, low: +k.l, close: +k.c, volume: +k.v }, k.x);
    };
    ws.onclose = () => {
      if (!stopped) setTimeout(connect, 3000);
    };
  };
  connect();
  return () => {
    stopped = true;
    ws?.close();
  };
}
