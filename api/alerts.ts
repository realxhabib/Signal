// Alerts endpoint. The open app calls it a minute after every hourly candle close; it checks all coins on
// 4h and 1h and sends any new OPEN / CLOSE / ADD events to the configured channels (Telegram, SMS, ntfy,
// Discord). It never sends caller-supplied text, only events it computes itself.
//   GET /api/alerts            → check and send
//   GET /api/alerts?dry=1      → compute events without sending
//   GET /api/alerts?test=1     → send a test message to every configured channel
// Optional: set ALERTS_KEY to require ?key=… on every call.
// ?levels=BTCUSDT:p,DOGEUSDT:off sets per-coin levels (priority = loud + SMS, off = not sent; default normal).
import { runAlerts, sendTest } from '../server/alertsRun.js';

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const secret = process.env.ALERTS_KEY;
  const authed = !secret || url.searchParams.get('key') === secret;
  if (!authed) return Response.json({ error: 'unauthorized' }, { status: 401 });
  if (url.searchParams.get('test')) return Response.json(await sendTest());
  return Response.json(await runAlerts({ send: !url.searchParams.get('dry'), levels: url.searchParams.get('levels') }));
}
