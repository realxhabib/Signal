# Overfitting checks — Signal Composite, 20 coins, 4h

## 1. Parameter sensitivity (one setting changed at a time; all else default)

| Setting | Value | Trades | Win | PF | Total R | Coins profitable |
|---|---|---|---|---|---|---|
| supertrend.stMult | 2 | 3110 | 52.4% | 1.39 | 375 | 19/20 |
| supertrend.stMult | 2.5 | 2906 | 54.4% | 1.47 | 424 | 19/20 |
| supertrend.stMult | 3 **(default)** | 2787 | 57.1% | 1.65 | 542 | 19/20 |
| supertrend.stMult | 3.5 | 2775 | 58.2% | 1.53 | 426 | 16/20 |
| supertrend.stMult | 4 | 2755 | 58.7% | 1.55 | 425 | 13/20 |
| supertrend.stLen | 7 | 2795 | 57.1% | 1.41 | 337 | 17/20 |
| supertrend.stLen | 10 | 2801 | 57.4% | 1.44 | 366 | 17/20 |
| supertrend.stLen | 14 **(default)** | 2787 | 57.1% | 1.65 | 542 | 19/20 |
| supertrend.stLen | 20 | 2815 | 56.4% | 1.53 | 457 | 18/20 |
| supertrend.stLen | 30 | 2847 | 55.8% | 1.51 | 441 | 20/20 |
| supertrend.trendLen | 50 | 3106 | 52.9% | 1.41 | 388 | 17/20 |
| supertrend.trendLen | 100 **(default)** | 2787 | 57.1% | 1.65 | 542 | 19/20 |
| supertrend.trendLen | 150 | 2738 | 57.2% | 1.65 | 545 | 18/20 |
| supertrend.trendLen | 200 | 2721 | 56.6% | 1.62 | 526 | 17/20 |
| rsi2-pullback.rsiEntry | 5 | 2068 | 52.3% | 1.71 | 513 | 19/20 |
| rsi2-pullback.rsiEntry | 10 **(default)** | 2787 | 57.1% | 1.65 | 542 | 19/20 |
| rsi2-pullback.rsiEntry | 15 | 3572 | 60.5% | 1.58 | 545 | 18/20 |
| rsi2-pullback.rsiEntry | 20 | 4396 | 63.3% | 1.54 | 559 | 18/20 |
| rsi2-pullback.exitLen | 5 | 2927 | 59.4% | 1.71 | 561 | 18/20 |
| rsi2-pullback.exitLen | 10 **(default)** | 2787 | 57.1% | 1.65 | 542 | 19/20 |
| rsi2-pullback.exitLen | 15 | 2817 | 57.5% | 1.66 | 542 | 18/20 |
| rsi2-pullback.trendLen | 50 | 2577 | 56.2% | 1.68 | 542 | 19/20 |
| rsi2-pullback.trendLen | 100 **(default)** | 2787 | 57.1% | 1.65 | 542 | 19/20 |
| rsi2-pullback.trendLen | 200 | 3086 | 58.2% | 1.60 | 534 | 18/20 |
| band-reversion.bbMult | 1.5 | 2957 | 58.0% | 1.61 | 544 | 17/20 |
| band-reversion.bbMult | 2 **(default)** | 2787 | 57.1% | 1.65 | 542 | 19/20 |
| band-reversion.bbMult | 2.5 | 2683 | 55.4% | 1.69 | 539 | 19/20 |
| band-reversion.bbMult | 3 | 2603 | 54.2% | 1.68 | 511 | 19/20 |
| band-reversion.maxBars | 10 | 2822 | 56.0% | 1.65 | 536 | 18/20 |
| band-reversion.maxBars | 15 **(default)** | 2787 | 57.1% | 1.65 | 542 | 19/20 |
| band-reversion.maxBars | 30 | 2769 | 58.1% | 1.68 | 561 | 18/20 |
| stopAtr | 2 | 2788 | 53.0% | 1.57 | 671 | 16/20 |
| stopAtr | 2.5 | 2788 | 55.8% | 1.61 | 591 | 17/20 |
| stopAtr | 3 **(default)** | 2787 | 57.1% | 1.65 | 542 | 19/20 |
| stopAtr | 3.5 | 2787 | 57.3% | 1.63 | 458 | 19/20 |
| stopAtr | 4 | 2787 | 57.5% | 1.65 | 409 | 18/20 |
| gate | 0 | 2764 | 57.5% | 1.65 | 543 | 19/20 |
| gate | 1 **(default)** | 2787 | 57.1% | 1.65 | 542 | 19/20 |
| gate | 2 | 3193 | 41.0% | 1.57 | 389 | 18/20 |

## 2. Probability of Backtest Overfitting (CSCV)

189 line-ups (63 strategy subsets × 3 regime gates), 85 months split into 16 blocks, 12870 train/test combinations. For each, the best line-up on the train half is ranked on the test half.

**PBO = 30.4%** — the probability that the best in-sample line-up ranks below the median out-of-sample (under 50% means selection adds value; the lower the better). Median logit rank: 0.41.

## 3. Deflated Sharpe Ratio

Chosen line-up (Supertrend + RSI(2) + band reversion, gate: not bearish): monthly Sharpe 0.294 (≈ 1.02 annualised on R), skew 2.74, kurtosis 11.52, 85 months.

| Trials assumed | Sharpe needed by luck alone (monthly) | Probability the edge is real (DSR) |
|---|---|---|
| 189 (this search) | 0.333 | **28.8%** |
| 1000 (conservative: everything tried in this project) | 0.395 | **7.4%** |

**Context.** Probability the chosen line-up's edge is above zero (Probabilistic Sharpe, no selection penalty): **>99.99%**. Line-ups in the search space with positive total return: **176/189**. The DSR asks whether *choosing* this exact line-up beats the luckiest of many; since almost the whole family is profitable, the edge belongs to the approach (trend-following plus buying dips inside uptrends) rather than to this particular pick. The strongest independent evidence is cross-asset: the composite was designed on BTC/ETH/SOL and was profitable on 16 of the 17 other coins.
