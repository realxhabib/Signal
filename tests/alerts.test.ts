import { afterEach, describe, expect, it, vi } from 'vitest';
import { formatAlert, latestEvents, type AlertEvent } from '../src/alerts';
import { btcRegimeByTime } from '../src/scan';
import type { Candle } from '../src/types';
import { channels, dueIntervals } from '../server/alertsRun';
import { backtest, defaultRisk } from '../src/backtest';
import { composite, LEVELS, lineupFor } from '../src/composite';
import { applyBtcGate } from '../src/scan';

function series(n: number, barSec = 14_400): Candle[] {
  let seed = 5;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) - 0.5;
  let p = 100;
  return Array.from({ length: n }, (_, i) => {
    const o = p;
    p = p * (1 + rand() * 0.03 + Math.sin(i / 90) * 0.004);
    return { time: 1_700_000_400 - (1_700_000_400 % barSec) + i * barSec, open: o, high: Math.max(o, p) * 1.004, low: Math.min(o, p) * 0.996, close: p, volume: 100 + Math.abs(rand()) * 50 };
  });
}

describe('alert timing', () => {
  it('runs 4h and 1h just after a 4h close, only 1h at other hours', () => {
    const fourH = 1_700_006_400; // divisible by 14400
    expect(fourH % 14_400).toBe(0);
    expect(dueIntervals(fourH + 60).map((d) => d.interval)).toEqual(['4h', '1h']);
    expect(dueIntervals(fourH + 3600 + 60).map((d) => d.interval)).toEqual(['1h']);
  });
});

describe('alert events', () => {
  it('only reports events decided on the latest closed candle, and they match a later re-run', () => {
    const c = series(1400);
    const reg = btcRegimeByTime(c);
    // Trades a full-history run actually took (same rules as the app and the cron).
    const out = composite.build(c, lineupFor('4h'));
    const full = backtest(c, applyBtcGate(out.signals, 'ETHUSDT', reg), out.atr, { ...defaultRisk, feePct: 0.02, slippagePct: 0, ...out.risk, ...LEVELS }, out.rules).trades;
    let opens = 0;
    for (let cut = 1000; cut < 1400; cut += 3) {
      const prefix = c.slice(0, cut);
      for (const e of latestEvents(prefix, 'ETHUSDT', '4h', reg)) {
        expect(e.barClose).toBe(prefix[prefix.length - 1].time + 14_400);
        if (e.kind === 'open') {
          opens++;
          // Alerted at the close of bar cut-1 → the full run enters at bar cut's open, same side.
          expect(full.some((t) => t.entryIndex === cut && t.side === e.side)).toBe(true);
        }
      }
    }
    expect(opens).toBeGreaterThan(0);
  }, 120_000);

  it('formats readable messages', () => {
    const e: AlertEvent = { symbol: 'BTCUSDT', interval: '4h', kind: 'open', side: 'long', price: 84000, barClose: 1_700_006_400, mode: 'bull', stop: 81000, addAt: 90000, grade: 'A', riskMult: 1, safeLeverage: 20, reasons: ['Supertrend trend-follow'] };
    const text = formatAlert(e);
    expect(text).toContain('OPEN LONG BTC (Bitcoin) · 4h');
    expect(text).toContain('Stop $81,000');
    expect(text).toContain('Grade A');
    expect(formatAlert({ ...e, kind: 'close', resultPct: 3.2 })).toContain('CLOSE LONG');
  });
});

describe('alert channels', () => {
  const realFetch = globalThis.fetch;
  afterEach(() => (globalThis.fetch = realFetch));

  it('sends to Telegram, ntfy and Discord when configured', async () => {
    const calls: [string, RequestInit][] = [];
    globalThis.fetch = vi.fn(async (u: string, init: RequestInit) => (calls.push([u, init]), new Response('{}'))) as unknown as typeof fetch;
    const chs = channels({ TELEGRAM_BOT_TOKEN: 't', TELEGRAM_CHAT_ID: '42', NTFY_TOPIC: 'my-signals', DISCORD_WEBHOOK_URL: 'https://discord.test/hook' });
    expect(chs.map((c) => c.name)).toEqual(['telegram', 'ntfy', 'discord']);
    for (const ch of chs) await ch.send('🟢 OPEN LONG BTC\nPrice $1');
    expect(calls[0][0]).toBe('https://api.telegram.org/bott/sendMessage');
    expect(JSON.parse(calls[0][1].body as string)).toMatchObject({ chat_id: '42', text: '🟢 OPEN LONG BTC\nPrice $1' });
    expect(calls[1][0]).toBe('https://ntfy.sh/my-signals');
    expect((calls[1][1].headers as Record<string, string>).Title).toBe('OPEN LONG BTC');
    expect(calls[2][0]).toBe('https://discord.test/hook');
  });

  it('sends SMS through Twilio when configured', async () => {
    const calls: [string, RequestInit][] = [];
    globalThis.fetch = vi.fn(async (u: string, init: RequestInit) => (calls.push([u, init]), new Response('{}'))) as unknown as typeof fetch;
    const [sms] = channels({ TWILIO_ACCOUNT_SID: 'AC1', TWILIO_AUTH_TOKEN: 'tok', TWILIO_FROM: '+15550001', ALERT_PHONE: '+15550002' });
    expect(sms.name).toBe('sms');
    await sms.send('CLOSE LONG BTC');
    expect(calls[0][0]).toBe('https://api.twilio.com/2010-04-01/Accounts/AC1/Messages.json');
    expect(String(calls[0][1].body)).toBe('From=%2B15550001&To=%2B15550002&Body=CLOSE+LONG+BTC');
    expect((calls[0][1].headers as Record<string, string>).Authorization).toBe(`Basic ${btoa('AC1:tok')}`);
  });

  it('has no channels without configuration', () => {
    expect(channels({})).toEqual([]);
  });
});
