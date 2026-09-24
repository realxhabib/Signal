# Signal

Buy/sell signals for Bitcoin (plus ETH and SOL), drawn on a TradingView
[lightweight-charts](https://github.com/tradingview/lightweight-charts) chart. The signals come from
Jurik-MA indicator confluence and are judged by [Jev](https://typesafe.ai), TypeSafe AI's
System One model.

## How a signal is made

1. **Candidates (deterministic).** A fast/slow Jurik Moving Average crossover is the trigger. Five filters are scored:
   trend (EMA 200), trend strength (ADX + DI), RSI zone, MACD momentum and volume expansion.
   A candidate needs at least *Min confluence* of the five. Everything is computed on **closed bars only**, so
   signals never repaint.
2. **Jev judgement.** Each candidate's market context is summarised as pre-computed features: percent distances,
   RSI/ADX, volatility and recent returns. The summary deliberately contains **no dates and no absolute prices**,
   so Jev can't lean on memorised BTC history. Jev answers four typed questions: `regime` (choice), `direction`
   (long/short/stand aside), `trap` (probability of a false breakout) and `conviction` (score). The signal is kept
   only when Jev picks the same side with ≥ 55% probability, trap risk is ≤ 50%, and the regime isn't against the
   trade or choppy. Vetoed candidates show as grey dots on the chart.
3. **Backtest.** Entries fill at the next bar's open. The simulation risks a fixed % of equity per trade, uses a
   2-ATR stop, a 3R target and a 3-ATR trailing stop, and includes fees and slippage. It models isolated-margin
   liquidation: at high leverage the liquidation price can sit *in front of* the stop, and then you get liquidated
   instead of stopped out. Results are shown with and without Jev, plus the most recent 30% of history on its own.

Jev results are cached in the browser (`localStorage`) per symbol, timeframe and bar, so re-runs don't re-bill.

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
npm test          # indicators, backtester (fills, stops, liquidation), Jev client, proxy
npm run typecheck
```

## Honest numbers (indicators only, fees included, 1% risk, 5x)

| Timeframe | Profit factor | Net | Max DD |
|---|---|---|---|
| 1h (last ~4 months) | 0.72 | −8.3% | 13.0% |
| 4h (last ~16 months) | 0.60 | −10.9% | 14.0% |
| 1d (2018 → now) | 1.40 | +11.0% | 5.0% |

The intraday edge is negative after costs. Daily is positive but the sample is small (≈57 trades), so the app
defaults to `1d`. Whether Jev improves these numbers has to be measured with a real key: toggle *Jev filter* and
compare the columns. Leverage multiplies losses as well as gains, and no indicator stack is reliably "extremely
accurate". Treat this as a research tool, not financial advice.

## Adding assets

Add a Binance symbol to `ASSETS` in `src/data.ts`.
