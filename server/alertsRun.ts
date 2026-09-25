// Server-side alert run: evaluate every coin on 4h and 1h for candles that just closed, then notify.
import { latestEvents, formatAlert, type AlertEvent } from '../src/alerts.js';
import { ASSETS, loadCandles, type Interval } from '../src/data.js';
import { alignRegime, btcRegimeByTime } from '../src/scan.js';

const SEC: Record<string, number> = { '1h': 3600, '4h': 14_400 };
// Events already sent by this server instance (the app triggers a check after every candle close; this stops
// repeat sends when several tabs or reloads trigger the same check).
const sentKeys = new Set<string>();
type Env = Record<string, string | undefined>;

/** Channels configured through environment variables; each is optional. */
export function channels(env: Env) {
  const list: { name: string; send: (text: string) => Promise<void> }[] = [];
  if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID)
    list.push({
      name: 'telegram',
      send: async (text) => {
        const r = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text, disable_web_page_preview: true }),
        });
        if (!r.ok) throw new Error(`telegram ${r.status}`);
      },
    });
  if (env.NTFY_TOPIC)
    list.push({
      name: 'ntfy',
      send: async (text) => {
        const [title, ...body] = text.split('\n');
        const r = await fetch(`${env.NTFY_SERVER ?? 'https://ntfy.sh'}/${encodeURIComponent(env.NTFY_TOPIC!)}`, {
          method: 'POST',
          // Header values must be ASCII: drop emoji from the title.
          headers: { Title: title.replace(/[^\x20-\x7E]/g, '').trim(), Priority: 'high', Tags: 'chart_with_upwards_trend' },
          body: body.join('\n'),
        });
        if (!r.ok) throw new Error(`ntfy ${r.status}`);
      },
    });
  if (env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && env.TWILIO_FROM && env.ALERT_PHONE)
    list.push({
      name: 'sms',
      send: async (text) => {
        const auth = btoa(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`);
        const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`, {
          method: 'POST',
          headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ From: env.TWILIO_FROM!, To: env.ALERT_PHONE!, Body: text }).toString(),
        });
        if (!r.ok) throw new Error(`sms ${r.status}`);
      },
    });
  if (env.DISCORD_WEBHOOK_URL)
    list.push({
      name: 'discord',
      send: async (text) => {
        const r = await fetch(env.DISCORD_WEBHOOK_URL!, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: text }) });
        if (!r.ok) throw new Error(`discord ${r.status}`);
      },
    });
  return list;
}

async function pool<T>(items: T[], n: number, fn: (x: T) => Promise<void>) {
  const q = [...items];
  await Promise.all(Array.from({ length: n }, async () => { for (let x = q.shift(); x !== undefined; x = q.shift()) await fn(x); }));
}

/** Timeframes whose most recent candle closed within `withinSec` of `now`. */
export function dueIntervals(now: number, withinSec = 1200): { interval: Interval; barClose: number }[] {
  return (['4h', '1h'] as Interval[])
    .map((interval) => ({ interval, barClose: Math.floor(now / SEC[interval]) * SEC[interval] }))
    .filter((x) => now - x.barClose < withinSec);
}

export async function runAlerts(opts: { now?: number; send?: boolean; env?: Env; symbols?: string[] } = {}) {
  const now = opts.now ?? Math.floor(Date.now() / 1000);
  const env = opts.env ?? process.env;
  const symbols = opts.symbols ?? Object.keys(ASSETS);
  const due = dueIntervals(now);
  const events: AlertEvent[] = [];
  const errors: string[] = [];
  if (due.length) {
    // Market mode for every timeframe comes from Bitcoin's 4h trend (as in the research and the app).
    const btc4 = (await loadCandles('BTCUSDT', '4h', 1000)).filter((b) => b.time + SEC['4h'] <= now);
    const btcMap = btcRegimeByTime(btc4);
    for (const { interval, barClose } of due) {
      await pool(symbols, 5, async (symbol) => {
        try {
          const c = (await loadCandles(symbol, interval, 1000)).filter((b) => b.time + SEC[interval] <= now);
          const regime = interval === '4h' ? btcMap : alignRegime(c.map((b) => b.time), SEC[interval], btcMap, SEC['4h']);
          for (const e of latestEvents(c, symbol, interval, regime)) if (e.barClose === barClose) events.push(e);
        } catch (err) {
          errors.push(`${symbol} ${interval}: ${(err as Error).message}`);
        }
      });
    }
  }
  const sent: string[] = [];
  const fresh = events.filter((e) => !sentKeys.has(`${e.symbol}|${e.interval}|${e.barClose}|${e.kind}`));
  if (opts.send !== false && fresh.length) {
    for (const e of fresh) sentKeys.add(`${e.symbol}|${e.interval}|${e.barClose}|${e.kind}`);
    for (const ch of channels(env)) {
      for (const e of fresh) {
        try {
          await ch.send(formatAlert(e));
          sent.push(`${ch.name}:${e.symbol}:${e.interval}:${e.kind}`);
        } catch (err) {
          errors.push(`${ch.name}: ${(err as Error).message}`);
        }
      }
    }
  }
  return { now, due: due.map((d) => d.interval), events, sent, errors, channels: channels(env).map((c) => c.name) };
}

export async function sendTest(env: Env = process.env) {
  const chs = channels(env);
  const results: string[] = [];
  for (const ch of chs) {
    try {
      await ch.send('✅ Signal alerts are connected.\nYou will get OPEN / CLOSE / ADD messages here when candles close.');
      results.push(`${ch.name}: ok`);
    } catch (err) {
      results.push(`${ch.name}: ${(err as Error).message}`);
    }
  }
  return { channels: chs.map((c) => c.name), results };
}
