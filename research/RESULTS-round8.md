# Round 8 · Stronger basket, the whole portfolio across cycles, and the risk dial

## Pattern basket upgrades ([basket](RESULTS-round8-basket.md))
Daily rebalance, limit-order fees, research years (2020 → Sep 2025):

| Basket | CAGR | Max DD | Sharpe |
|---|---|---|---|
| 20 coins, 1 library (round 7) | +13% | 23% | 0.86 |
| 33 coins, 1 library | +16% | 19% | 1.07 |
| 20 coins, ensemble of 4 libraries | +17% | 21% | 0.98 |
| **33 coins, ensemble of 4 (shipped)** | **+22%** | **19%** | **1.33** |
| … + 1% / 2% no-trade band | +21% / +19% | 20% / 21% | 1.26 / 1.11 |
| … + volatility target 20% | +30% | 29% | 1.32 (just more leverage) |

Locked final year, looked at once ([locked](RESULTS-round8-basket-locked.md)): **+19.5%, Sharpe 1.19, max DD 8%**.
The round-7 version made +49% that year. One year is noisy (a Sharpe estimate over 12 months is roughly ±1). Over all
6.7 years the broader ensemble is ahead and steadier, and breadth and ensembling are standard ways to reduce noise
rather than tuned parameters.

## Rejected
- Pattern-guided sizing of the Signal Composite: Sharpe 1.93–1.99 vs 2.00 ([patternsize](RESULTS-round8-patternsize.md)).
  The pattern edge works best as its own sleeve.
- Market-aware mix (more account in trends, more sleeves in chop): best 2.26 vs 2.21 static, within noise
  ([mix](RESULTS-round8-mix.md)).

## The whole portfolio ([portfolio](RESULTS-round8-portfolio.md))
The mix was picked on research years only (best Sharpe with every year positive): **40% Signal Composite account, 20% weekly
momentum, 40% Pattern basket**. Sharpe 2.28, +81%/yr at 1% risk, max drawdown 25%.

| 2020 | 2021 | 2022 (bear) | 2023 | 2024 | 2025 to Sep | Locked year |
|---|---|---|---|---|---|---|
| +132% | +152% | +14% | +111% | +107% | +2% | +92% (DD 15%) |

## Risk dial
The account is re-simulated at each risk level, and the sleeves are scaled by the same multiple. The bootstrap uses
5,000 one-year paths built from 20-day blocks.

| Risk / trade | CAGR 2020–25 | Worst DD | Locked year | 50%+ drawdown within a year |
|---|---|---|---|---|
| 0.5% | +38% | 14% | +45% | 0.0% |
| 1% | +81% | 25% | +92% | 0.0% |
| 1.5% | +129% | 34% | +141% | 0.1% |
| 2% | +184% | 42% | +192% | 0.4% |
| 3% | +308% | 55% | +297% | 7.5% |

These are backtests on today's top coins with ideal fills, so real results will be lower. Choppy years (2022, 2025)
are the weak spots whatever the mix.

## Jev
Not tested yet: `TYPESAFE_API_KEY` is only set in Vercel. With the key in the research environment,
`research/jev-eval.ts` measures whether Jev's verdicts improve trades out of sample before Jev is allowed to decide
anything.
