// Does adding shorts help the composite? Fixed configs, real funding, 20 coins.
import { composite } from '../src/composite';
import { dataset, fmt, inTest, run, summarizeR, years } from './lib';
import { UNIVERSE } from './universe';

const configs = {
  'long only': { ...composite.defaults, shorts: 0 },
  'long + short (bear regime)': { ...composite.defaults, shorts: 1, shortGate: 2 },
  'long + short (not bull)': { ...composite.defaults, shorts: 1, shortGate: 1 },
};
for (const iv of (process.env.INTERVALS ?? '4h,1h').split(',')) {
  const pooled: Record<string, { rs: number[]; coinsUp: number; perCoin: string[]; shortRs: number[] }> = {};
  for (const sym of UNIVERSE) {
    const d = await dataset(sym, iv);
    for (const [name, p] of Object.entries(configs)) {
      const tr = inTest(d, run(d, composite, p));
      const st = summarizeR(tr);
      const e = (pooled[name] ??= { rs: [], coinsUp: 0, perCoin: [], shortRs: [] });
      e.rs.push(...tr.map((t) => t.rMultiple));
      e.shortRs.push(...tr.filter((t) => t.side === 'short').map((t) => t.rMultiple));
      if (st.totalR > 0) e.coinsUp++;
      e.perCoin.push(`${sym.replace('USDT', '')} ${fmt(st.pf)}`);
    }
    process.stdout.write('.');
  }
  console.log(`\n== ${iv}`);
  for (const [name, e] of Object.entries(pooled)) {
    const wins = e.rs.filter((r) => r > 0);
    const gw = wins.reduce((a, r) => a + r, 0);
    const gl = -e.rs.filter((r) => r <= 0).reduce((a, r) => a + r, 0);
    const sw = e.shortRs.filter((r) => r > 0).length;
    console.log(
      `${name.padEnd(28)} trades=${e.rs.length} win=${fmt((wins.length / e.rs.length) * 100, 1)}% PF=${fmt(gw / gl)} totalR=${fmt(gw - gl, 0)} coinsProfitable=${e.coinsUp}/${UNIVERSE.length}` +
        (e.shortRs.length ? ` | shorts: n=${e.shortRs.length} win=${fmt((sw / e.shortRs.length) * 100, 1)}% R=${fmt(e.shortRs.reduce((a, r) => a + r, 0), 0)}` : ''),
    );
    if (process.env.VERBOSE) console.log('   ', e.perCoin.join(' · '));
  }
}
