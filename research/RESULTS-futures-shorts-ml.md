# Shorts, futures positioning and ML signal scoring

All on the 20-coin universe (`research/universe.ts`), test periods only (after each coin's first two years),
limit-order fees and **real historical funding** from Binance (`research/futures.ts`).

## Shorts (`npm run` → `tsx research/shorts.ts`)

| 4h | Trades | Win | PF | Total R | Coins profitable |
|---|---|---|---|---|---|
| Long only | 2,803 | 57.3% | 1.68 | 573 | 19/20 |
| + shorts in bear regime | 6,774 | 48.9% | 1.43 | 692 | 20/20 |
| + shorts when not bullish | 6,312 | 59.3% | 1.39 | 701 | 20/20 |

| 1h | Trades | Win | PF | Total R | Coins profitable |
|---|---|---|---|---|---|
| Long only | 9,825 | 55.0% | 1.29 | 881 | 19/20 |
| + shorts in bear regime | 23,625 | 45.0% | 1.13 | 787 | 16/20 |
| + shorts when not bullish | 21,854 | 55.2% | 1.15 | 986 | 19/20 |

Shorts carry a thin edge (~+0.03R per trade on 4h, ~0 on 1h). In the portfolio simulation they add some return
and some drawdown (roughly neutral risk-adjusted), so the app keeps them as an optional Advanced toggle.

## Futures positioning filters (`tsx research/futures-filters.ts`)

Funding for all 20 coins (from 2020); open interest and long/short ratios for 9 coins (from Dec 2021; BTC from
Sep 2020). Each filter was judged by the trades it would remove, split into the first and second half of the data.

- **Retail crowded long** (all-account long/short ratio in the top 10% of its 30-day range): the longs it removes
  were break-even or losing in all 4 cells on BTC/ETH/SOL (avg −0.04 to −0.17R vs +0.09 to +0.50R kept) and again in
  all 4 cells on the 6 holdout coins (BNB, XRP, DOGE, LINK, ADA, AVAX). A real effect at the trade level.
- **Portfolio impact is negligible** (9 coins, 2022–2026, max 5 positions): CAGR 23.6% → 22.7%, max DD 31.9% → 29.0%,
  Sharpe 0.90 → 0.89 — skipped trades are replaced by other signals. Not shipped (it would also need live Binance
  futures data, which is geo-blocked from US-hosted servers).
- Funding extremes, open-interest surges/drops, taker flow and top-trader extremes flipped sign between halves or
  on the holdout coins: noise.

## ML signal scoring (`TARGET=r tsx research/ml.ts`)

Walk-forward (train on all trades before each 6-month window, 20 coins pooled), 2,284 composite longs scored blind.

**Predicting win/loss** (logistic regression) worked "too well": win rate rose from 35% to 68% across model
quintiles, but average profit fell from +0.37R to ~0R. The trades least likely to win are the trend breakouts
that make the money. Skipping the "unlikely winners" took the portfolio from +38%/yr to −1%/yr.

**Predicting profit** (ridge regression on R, calendar/moon features excluded as noise):

| Model quintile | Win | Avg R |
|---|---|---|
| 1 (lowest) | 62.9% | +0.03 |
| 2 | 59.7% | −0.04 |
| 3 | 60.4% | +0.07 |
| 4 | 56.2% | +0.16 |
| 5 (highest) | 41.6% | **+0.40** |

Portfolio (1% risk, max 5 positions): all signals +38.0%/yr (Sharpe 1.09); skip bottom 25% +41.1% (1.19); size
0.5×–1.5× by score +40.8% (1.16). Shipped as the A/B/C signal-strength grade with a size suggestion
(`src/signalModel.json`, `EXPORT=1` regenerates it).
