import {
  CandlestickSeries,
  ColorType,
  createChart,
  createSeriesMarkers,
  LineSeries,
  type ISeriesApi,
  type SeriesMarker,
  type Time,
  type UTCTimestamp,
} from 'lightweight-charts';
import './styles.css';
import { backtest, defaultRisk, summarize, type Stats } from './backtest';
import { ASSETS, INTERVALS, loadCandles, streamCandles, type Interval } from './data';
import { approves, defaultJevThresholds, judgeSignals, type JevVerdict } from './jev';
import { marketContext, QUANT_PROFILES, quantRuleSet, quantStrategy } from './quant';
import { STRATEGIES as BASE_STRATEGIES, type StrategyOutput } from './strategies';
import { computeIndicators, defaultStrategy } from './strategy';
import type { Candle, RiskParams, Signal, Trade } from './types';
import walkforward from './walkforward.json';

const STRATEGIES = [...BASE_STRATEGIES, quantStrategy];
const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const ui = {
  symbol: $<HTMLSelectElement>('symbol'),
  interval: $<HTMLSelectElement>('interval'),
  useJev: $<HTMLInputElement>('useJev'),
  leverage: $<HTMLInputElement>('leverage'),
  riskPct: $<HTMLInputElement>('riskPct'),
  strategy: $<HTMLSelectElement>('strategy'),
  orderType: $<HTMLSelectElement>('orderType'),
  walkforward: $<HTMLDivElement>('walkforward'),
  context: $<HTMLDivElement>('context'),
  run: $<HTMLButtonElement>('run'),
  status: $<HTMLSpanElement>('status'),
  latest: $<HTMLDivElement>('latest'),
  stats: $<HTMLTableElement>('stats'),
  trades: $<HTMLTableElement>('trades'),
};

for (const s of STRATEGIES) ui.strategy.add(new Option(s.name, s.id));
ui.strategy.value = 'supertrend';
for (const [sym, name] of Object.entries(ASSETS)) ui.symbol.add(new Option(`${name} (${sym})`, sym));
for (const iv of INTERVALS) ui.interval.add(new Option(iv, iv));
ui.interval.value = '4h';

const COLORS = { long: '#26a69a', short: '#ef5350', veto: '#8a94a3', fast: '#4aa3ff', slow: '#f5a623', ema: '#6b7684' };

const chartOptions = {
  layout: { background: { type: ColorType.Solid, color: '#0e1117' }, textColor: '#8a94a3' },
  grid: { vertLines: { color: '#1b212a' }, horzLines: { color: '#1b212a' } },
  timeScale: { timeVisible: true, borderColor: '#262d36' },
  rightPriceScale: { borderColor: '#262d36' },
  autoSize: true,
};
const chart = createChart($('chart'), chartOptions);
const candleSeries = chart.addSeries(CandlestickSeries, {
  upColor: COLORS.long,
  downColor: COLORS.short,
  wickUpColor: COLORS.long,
  wickDownColor: COLORS.short,
  borderVisible: false,
});
let lineSeries: ISeriesApi<'Line'>[] = [];
const markers = createSeriesMarkers(candleSeries, []);

const equityChart = createChart($('equity'), { ...chartOptions, timeScale: { ...chartOptions.timeScale, visible: false } });
const equitySeries = equityChart.addSeries(LineSeries, { color: COLORS.fast, lineWidth: 2, priceLineVisible: false });
chart.timeScale().subscribeVisibleLogicalRangeChange((r) => r && equityChart.timeScale().setVisibleLogicalRange(r));

let candles: Candle[] = [];
let verdicts = new Map<number, JevVerdict>();
let stopStream: (() => void) | null = null;
let runId = 0;

const t = (s: number) => s as UTCTimestamp;
const toLine = (vals: number[]) =>
  candles.flatMap((c, i) => (Number.isNaN(vals[i]) ? [] : [{ time: t(c.time), value: vals[i] }]));

function setStatus(msg: string, error = false) {
  ui.status.textContent = msg;
  ui.status.classList.toggle('error', error);
}

function riskParams(): RiskParams {
  const limit = ui.orderType.value === 'limit';
  return {
    ...defaultRisk,
    leverage: +ui.leverage.value || 1,
    riskPct: +ui.riskPct.value || 1,
    feePct: limit ? 0.02 : 0.05,
    slippagePct: limit ? 0 : 0.02,
  };
}

/** Full pipeline: strategy signals -> Jev verdicts -> backtest -> render. */
async function analyze(id: number) {
  const strategy = STRATEGIES.find((s) => s.id === ui.strategy.value) ?? STRATEGIES[0];
  const out = strategy.build(candles, strategy.defaults, { symbol: ui.symbol.value, interval: ui.interval.value });
  const candidates = out.signals;
  const risk = { ...riskParams(), ...out.risk };

  let jevError: string | null = null;
  if (ui.useJev.checked && candidates.length) {
    try {
      // Jev always gets the same broad market context, whichever strategy proposed the trade.
      const context = computeIndicators(candles, defaultStrategy);
      verdicts = await judgeSignals(
        candles,
        context,
        candidates,
        { symbol: ui.symbol.value, assetLabel: ASSETS[ui.symbol.value], interval: ui.interval.value, strategyId: strategy.id },
        (d, n) => id === runId && setStatus(`Jev judging signals ${d}/${n}…`),
      );
    } catch (e) {
      jevError = (e as Error).message;
    }
  }
  if (id !== runId) return;

  const jevOn = ui.useJev.checked && !jevError;
  const approved = jevOn
    ? candidates.filter((s) => {
        const v = verdicts.get(s.index);
        return v && approves(v, s.side, defaultJevThresholds);
      })
    : candidates;

  const base = backtest(candles, candidates, out.atr, risk, out.rules);
  const filtered = jevOn ? backtest(candles, approved, out.atr, risk, out.rules) : base;
  const split = Math.floor(candles.length * 0.7);
  const recent = backtest(candles, approved.filter((s) => s.index >= split), out.atr, risk, out.rules);

  render(out, candidates, approved, filtered.trades, filtered.equity);
  renderStats([
    ['Strategy', summarize(base, risk.startEquity)],
    ...(jevOn ? ([['+ Jev', summarize(filtered, risk.startEquity)]] as [string, Stats][]) : []),
    [`Recent 30%${jevOn ? ' +Jev' : ''}`, summarize(recent, risk.startEquity)],
  ]);
  const inSample = strategy.id === quantStrategy.id;
  $('statsWarn').hidden = !inSample;
  $('statsWarn').textContent = inSample
    ? 'In-sample: these rules were mined on this same history, so this table overstates them. Use the frontier above (unseen data) as the real expectation.'
    : '';
  renderWalkForward(strategy.id, strategy.description, strategy.defaults);
  renderContext();
  renderTrades(filtered.trades);
  renderLatest(candidates, approved, jevOn);
  setStatus(
    jevError
      ? `Jev unavailable (${jevError}); showing strategy signals without Jev`
      : `${candles.length} bars · ${candidates.length} candidates · ${approved.length} signals`,
    !!jevError,
  );
}

function renderContext() {
  const ctx = marketContext(candles);
  const cls = (r: string | null) => (r === 'bullish' ? 'long' : r === 'bearish' ? 'short' : 'muted');
  const groups = new Map<string, string[]>();
  for (const k of ctx.active) {
    const [fam, val] = k.split(':');
    if (['regime', 'daily', 'moon', 'day', 'session'].includes(fam)) continue;
    groups.set(fam, [...(groups.get(fam) ?? []), val]);
  }
  ui.context.innerHTML = `
    <h3>Market context (last closed bar)</h3>
    <table>
      <tr><td>Trend regime (${ui.interval.value})</td><td class="${cls(ctx.regime)}">${ctx.regime}</td></tr>
      ${ctx.dailyRegime ? `<tr><td>Trend regime (daily)</td><td class="${cls(ctx.dailyRegime)}">${ctx.dailyRegime}</td></tr>` : ''}
      <tr><td>Moon</td><td>${ctx.moon.replace('-', ' ')} · ${Math.round(ctx.moonIllumination * 100)}% lit · full in ${ctx.daysToFull.toFixed(1)}d</td></tr>
      ${[...groups.entries()].map(([k, v]) => `<tr><td>${k}</td><td>${v.join(', ')}</td></tr>`).join('')}
    </table>
    <p class="note">Regime = price vs EMA 50/200 with the 200 rising or falling. Variance ratio &gt; 1 means moves persist (trending), &lt; 1 means they revert. Moon phase showed no reliable edge in testing (see research/QUANT.md).</p>`;
}

function renderWalkForward(strategyId: string, description: string, params: Record<string, number>) {
  if (strategyId === quantStrategy.id) return renderFrontier(description, params);
  const book = walkforward[ui.orderType.value as 'limit' | 'market'] as Record<
    string,
    { trades: number; winRate: number; profitFactor: number; avgR: number }
  >;
  const r = book[`${strategyId}:${ui.symbol.value}:${ui.interval.value}`];
  const body = !r
    ? '<p class="muted">No walk-forward result for this timeframe.</p>'
    : r.trades === 0
      ? '<p class="muted">No parameter set qualified in any training window, so the walk-forward never traded this combination.</p>'
      : `<table>
          <tr><td>Trades</td><td>${r.trades}</td></tr>
          <tr><td>Win rate</td><td>${(r.winRate * 100).toFixed(1)}%</td></tr>
          <tr><td>Profit factor</td><td class="${r.profitFactor >= 1.2 ? 'long' : r.profitFactor < 1 ? 'short' : ''}">${r.profitFactor.toFixed(2)}</td></tr>
          <tr><td>Avg R / trade</td><td>${r.avgR.toFixed(2)}</td></tr>
        </table>`;
  ui.walkforward.innerHTML = `
    <h3>Walk-forward (unseen data)</h3>
    <p class="muted" style="margin:0 0 8px">${description}</p>
    ${body}
    <p class="note">Settings tuned on 2 years, tested on the next 6 months, rolled forward since ${
      ui.symbol.value === 'SOLUSDT' ? '2020' : '2017'
    }. Only the test periods are counted. ${ui.orderType.value === 'limit' ? 'Limit-order' : 'Market-order'} costs and funding included.</p>`;
}

function render(out: StrategyOutput, candidates: Signal[], approved: Signal[], trades: Trade[], equity: { time: number; value: number }[]) {
  candleSeries.setData(candles.map((c) => ({ ...c, time: t(c.time) })));
  for (const s of lineSeries) chart.removeSeries(s);
  lineSeries = out.lines.map((l) => {
    const s = chart.addSeries(LineSeries, { color: l.color, lineWidth: 2, title: l.name, priceLineVisible: false, lastValueVisible: false });
    s.setData(toLine(l.values));
    return s;
  });
  equitySeries.setData(equity.map((p) => ({ time: t(p.time), value: p.value })));

  const ok = new Set(approved.map((s) => s.index));
  const m: SeriesMarker<Time>[] = [];
  for (const s of candidates) {
    const long = s.side === 'long';
    const v = verdicts.get(s.index);
    if (ok.has(s.index)) {
      const prob = v ? ` ${Math.round((v.directionProbs[s.side] ?? 0) * 100)}%` : '';
      m.push({
        time: t(s.time),
        position: long ? 'belowBar' : 'aboveBar',
        shape: long ? 'arrowUp' : 'arrowDown',
        color: long ? COLORS.long : COLORS.short,
        text: `${long ? 'BUY' : 'SELL'}${prob}`,
      });
    } else {
      m.push({ time: t(s.time), position: long ? 'belowBar' : 'aboveBar', shape: 'circle', color: COLORS.veto, text: 'veto', size: 0.5 });
    }
  }
  for (const tr of trades) {
    if (tr.exitReason === 'reverse' || tr.exitReason === 'end') continue;
    const label = tr.exitReason === 'liquidation' ? 'LIQ' : `${tr.rMultiple >= 0 ? '+' : ''}${tr.rMultiple.toFixed(1)}R`;
    m.push({
      time: t(tr.exitTime),
      position: tr.side === 'long' ? 'aboveBar' : 'belowBar',
      shape: 'square',
      color: tr.pnl > 0 ? COLORS.long : COLORS.short,
      text: label,
      size: 0.5,
    });
  }
  markers.setMarkers(m.sort((a, b) => (a.time as number) - (b.time as number)));
}

function renderFrontier(description: string, params: Record<string, number>) {
  const profile = QUANT_PROFILES[params.profile] ?? 'high-hit';
  const set = quantRuleSet(profile, ui.symbol.value, ui.interval.value);
  if (!set) {
    ui.walkforward.innerHTML = '<h3>Signal frontier</h3><p class="muted">No mined rules for this timeframe.</p>';
    return;
  }
  const rows = Object.entries(set.oos)
    .map(
      ([t, r]) =>
        `<tr${+t === params.target ? ' style="font-weight:600"' : ''}><td>≥${Math.round(+t * 100)}%</td><td>${r.perYear.toFixed(0)}</td><td>${
          r.trades ? (r.winRate * 100).toFixed(1) + '%' : '–'
        }</td><td class="${r.profitFactor >= 1.2 ? 'long' : r.trades && r.profitFactor < 1 ? 'short' : ''}">${r.trades ? r.profitFactor.toFixed(2) : '–'}</td></tr>`,
    )
    .join('');
  const breakEven = Math.round((set.profile.sl / (set.profile.sl + set.profile.tp)) * 100);
  ui.walkforward.innerHTML = `
    <h3>Signal frontier (unseen data)</h3>
    <p class="muted" style="margin:0 0 8px">${description}</p>
    <table><tr><th>Train win rate</th><th>Signals / yr</th><th>Real win rate</th><th>PF</th></tr>${rows}</table>
    <p class="note">Rules picked on past data at each training win-rate bar, then traded on the next unseen 6 months (limit-order costs, funding). With a ${set.profile.sl} ATR stop and ${set.profile.tp} ATR target you need ~${breakEven}% wins to break even. Bold row = the rules shown on the chart.</p>`;
}

const fmt = (v: number, d = 1) => (Number.isFinite(v) ? v.toFixed(d) : '∞');

function renderStats(rows: [string, Stats][]) {
  const metrics: [string, (s: Stats) => string][] = [
    ['Trades', (s) => String(s.trades)],
    ['Win rate', (s) => `${fmt(s.winRate * 100)}%`],
    ['Profit factor', (s) => fmt(s.profitFactor, 2)],
    ['Net return', (s) => `${fmt(s.netReturnPct)}%`],
    ['Max drawdown', (s) => `${fmt(s.maxDrawdownPct)}%`],
    ['Avg R / trade', (s) => fmt(s.avgR, 2)],
    ['Liquidations', (s) => String(s.liquidations)],
  ];
  ui.stats.innerHTML =
    `<tr><th></th>${rows.map(([n]) => `<th>${n}</th>`).join('')}</tr>` +
    metrics.map(([label, f]) => `<tr><td>${label}</td>${rows.map(([, s]) => `<td>${f(s)}</td>`).join('')}</tr>`).join('');
}

function renderTrades(trades: Trade[]) {
  const recent = trades.slice(-12).reverse();
  ui.trades.innerHTML =
    '<tr><th>Entry</th><th>Side</th><th>Exit</th><th>R</th></tr>' +
    recent
      .map(
        (tr) =>
          `<tr><td>${new Date(tr.entryTime * 1000).toISOString().slice(5, 16).replace('T', ' ')}</td>` +
          `<td class="${tr.side}">${tr.side}</td><td class="muted">${tr.exitReason}</td>` +
          `<td class="${tr.pnl > 0 ? 'long' : 'short'}">${tr.rMultiple.toFixed(2)}</td></tr>`,
      )
      .join('');
}

function renderLatest(candidates: Signal[], approved: Signal[], jevOn: boolean) {
  const last = approved[approved.length - 1];
  const lastCandidate = candidates[candidates.length - 1];
  if (!last) {
    ui.latest.innerHTML = '<h3>Latest signal</h3><p class="muted">No signal in this range.</p>';
    return;
  }
  const v = verdicts.get(last.index);
  const barsAgo = candles.length - 1 - last.index;
  const bar = (label: string, p: number) =>
    `<span>${label}</span><div class="meter"><span style="width:${Math.round(p * 100)}%"></span></div><span>${Math.round(p * 100)}%</span>`;
  ui.latest.innerHTML = `
    <h3>Latest signal</h3>
    <div class="signal-side ${last.side}">${last.side === 'long' ? 'BUY / LONG' : 'SELL / SHORT'}</div>
    <div class="muted">${new Date(last.time * 1000).toUTCString()} · ${barsAgo} bar${barsAgo === 1 ? '' : 's'} ago</div>
    <ul class="reasons">${last.reasons.map((r) => `<li>${r}</li>`).join('')}</ul>
    ${
      jevOn && v
        ? `<div class="probs">
            ${bar('Long', v.directionProbs.long ?? 0)}
            ${bar('Short', v.directionProbs.short ?? 0)}
            ${bar('Stand aside', v.directionProbs.stand_aside ?? 0)}
            ${bar('Trap risk', v.trapProb)}
          </div>
          <p class="note">Jev regime: ${v.regime.replace('_', ' ')} · conviction ${v.conviction.toFixed(1)}/4 · ${v.model}</p>`
        : ''
    }
    ${
      lastCandidate && lastCandidate.index > last.index
        ? `<p class="note">Most recent candidate (${lastCandidate.side}, ${candles.length - 1 - lastCandidate.index} bars ago) was vetoed by Jev.</p>`
        : ''
    }`;
}

async function run() {
  const id = ++runId;
  stopStream?.();
  verdicts = new Map();
  ui.run.disabled = true;
  setStatus('Loading market data…');
  const symbol = ui.symbol.value;
  const interval = ui.interval.value as Interval;
  try {
    const all = await loadCandles(symbol, interval);
    if (id !== runId) return;
    // Drop the still-forming bar so every signal is computed on closed candles.
    candles = all.slice(0, -1);
    await analyze(id);
    chart.timeScale().setVisibleLogicalRange({ from: candles.length - 200, to: candles.length + 5 });
    let forming: Candle | null = null;
    stopStream = streamCandles(symbol, interval, (c, closed) => {
      if (id !== runId) return;
      if (closed) {
        if (candles[candles.length - 1]?.time !== c.time) candles.push(c);
        forming = null;
        void analyze(id);
      } else {
        forming = c;
        candleSeries.update({ ...forming, time: t(forming.time) });
      }
    });
  } catch (e) {
    setStatus((e as Error).message, true);
  } finally {
    ui.run.disabled = false;
  }
}

ui.run.addEventListener('click', run);
ui.symbol.addEventListener('change', run);
ui.strategy.addEventListener('change', run);
ui.orderType.addEventListener('change', run);
ui.interval.addEventListener('change', run);
void run();
