import { funding } from './futures';
import { history } from './history';
import { EXTRA } from './universe';
for (const s of EXTRA) {
  for (const iv of ['1d', '4h', '1h']) await history(s, iv);
  const f = await funding(s);
  const c = await history(s, '1d');
  console.log(s, 'from', new Date(c[0].time * 1000).toISOString().slice(0, 10), 'funding rows', f.length);
}
