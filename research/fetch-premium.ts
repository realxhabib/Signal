import { premium } from './futures';
import { UNIVERSE } from './universe';
for (const s of UNIVERSE) {
  const p = await premium(s);
  console.log(s, 'premium hours', p.length, p.length ? new Date(p[0].time * 1000).toISOString().slice(0, 10) : '-');
}
