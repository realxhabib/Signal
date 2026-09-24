// Which short design helps the whole account? 20 coins, 4h, 1% risk, max 5 positions,
// altcoin longs paused while BTC is bearish. Shorts optionally require BTC to be bearish too.
import { composite } from '../src/composite';
import { computeFeatures } from '../src/features';
import type { Params } from '../src/strategies';
import { history } from './history';
import { fmt } from './lib';
import { collectTrades, curveStats, simulate, type PTrade } from './portfolio';

const iv = process.env.INTERVALS ?? '4h';
const btc = await history('BTCUSDT', iv);
const reg = computeFeatures(btc).regime;
const idx = new Map(btc.map((b, i) => [b.time, i]));
const btcAt = (t: PTrade) => reg[idx.get(t.candles[t.entryIndex - 1].time) ?? -1] ?? 0;

const d = composite.defaults;
const SEPARATE = !!process.env.SEPARATE;
const designs: [string, Params, boolean][] = [
  ['long only (current)', { ...d, shorts: 0 }, false],
  ['+ mirrored shorts, coin not bullish', { ...d, shorts: 1, shortGate: 1, shortMask: 0b111 }, false],
  ['+ mirrored shorts, coin bear + BTC bear', { ...d, shorts: 1, shortGate: 2, shortMask: 0b111 }, true],
  ['+ Supertrend shorts, coin bear + BTC bear', { ...d, shorts: 1, shortGate: 2, shortMask: 0b001 }, true],
  ['+ rally shorts (RSI2), coin bear + BTC bear', { ...d, shorts: 1, shortGate: 2, shortMask: 0b010 }, true],
  ['+ band shorts, coin bear + BTC bear', { ...d, shorts: 1, shortGate: 2, shortMask: 0b100 }, true],
  ['+ Supertrend shorts, coin not bull + BTC bear', { ...d, shorts: 1, shortGate: 1, shortMask: 0b001 }, true],
];
console.log('| Design | CAGR | Max DD | Sharpe | 2022 | 2024 | Shorts taken | Short R |');
for (const [name, p, btcShort] of designs) {
  const { trades, candlesBySym } = await collectTrades(iv, p);
  const shortSize = SEPARATE ? 0.5 : 1;
  const weight = (t: PTrade) => (t.side === 'long' ? (btcAt(t) !== -1 ? 1 : 0) : !btcShort || btcAt(t) === -1 ? shortSize : 0);
  const r = simulate(trades, candlesBySym, { riskPct: 1, sizing: 'risk', maxPositions: 5, weight, ...(SEPARATE ? { maxShorts: 3 } : {}) });
  const s = curveStats(r.curve);
  const yr = (y: string) => {
    const pts = r.curve.filter((x) => new Date(x.time * 1000).getUTCFullYear() === +y);
    const prev = r.curve.filter((x) => new Date(x.time * 1000).getUTCFullYear() < +y).pop() ?? pts[0];
    return pts.length ? pts[pts.length - 1].equity / prev.equity - 1 : NaN;
  };
  const shorts = trades.filter((t) => t.side === 'short' && weight(t));
  console.log(
    `| ${name} | ${fmt(s.cagr * 100, 1)}% | ${fmt(s.maxDd * 100, 1)}% | ${fmt(s.sharpe)} | ${fmt(yr('2022') * 100, 1)}% | ${fmt(yr('2024') * 100, 1)}% | ${shorts.length} | ${fmt(shorts.reduce((a, t) => a + t.rMultiple, 0), 0)} |`,
  );
}
