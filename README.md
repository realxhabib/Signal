# Signal

Buy/sell signals for Bitcoin (plus ETH and SOL), drawn on a TradingView
[lightweight-charts](https://github.com/tradingview/lightweight-charts) chart. Several walk-forward-tested strategies
generate signals, and [Jev](https://typesafe.ai), TypeSafe AI's System One model, can veto them.

## Simple and Advanced modes

- **Simple** (default) shows only the best overall strategy, the **Signal Composite**: large BUY/SELL arrows on the
  chart, entry and stop lines for the open trade, a status card (*IN A BUY*, *NO TRADE*, or *BUY NOW* / *SELL NOW*
  when a decision was confirmed on the last close), the latest signals with prices and results, and its track record.
- **Advanced** unlocks the strategy picker, Jev filter, leverage, risk, order type, backtest tables, walk-forward
  panels and the market-context panel.

## Signal Composite (best overall)

Supertrend, RSI(2) pullback and band reversion vote at every candle. The composite buys when any of them wants a
long and the trend regime isn't bearish, and sells when none do (3 ATR protective stop). Scored on history after
each coin's first two years, limit-order fees and funding included:

| | BTC 4h | ETH 4h | SOL 4h | BTC 1h | ETH 1h | SOL 1h |
|---|---|---|---|---|---|---|
| Win rate | 60% | 58% | 63% | 60% | 56% | 59% |
| Trades / year | 28 | 29 | 31 | 99 | 100 | 97 |
| Profit factor | 1.27 | 2.09 | 2.52 | 1.43 | 1.52 | 1.46 |

Versus Supertrend alone it trades 3–4× more often with a much higher win rate (Supertrend wins ~35–40%) for similar
total profit. The line-up was chosen after comparing fixed line-ups across coins, so treat these numbers as slightly
optimistic. A fully blind walk-forward that re-picks the line-up every 6 months from all 63 combinations was still
profitable on 1h for all three coins (PF 1.34–1.51). `npm run composite` regenerates the numbers.

## Strategies

Pick one in Advanced mode. Every strategy computes signals on **closed bars only**; tests check that none of them repaint.

| Strategy | Idea | Character |
|---|---|---|
| Signal Composite (default) | The three strategies below voting together, gated by regime | Most signals at a ~56–63% win rate, profitable on every coin tested |
| Supertrend trend-follow | Supertrend flips up while price is above a rising EMA; ride it until the next flip | Wins ~1 in 3 trades, but the winners are large |
| Trend pullback (RSI 2) | Uptrend on the chart and the daily; buy a 2-period-RSI washout; sell the first bounce | Wins ~2 in 3 trades, small profit per trade |
| A+ stacked pullback | RSI(2) washout + close under the lower Bollinger band + stretched below the 20 EMA, uptrend on two timeframes | Rare trades |
| Trend band reversion | Uptrend + close below the lower Bollinger band; exit at the mid band | |
| Trend pullback, fixed target | Uptrend + RSI(14) dip; take profit at a fraction of the stop | |
| Jurik MA confluence | Jurik MA crossover scored against trend, ADX, RSI, MACD and volume | The original strategy |
| Quant mined rules | Combinations of ~80 quant, regime, calendar and moon conditions mined for high win rates | ~62–68% real win rate at 2:1 stop:target; roughly break-even |

The **Market context** panel shows the latest bar's trend regime (chart timeframe and daily), moon phase, and quant
state: volatility and Bollinger-width percentiles, variance ratio (trending vs mean-reverting), efficiency ratio,
return skew and autocorrelation, z-score, momentum rank, drawdown and volume z-score.

**Jev as judge.** When the Jev filter is on, each signal's market context is sent to Jev as pre-computed features:
percent distances, RSI/ADX, volatility and recent returns. There are **no dates and no absolute prices**, so Jev can't
lean on memorised history. Jev answers `regime`, `direction` (long/short/stand aside), `trap` (probability of a false
breakout) and `conviction`. The signal is kept only when Jev picks the same side with ≥ 55% probability, trap risk is
≤ 50%, and the regime isn't against the trade or choppy. Vetoed signals show as grey dots.

**Backtest.** Entries fill at the next bar's open. The simulation risks a fixed % of equity per trade, uses ATR stops,
and applies strategy-specific exits and a maximum holding time. Costs include limit (0.02%) or market
(0.05% + 0.02% slippage) fees and perpetual funding (0.01%/8h, always paid). It models isolated-margin liquidation:
at high leverage the liquidation price can sit in front of the stop.

## Research: can signals be 80%+ accurate?

`npm run research` downloads full history (BTC/ETH from 2017, SOL from 2020) on 1h, 4h and 1d and runs a
**walk-forward** test. For each rolling window, settings are chosen on 2 years of data, then traded on the next 6
months, which the tuning never saw. Only those unseen periods are scored. Full tables:
[`research/RESULTS-limit.md`](research/RESULTS-limit.md) and [`research/RESULTS-market.md`](research/RESULTS-market.md).
The app shows the matching unseen-data result for the selected strategy, asset, timeframe and order type.

Findings (unseen data, costs included):

- **No strategy reached 80% winners reliably.** The highest win rates came from buying dips inside uptrends, at
  61–72%. One configuration hit 78% (A+ pullback, SOL 1h), but only over 60 trades, and the same rules managed 55–67%
  on BTC and ETH, so it is likely luck.
- **Win rate and profit pull in opposite directions.** Requiring ≥75% winners during tuning produced results that
  barely made money. The high-win-rate strategies make ~0.0–0.08R per trade, so fees decide whether they profit at all.
- **The only edge that held on all three assets and both fee models was trend-following.** Supertrend on 4h: profit
  factor 1.45–2.5, avg +0.26 to +0.64R per trade, but only 32–36% of trades win.
- A strategy that wins 80% with a stop 3–4× larger than its target is not "accurate" in any useful sense. One loss
  erases several wins, and leverage turns that into liquidation risk.

### Condition mining: most signals at the best win rate

`npm run mine` labels every bar with a triple-barrier outcome (stop, target and time limit, with costs) for a long and a
short. It then searches single conditions, pairs and triples across ~80 features (regime, daily trend, Supertrend,
RSI, z-score, momentum, drawdown, volatility regime, Bollinger width, variance ratio, efficiency ratio, skew,
autocorrelation, volume, candle shape, weekday, session, moon phase). For each target win rate, rules are picked on
past data only and traded on the next unseen 6 months. Full tables: [`research/QUANT.md`](research/QUANT.md).

Pooled across BTC, ETH and SOL, limit-order costs, 2 ATR stop / 1 ATR target (break-even ≈ 67% before costs):

| TF | Train win-rate bar | Signals / year | **Real (unseen) win rate** | PF |
|---|---|---|---|---|
| 4h | ≥70% | 185 | 64.4% | 1.05 |
| 4h | ≥80% | 56 | 62.2% | 0.99 |
| 1h | ≥75% | 284 | 67.6% | 1.02 |
| 1h | ≥85% | 15 | 69.4% | 1.09 |

- **The frontier is flat.** Raising the training bar from 65% to 85% cuts signals by 10–50× but barely moves the
  real win rate. Rules that won 80–85% in training won 61–69% afterwards. That gap is what data-mining overfitting
  looks like.
- **Moon phase:** mined rules often included moon conditions in training, and they didn't hold up. On their own, over
  daily data, the "up next day" rate by phase ranges 39–56% against a ~50% baseline, which is within noise for ~415
  days per phase (new moon was weakest on all three coins; the coins move together, so that's not three independent
  confirmations).
- **Bullish/bearish regime is the real effect:** average next-day return is +0.26–0.69% in a bull regime versus
  ~0% in a bear regime, on all three coins. That's why trend-following (Supertrend) is the strategy that holds up.

Whether Jev can lift the win rate is the one untested lever, because it needs an API key. With a key set, toggle the
Jev filter and compare the *Strategy* and *+ Jev* columns.

Leverage multiplies losses as well as gains. Treat this as a research tool, not financial advice.

## Run it

```bash
npm install
cp .env.example .env        # add your TYPESAFE_API_KEY
npm run dev                 # http://localhost:5173
```

Production: `npm run build && npm start` (serves `dist/` plus the Jev proxy on port 3000).

The API key stays on the server. The browser calls `/api/jev` and sends only the market summary. The server
(`api/jev.ts`) adds the key, the pinned model and a fixed set of questions, so a public deployment can't be used
as a general-purpose proxy for your key. Without a key the app still works and shows indicator-only signals.

## Deploy to Vercel

1. Import the GitHub repo in Vercel. `vercel.json` already sets the framework (Vite), build command and output folder.
2. In **Project → Settings → Environment Variables**, add `TYPESAFE_API_KEY` (and optionally `JEV_MODEL`).
3. Deploy. The chart is served as a static site and `api/jev.ts` runs as a serverless function at `/api/jev`.

Anyone with the URL can load the page and trigger Jev calls on your key. Calls are cheap and cached per bar, but
if you want the site private, turn on Vercel's Deployment Protection.

Market data comes from Binance's public mirror (`data-api.binance.vision`), with a websocket for live bars.

## Tests

```bash
npm test          # indicators, strategies (no repainting), backtester, Jev client, proxy
npm run research  # strategy walk-forward (caches history in research/.cache)
npm run mine      # quant condition mining frontier
npm run typecheck
```

## Adding assets

Add a Binance symbol to `ASSETS` in `src/data.ts`.
