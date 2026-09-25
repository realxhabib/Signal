// Server-side alert run: evaluate every coin on 4h and 1h for candles that just closed, then notify.
import { formatAlert, latestEvents, parseLevels, type AlertEvent, type AlertLevel } from '../src/alerts.js';
import { ASSETS, loadCandles, type Interval } from '../src/data.js';
import { alignRegime, btcRegimeByTime } from '../src/scan.js';
import { formatBasket, patternBasket, type Basket } from '../src/patterns.js';
import type { Candle } from '../src/types.js';

const SEC: Record<string, number> = { '1h': 3600, '4h': 14_400 };
// Events already sent by this server instance (the app triggers a check after every candle close; this stops
// repeat sends when several tabs or reloads trigger the same check).
const sentKeys = new Set<string>();
type Env = Record<string, string | undefined>;

/** Channels configured through environment variables; each is optional. */
export function channels(env: Env) {
  // `priority` messages are loud everywhere; SMS (paid) is only used for priority messages.
  const list: { name: string; send: (text: string, priority?: boolean) => Promise<void> }[] = [];
  if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID)
    list.push({
      name: 'telegram',
      send: async (text, priority = false) => {
        const r = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // Normal messages arrive silently; priority ones ring.
          body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text, disable_web_page_preview: true, disable_notification: !priority }),
        });
        if (!r.ok) throw new Error(`telegram ${r.status}`);
      },
    });
  if (env.NTFY_TOPIC)
    list.push({
      name: 'ntfy',
      send: async (text, priority = false) => {
        const [title, ...body] = text.split('\n');
        const r = await fetch(`${env.NTFY_SERVER ?? 'https://ntfy.sh'}/${encodeURIComponent(env.NTFY_TOPIC!)}`, {
          method: 'POST',
          // Header values must be ASCII: drop emoji from the title.
          headers: { Title: title.replace(/[^\x20-\x7E]/g, '').trim(), Priority: priority ? 'urgent' : 'default', Tags: priority ? 'rotating_light' : 'chart_with_upwards_trend' },
          body: body.join('\n'),
        });
        if (!r.ok) throw new Error(`ntfy ${r.status}`);
      },
    });
  if (env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && env.TWILIO_FROM && env.ALERT_PHONE)
    list.push({
      name: 'sms',
      send: async (text, priority = false) => {
        if (!priority) return; // SMS costs money: priority coins only
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
      send: async (text, priority = false) => {
        const r = await fetch(env.DISCORD_WEBHOOK_URL!, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: priority ? `@here ${text}` : text }) });
        if (!r.ok) throw new Error(`discord ${r.status}`);
      },
    });
  return list;
}

async function pool<T>(items: T[], n: number, fn: (x: T) => Promise<void>) {
  const q = [...items];
  await Promise.all(Array.from({ length: n }, async () => { for (let x = q.shift(); x !== undefined; x = q.shift()) await fn(x); }));
}

const isOn = (v: string | undefined) => !!v && /^(1|true|yes|on)$/i.test(v.trim());

/** Timeframes whose most recent candle closed within `withinSec` of `now`. */
export function dueIntervals(now: number, withinSec = 1200): { interval: Interval; barClose: number }[] {
  return (['4h', '1h'] as Interval[])
    .map((interval) => ({ interval, barClose: Math.floor(now / SEC[interval]) * SEC[interval] }))
    .filter((x) => now - x.barClose < withinSec);
}

/** Levels from the ALERT_PRIORITY / ALERT_OFF env defaults, overridden by the caller's (the app's) settings. */
export function resolveLevels(env: Env, spec?: string | null): Record<string, AlertLevel> {
  const known = Object.keys(ASSETS);
  const levels: Record<string, AlertLevel> = Object.fromEntries(known.map((s) => [s, 'normal' as AlertLevel]));
  for (const s of (env.ALERT_PRIORITY ?? '').split(',').map((x) => x.trim().toUpperCase())) if (known.includes(s)) levels[s] = 'priority';
  for (const s of (env.ALERT_OFF ?? '').split(',').map((x) => x.trim().toUpperCase())) if (known.includes(s)) levels[s] = 'off';
  return { ...levels, ...parseLevels(spec, known) };
}

export async function runAlerts(opts: { now?: number; send?: boolean; env?: Env; symbols?: string[]; levels?: string | null } = {}) {
  const now = opts.now ?? Math.floor(Date.now() / 1000);
  const env = opts.env ?? process.env;
  const levels = resolveLevels(env, opts.levels);
  const symbols = (opts.symbols ?? Object.keys(ASSETS)).filter((s) => levels[s] !== 'off');
  const due = dueIntervals(now);
  const events: AlertEvent[] = [];
  const errors: string[] = [];
  const four = new Map<string, Candle[]>(); // 4h candles loaded this run (reused for the pattern basket)
  if (due.length) {
    // Market mode for every timeframe comes from Bitcoin's 4h trend (as in the research and the app).
    const btc4 = (await loadCandles('BTCUSDT', '4h', 1000)).filter((b) => b.time + SEC['4h'] <= now);
    const btcMap = btcRegimeByTime(btc4);
    for (const { interval, barClose } of due) {
      await pool(symbols, 5, async (symbol) => {
        try {
          const c = (await loadCandles(symbol, interval, 1000)).filter((b) => b.time + SEC[interval] <= now);
          if (interval === '4h') four.set(symbol, c);
          const regime = interval === '4h' ? btcMap : alignRegime(c.map((b) => b.time), SEC[interval], btcMap, SEC['4h']);
          for (const e of latestEvents(c, symbol, interval, regime)) if (e.barClose === barClose) events.push(e);
        } catch (err) {
          errors.push(`${symbol} ${interval}: ${(err as Error).message}`);
        }
      });
    }
  }
  // Pattern basket: once a day, after the 4h candle that closes at 00:00 UTC (8 PM ET in summer), if ALERT_BASKET=1.
  let basket: Basket | null = null;
  const basketDue = due.find((d) => d.interval === '4h' && d.barClose % 86_400 === 0);
  if (basketDue && (isOn(env.ALERT_BASKET) || opts.send === false)) {
    try {
      const all = new Map<string, Candle[]>();
      await pool(Object.keys(ASSETS), 5, async (sym) => {
        all.set(sym, four.get(sym) ?? (await loadCandles(sym, '4h', 1000)).filter((b) => b.time + SEC['4h'] <= now));
      });
      basket = patternBasket(new Map(Object.keys(ASSETS).filter((s) => all.has(s)).map((s) => [s, all.get(s)!])), now);
    } catch (err) {
      errors.push(`basket: ${(err as Error).message}`);
    }
  }
  const sent: string[] = [];
  if (basket && opts.send !== false && isOn(env.ALERT_BASKET) && !sentKeys.has(`basket|${basket.asOf}`)) {
    sentKeys.add(`basket|${basket.asOf}`);
    for (const ch of channels(env)) {
      if (ch.name === 'sms') continue;
      try {
        await ch.send(formatBasket(basket), false);
        sent.push(`${ch.name}:basket`);
      } catch (err) {
        errors.push(`${ch.name}: ${(err as Error).message}`);
      }
    }
    try {
      await alertLog(env)?.add([{ kind: 'basket', asOf: basket.asOf, rows: basket.rows.filter((r) => Math.abs(r.weight) > 0.001), loggedAt: now }]);
    } catch (err) {
      errors.push(`log: ${(err as Error).message}`);
    }
  }
  // ALERT_GOLD_ONLY=1 sends gold setups only; everything else stays in the response for the app.
  const goldOnly = isOn(env.ALERT_GOLD_ONLY);
  const unseen = events.filter((e) => !sentKeys.has(`${e.symbol}|${e.interval}|${e.barClose}|${e.kind}`));
  const fresh = unseen.filter((e) => !goldOnly || e.gold);
  const log = alertLog(env);
  if (opts.send !== false && log && unseen.length) {
    // The forward-test record: every event the rules produced, whether or not it was sent.
    try {
      await log.add(unseen.map((e) => ({ ...e, level: levels[e.symbol], loggedAt: now })));
    } catch (err) {
      errors.push(`log: ${(err as Error).message}`);
    }
  }
  if (opts.send !== false) for (const e of unseen) sentKeys.add(`${e.symbol}|${e.interval}|${e.barClose}|${e.kind}`);
  if (opts.send !== false && fresh.length) {
    for (const ch of channels(env)) {
      for (const e of fresh) {
        try {
          // Gold setups always ring (off coins are never checked).
          const priority = levels[e.symbol] === 'priority' || !!e.gold;
          if (ch.name === 'sms' && !priority) continue;
          await ch.send(formatAlert(e, priority), priority);
          sent.push(`${ch.name}:${e.symbol}:${e.interval}:${e.kind}${priority ? ':priority' : ''}`);
        } catch (err) {
          errors.push(`${ch.name}: ${(err as Error).message}`);
        }
      }
    }
  }
  return {
    now,
    due: due.map((d) => d.interval),
    events: events.map((e) => ({ ...e, level: levels[e.symbol] })),
    sent,
    errors,
    channels: channels(env).map((c) => c.name),
    priority: Object.keys(levels).filter((s) => levels[s] === 'priority'),
    goldOnly,
    basket,
  };
}

/**
 * Who may call the alerts endpoint. Vercel Cron sends `Authorization: Bearer $CRON_SECRET` when CRON_SECRET is
 * set; manual calls (the app's Send test button) may pass ?key= with CRON_SECRET or ALERTS_KEY. With neither set, the
 * endpoint is open (it only ever sends events it computes itself).
 */
export function isAuthorized(authHeader: string | null, key: string | null, env: Env): boolean {
  const cron = env.CRON_SECRET;
  const manual = env.ALERTS_KEY;
  if (!cron && !manual) return true;
  if (cron && authHeader === `Bearer ${cron}`) return true;
  // Manual calls may use either secret as ?key=.
  return !!key && (key === manual || key === cron);
}

const LOG_KEY = 'signal:alerts';
/**
 * Optional alert log in Redis over REST (Vercel KV / Upstash: add the integration and its KV_REST_API_URL and
 * KV_REST_API_TOKEN, or UPSTASH_REDIS_REST_URL / _TOKEN, are set for you). Keeps the latest 20,000 events.
 */
export function alertLog(env: Env) {
  const url = env.KV_REST_API_URL ?? env.UPSTASH_REDIS_REST_URL;
  const token = env.KV_REST_API_TOKEN ?? env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  const cmd = async (args: string[]) => {
    const r = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(args) });
    if (!r.ok) throw new Error(`redis ${r.status}`);
    return (await r.json()) as { result: unknown };
  };
  return {
    add: async (items: object[]) => {
      if (!items.length) return;
      await cmd(['LPUSH', LOG_KEY, ...items.map((x) => JSON.stringify(x))]);
      await cmd(['LTRIM', LOG_KEY, '0', '19999']);
    },
    read: async (n = 500) => ((await cmd(['LRANGE', LOG_KEY, '0', String(n - 1)])).result as string[]).map((x) => JSON.parse(x)),
  };
}

export async function sendTest(env: Env = process.env) {
  const chs = channels(env);
  const results: string[] = [];
  for (const ch of chs) {
    try {
      await ch.send('🚨 PRIORITY · ✅ Signal alerts are connected.\nPriority coins ring (and get SMS); normal coins arrive quietly.', true);
      results.push(`${ch.name}: ok`);
    } catch (err) {
      results.push(`${ch.name}: ${(err as Error).message}`);
    }
  }
  return { channels: chs.map((c) => c.name), results };
}
