# Signal

Buy/sell signals for Bitcoin (plus ETH and SOL), drawn on a TradingView
[lightweight-charts](https://github.com/tradingview/lightweight-charts) chart. Several walk-forward-tested strategies
generate signals, and [Jev](https://typesafe.ai), TypeSafe AI's System One model, can veto them.

## Strategies

Pick one in the app. Every strategy computes signals on **closed bars only**; tests check that none of them repaint.

| Strategy | Idea | Character |
|---|---|---|
| Supertrend trend-follow (default) | Supertrend flips up while price is above a rising EMA; ride it until the next flip | Wins ~1 in 3 trades, but the winners are large |
| Trend pullback (RSI 2) | Uptrend on the chart and the daily; buy a 2-period-RSI washout; sell the first bounce | Wins ~2 in 3 trades, small profit per trade |
| A+ stacked pullback | RSI(2) washout + close under the lower Bollinger band + stretched below the 20 EMA, uptrend on two timeframes | Rare trades |
| Trend band reversion | Uptrend + close below the lower Bollinger band; exit at the mid band | |
| Trend pullback, fixed target | Uptrend + RSI(14) dip; take profit at a fraction of the stop | |
| Jurik MA confluence | Jurik MA crossover scored against trend, ADX, RSI, MACD and volume | The original strategy |

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
npm run research  # walk-forward study (caches history in research/.cache)
npm run typecheck
```

## Adding assets

Add a Binance symbol to `ASSETS` in `src/data.ts`.
