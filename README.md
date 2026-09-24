# Signal

Long/short signals for the top 20 crypto coins, drawn on a TradingView
[lightweight-charts](https://github.com/tradingview/lightweight-charts) chart. Several walk-forward-tested strategies
generate signals, and [Jev](https://typesafe.ai), TypeSafe AI's System One model, can veto them.

**LONG** = a bet that the price rises; **SHORT** = a bet that it falls; **CLOSE** = exit the position.

## Simple and Advanced modes

- **Simple** (default) shows only the best overall strategy, the **Signal Composite**: large LONG/CLOSE arrows with
  an A/B/C strength grade, entry and stop lines for the open trade, a status card (*IN A LONG*, *NO TRADE*, or
  *OPEN LONG NOW* / *CLOSE LONG NOW* when a decision was confirmed on the last close), a position-size calculator,
  an all-coins scanner, the latest signals, and the track record of the coin and of the whole 20-coin account.
- **Advanced** unlocks the strategy picker, Jev filter, optional shorts, leverage, risk, order type, backtest
  tables, walk-forward panels and the market-context panel.

## Signal Composite (best overall)

Supertrend, RSI(2) pullback and band reversion vote at every candle. The composite goes **long** when any of them
wants a long and the coin's trend isn't bearish, goes **short** when any wants a short and the trend isn't bullish,
and closes when none do (3 ATR protective stop). Each long gets a **strength grade** (A = top 20% of historical
model scores, size 1.5×; B = 1×; C = bottom 20%, 0.5×).

**Market mode** (Bitcoin's trend) decides which side the account trades and how big:

| Mode | Longs | Shorts |
|---|---|---|
| Bull | 1× risk, up to 5 | none |
| Neutral | 1× risk, up to 5 | ½× risk, up to 3 |
| Bear | none | ¾× risk, up to 5 |

Scored on history after each coin's first two years, limit-order fees and **real historical funding** included.
Designed on BTC/ETH/SOL; the other 17 coins are an out-of-sample test: **4h profitable on 20/20 coins, 1h on 19/20.**

### Whole account (`research/portfolio-report.ts`)

20 coins; 80% of the account follows 4h signals and 20% follows 1h signals (the 1h sleeve reads the market mode
from Bitcoin's 4h trend). **Pyramiding:** when a trade reaches +2R, add half a position and move the stop to the
entry, so total risk never exceeds the original 1R.

| Base risk | 2019* | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 | 2026* | Per year | Max DD | Sharpe |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1% | +7% | +246% | +512% | −1% | +193% | +67% | +129% | +52% | 130% | 35% | 1.95 |
| 0.5% | +4% | +95% | +180% | +1% | +84% | +34% | +69% | +26% | 61% | 19% | 1.92 |

\*partial years. **Locked final exam:** every change in this round was chosen on 2019 → Sep 2025 only; on the untouched
last 12 months the shipped setup made **+39%** (vs +24% for the previous setup, +34% with pyramiding alone). That
year was weaker than the history (Sharpe ~1 vs ~1.9), so expect less than the headline going forward. About a quarter
of quarters lose money. Position exposure peaks around 7× equity at 1% risk (1h stops are tight), so use the per-trade
**max safe leverage** shown in the app (liquidation beyond the stop) rather than one fixed setting.

**Optional momentum sleeve.** Each Monday, long the 4 strongest coins and short the 4 weakest (14-day return), equal
dollars each side. Blind walk-forward: 24%/yr on its own, correlation 0.22 with the main account; 20% of capital in
it cut the worst drawdown from 30% to 25% (Sharpe 1.82 → 1.87). Tested on today's top coins (survivorship bias), so
treat it as a diversifier, not a return engine. Funding carry was also tested and dropped (near-zero income since 2022).
Details: `research/RESULTS-round5.md`.

## Strategies

Pick one in Advanced mode. Every strategy computes signals on **closed bars only**; tests check that none of them repaint.

| Strategy | Idea | Character |
|---|---|---|
| Signal Composite (default) | The three strategies below voting together, gated by regime | Most signals at a ~55–63% win rate, profitable on 19 of 20 coins (4h) |
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

## Research round 3: portfolio, exits, futures data, ML, overfitting

Data: 20 coins (spot history from 2017–2023 depending on listing) plus Binance USDT-perpetual funding rates (from 2020)
and open-interest / long-short metrics (from Dec 2021; `research/futures.ts`, from `data.binance.vision`).

| Question | Answer | Details |
|---|---|---|
| Size by volatility? | Yes: risk-based sizing (ATR stop) beat equal notional, Sharpe 1.25 vs 1.18 | `RESULTS-portfolio.md` |
| How much risk / leverage? | 1% risk, max 5 positions, BTC gate: 72%/yr, 31% max DD; 2% risk has a 71% chance of a 50% drawdown | `RESULTS-portfolio.md` |
| Better exits? | No. Partial profits, trailing stops, time limits and fixed targets all cut profit; a 2 ATR stop adds return but proportionally more drawdown | `RESULTS-exits.md` |
| Add shorts? | Thin edge per trade; with their own slots at half risk they improve the account (Sharpe 1.64 → 1.70, DD 31% → 27%) | `RESULTS-round4.md` |
| Profit in bull *and* bear? | Market mode by BTC trend (bull: longs only; bear: shorts only, ¾ size, 5 slots): every year positive, 84%/yr, Sharpe 1.75 | `RESULTS-round5.md` |
| Market-neutral sleeves? | Momentum (long strong / short weak) diversifies (corr 0.22); funding carry income has dried up | `RESULTS-round5.md` |
| Buy/sell in levels? | Pyramid (+½ at +2R, stop → entry) beats plain risk at equal drawdown (85% vs 78%/yr at 31% DD); scale-ins, far scale-outs and swing stops all hurt | `RESULTS-levels-4h.md` |
| More slots? | No: 8–10 long slots add no return and push drawdowns to 46–48% (crypto crashes together); 5 is right | `RESULTS-account-tests.md` |
| Grade sizing / momentum rotation? | Grade sizing adds return with proportionally more risk; rotation into stronger coins is noise | `RESULTS-account-tests.md` |
| More coins / timeframes? | 13 extra coins: no gain (they alone made 11%/yr); adding a 20% 1h sleeve: Sharpe 1.77 → 1.93 | `RESULTS-scale-tests.md` |
| Does it hold on unseen data? | Locked last 12 months: shipped setup +39% vs +24% before | `RESULTS-final-exam.md` |
| Futures positioning? | "Retail crowded long" predicts weaker longs (confirmed on 6 holdout coins), but doesn't move the portfolio. Funding / OI filters were noise | `RESULTS-futures-shorts-ml.md` |
| ML scoring? | Predicting wins picks the low-profit trades (win rate ≠ profit). Predicting profit works: top quintile +0.40R vs ~+0.05R. Shipped as A/B/C grades | `RESULTS-futures-shorts-ml.md` |
| Overfit? | Every setting nudge stays profitable (PF 1.39–1.71); PBO 30%; 176/189 line-ups profitable; deflated Sharpe says the *exact* pick isn't special, the approach is | `RESULTS-overfitting.md` |
| Jev? | `npm run jev-eval` with `TYPESAFE_API_KEY` set compares the composite with and without Jev | `research/jev-eval.ts` |

Remaining caveats: prices are spot (not perp) candles; limit orders are assumed to fill; the universe is today's top
coins (survivorship bias); results lean on the 2020–21 and 2023–25 bull markets.

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
npx tsx research/portfolio.ts        # multi-coin account + stress test
npx tsx research/exits.ts            # exit variants, walk-forward
npx tsx research/overfit.ts          # sensitivity, PBO, deflated Sharpe
npm run jev-eval                     # Jev comparison (needs TYPESAFE_API_KEY)
npm run mine      # quant condition mining frontier
npm run typecheck
```

## Adding assets

Add a Binance symbol to `ASSETS` in `src/data.ts` (and to `research/universe.ts` to include it in research).
