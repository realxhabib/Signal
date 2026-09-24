// Walk-forward evaluation: for each rolling window pick parameters on the past
// (train) period only, then record how those parameters did on the next,
// unseen (test) period. Only out-of-sample trades are reported.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { backtest, defaultRisk } from '../src/backtest';
import { composite } from '../src/composite';
import { expandGrid, STRATEGIES as BASE, type Params, type StrategyDef } from '../src/strategies';

const STRATEGIES = [...BASE, composite];
import type { Candle, Trade } from '../src/types';
import { history } from './history';
import { summarizeR, type Summary } from './walkforward-stats';

const DAY = 86_400;
const TRAIN_DAYS = 730;
const TEST_DAYS = 182;
const MIN_TRAIN_TRADES = 15;
const TARGET_WIN = Number(process.env.TARGET_WIN ?? 0.75); // in-sample win rate a parameter set must show to be eligible
const MIN_PF = 1.2;

// Leverage does not change R-multiples unless it causes liquidation; 5x with a
// 1% risk budget is used for every run.
const risk = {
  ...defaultRisk,
  leverage: 5,
  riskPct: 1,
  feePct: Number(process.env.FEE ?? defaultRisk.feePct),
  slippagePct: Number(process.env.SLIP ?? defaultRisk.slippagePct),
};

function runAll(candles: Candle[], s: StrategyDef) {
  return expandGrid(s.grid).map((p) => {
    const out = s.build(candles, p);
    const trades = backtest(candles, out.signals, out.atr, { ...risk, ...out.risk }, out.rules).trades;
    return { p, trades };
  });
}

function walkForward(candles: Candle[], s: StrategyDef) {
  const runs = runAll(candles, s);
  const first = candles[0].time;
  const last = candles[candles.length - 1].time;
  const oos: Trade[] = [];
  const picks: { from: string; params: Params | null; train: Summary | null }[] = [];
  for (let testStart = first + TRAIN_DAYS * DAY; testStart < last; testStart += TEST_DAYS * DAY) {
    const trainStart = testStart - TRAIN_DAYS * DAY;
    const testEnd = testStart + TEST_DAYS * DAY;
    let best: { p: Params; trades: Trade[]; score: number; train: Summary } | null = null;
    for (const r of runs) {
      const tr = r.trades.filter((t) => t.entryTime >= trainStart && t.entryTime < testStart);
      const st = summarizeR(tr);
      if (st.n < MIN_TRAIN_TRADES || st.win < TARGET_WIN || st.pf < MIN_PF || st.liq > 0) continue;
      const score = st.avgR * Math.sqrt(st.n);
      if (!best || score > best.score) best = { p: r.p, trades: r.trades, score, train: st };
    }
    picks.push({ from: new Date(testStart * 1000).toISOString().slice(0, 10), params: best?.p ?? null, train: best?.train ?? null });
    // No eligible parameters -> the strategy stands aside for this window.
    if (best) oos.push(...best.trades.filter((t) => t.entryTime >= testStart && t.entryTime < testEnd));
  }
  return { oos, picks };
}

const fmt = (v: number, d = 2) => (Number.isFinite(v) ? v.toFixed(d) : '∞');

const symbols = (process.env.SYMBOLS ?? 'BTCUSDT,ETHUSDT,SOLUSDT').split(',');
const intervals = (process.env.INTERVALS ?? '1d,4h,1h').split(',');
const rows: string[] = [];
const details: string[] = [];
const pooled = new Map<string, Trade[]>();
const json: Record<string, { trades: number; winRate: number; profitFactor: number; avgR: number }> = {};
for (const sym of symbols)
  for (const iv of intervals) {
    const candles = await history(sym, iv);
    for (const s of STRATEGIES.filter((x) => !process.env.ONLY || process.env.ONLY.split(',').includes(x.id))) {
      const t0 = Date.now();
      const { oos, picks } = walkForward(candles, s);
      const st = summarizeR(oos);
      const key = `${s.id} ${iv}`;
      pooled.set(key, [...(pooled.get(key) ?? []), ...oos]);
      const active = picks.filter((p) => p.params).length;
      json[`${s.id}:${sym}:${iv}`] = { trades: st.n, winRate: +st.win.toFixed(3), profitFactor: Number.isFinite(st.pf) ? +st.pf.toFixed(2) : 99, avgR: +st.avgR.toFixed(3) };
      rows.push(
        `| ${sym} | ${iv} | ${s.name} | ${st.n} | ${fmt(st.win * 100, 1)}% | ${fmt(st.pf)} | ${fmt(st.avgR)} | ${fmt(st.totalR, 1)} | ${fmt(st.maxDdR, 1)} | ${fmt(st.worstR)} | ${st.maxLosingStreak} | ${st.liq} | ${active}/${picks.length} |`,
      );
      details.push(`### ${sym} ${iv} ${s.name}\n` + picks.map((p) => `- ${p.from}: ${p.params ? JSON.stringify(p.params) : 'stand aside'}`).join('\n'));
      console.log(sym, iv, s.id, `n=${st.n} win=${fmt(st.win * 100, 1)}% pf=${fmt(st.pf)} avgR=${fmt(st.avgR)} (${Date.now() - t0}ms)`);
    }
  }

const header =
  '| Asset | TF | Strategy | OOS trades | Win rate | PF | Avg R | Total R | Max DD (R) | Worst trade (R) | Max losing streak | Liq | Windows traded |\n|---|---|---|---|---|---|---|---|---|---|---|---|---|';
const pooledRows = [...pooled.entries()]
  .map(([k, tr]) => {
    const st = summarizeR(tr.sort((a, b) => a.entryTime - b.entryTime));
    return `| ${k} | ${st.n} | ${fmt(st.win * 100, 1)}% | ${fmt(st.pf)} | ${fmt(st.avgR)} | ${fmt(st.totalR, 1)} |`;
  })
  .join('\n');
const md = `# Walk-forward results

Generated ${new Date().toISOString().slice(0, 10)}. Train ${TRAIN_DAYS}d → test ${TEST_DAYS}d, rolling. Parameters are chosen on the
train window only (needs ≥${MIN_TRAIN_TRADES} trades, win rate ≥${TARGET_WIN * 100}%, PF ≥${MIN_PF}, no liquidations); when none
qualify the strategy stands aside. **Every number below is out-of-sample.** Costs: ${risk.feePct}% fee + ${risk.slippagePct}% slippage
per side, ${risk.fundingPct8h}%/8h funding always paid, ${risk.leverage}x isolated margin. R = multiples of the initial stop risk.

${header}
${rows.join('\n')}

## Pooled across assets

| Strategy / TF | Trades | Win rate | PF | Avg R | Total R |
|---|---|---|---|---|---|
${pooledRows}

## Parameters chosen per window

${details.join('\n\n')}
`;
writeFileSync(join(import.meta.dirname, process.env.OUT ?? 'RESULTS.md'), md);
if (process.env.JSON_OUT) writeFileSync(process.env.JSON_OUT, JSON.stringify(json, null, 1) + '\n');
console.log(`wrote research/${process.env.OUT ?? 'RESULTS.md'}`);
