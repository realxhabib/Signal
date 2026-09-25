// Alert events for the latest closed candle, shared by the server cron (api/alerts.ts) and the app.
import { backtest, defaultRisk } from './backtest.js';
import { ALLOCATION, composite, LEVELS, lineupFor, modeOf, type MarketMode } from './composite.js';
import { ASSETS } from './data.js';
import { gradeSignals, type Grade } from './grade.js';
import { applyBtcGate } from './scan.js';
import { safeLeverage } from './sizing.js';
import type { Candle, Side } from './types.js';

export interface AlertEvent {
  symbol: string;
  interval: string;
  kind: 'open' | 'close' | 'add';
  side: Side;
  price: number;
  barClose: number; // unix seconds when the triggering candle closed
  mode: MarketMode;
  stop?: number;
  addAt?: number;
  grade?: Grade;
  resultPct?: number;
  riskMult?: number; // multiple of the base risk per trade for this signal
  safeLeverage?: number;
  reasons?: string[];
}

/**
 * Events decided on the most recent closed candle: a new LONG/SHORT to open at the next open, an open position
 * to close at the next open, or a pyramid add filled during that candle. `candles` must contain closed bars only.
 */
export function latestEvents(candles: Candle[], symbol: string, interval: string, regime: Map<number, number> | null): AlertEvent[] {
  if (candles.length < 300) return [];
  const barSec = candles[1].time - candles[0].time;
  const last = candles.length - 1;
  const barClose = candles[last].time + barSec;
  const out = composite.build(candles, lineupFor(interval));
  const signals = applyBtcGate(out.signals, symbol, regime);
  const risk = { ...defaultRisk, feePct: 0.02, slippagePct: 0, ...out.risk, ...LEVELS };
  const res = backtest(candles, signals, out.atr, risk, out.rules);
  const mode = modeOf(regime?.get(candles[last].time));
  const price = candles[last].close;
  const events: AlertEvent[] = [];
  const lastTrade = res.trades[res.trades.length - 1];
  const open = lastTrade && lastTrade.exitReason === 'end' ? lastTrade : null;

  if (open?.fills?.some((f) => f.kind === 'add' && f.index === last)) {
    const f = open.fills.find((x) => x.kind === 'add' && x.index === last)!;
    events.push({ symbol, interval, kind: 'add', side: open.side, price: f.price, barClose, mode, stop: open.entryPrice });
  }
  if (open && (res.pending.exit || (res.pending.signal && res.pending.signal.side !== open.side))) {
    const dir = open.side === 'long' ? 1 : -1;
    events.push({ symbol, interval, kind: 'close', side: open.side, price, barClose, mode, resultPct: ((dir * (price - open.entryPrice)) / open.entryPrice) * 100 });
  }
  const sig = res.pending.signal;
  if (sig && (!open || sig.side !== open.side)) {
    const dir = sig.side === 'long' ? 1 : -1;
    const dist = risk.stopAtr * out.atr[last];
    const stop = price - dir * dist;
    const alloc = ALLOCATION[mode];
    events.push({
      symbol,
      interval,
      kind: 'open',
      side: sig.side,
      price,
      barClose,
      mode,
      stop,
      addAt: price + dir * 2 * dist,
      grade: sig.side === 'long' ? gradeSignals(candles, [sig]).get(sig.index) : undefined,
      riskMult: sig.side === 'long' ? alloc.longRisk : alloc.shortRisk,
      safeLeverage: safeLeverage(price, stop),
      reasons: sig.reasons,
    });
  }
  return events;
}

const fmtPrice = (v: number) => '$' + v.toLocaleString('en-US', { maximumFractionDigits: v >= 1000 ? 0 : v >= 10 ? 2 : 4 });

/** Per-coin alert level: priority (loud + SMS), normal (quiet), off (not sent). */
export type AlertLevel = 'priority' | 'normal' | 'off';

/** Parse `BTCUSDT:p,ETHUSDT:off,…` (as sent by the app) into levels for known coins only. */
export function parseLevels(spec: string | null | undefined, known: string[]): Record<string, AlertLevel> {
  const out: Record<string, AlertLevel> = {};
  for (const part of (spec ?? '').split(',')) {
    const [sym, lvl] = part.trim().toUpperCase().split(':');
    if (!known.includes(sym)) continue;
    if (lvl === 'P' || lvl === 'PRIORITY') out[sym] = 'priority';
    else if (lvl === 'OFF') out[sym] = 'off';
    else if (lvl === 'N' || lvl === 'NORMAL') out[sym] = 'normal';
  }
  return out;
}

/** Compact form of levels for the query string; normal is the default and is omitted. */
export function levelsToSpec(levels: Record<string, AlertLevel>): string {
  return Object.entries(levels)
    .filter(([, l]) => l !== 'normal')
    .map(([s, l]) => `${s}:${l === 'priority' ? 'p' : 'off'}`)
    .join(',');
}

/** Plain-text message for one event (works for Telegram, SMS, ntfy and Discord). */
export function formatAlert(e: AlertEvent, priority = false): string {
  return (priority ? '🚨 PRIORITY · ' : '') + formatBody(e);
}

function formatBody(e: AlertEvent): string {
  const coin = `${e.symbol.replace('USDT', '')} (${ASSETS[e.symbol] ?? e.symbol}) · ${e.interval}`;
  const side = e.side === 'long' ? 'LONG' : 'SHORT';
  const when = new Date(e.barClose * 1000).toISOString().slice(0, 16).replace('T', ' ') + ' UTC';
  if (e.kind === 'open')
    return [
      `${e.side === 'long' ? '🟢' : '🔴'} OPEN ${side} ${coin}`,
      `Price ${fmtPrice(e.price)} · act at the next open`,
      `Stop ${fmtPrice(e.stop!)} · add ½ at ${fmtPrice(e.addAt!)} (+2R), then stop → entry`,
      `${e.grade ? `Grade ${e.grade} · ` : ''}risk ${e.riskMult}× base · max safe leverage ${e.safeLeverage}x`,
      `Market mode ${e.mode.toUpperCase()} · ${(e.reasons ?? []).join(', ')}`,
      `Candle closed ${when}`,
    ].join('\n');
  if (e.kind === 'close')
    return [`⚪ CLOSE ${side} ${coin}`, `Price ${fmtPrice(e.price)} · ${e.resultPct! >= 0 ? '+' : ''}${e.resultPct!.toFixed(1)}% · act at the next open`, `Candle closed ${when}`].join('\n');
  return [`➕ ADD ½ to ${side} ${coin}`, `Filled around ${fmtPrice(e.price)} (+2R)`, `Move the stop to your entry ${fmtPrice(e.stop!)}`, `Candle closed ${when}`].join('\n');
}
