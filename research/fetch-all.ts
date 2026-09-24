import { history } from './history';
for (const s of ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'])
  for (const iv of ['1d', '4h', '1h']) {
    const c = await history(s, iv);
    console.log(s, iv, c.length, new Date(c[0].time * 1000).toISOString().slice(0, 10));
  }
