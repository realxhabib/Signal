# Round 7 · Our own patterns and structural edges

Goal: find edges that come from the data itself, not from indicators everyone watches. Everything was scored on
the research years (to 2025-09-24) with market-order or limit-order fees; 36+ variants are in `trials.json`. The one
finalist got a single look at the locked final year.

| Idea | Best research-years result | Verdict | Details |
|---|---|---|---|
| **Pattern library** (k-means on 24-bar chart shapes + Bitcoin's shape, volume, range; scored on past data only; re-learned every 6 months) | Sharpe 1.20 (staggered 3-day hold, limit fees); 1.21 with 64 patterns | **Shipped** as the 🧩 Pattern basket | [patterns](RESULTS-round7-patterns.md), [slow](RESULTS-round7-patterns-slow.md) |
| Genetic programming (evolved formulas, 2 walk-forward folds, 3 random seeds) | Unseen-years Sharpe 1.43 / 1.20 / 0.71 | Rejected: too seed-dependent (own edge t = 0.8–1.8) | [gp 7](RESULTS-round7-gp-7.md), [11](RESULTS-round7-gp-11.md), [23](RESULTS-round7-gp-23.md) |
| Residual (beta-adjusted) momentum, market neutral | Sharpe 1.03–1.25 across 7 settings | Robust but 0.68 correlated with the existing momentum sleeve (own edge t ≤ 1.7): redundant | [resmom](RESULTS-round7-resmom.md) |
| Bitcoin → altcoin lead-lag (1h) | Sharpe ≤ 0.02 | No edge: alts react within the hour | [structural](RESULTS-round7-structural.md) |
| Residual reversal (1–42 bars) | Sharpe −1.1 to −2.0 | Wrong way round: idiosyncratic moves persist | [structural](RESULTS-round7-structural.md) |
| Liquidation flush (price shock + open-interest drop), 20 coins | Sharpe ≤ 0.25 | No edge after fees | [liquidity](RESULTS-round7-liquidity.md) |
| Stablecoin supply growth / Deribit DVOL / implied-minus-realised vol as long filters | −0.20 to +0.04 Sharpe vs baseline | No edge | [liquidity](RESULTS-round7-liquidity.md) |

**What the finalist adds** ([incremental](RESULTS-round7-incremental.md)): correlation with the momentum sleeve 0.16
and with the account 0.06–0.08. Its own edge, after controlling for both, is ≈ +16%/yr (t 2.4). Moving 10% of
capital into it lifted the mix's Sharpe from 2.10 to 2.15.

**Practical version and the locked year.** The staggered version re-weights every 4h. The shipped version trades
once a day to the average of the last 3 days of signals:

| Version | Research years (2020 → Sep 2025) | Locked final year |
|---|---|---|
| Staggered, every 4h, limit fees | Sharpe 1.20, +20%/yr, DD 20% | +55%, Sharpe 2.39, DD 10% |
| **Daily rebalance, limit fees (shipped)** | Sharpe 0.86, +13%/yr, DD 23% | **+49%, Sharpe 2.22, DD 11%** |
| Daily rebalance, market fees | Sharpe 0.64, +9%/yr, DD 26% | +44%, Sharpe 2.02, DD 11% |
| Whole basket reset every 3 days | Sharpe 0.41–0.56 | +54–62%, Sharpe 1.5–1.7 |
| Top 4 / bottom 4 only | Sharpe −0.01 to 0.12 | +27–49% |

The edge lives in the breadth of small, gradually changing bets. Concentrated top-4 picks lose it.

**Caveats.** On the research years alone, a Sharpe of 0.86 among ~40 variants would not pass a Deflated Sharpe
test by itself. The strongest evidence is the locked year it never saw, plus low correlation with everything else.
It ships as an experimental 10% sleeve, and the forward test from 2026-09-25 decides whether it stays.
