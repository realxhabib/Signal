# Quant condition mining — walk-forward frontier

Generated 2026-09-24. ~80 causal conditions (regime, daily trend, Supertrend, RSI, z-score,
momentum, drawdown, volatility regime, Bollinger width, variance ratio, efficiency ratio, skew, autocorrelation, volume
z-score, candle shape, day, session, moon phase). Rules = single conditions, pairs, and triples grown from the best pairs.
Rules are selected on all data before each 6-month test window (Wilson 95% lower bound of the train win rate ≥ target,
up to 10 rules, preferring those that fire most often), then traded on the unseen window with the real backtester
(next-open fills, limit-order fees, funding, one position at a time). **Every trade below is out-of-sample.**

## Pooled across BTC, ETH, SOL (sums per-asset trades/year)

| Profile / TF / target | OOS trades | Trades / year | OOS win rate | PF | Avg R |
|---|---|---|---|---|---|
| symmetric 4h ≥55% | 3908 | 213.0 | 51.2% | 1.05 | 0.02 |
| symmetric 4h ≥60% | 2654 | 144.7 | 52.1% | 1.09 | 0.04 |
| symmetric 4h ≥65% | 1698 | 92.6 | 52.8% | 1.11 | 0.05 |
| symmetric 4h ≥70% | 895 | 48.8 | 51.5% | 1.12 | 0.05 |
| symmetric 4h ≥75% | 244 | 13.3 | 48.0% | 0.88 | -0.06 |
| symmetric 4h ≥80% | 0 | 0.0 | 0.0% | 0.00 | 0.00 |
| symmetric 4h ≥85% | 0 | 0.0 | 0.0% | 0.00 | 0.00 |
| symmetric 1h ≥55% | 10683 | 582.3 | 50.4% | 0.95 | -0.02 |
| symmetric 1h ≥60% | 5029 | 274.1 | 51.2% | 0.99 | -0.01 |
| symmetric 1h ≥65% | 2924 | 159.4 | 51.0% | 0.97 | -0.02 |
| symmetric 1h ≥70% | 702 | 38.3 | 52.6% | 1.04 | 0.02 |
| symmetric 1h ≥75% | 78 | 4.3 | 53.8% | 1.08 | 0.04 |
| symmetric 1h ≥80% | 0 | 0.0 | 0.0% | 0.00 | 0.00 |
| symmetric 1h ≥85% | 0 | 0.0 | 0.0% | 0.00 | 0.00 |
| symmetric 1d ≥55% | 990 | 54.0 | 48.3% | 0.96 | -0.02 |
| symmetric 1d ≥60% | 732 | 39.9 | 49.9% | 0.98 | -0.01 |
| symmetric 1d ≥65% | 638 | 34.8 | 51.6% | 1.06 | 0.02 |
| symmetric 1d ≥70% | 515 | 28.1 | 51.7% | 1.05 | 0.02 |
| symmetric 1d ≥75% | 270 | 14.7 | 43.3% | 0.74 | -0.13 |
| symmetric 1d ≥80% | 130 | 7.1 | 43.1% | 0.75 | -0.12 |
| symmetric 1d ≥85% | 8 | 0.4 | 37.5% | 0.66 | -0.19 |
| high-hit 4h ≥55% | 29 | 1.6 | 75.9% | 1.63 | 0.14 |
| high-hit 4h ≥60% | 1075 | 58.6 | 63.1% | 0.97 | -0.01 |
| high-hit 4h ≥65% | 5308 | 289.3 | 62.1% | 0.94 | -0.02 |
| high-hit 4h ≥70% | 3384 | 184.5 | 64.4% | 1.05 | 0.02 |
| high-hit 4h ≥75% | 1909 | 104.1 | 63.8% | 1.02 | 0.01 |
| high-hit 4h ≥80% | 1018 | 55.5 | 62.2% | 0.99 | -0.00 |
| high-hit 4h ≥85% | 47 | 2.6 | 57.4% | 0.75 | -0.09 |
| high-hit 1h ≥55% | 0 | 0.0 | 0.0% | 0.00 | 0.00 |
| high-hit 1h ≥60% | 0 | 0.0 | 0.0% | 0.00 | 0.00 |
| high-hit 1h ≥65% | 16356 | 891.5 | 65.2% | 0.91 | -0.03 |
| high-hit 1h ≥70% | 11690 | 637.2 | 66.2% | 0.98 | -0.01 |
| high-hit 1h ≥75% | 5209 | 283.9 | 67.6% | 1.02 | 0.01 |
| high-hit 1h ≥80% | 2126 | 115.9 | 66.3% | 0.97 | -0.01 |
| high-hit 1h ≥85% | 281 | 15.3 | 69.4% | 1.09 | 0.03 |
| high-hit 1d ≥55% | 295 | 16.1 | 59.7% | 0.91 | -0.03 |
| high-hit 1d ≥60% | 1255 | 68.5 | 61.0% | 0.95 | -0.02 |
| high-hit 1d ≥65% | 1147 | 62.6 | 60.1% | 0.90 | -0.03 |
| high-hit 1d ≥70% | 836 | 45.6 | 60.3% | 0.94 | -0.02 |
| high-hit 1d ≥75% | 638 | 34.8 | 62.5% | 1.01 | 0.00 |
| high-hit 1d ≥80% | 502 | 27.4 | 63.5% | 0.99 | -0.00 |
| high-hit 1d ≥85% | 165 | 9.0 | 56.4% | 0.76 | -0.08 |

## Per asset

### BTCUSDT 4h — symmetric (stop 1.5 ATR, target 1.5 ATR, max 12 bars; break-even win rate ≈ 50% before costs)

| Target win rate (train) | OOS trades | Trades / year | OOS win rate | PF | Avg R | Features used most |
|---|---|---|---|---|---|---|
| ≥55% | 1240 | 174.4 | 52.4% | 1.04 | 0.02 | regime, supertrend, rsi14, moon |
| ≥60% | 953 | 134.0 | 51.4% | 1.03 | 0.01 | regime, drawdown90, supertrend, bb-width |
| ≥65% | 666 | 93.7 | 52.3% | 1.08 | 0.03 | regime, bb-width, moon, drawdown90 |
| ≥70% | 315 | 44.3 | 51.7% | 1.16 | 0.06 | regime, bb-width, volatility, drawdown90 |
| ≥75% | 93 | 13.1 | 55.9% | 1.24 | 0.09 | regime, bb-width, moon, momentum20 |
| ≥80% | 0 | 0.0 | 0.0% | 0.00 | 0.00 |  |
| ≥85% | 0 | 0.0 | 0.0% | 0.00 | 0.00 |  |

### ETHUSDT 4h — symmetric (stop 1.5 ATR, target 1.5 ATR, max 12 bars; break-even win rate ≈ 50% before costs)

| Target win rate (train) | OOS trades | Trades / year | OOS win rate | PF | Avg R | Features used most |
|---|---|---|---|---|---|---|
| ≥55% | 1606 | 225.9 | 50.6% | 1.05 | 0.02 | supertrend, regime, daily, momentum20 |
| ≥60% | 1029 | 144.7 | 53.4% | 1.17 | 0.07 | regime, momentum20, supertrend, rsi14 |
| ≥65% | 678 | 95.4 | 52.7% | 1.12 | 0.05 | moon, regime, drawdown90, skew50 |
| ≥70% | 356 | 50.1 | 50.8% | 1.10 | 0.04 | day, moon, regime, supertrend |
| ≥75% | 121 | 17.0 | 40.5% | 0.65 | -0.19 | drawdown90, daily, skew50, day |
| ≥80% | 0 | 0.0 | 0.0% | 0.00 | 0.00 |  |
| ≥85% | 0 | 0.0 | 0.0% | 0.00 | 0.00 |  |

### SOLUSDT 4h — symmetric (stop 1.5 ATR, target 1.5 ATR, max 12 bars; break-even win rate ≈ 50% before costs)

| Target win rate (train) | OOS trades | Trades / year | OOS win rate | PF | Avg R | Features used most |
|---|---|---|---|---|---|---|
| ≥55% | 1062 | 257.5 | 50.6% | 1.05 | 0.02 | moon, supertrend, variance-ratio, rsi14 |
| ≥60% | 672 | 162.9 | 51.0% | 1.05 | 0.02 | moon, skew50, regime, variance-ratio |
| ≥65% | 354 | 85.8 | 54.2% | 1.16 | 0.06 | moon, volatility, autocorr, efficiency |
| ≥70% | 224 | 54.3 | 52.2% | 1.09 | 0.04 | moon, volatility, daily, variance-ratio |
| ≥75% | 30 | 7.3 | 53.3% | 1.09 | 0.03 | moon, bb-width, supertrend, regime |
| ≥80% | 0 | 0.0 | 0.0% | 0.00 | 0.00 |  |
| ≥85% | 0 | 0.0 | 0.0% | 0.00 | 0.00 |  |

### BTCUSDT 1h — symmetric (stop 1.5 ATR, target 1.5 ATR, max 24 bars; break-even win rate ≈ 50% before costs)

| Target win rate (train) | OOS trades | Trades / year | OOS win rate | PF | Avg R | Features used most |
|---|---|---|---|---|---|---|
| ≥55% | 4398 | 618.5 | 50.1% | 0.94 | -0.03 | supertrend, regime, variance-ratio, skew50 |
| ≥60% | 1993 | 280.3 | 50.4% | 0.94 | -0.03 | day, regime, supertrend, variance-ratio |
| ≥65% | 1161 | 163.3 | 48.8% | 0.88 | -0.06 | day, regime, moon, supertrend |
| ≥70% | 357 | 50.2 | 49.6% | 0.91 | -0.04 | day, regime, supertrend, drawdown90 |
| ≥75% | 34 | 4.8 | 47.1% | 0.79 | -0.12 | rsi14, day, drawdown90, daily |
| ≥80% | 0 | 0.0 | 0.0% | 0.00 | 0.00 |  |
| ≥85% | 0 | 0.0 | 0.0% | 0.00 | 0.00 |  |

### ETHUSDT 1h — symmetric (stop 1.5 ATR, target 1.5 ATR, max 24 bars; break-even win rate ≈ 50% before costs)

| Target win rate (train) | OOS trades | Trades / year | OOS win rate | PF | Avg R | Features used most |
|---|---|---|---|---|---|---|
| ≥55% | 3606 | 507.1 | 50.5% | 0.96 | -0.02 | daily, efficiency, day, rsi14 |
| ≥60% | 1798 | 252.8 | 51.1% | 0.99 | -0.01 | daily, day, skew50, variance-ratio |
| ≥65% | 1139 | 160.2 | 51.9% | 1.00 | 0.00 | daily, day, moon, skew50 |
| ≥70% | 199 | 28.0 | 54.3% | 1.12 | 0.05 | moon, day, volatility, drawdown90 |
| ≥75% | 32 | 4.5 | 59.4% | 1.44 | 0.16 | drawdown90, daily, day, regime |
| ≥80% | 0 | 0.0 | 0.0% | 0.00 | 0.00 |  |
| ≥85% | 0 | 0.0 | 0.0% | 0.00 | 0.00 |  |

### SOLUSDT 1h — symmetric (stop 1.5 ATR, target 1.5 ATR, max 24 bars; break-even win rate ≈ 50% before costs)

| Target win rate (train) | OOS trades | Trades / year | OOS win rate | PF | Avg R | Features used most |
|---|---|---|---|---|---|---|
| ≥55% | 2679 | 649.5 | 50.5% | 0.97 | -0.02 | volatility, moon, rsi14, supertrend |
| ≥60% | 1238 | 300.2 | 52.5% | 1.05 | 0.03 | moon, volatility, bb-width, daily |
| ≥65% | 624 | 151.3 | 53.4% | 1.07 | 0.03 | moon, bb-width, volatility, autocorr |
| ≥70% | 146 | 35.4 | 57.5% | 1.26 | 0.11 | moon, variance-ratio, volatility, autocorr |
| ≥75% | 12 | 2.9 | 58.3% | 1.30 | 0.13 | volatility, moon, regime |
| ≥80% | 0 | 0.0 | 0.0% | 0.00 | 0.00 |  |
| ≥85% | 0 | 0.0 | 0.0% | 0.00 | 0.00 |  |

### BTCUSDT 1d — symmetric (stop 1.5 ATR, target 1.5 ATR, max 10 bars; break-even win rate ≈ 50% before costs)

| Target win rate (train) | OOS trades | Trades / year | OOS win rate | PF | Avg R | Features used most |
|---|---|---|---|---|---|---|
| ≥55% | 368 | 51.8 | 51.1% | 1.04 | 0.01 | supertrend, autocorr, drawdown90, moon |
| ≥60% | 300 | 42.2 | 52.0% | 1.08 | 0.03 | supertrend, drawdown90, autocorr, regime |
| ≥65% | 230 | 32.4 | 50.9% | 0.96 | -0.02 | drawdown90, supertrend, autocorr, volume-z |
| ≥70% | 183 | 25.7 | 50.8% | 1.02 | 0.01 | drawdown90, supertrend, autocorr, moon |
| ≥75% | 107 | 15.1 | 41.1% | 0.71 | -0.15 | drawdown90, autocorr, supertrend, volume-z |
| ≥80% | 75 | 10.6 | 37.3% | 0.59 | -0.23 | autocorr, drawdown90, supertrend, zscore20 |
| ≥85% | 6 | 0.8 | 50.0% | 0.95 | -0.02 | zscore20, drawdown90, supertrend |

### ETHUSDT 1d — symmetric (stop 1.5 ATR, target 1.5 ATR, max 10 bars; break-even win rate ≈ 50% before costs)

| Target win rate (train) | OOS trades | Trades / year | OOS win rate | PF | Avg R | Features used most |
|---|---|---|---|---|---|---|
| ≥55% | 399 | 56.1 | 45.1% | 0.88 | -0.05 | supertrend, skew50, rsi14, variance-ratio |
| ≥60% | 295 | 41.5 | 49.5% | 0.98 | -0.01 | autocorr, variance-ratio, rsi14, skew50 |
| ≥65% | 240 | 33.8 | 49.6% | 1.02 | 0.01 | autocorr, variance-ratio, regime, rsi14 |
| ≥70% | 238 | 33.5 | 51.3% | 1.03 | 0.01 | bb-width, drawdown90, variance-ratio, autocorr |
| ≥75% | 135 | 19.0 | 42.2% | 0.69 | -0.16 | bb-width, skew50, rsi14, variance-ratio |
| ≥80% | 55 | 7.7 | 50.9% | 1.06 | 0.02 | bb-width, regime, rsi14, autocorr |
| ≥85% | 2 | 0.3 | 0.0% | 0.00 | -0.69 | rsi14, skew50, regime |

### SOLUSDT 1d — symmetric (stop 1.5 ATR, target 1.5 ATR, max 10 bars; break-even win rate ≈ 50% before costs)

| Target win rate (train) | OOS trades | Trades / year | OOS win rate | PF | Avg R | Features used most |
|---|---|---|---|---|---|---|
| ≥55% | 223 | 54.1 | 49.3% | 0.98 | -0.01 | supertrend, moon, rsi14, regime |
| ≥60% | 137 | 33.2 | 46.0% | 0.79 | -0.10 | supertrend, volatility, bb-width, moon |
| ≥65% | 168 | 40.8 | 55.4% | 1.25 | 0.10 | regime, moon, supertrend, skew50 |
| ≥70% | 94 | 22.8 | 54.3% | 1.14 | 0.06 | rsi14, volatility, supertrend, moon |
| ≥75% | 28 | 6.8 | 57.1% | 1.28 | 0.11 | rsi14, volatility, supertrend, skew50 |
| ≥80% | 0 | 0.0 | 0.0% | 0.00 | 0.00 |  |
| ≥85% | 0 | 0.0 | 0.0% | 0.00 | 0.00 |  |

### BTCUSDT 4h — high-hit (stop 2 ATR, target 1 ATR, max 12 bars; break-even win rate ≈ 67% before costs)

| Target win rate (train) | OOS trades | Trades / year | OOS win rate | PF | Avg R | Features used most |
|---|---|---|---|---|---|---|
| ≥55% | 0 | 0.0 | 0.0% | 0.00 | 0.00 |  |
| ≥60% | 348 | 48.9 | 62.4% | 0.89 | -0.04 | moon, volume-z, variance-ratio, supertrend |
| ≥65% | 1815 | 255.3 | 63.0% | 0.96 | -0.01 | regime, supertrend, moon, volume-z |
| ≥70% | 1038 | 146.0 | 64.1% | 0.98 | -0.00 | regime, moon, efficiency, supertrend |
| ≥75% | 759 | 106.7 | 63.9% | 1.02 | 0.01 | regime, moon, bb-width, drawdown90 |
| ≥80% | 425 | 59.8 | 61.2% | 0.95 | -0.02 | regime, bb-width, moon, volatility |
| ≥85% | 18 | 2.5 | 61.1% | 0.85 | -0.05 | volatility, moon, regime, bb-width |

### ETHUSDT 4h — high-hit (stop 2 ATR, target 1 ATR, max 12 bars; break-even win rate ≈ 67% before costs)

| Target win rate (train) | OOS trades | Trades / year | OOS win rate | PF | Avg R | Features used most |
|---|---|---|---|---|---|---|
| ≥55% | 29 | 4.1 | 75.9% | 1.63 | 0.14 | supertrend, down-closes |
| ≥60% | 296 | 41.6 | 61.8% | 0.97 | -0.01 | supertrend, moon, volume-z, variance-ratio |
| ≥65% | 1980 | 278.5 | 61.4% | 0.93 | -0.02 | regime, supertrend, variance-ratio, daily |
| ≥70% | 1380 | 194.1 | 64.7% | 1.10 | 0.03 | regime, supertrend, momentum20, efficiency |
| ≥75% | 707 | 99.4 | 62.4% | 0.98 | -0.01 | moon, regime, supertrend, day |
| ≥80% | 331 | 46.6 | 60.1% | 0.88 | -0.04 | moon, day, regime, supertrend |
| ≥85% | 18 | 2.5 | 44.4% | 0.46 | -0.26 | moon, daily, skew50, volatility |

### SOLUSDT 4h — high-hit (stop 2 ATR, target 1 ATR, max 12 bars; break-even win rate ≈ 67% before costs)

| Target win rate (train) | OOS trades | Trades / year | OOS win rate | PF | Avg R | Features used most |
|---|---|---|---|---|---|---|
| ≥55% | 0 | 0.0 | 0.0% | 0.00 | 0.00 |  |
| ≥60% | 431 | 104.5 | 64.5% | 1.04 | 0.01 | moon, volume-z, variance-ratio, skew50 |
| ≥65% | 1513 | 366.9 | 62.1% | 0.93 | -0.02 | supertrend, variance-ratio, moon, autocorr |
| ≥70% | 966 | 234.2 | 64.3% | 1.07 | 0.02 | moon, skew50, variance-ratio, regime |
| ≥75% | 443 | 107.4 | 65.9% | 1.08 | 0.02 | moon, skew50, supertrend, volatility |
| ≥80% | 262 | 63.5 | 66.4% | 1.28 | 0.07 | volatility, skew50, autocorr, moon |
| ≥85% | 11 | 2.7 | 72.7% | 1.54 | 0.11 | supertrend, skew50, regime, bb-width |

### BTCUSDT 1h — high-hit (stop 2 ATR, target 1 ATR, max 24 bars; break-even win rate ≈ 67% before costs)

| Target win rate (train) | OOS trades | Trades / year | OOS win rate | PF | Avg R | Features used most |
|---|---|---|---|---|---|---|
| ≥55% | 0 | 0.0 | 0.0% | 0.00 | 0.00 |  |
| ≥60% | 0 | 0.0 | 0.0% | 0.00 | 0.00 |  |
| ≥65% | 2212 | 311.1 | 65.1% | 0.87 | -0.04 | supertrend, moon, down-closes, volume-z |
| ≥70% | 4415 | 620.9 | 65.8% | 0.95 | -0.01 | supertrend, bb-width, regime, skew50 |
| ≥75% | 2070 | 291.1 | 67.1% | 0.99 | -0.00 | autocorr, supertrend, day, regime |
| ≥80% | 881 | 123.9 | 65.6% | 0.92 | -0.03 | moon, day, drawdown90, autocorr |
| ≥85% | 125 | 17.6 | 68.0% | 1.03 | 0.01 | moon, drawdown90, autocorr, skew50 |

### ETHUSDT 1h — high-hit (stop 2 ATR, target 1 ATR, max 24 bars; break-even win rate ≈ 67% before costs)

| Target win rate (train) | OOS trades | Trades / year | OOS win rate | PF | Avg R | Features used most |
|---|---|---|---|---|---|---|
| ≥55% | 0 | 0.0 | 0.0% | 0.00 | 0.00 |  |
| ≥60% | 0 | 0.0 | 0.0% | 0.00 | 0.00 |  |
| ≥65% | 8011 | 1126.6 | 64.6% | 0.90 | -0.04 | volume-z, variance-ratio, autocorr, down-closes |
| ≥70% | 4277 | 601.5 | 66.6% | 1.00 | 0.00 | daily, day, supertrend, efficiency |
| ≥75% | 1998 | 281.0 | 67.0% | 1.00 | 0.00 | day, skew50, autocorr, daily |
| ≥80% | 726 | 102.1 | 65.0% | 0.92 | -0.03 | day, moon, daily, skew50 |
| ≥85% | 121 | 17.0 | 69.4% | 1.08 | 0.02 | daily, day, supertrend, skew50 |

### SOLUSDT 1h — high-hit (stop 2 ATR, target 1 ATR, max 24 bars; break-even win rate ≈ 67% before costs)

| Target win rate (train) | OOS trades | Trades / year | OOS win rate | PF | Avg R | Features used most |
|---|---|---|---|---|---|---|
| ≥55% | 0 | 0.0 | 0.0% | 0.00 | 0.00 |  |
| ≥60% | 0 | 0.0 | 0.0% | 0.00 | 0.00 |  |
| ≥65% | 6133 | 1487.0 | 66.1% | 0.95 | -0.02 | supertrend, volume-z, moon, variance-ratio |
| ≥70% | 2998 | 726.9 | 66.1% | 0.98 | -0.01 | moon, volatility, supertrend, bb-width |
| ≥75% | 1141 | 276.6 | 69.3% | 1.10 | 0.03 | moon, volatility, bb-width, variance-ratio |
| ≥80% | 519 | 125.8 | 69.4% | 1.14 | 0.04 | moon, bb-width, volatility, variance-ratio |
| ≥85% | 35 | 8.5 | 74.3% | 1.45 | 0.11 | moon, bb-width, daily, volatility |

### BTCUSDT 1d — high-hit (stop 2 ATR, target 1 ATR, max 10 bars; break-even win rate ≈ 67% before costs)

| Target win rate (train) | OOS trades | Trades / year | OOS win rate | PF | Avg R | Features used most |
|---|---|---|---|---|---|---|
| ≥55% | 114 | 16.0 | 66.7% | 1.30 | 0.07 | moon, volume-z, down-closes, supertrend |
| ≥60% | 522 | 73.5 | 63.4% | 1.03 | 0.01 | autocorr, supertrend, down-closes, moon |
| ≥65% | 428 | 60.2 | 61.7% | 0.95 | -0.01 | supertrend, autocorr, drawdown90, regime |
| ≥70% | 308 | 43.3 | 63.0% | 1.06 | 0.02 | drawdown90, supertrend, autocorr, volume-z |
| ≥75% | 250 | 35.2 | 64.4% | 1.02 | 0.01 | drawdown90, supertrend, autocorr, volume-z |
| ≥80% | 184 | 25.9 | 65.8% | 1.09 | 0.02 | supertrend, drawdown90, autocorr, variance-ratio |
| ≥85% | 84 | 11.8 | 56.0% | 0.74 | -0.09 | autocorr, drawdown90, regime, supertrend |

### ETHUSDT 1d — high-hit (stop 2 ATR, target 1 ATR, max 10 bars; break-even win rate ≈ 67% before costs)

| Target win rate (train) | OOS trades | Trades / year | OOS win rate | PF | Avg R | Features used most |
|---|---|---|---|---|---|---|
| ≥55% | 159 | 22.4 | 57.2% | 0.77 | -0.08 | moon, supertrend, volume-z, variance-ratio |
| ≥60% | 503 | 70.8 | 56.5% | 0.81 | -0.06 | volume-z, down-closes, skew50, autocorr |
| ≥65% | 439 | 61.8 | 58.8% | 0.88 | -0.04 | supertrend, regime, skew50, variance-ratio |
| ≥70% | 319 | 44.9 | 60.2% | 0.92 | -0.02 | autocorr, regime, supertrend, variance-ratio |
| ≥75% | 224 | 31.5 | 62.1% | 1.06 | 0.02 | autocorr, regime, volatility, variance-ratio |
| ≥80% | 197 | 27.7 | 64.0% | 1.02 | 0.00 | volatility, rsi14, efficiency, autocorr |
| ≥85% | 62 | 8.7 | 53.2% | 0.64 | -0.13 | volatility, regime, rsi14, variance-ratio |

### SOLUSDT 1d — high-hit (stop 2 ATR, target 1 ATR, max 10 bars; break-even win rate ≈ 67% before costs)

| Target win rate (train) | OOS trades | Trades / year | OOS win rate | PF | Avg R | Features used most |
|---|---|---|---|---|---|---|
| ≥55% | 22 | 5.3 | 40.9% | 0.51 | -0.19 | skew50, moon, supertrend, zscore20 |
| ≥60% | 230 | 55.8 | 65.7% | 1.12 | 0.03 | skew50, autocorr, supertrend, volume-z |
| ≥65% | 280 | 68.0 | 59.6% | 0.87 | -0.04 | supertrend, moon, skew50, autocorr |
| ≥70% | 209 | 50.7 | 56.5% | 0.81 | -0.06 | supertrend, moon, variance-ratio, autocorr |
| ≥75% | 164 | 39.8 | 60.4% | 0.94 | -0.02 | supertrend, variance-ratio, moon, regime |
| ≥80% | 121 | 29.4 | 59.5% | 0.81 | -0.06 | rsi14, supertrend, volatility, drawdown90 |
| ≥85% | 19 | 4.6 | 68.4% | 1.60 | 0.13 | rsi14, volatility, supertrend, skew50 |
