// Alerts endpoint, called by Vercel Cron at minute :01 of every hour (vercel.json). It checks all coins on 4h
// and 1h for candles that just closed and sends new OPEN / CLOSE / ADD events to the configured channels
// (Telegram, SMS, ntfy, Discord). It never sends caller-supplied text, only events it computes itself.
//   GET /api/alerts            → check and send
//   GET /api/alerts?dry=1      → compute events without sending
//   GET /api/alerts?test=1     → send a test message to every configured channel
//   GET /api/alerts?log=1&n=500 → the latest logged events (forward-test record; needs Vercel KV / Upstash Redis)
// Auth: Vercel Cron's `Authorization: Bearer $CRON_SECRET`, or ?key=$ALERTS_KEY for manual calls.
// Per-coin levels come from ALERT_PRIORITY / ALERT_OFF (or ?levels=BTCUSDT:p,DOGEUSDT:off on manual calls).
import { alertLog, isAuthorized, runAlerts, sendTest } from '../server/alertsRun.js';

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  if (!isAuthorized(request.headers.get('authorization'), url.searchParams.get('key'), process.env))
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  if (url.searchParams.get('test')) return Response.json(await sendTest());
  if (url.searchParams.get('log')) {
    const log = alertLog(process.env);
    return log ? Response.json(await log.read(Math.min(5000, Number(url.searchParams.get('n') ?? 500)))) : Response.json({ error: 'no log configured' }, { status: 404 });
  }
  return Response.json(await runAlerts({ send: !url.searchParams.get('dry'), levels: url.searchParams.get('levels') }));
}
