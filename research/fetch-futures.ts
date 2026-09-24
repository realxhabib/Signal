import { funding, metrics } from './futures';
import { UNIVERSE } from './universe';
for (const s of UNIVERSE) {
  const f = await funding(s);
  console.log(s, 'funding', f.length, f.length ? new Date(f[0].time * 1000).toISOString().slice(0, 10) : '-');
}
for (const s of (process.env.METRICS ?? 'BTCUSDT,ETHUSDT,SOLUSDT').split(',')) {
  const m = await metrics(s);
  console.log(s, 'metrics hours', m.length, m.length ? new Date(m[0].time * 1000).toISOString().slice(0, 10) : '-');
}
