import {
  CandlestickSeries,
  ColorType,
  createChart,
  createSeriesMarkers,
  LineSeries,
  type IPriceLine,
  type ISeriesApi,
  type SeriesMarker,
  type Time,
  type UTCTimestamp,
} from 'lightweight-charts';
import './styles.css';
import { backtest, defaultRisk, summarize, type BacktestResult, type Stats } from './backtest.js';
import { ALLOCATION, composite, LEVELS, lineupFor, modeOf, SPLIT, type MarketMode } from './composite.js';
import { GRADE_SIZE, gradeSignals, type Grade } from './grade.js';
import portfolioStats from './portfolioStats.json' with { type: 'json' };
import { alignRegime, applyBtcGate, btcRegimeByTime, coinStatus, type CoinStatus } from './scan.js';
import { lastMonday, MOMENTUM, momentumPicks } from './momentum.js';
import { safeLeverage } from './sizing.js';
import { formatAlert, latestEvents } from './alerts.js';
import { ASSETS, INTERVALS, loadCandles, streamCandles, type Interval } from './data.js';
import { approves, defaultJevThresholds, judgeSignals, type JevVerdict } from './jev.js';
import { marketContext, QUANT_PROFILES, quantRuleSet, quantStrategy } from './quant.js';
import { STRATEGIES as BASE_STRATEGIES, type StrategyOutput } from './strategies.js';
import { computeIndicators, defaultStrategy } from './strategy.js';
import type { Candle, RiskParams, Signal, Trade } from './types.js';
import walkforward from './walkforward.json' with { type: 'json' };

const STRATEGIES = [composite, ...BASE_STRATEGIES, quantStrategy];
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
  simpleStatus: $<HTMLDivElement>('simpleStatus'),
  simpleSignals: $<HTMLDivElement>('simpleSignals'),
  simpleRecord: $<HTMLDivElement>('simpleRecord'),
  simpleSizing: $<HTMLDivElement>('simpleSizing'),
  scanner: $<HTMLDivElement>('scanner'),
  allowShorts: $<HTMLInputElement>('allowShorts'),
  momentum: $<HTMLDivElement>('momentum'),
  alerts: $<HTMLDivElement>('alerts'),
};

type Mode = 'simple' | 'advanced';
let mode: Mode = 'simple';
try {
  if (localStorage.getItem('signal-mode') === 'advanced') mode = 'advanced';
} catch {
  /* storage unavailable: default to simple */
}

for (const s of STRATEGIES) ui.strategy.add(new Option(s.name, s.id));
ui.strategy.value = composite.id;
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
let priceLines: IPriceLine[] = [];

const equityChart = createChart($('equity'), { ...chartOptions, timeScale: { ...chartOptions.timeScale, visible: false } });
const equitySeries = equityChart.addSeries(LineSeries, { color: COLORS.fast, lineWidth: 2, priceLineVisible: false });
chart.timeScale().subscribeVisibleLogicalRangeChange((r) => r && equityChart.timeScale().setVisibleLogicalRange(r));

let candles: Candle[] = [];
let btcRegime: Map<number, number> | null = null;
let grades = new Map<number, Grade>();
let accountSize = 10_000;
try {
  accountSize = Number(localStorage.getItem('signal-account')) || accountSize;
} catch {
  /* storage unavailable */
}
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

const money = (v: number) =>
  '$' + v.toLocaleString('en-US', { maximumFractionDigits: v >= 1000 ? 0 : v >= 10 ? 2 : 4, minimumFractionDigits: v >= 1000 ? 0 : 2 });
const pctText = (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`;
const tradePct = (tr: Trade) => ((tr.side === 'long' ? 1 : -1) * (tr.exitPrice - tr.entryPrice)) / tr.entryPrice * 100;
const dateText = (s: number) =>
  new Date(s * 1000).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' }) + ' UTC';

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
  const isComposite = strategy.id === composite.id;
  const shorts = isComposite && (mode === 'simple' || ui.allowShorts.checked);
  const params = isComposite ? { ...lineupFor(ui.interval.value), shorts: shorts ? 1 : 0 } : strategy.defaults;
  const out = strategy.build(candles, params, { symbol: ui.symbol.value, interval: ui.interval.value });
  const candidates = out.signals;
  // Altcoin longs wait while Bitcoin's own trend is bearish (composite only).
  const gated = isComposite ? applyBtcGate(candidates, ui.symbol.value, btcRegime) : candidates;
  const risk = { ...riskParams(), ...out.risk, ...(isComposite ? LEVELS : {}) };

  let jevError: string | null = null;
  if (ui.useJev.checked && gated.length) {
    try {
      // Jev always gets the same broad market context, whichever strategy proposed the trade.
      const context = computeIndicators(candles, defaultStrategy);
      verdicts = await judgeSignals(
        candles,
        context,
        gated,
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
    ? gated.filter((s) => {
        const v = verdicts.get(s.index);
        return v && approves(v, s.side, defaultJevThresholds);
      })
    : gated;
  grades = isComposite ? gradeSignals(candles, approved) : new Map();

  const base = backtest(candles, gated, out.atr, risk, out.rules);
  const filtered = jevOn ? backtest(candles, approved, out.atr, risk, out.rules) : base;
  const split = Math.floor(candles.length * 0.7);
  const recent = backtest(candles, approved.filter((s) => s.index >= split), out.atr, risk, out.rules);

  render(out, candidates, approved, filtered.trades, filtered.equity, risk, filtered.pending);
  renderSimple(strategy.id, filtered.trades, out, risk, jevOn, filtered.pending);
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
  if (mode === 'simple') setStatus(`Live · updates when each candle closes${jevError ? ' · Jev not connected' : jevOn ? ' · Jev on' : ''}`);
  else
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
    <p class="note">${
      strategyId === composite.id
        ? 'Fixed settings, scored on all history after each coin’s first two years. The line-up was chosen after comparing results across coins, so treat it as slightly optimistic; the fully blind walk-forward (re-picking the line-up every 6 months) was still profitable on 1h for all three coins.'
        : `Settings tuned on 2 years, tested on the next 6 months, rolled forward since ${ui.symbol.value === 'SOLUSDT' ? '2020' : '2017'}. Only the test periods are counted.`
    } ${ui.orderType.value === 'limit' ? 'Limit-order' : 'Market-order'} costs and funding included.</p>`;
}

function render(
  out: StrategyOutput,
  candidates: Signal[],
  approved: Signal[],
  trades: Trade[],
  equity: { time: number; value: number }[],
  risk: RiskParams,
  pending: BacktestResult['pending'],
) {
  const simple = mode === 'simple';
  candleSeries.setData(candles.map((c) => ({ ...c, time: t(c.time) })));
  for (const s of lineSeries) chart.removeSeries(s);
  lineSeries = (simple ? out.lines.slice(0, 1) : out.lines).map((l) => {
    const s = chart.addSeries(LineSeries, {
      color: l.color,
      lineWidth: simple ? 1 : 2,
      title: simple ? '' : l.name,
      priceLineVisible: false,
      lastValueVisible: false,
    });
    s.setData(toLine(l.values));
    return s;
  });
  equitySeries.setData(equity.map((p) => ({ time: t(p.time), value: p.value })));

  // Clear entry and exit points for every trade: LONG = profits if price rises, SHORT = profits if it falls.
  const size = simple ? 2 : 1;
  const m: SeriesMarker<Time>[] = [];
  const word = (side: 'long' | 'short') => (side === 'long' ? 'LONG' : 'SHORT');
  for (const tr of trades) {
    const long = tr.side === 'long';
    const g = grades.get(tr.entryIndex - 1);
    m.push({
      time: t(candles[tr.entryIndex].time),
      position: long ? 'belowBar' : 'aboveBar',
      shape: long ? 'arrowUp' : 'arrowDown',
      color: long ? COLORS.long : COLORS.short,
      text: `${word(tr.side)}${g ? ` ${g}` : ''}${simple ? '' : ` ${money(tr.entryPrice)}`}`,
      size,
    });
    for (const f of tr.fills ?? [])
      if (f.kind === 'add')
        m.push({
          time: t(candles[f.index].time),
          position: long ? 'belowBar' : 'aboveBar',
          shape: long ? 'arrowUp' : 'arrowDown',
          color: long ? COLORS.long : COLORS.short,
          text: simple ? 'ADD ½' : `ADD ½ ${money(f.price)}`,
          size: size * 0.75,
        });
    if (tr.exitReason === 'end') continue; // still open
    const pct = tradePct(tr);
    const why = tr.exitReason === 'liquidation' ? ' LIQ' : tr.exitReason === 'stop' ? ' stop' : '';
    m.push({
      time: t(candles[tr.exitIndex].time),
      position: long ? 'aboveBar' : 'belowBar',
      shape: long ? 'arrowDown' : 'arrowUp',
      color: pct >= 0 ? '#f5a623' : COLORS.short,
      text: simple ? `CLOSE ${pctText(pct)}` : `CLOSE ${word(tr.side)} ${money(tr.exitPrice)} ${pctText(pct)}${why}`,
      size,
    });
  }
  // Decisions made on the latest close fill at the next open: show them now.
  const lastTime = t(candles[candles.length - 1].time);
  const open0 = openTrade(trades);
  if (open0 && (pending.exit || (pending.signal && pending.signal.side !== open0.side))) {
    const long = open0.side === 'long';
    m.push({ time: lastTime, position: long ? 'aboveBar' : 'belowBar', shape: long ? 'arrowDown' : 'arrowUp', color: '#f5a623', text: `CLOSE ${word(open0.side)} at next open`, size });
  }
  if (pending.signal && (!open0 || pending.signal.side !== open0.side)) {
    const long = pending.signal.side === 'long';
    const g = grades.get(pending.signal.index);
    m.push({ time: lastTime, position: long ? 'belowBar' : 'aboveBar', shape: long ? 'arrowUp' : 'arrowDown', color: long ? COLORS.long : COLORS.short, text: `${word(pending.signal.side)}${g ? ` ${g}` : ''} at next open`, size });
  }
  if (!simple) {
    // Signals the Jev filter vetoed.
    const ok = new Set(approved.map((s) => s.index));
    for (const s of candidates)
      if (!ok.has(s.index))
        m.push({ time: t(s.time), position: s.side === 'long' ? 'belowBar' : 'aboveBar', shape: 'circle', color: COLORS.veto, text: 'veto', size: 0.5 });
  }
  markers.setMarkers(m.sort((a, b) => (a.time as number) - (b.time as number)));

  // Entry and stop lines for the position that is open right now.
  for (const pl of priceLines) candleSeries.removePriceLine(pl);
  priceLines = [];
  const open = openTrade(trades);
  if (open) {
    const stop = stopPrice(open, out, risk);
    priceLines.push(
      candleSeries.createPriceLine({ price: open.entryPrice, color: COLORS.fast, lineWidth: 2, lineStyle: 0, axisLabelVisible: true, title: 'Entry' }),
      candleSeries.createPriceLine({ price: stop, color: COLORS.short, lineWidth: 2, lineStyle: 2, axisLabelVisible: true, title: 'Stop' }),
    );
  }
}

const openTrade = (trades: Trade[]) => {
  const last = trades[trades.length - 1];
  return last && last.exitReason === 'end' ? last : null;
};

const hasAdd = (tr: Trade) => !!tr.fills?.some((f) => f.kind === 'add');
function stopPrice(tr: Trade, out: StrategyOutput, risk: RiskParams) {
  if (risk.breakevenAfterAdd && hasAdd(tr)) return tr.entryPrice; // stop moved to entry after the pyramid add
  const a = out.atr[tr.entryIndex - 1];
  return tr.entryPrice - (tr.side === 'long' ? 1 : -1) * risk.stopAtr * a;
}

const MODE_TEXT: Record<MarketMode, string> = {
  bull: 'Longs only (up to 5). No shorts.',
  neutral: 'Longs (up to 5) and half-size shorts (up to 3).',
  bear: 'Shorts only (up to 5, ¾ size). No longs.',
};
const modeAt = (time: number | undefined): MarketMode => modeOf(time === undefined ? undefined : btcRegime?.get(time));
const currentMode = (): MarketMode => modeAt(candles[candles.length - 1]?.time);
const modeBanner = () => {
  const mm = currentMode();
  return `<div class="mode-banner ${mm}"><b>Market mode: ${mm.toUpperCase()}</b><span>${MODE_TEXT[mm]} Set by Bitcoin’s trend.</span></div>`;
};

const GRADE_TEXT: Record<Grade, string> = {
  A: 'A · strong (top 20% historically)',
  B: 'B · normal',
  C: 'C · weak (bottom 20%)',
};

function renderSimple(
  strategyId: string,
  trades: Trade[],
  out: StrategyOutput,
  risk: RiskParams,
  jevOn: boolean,
  pending: BacktestResult['pending'],
) {
  const open = openTrade(trades);
  const price = candles[candles.length - 1].close;
  const asset = ASSETS[ui.symbol.value];
  const closingNow = open && (pending.exit || (pending.signal && pending.signal.side !== open.side));
  const openingNow = pending.signal && (!open || pending.signal.side !== open.side) ? pending.signal : null;
  const side = (s: 'long' | 'short') => (s === 'long' ? 'LONG' : 'SHORT');
  const explain = '<p class="note"><b class="long">LONG</b> = you profit if the price rises. <b class="short">SHORT</b> = you profit if it falls. CLOSE = exit the position.</p>';
  let sizing: { entry: number; stop: number; grade?: Grade; side: 'long' | 'short'; mode: MarketMode; added?: boolean } | null = null;

  if (openingNow || closingNow) {
    const opening = !!openingNow;
    const s = opening ? openingNow!.side : open!.side;
    const g = opening ? grades.get(openingNow!.index) : undefined;
    const stop = opening ? price - (s === 'long' ? 1 : -1) * risk.stopAtr * out.atr[candles.length - 1] : 0;
    if (opening) sizing = { entry: price, stop, grade: g, side: s, mode: currentMode() };
    ui.simpleStatus.innerHTML = `
      <h3>${asset} · ${ui.interval.value}</h3>
      ${modeBanner()}
      <div class="big-status ${opening ? (s === 'long' ? 'long' : 'short') : 'muted'}">${opening ? `OPEN ${side(s)} NOW` : `CLOSE ${side(s)} NOW`}<small>Confirmed at the ${dateText(
        candles[candles.length - 1].time + (candles[1].time - candles[0].time),
      )} close · act at the next open</small></div>
      <dl class="kv">
        <dt>Last close</dt><dd>${money(price)}</dd>
        ${opening ? `<dt>Stop</dt><dd class="short">${money(stop)} (${pctText(((stop - price) / price) * 100)})</dd>` : ''}
        ${g ? `<dt>Signal strength</dt><dd>${GRADE_TEXT[g]}</dd>` : ''}
        ${!opening && open ? `<dt>Trade result</dt><dd class="${(open.side === 'long' ? price - open.entryPrice : open.entryPrice - price) >= 0 ? 'long' : 'short'}">${pctText((((open.side === 'long' ? 1 : -1) * (price - open.entryPrice)) / open.entryPrice) * 100)} so far</dd>` : ''}
      </dl>
      ${opening ? `<ul class="reasons">${openingNow!.reasons.map((r) => `<li>${r}</li>`).join('')}</ul>` : ''}
      ${explain}`;
  } else if (open) {
    const long = open.side === 'long';
    const stop = stopPrice(open, out, risk);
    const g = grades.get(open.entryIndex - 1);
    const pnl = (((long ? 1 : -1) * (price - open.entryPrice)) / open.entryPrice) * 100;
    // Size from the original stop distance (the stop may since have moved to the entry after the add).
    const origStop = open.entryPrice - (long ? 1 : -1) * risk.stopAtr * out.atr[open.entryIndex - 1];
    sizing = { entry: open.entryPrice, stop: origStop, grade: g, side: open.side, mode: modeAt(candles[open.entryIndex - 1].time), added: hasAdd(open) };
    ui.simpleStatus.innerHTML = `
      <h3>${asset} · ${ui.interval.value}</h3>
      ${modeBanner()}
      <div class="big-status ${long ? 'long' : 'short'}">IN A ${side(open.side)}<small>Opened ${dateText(candles[open.entryIndex].time)}</small></div>
      <dl class="kv">
        <dt>Entry</dt><dd>${money(open.entryPrice)}</dd>
        <dt>Now</dt><dd class="${pnl >= 0 ? 'long' : 'short'}">${money(price)} (${pctText(pnl)})</dd>
        <dt>Stop</dt><dd class="short">${money(stop)} (${pctText((((long ? 1 : -1) * (stop - open.entryPrice)) / open.entryPrice) * 100)})</dd>
        ${
          risk.pyramid
            ? hasAdd(open)
              ? `<dt>Added ½</dt><dd>at ${money(open.fills!.find((f) => f.kind === 'add')!.price)} · stop moved to entry</dd>`
              : `<dt>Add ½ at</dt><dd>${money(open.entryPrice + (long ? 1 : -1) * 2 * Math.abs(open.entryPrice - stop))} (+2R), then stop → entry</dd>`
            : ''
        }
        ${g ? `<dt>Signal strength</dt><dd>${GRADE_TEXT[g]}</dd>` : ''}
      </dl>
      <p class="note">It closes when none of its strategies still want the trade, the trend turns against it, or the stop is hit. A CLOSE arrow appears on the chart when that happens.</p>
      ${explain}`;
  } else {
    const last = trades[trades.length - 1];
    const mm = currentMode();
    ui.simpleStatus.innerHTML = `
      <h3>${asset} · ${ui.interval.value}</h3>
      ${modeBanner()}
      <div class="big-status muted">NO TRADE<small>Waiting for the next ${mm === 'bull' ? 'LONG' : mm === 'bear' ? 'SHORT' : 'LONG or SHORT'} signal</small></div>
      ${
        last
          ? `<dl class="kv"><dt>Last trade</dt><dd>${side(last.side)} ${money(last.entryPrice)} → ${money(last.exitPrice)}</dd>
             <dt>Result</dt><dd class="${tradePct(last) >= 0 ? 'long' : 'short'}">${pctText(tradePct(last))}</dd>
             <dt>Closed</dt><dd>${dateText(candles[last.exitIndex].time)}</dd></dl>`
          : ''
      }
      <p class="note">Signals are only confirmed when a candle closes, so an arrow never disappears once it is drawn.</p>
      ${explain}`;
  }
  renderSizing(sizing);

  const events: { time: number; kind: string; cls: string; price: number; pct?: number }[] = [];
  for (const tr of trades) {
    const g = grades.get(tr.entryIndex - 1);
    events.push({ time: candles[tr.entryIndex].time, kind: `${side(tr.side)}${g ? ' ' + g : ''}`, cls: tr.side === 'long' ? 'buy' : 'sell', price: tr.entryPrice });
    if (tr.exitReason !== 'end') events.push({ time: candles[tr.exitIndex].time, kind: 'CLOSE', cls: 'close', price: tr.exitPrice, pct: tradePct(tr) });
  }
  ui.simpleSignals.innerHTML = `
    <h3>Latest signals</h3>
    <ul class="signal-list">${events
      .slice(-8)
      .reverse()
      .map(
        (e) => `<li><span class="pill ${e.cls}">${e.kind}</span>
          <span>${money(e.price)} <span class="muted">· ${dateText(e.time)}</span></span>
          <span class="${e.pct === undefined ? 'muted' : e.pct >= 0 ? 'long' : 'short'}">${e.pct === undefined ? '' : pctText(e.pct)}</span></li>`,
      )
      .join('')}</ul>`;

  const r = (walkforward.limit as Record<string, { trades: number; winRate: number; profitFactor: number; perYear?: number }>)[
    `${strategyId}:${ui.symbol.value}:${ui.interval.value}`
  ];
  const pf = portfolioStats.balanced;
  const years = Object.entries(pf.years)
    .map(([y, v]) => `<div><b class="${v >= 0 ? 'long' : 'short'}">${v >= 0 ? '+' : ''}${Math.round(v * 100)}%</b><span>${y.replace(' YTD', '*')}</span></div>`)
    .join('');
  ui.simpleRecord.innerHTML = `
    ${
      r
        ? `<h3>${asset} ${ui.interval.value} track record</h3>
       <div class="stat-row">
         <div><b>${(r.winRate * 100).toFixed(0)}%</b><span>trades won</span></div>
         <div><b>${r.perYear ? r.perYear.toFixed(0) : r.trades}</b><span>${r.perYear ? 'trades / year' : 'trades'}</span></div>
         <div><b class="${r.profitFactor >= 1.2 ? 'long' : r.profitFactor < 1 ? 'short' : ''}">${r.profitFactor.toFixed(2)}</b><span>profit factor</span></div>
       </div>`
        : ''
    }
    <h3 style="margin-top:14px">Whole account, ${portfolioStats.coins} coins (4h)</h3>
    <div class="stat-row">
      <div><b class="long">+${Math.round(pf.cagr * 100)}%</b><span>per year</span></div>
      <div><b class="short">−${Math.round(pf.maxDrawdown * 100)}%</b><span>worst drawdown</span></div>
      <div><b>${pf.sharpe.toFixed(2)}</b><span>Sharpe</span></div>
    </div>
    <div class="year-row">${years}</div>
    <p class="note">Signal Composite on all ${portfolioStats.coins} coins, sized by market mode (bull: longs only; neutral: longs + half-size shorts; bear: shorts only)${
      jevOn ? ', Jev able to veto' : ''
    }. Limit-order fees and real funding included; only history after each coin’s first two years counts. *${new Date().getUTCFullYear()} so far. Stress test bad case: −${Math.round(pf.stress.badCaseDrawdown * 100)}% drawdown.</p>`;
}

function renderSizing(s: { entry: number; stop: number; grade?: Grade; side: 'long' | 'short'; mode: MarketMode; added?: boolean } | null) {
  const pf = portfolioStats.balanced;
  const riskPct = pf.riskPct;
  const alloc = s ? ALLOCATION[s.mode] : null;
  const sideMult = alloc ? (s!.side === 'short' ? alloc.shortRisk : alloc.longRisk) || 1 : 1;
  const mult = (s?.grade ? GRADE_SIZE[s.grade] : 1) * sideMult;
  const riskAmt = (accountSize * riskPct * mult) / 100;
  const dist = s ? Math.abs(s.entry - s.stop) : 0;
  const qty = dist ? riskAmt / dist : 0;
  const safeLev = s ? safeLeverage(s.entry, s.stop) : 1;
  const coin = ui.symbol.value.replace('USDT', '');
  ui.simpleSizing.innerHTML = `
    <h3>Position size</h3>
    <label class="field">Account size (USDT) <input id="acct" type="number" min="100" step="100" value="${accountSize}" /></label>
    ${
      s
        ? `<dl class="kv">
            <dt>Risk on this trade</dt><dd>${money(riskAmt)} (${(riskPct * mult).toFixed(2)}%${s.grade ? `, grade ${s.grade}` : ''}${s.side === 'short' ? `, ${s.mode} mode short × ${sideMult}` : ''})</dd>
            <dt>Position</dt><dd>${qty.toPrecision(4)} ${coin} ≈ ${money(qty * s.entry)}</dd>
            <dt>${s.added ? 'Added at +2R' : 'Add at +2R'}</dt><dd>${(qty / 2).toPrecision(4)} ${coin} (½ position)${s.added ? ' · total ' + (qty * 1.5).toPrecision(4) : ''}</dd>
            <dt>Max safe leverage</dt><dd>${safeLev}x <span class="muted">(liquidation beyond the stop)</span></dd>
            <dt>Margin at ${safeLev}x</dt><dd>${money((qty * s.entry) / safeLev)}</dd>
          </dl>`
        : '<p class="muted">Shows how much to buy when a signal is live.</p>'
    }
    <p class="note">Recommended: base risk ${riskPct}% of the account per trade (${portfolioStats.conservative.riskPct}% for smaller swings). Bull mode: longs at 1×, up to 5. Neutral: longs 1× (up to 5) + shorts ½× (up to 3). Bear: shorts ¾× (up to 5), no longs. When a trade reaches +2R, add half a position and move the stop to your entry. Split the account ${SPLIT['4h'] * 100}% on 4h signals and ${SPLIT['1h'] * 100}% on 1h signals (switch the timeframe to see each). Leverage only sets how much margin each position locks up: your risk comes from the stop. Use at most the “max safe leverage” shown for each trade so liquidation sits beyond the stop (the whole account averaged ${pf.avgLeverage}x exposure, peak ${pf.peakLeverage}x). If the stop is hit you lose only the “risk” amount.</p>`;
  $<HTMLInputElement>('acct').addEventListener('change', (e) => {
    accountSize = Math.max(100, Number((e.target as HTMLInputElement).value) || accountSize);
    try {
      localStorage.setItem('signal-account', String(accountSize));
    } catch {
      /* ignore */
    }
    renderSizing(s);
  });
}

const SEC: Record<string, number> = { '15m': 900, '1h': 3600, '4h': 14_400, '1d': 86_400 };
/**
 * Market-mode regime keyed by the given bar times. Intraday views below 4h follow Bitcoin's 4h trend
 * (as in the research); 4h and 1d use Bitcoin on the same timeframe.
 */
async function regimeFor(interval: string, times: number[], sameIntervalBtc: Candle[] | null): Promise<Map<number, number>> {
  if (SEC[interval] < SEC['4h']) {
    const btc4 = (await loadCandles('BTCUSDT', '4h')).slice(0, -1);
    return alignRegime(times, SEC[interval], btcRegimeByTime(btc4), SEC['4h']);
  }
  return btcRegimeByTime(sameIntervalBtc ?? (await loadCandles('BTCUSDT', interval as Interval)).slice(0, -1));
}

// ---- Alerts ------------------------------------------------------------------------------
const notified = new Set<string>();
function notifyLatest(symbol: string, interval: string) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  for (const e of latestEvents(candles, symbol, interval, btcRegime)) {
    const key = `${e.symbol}|${e.interval}|${e.barClose}|${e.kind}`;
    if (notified.has(key)) continue;
    notified.add(key);
    const [title, ...body] = formatAlert(e).split('\n');
    try {
      new Notification(title, { body: body.join('\n'), tag: key });
    } catch {
      /* some mobile browsers only allow notifications from a service worker */
    }
  }
}

const store = {
  get: (k: string) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set: (k: string, v: string) => {
    try {
      localStorage.setItem(k, v);
    } catch {
      /* ignore */
    }
  },
};
let alertStatus = store.get('signal-alert-status') ?? 'No check yet';

/** Ask the server to check every coin and send phone alerts, once per hourly candle close. */
async function triggerAlerts(force = false) {
  const now = Date.now() / 1000;
  const hour = Math.floor(now / 3600);
  const into = now - hour * 3600;
  if (!force && (into < 60 || into > 1200 || store.get('signal-alert-hour') === String(hour))) return;
  store.set('signal-alert-hour', String(hour));
  const key = store.get('signal-alerts-key');
  try {
    const r = await fetch(`/api/alerts${key ? `?key=${encodeURIComponent(key)}` : ''}`);
    const j = await r.json();
    alertStatus = r.ok
      ? `Checked ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}: ${j.events.length} signal${j.events.length === 1 ? '' : 's'}, ${j.sent.length} message${j.sent.length === 1 ? '' : 's'} sent${j.channels.length ? '' : ' (no channel configured)'}`
      : `Check failed (${r.status}${j.error ? `: ${j.error}` : ''})`;
  } catch (e) {
    alertStatus = `Check failed (${(e as Error).message})`;
  }
  store.set('signal-alert-status', alertStatus);
  renderAlerts();
}
setInterval(() => void triggerAlerts(), 30_000);

function renderAlerts() {
  const supported = 'Notification' in window;
  const perm = supported ? Notification.permission : 'unsupported';
  ui.alerts.innerHTML = `
    <h3>Alerts</h3>
    <dl class="kv">
      <dt>Phone (Telegram / SMS)</dt><dd><button id="testAlert">Send test</button></dd>
      <dt>Last check</dt><dd class="muted">${alertStatus}</dd>
      <dt>Browser pop-ups</dt><dd>${
        perm === 'granted'
          ? '<span class="long">On</span>'
          : perm === 'denied'
            ? '<span class="short">Blocked</span>'
            : perm === 'unsupported'
              ? '<span class="muted">Not supported</span>'
              : '<button id="enableNotify">Turn on</button>'
      }</dd>
    </dl>
    <p class="note">While this page is open, it checks all ${Object.keys(ASSETS).length} coins on 4h and 1h a minute after every hourly candle close and sends OPEN LONG / OPEN SHORT (with stop, add level, grade and safe leverage), CLOSE and ADD ½ to your phone. Keep it open on a computer (phones pause background tabs). Setup: add <b>TELEGRAM_BOT_TOKEN</b> + <b>TELEGRAM_CHAT_ID</b> (free) and/or Twilio SMS variables in Vercel → Settings → Environment Variables, redeploy, then press Send test.</p>`;
  $('enableNotify')?.addEventListener('click', async () => {
    await Notification.requestPermission();
    renderAlerts();
  });
  $('testAlert')?.addEventListener('click', async () => {
    const key = store.get('signal-alerts-key');
    try {
      const r = await fetch(`/api/alerts?test=1${key ? `&key=${encodeURIComponent(key)}` : ''}`);
      const j = await r.json();
      alertStatus = r.ok ? (j.channels.length ? `Test: ${j.results.join(', ')}` : 'No channel configured yet (see setup below)') : `Test failed (${r.status})`;
    } catch (e) {
      alertStatus = `Test failed (${(e as Error).message})`;
    }
    renderAlerts();
  });
}

let momentumFor = -1;
async function renderMomentum() {
  const asOf = lastMonday(Date.now() / 1000);
  if (momentumFor === asOf) return;
  momentumFor = asOf;
  ui.momentum.innerHTML = '<h3>Weekly momentum pair trade</h3><p class="muted">Ranking coins…</p>';
  const daily = new Map<string, Candle[]>();
  const queue = Object.keys(ASSETS);
  await Promise.all(
    Array.from({ length: 4 }, async () => {
      for (let sym = queue.shift(); sym; sym = queue.shift()) {
        try {
          daily.set(sym, await loadCandles(sym, '1d', 60).catch(() => loadCandles(sym, '1d', 60)));
        } catch {
          /* coin skipped */
        }
      }
    }),
  );
  const p = momentumPicks(daily, asOf);
  if (!p) {
    ui.momentum.innerHTML = '<h3>Weekly momentum pair trade</h3><p class="muted">Not enough data right now.</p>';
    return;
  }
  const row = (x: { symbol: string; ret: number }, cls: string, word: string) =>
    `<li><span class="pill ${cls}">${word}</span><span>${x.symbol.replace('USDT', '')} <span class="muted">${ASSETS[x.symbol]}</span></span><span class="${x.ret >= 0 ? 'long' : 'short'}">${pctText(x.ret * 100)}</span></li>`;
  const next = new Date((asOf + 7 * 86_400) * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
  ui.momentum.innerHTML = `
    <h3>Weekly momentum pair trade (optional)</h3>
    <ul class="signal-list">${p.longs.map((x) => row(x, 'buy', 'LONG')).join('')}${p.shorts.map((x) => row(x, 'sell', 'SHORT')).join('')}</ul>
    <p class="note">Market-neutral: equal dollars long the ${MOMENTUM.perSide} strongest coins and short the ${MOMENTUM.perSide} weakest (${MOMENTUM.lookbackDays}-day return), refreshed every Monday; next ${next}. It earns from the gap between winners and losers, not from market direction. Suggested size: ${MOMENTUM.share * 100}% of the account, which in testing cut the worst drawdown from 30% to 25%. It was tested on today's top coins, so real results will likely be lower.</p>`;
}

let scanId = 0;
let scannedInterval = '';
async function renderScanner() {
  const id = ++scanId;
  const interval = ui.interval.value as Interval;
  const rows = new Map<string, CoinStatus | 'loading' | 'error'>(Object.keys(ASSETS).map((s) => [s, 'loading']));
  const draw = () => {
    const order = { 'open-now': 0, 'close-now': 1, 'in-trade': 2, flat: 3 } as const;
    const list = [...rows.entries()].sort(([, a], [, b]) => (typeof a === 'string' ? 9 : order[a.kind]) - (typeof b === 'string' ? 9 : order[b.kind]));
    ui.scanner.innerHTML = `
      <h3>All coins · ${interval}</h3>
      <ul class="signal-list scan">${list
        .map(([sym, st]) => {
          const name = sym.replace('USDT', '');
          let badge = '<span class="pill close">…</span>';
          let detail = '';
          if (st === 'error') badge = '<span class="pill close">n/a</span>';
          else if (st !== 'loading') {
            if (st.kind === 'open-now') [badge, detail] = [`<span class="pill ${st.side === 'long' ? 'buy' : 'sell'}">${st.side === 'long' ? 'LONG' : 'SHORT'} NOW</span>`, money(st.price)];
            else if (st.kind === 'close-now') [badge, detail] = ['<span class="pill close">CLOSE NOW</span>', pctText(st.pct)];
            else if (st.kind === 'in-trade') [badge, detail] = [`<span class="pill ${st.side === 'long' ? 'buy' : 'sell'} dim">IN ${st.side === 'long' ? 'LONG' : 'SHORT'}</span>`, pctText(st.pct)];
            else badge = '<span class="pill close dim">NO TRADE</span>';
          }
          return `<li data-sym="${sym}" class="${sym === ui.symbol.value ? 'current' : ''}">${badge}<span>${name} <span class="muted">${ASSETS[sym]}</span></span><span>${detail}</span></li>`;
        })
        .join('')}</ul>
      <p class="note">Tap a coin to open it. Status is from the last closed ${interval} candle.</p>`;
    ui.scanner.querySelectorAll<HTMLLIElement>('li[data-sym]').forEach((li) =>
      li.addEventListener('click', () => {
        ui.symbol.value = li.dataset.sym!;
        void run();
      }),
    );
  };
  draw();
  let btc4: Map<number, number> | null = null;
  let btcSame: Map<number, number> | null = null;
  try {
    if (SEC[interval] < SEC['4h']) btc4 = btcRegimeByTime((await loadCandles('BTCUSDT', '4h', 1000)).slice(0, -1));
    else btcSame = btcRegimeByTime((await loadCandles('BTCUSDT', interval, 1000)).slice(0, -1));
  } catch {
    /* scan without the market-mode gate */
  }
  const queue = Object.keys(ASSETS);
  await Promise.all(
    Array.from({ length: 4 }, async () => {
      for (let sym = queue.shift(); sym; sym = queue.shift()) {
        try {
          const c = (await loadCandles(sym, interval, 1000).catch(() => loadCandles(sym, interval, 1000))).slice(0, -1);
          if (id !== scanId) return;
          const btc = btc4 ? alignRegime(c.map((b) => b.time), SEC[interval], btc4, SEC['4h']) : btcSame;
          rows.set(sym, coinStatus(c, sym, btc, true, interval));
        } catch {
          rows.set(sym, 'error');
        }
        if (id === scanId) draw();
      }
    }),
  );
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
    <div class="signal-side ${last.side}">${last.side === 'long' ? 'LONG' : 'SHORT'}</div>
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
    const [all, btc] = await Promise.all([
      loadCandles(symbol, interval),
      symbol === 'BTCUSDT' ? Promise.resolve(null) : loadCandles('BTCUSDT', interval).catch(() => null),
    ]);
    if (id !== runId) return;
    // Drop the still-forming bar so every signal is computed on closed candles.
    candles = all.slice(0, -1);
    let btcCandles = btc ? btc.slice(0, -1) : candles;
    btcRegime = await regimeFor(interval, candles.map((b) => b.time), btcCandles).catch(() => btcRegimeByTime(btcCandles));
    if (id !== runId) return;
    await analyze(id);
    if (mode === 'simple' && scannedInterval !== interval) {
      scannedInterval = interval;
      void renderScanner().then(renderMomentum);
      renderAlerts();
    }
    const span = mode === 'simple' ? 120 : 200;
    chart.timeScale().setVisibleLogicalRange({ from: candles.length - span, to: candles.length + 5 });
    let forming: Candle | null = null;
    stopStream = streamCandles(symbol, interval, (c, closed) => {
      if (id !== runId) return;
      if (closed) {
        if (candles[candles.length - 1]?.time !== c.time) candles.push(c);
        forming = null;
        const refresh = async () => {
          // Keep Bitcoin's regime current for the altcoin gate.
          if (symbol !== 'BTCUSDT') {
            const latest = await loadCandles('BTCUSDT', interval, 5).catch(() => []);
            for (const b of latest.slice(0, -1)) if (b.time > btcCandles[btcCandles.length - 1].time) btcCandles.push(b);
          } else btcCandles = candles;
          btcRegime = await regimeFor(interval, candles.map((b) => b.time), btcCandles).catch(() => btcRegimeByTime(btcCandles));
          await analyze(id);
          if (id === runId) notifyLatest(symbol, interval);
          if (mode === 'simple') void renderScanner();
        };
        void refresh();
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

function setMode(next: Mode, rerun = true) {
  mode = next;
  document.body.classList.toggle('mode-simple', mode === 'simple');
  document.body.classList.toggle('mode-advanced', mode === 'advanced');
  document.querySelectorAll<HTMLButtonElement>('.modes button').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.mode === mode)));
  try {
    localStorage.setItem('signal-mode', mode);
  } catch {
    /* ignore */
  }
  if (mode === 'simple') {
    scannedInterval = '';
    // Simple mode always shows the best overall strategy with limit-order costs.
    ui.strategy.value = composite.id;
    ui.orderType.value = 'limit';
  }
  if (rerun) void run();
}
document.querySelectorAll<HTMLButtonElement>('.modes button').forEach((b) => b.addEventListener('click', () => setMode(b.dataset.mode as Mode)));
setMode(mode, false);
// The alerts card doesn't depend on market data: show it straight away.
renderAlerts();
$('alertsBtn').addEventListener('click', () => {
  ui.alerts.scrollIntoView({ behavior: 'smooth', block: 'start' });
  ui.alerts.classList.remove('flash');
  void ui.alerts.offsetWidth;
  ui.alerts.classList.add('flash');
});

ui.run.addEventListener('click', run);
ui.symbol.addEventListener('change', run);
ui.strategy.addEventListener('change', run);
ui.orderType.addEventListener('change', run);
ui.allowShorts.addEventListener('change', run);
ui.interval.addEventListener('change', run);
void run();
