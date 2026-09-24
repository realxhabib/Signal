import { history } from './history';
import { UNIVERSE } from './universe';
const ivs = (process.env.INTERVALS ?? '1d,4h,1h').split(',');
await Promise.all(
  [0, 1, 2, 3].map(async (w) => {
    for (let k = w; k < UNIVERSE.length; k += 4)
      for (const iv of ivs) {
        const c = await history(UNIVERSE[k], iv);
        const last = new Date(c[c.length - 1].time * 1000).toISOString().slice(0, 10);
        console.log(UNIVERSE[k], iv, c.length, new Date(c[0].time * 1000).toISOString().slice(0, 10), '→', last);
      }
  }),
);
