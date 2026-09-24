# Walk-forward results

Generated 2026-09-24. Train 730d → test 182d, rolling. Parameters are chosen on the
train window only (needs ≥15 trades, win rate ≥0%, PF ≥1.2, no liquidations); when none
qualify the strategy stands aside. **Every number below is out-of-sample.** Costs: 0.05% fee + 0.02% slippage
per side, 0.01%/8h funding always paid, 5x isolated margin. R = multiples of the initial stop risk.

| Asset | TF | Strategy | OOS trades | Win rate | PF | Avg R | Total R | Max DD (R) | Worst trade (R) | Max losing streak | Liq | Windows traded |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| BTCUSDT | 1d | Trend pullback (RSI 2) | 102 | 68.6% | 1.31 | 0.06 | 6.1 | 3.6 | -1.09 | 4 | 0 | 15/15 |
| BTCUSDT | 1d | Supertrend trend-follow | 0 | 0.0% | 0.00 | 0.00 | 0.0 | 0.0 | 0.00 | 0 | 0 | 0/15 |
| BTCUSDT | 1d | A+ stacked pullback | 0 | 0.0% | 0.00 | 0.00 | 0.0 | 0.0 | 0.00 | 0 | 0 | 0/15 |
| BTCUSDT | 1d | Trend band reversion | 2 | 50.0% | 11.95 | 0.39 | 0.8 | 0.1 | -0.07 | 1 | 0 | 1/15 |
| BTCUSDT | 1d | Trend pullback, fixed target | 18 | 55.6% | 0.51 | -0.23 | -4.1 | 5.6 | -1.11 | 3 | 0 | 5/15 |
| BTCUSDT | 1d | Jurik MA confluence | 99 | 31.3% | 1.27 | 0.13 | 12.8 | 9.2 | -1.07 | 8 | 0 | 15/15 |
| BTCUSDT | 4h | Trend pullback (RSI 2) | 189 | 60.3% | 0.71 | -0.08 | -15.8 | 17.3 | -1.14 | 4 | 0 | 10/15 |
| BTCUSDT | 4h | Supertrend trend-follow | 72 | 33.3% | 1.45 | 0.26 | 18.7 | 12.0 | -1.12 | 9 | 0 | 15/15 |
| BTCUSDT | 4h | A+ stacked pullback | 30 | 56.7% | 0.63 | -0.06 | -1.8 | 2.4 | -1.05 | 3 | 0 | 10/15 |
| BTCUSDT | 4h | Trend band reversion | 81 | 53.1% | 0.75 | -0.09 | -7.2 | 8.4 | -1.10 | 6 | 0 | 9/15 |
| BTCUSDT | 4h | Trend pullback, fixed target | 94 | 66.0% | 0.97 | -0.01 | -0.8 | 8.5 | -1.12 | 4 | 0 | 15/15 |
| BTCUSDT | 4h | Jurik MA confluence | 151 | 35.8% | 1.22 | 0.10 | 15.7 | 17.1 | -1.10 | 12 | 0 | 13/15 |
| BTCUSDT | 1h | Trend pullback (RSI 2) | 214 | 61.2% | 0.96 | -0.01 | -2.0 | 6.1 | -1.12 | 5 | 0 | 8/15 |
| BTCUSDT | 1h | Supertrend trend-follow | 275 | 35.3% | 1.32 | 0.17 | 45.8 | 27.8 | -1.26 | 13 | 0 | 15/15 |
| BTCUSDT | 1h | A+ stacked pullback | 136 | 61.8% | 0.81 | -0.06 | -7.7 | 13.4 | -1.24 | 4 | 0 | 11/15 |
| BTCUSDT | 1h | Trend band reversion | 145 | 58.6% | 0.89 | -0.04 | -5.3 | 12.3 | -1.17 | 6 | 0 | 8/15 |
| BTCUSDT | 1h | Trend pullback, fixed target | 71 | 64.8% | 1.01 | 0.00 | 0.2 | 5.8 | -1.13 | 5 | 0 | 9/15 |
| BTCUSDT | 1h | Jurik MA confluence | 382 | 30.1% | 0.91 | -0.04 | -16.6 | 25.2 | -1.46 | 16 | 0 | 5/15 |
| ETHUSDT | 1d | Trend pullback (RSI 2) | 45 | 66.7% | 1.08 | 0.01 | 0.7 | 3.5 | -1.04 | 2 | 2 | 9/15 |
| ETHUSDT | 1d | Supertrend trend-follow | 0 | 0.0% | 0.00 | 0.00 | 0.0 | 0.0 | 0.00 | 0 | 0 | 0/15 |
| ETHUSDT | 1d | A+ stacked pullback | 0 | 0.0% | 0.00 | 0.00 | 0.0 | 0.0 | 0.00 | 0 | 0 | 0/15 |
| ETHUSDT | 1d | Trend band reversion | 0 | 0.0% | 0.00 | 0.00 | 0.0 | 0.0 | 0.00 | 0 | 0 | 0/15 |
| ETHUSDT | 1d | Trend pullback, fixed target | 12 | 66.7% | 1.08 | 0.03 | 0.3 | 2.0 | -1.07 | 2 | 0 | 4/15 |
| ETHUSDT | 1d | Jurik MA confluence | 87 | 40.2% | 1.41 | 0.17 | 15.2 | 7.7 | -1.07 | 8 | 0 | 14/15 |
| ETHUSDT | 4h | Trend pullback (RSI 2) | 184 | 60.9% | 0.74 | -0.06 | -11.2 | 13.2 | -1.07 | 4 | 0 | 9/15 |
| ETHUSDT | 4h | Supertrend trend-follow | 77 | 36.4% | 2.42 | 0.62 | 47.9 | 10.2 | -1.07 | 9 | 0 | 15/15 |
| ETHUSDT | 4h | A+ stacked pullback | 46 | 54.3% | 0.48 | -0.15 | -6.8 | 7.6 | -1.07 | 4 | 0 | 7/15 |
| ETHUSDT | 4h | Trend band reversion | 74 | 64.9% | 1.22 | 0.07 | 5.3 | 5.1 | -1.08 | 4 | 0 | 13/15 |
| ETHUSDT | 4h | Trend pullback, fixed target | 72 | 51.4% | 0.69 | -0.15 | -10.8 | 13.3 | -1.07 | 6 | 0 | 13/15 |
| ETHUSDT | 4h | Jurik MA confluence | 303 | 36.6% | 1.21 | 0.10 | 30.8 | 24.0 | -1.06 | 9 | 0 | 15/15 |
| ETHUSDT | 1h | Trend pullback (RSI 2) | 326 | 64.4% | 0.99 | -0.00 | -1.2 | 23.6 | -1.13 | 7 | 0 | 7/15 |
| ETHUSDT | 1h | Supertrend trend-follow | 177 | 36.2% | 2.02 | 0.59 | 103.9 | 16.7 | -1.34 | 14 | 0 | 15/15 |
| ETHUSDT | 1h | A+ stacked pullback | 102 | 61.8% | 0.75 | -0.06 | -6.6 | 8.6 | -1.10 | 4 | 0 | 14/15 |
| ETHUSDT | 1h | Trend band reversion | 208 | 59.6% | 0.96 | -0.01 | -2.9 | 12.7 | -1.10 | 5 | 0 | 13/15 |
| ETHUSDT | 1h | Trend pullback, fixed target | 186 | 58.6% | 1.13 | 0.04 | 7.8 | 10.2 | -1.10 | 6 | 0 | 14/15 |
| ETHUSDT | 1h | Jurik MA confluence | 608 | 35.5% | 1.09 | 0.05 | 27.5 | 43.4 | -1.23 | 14 | 0 | 12/15 |
| SOLUSDT | 1d | Trend pullback (RSI 2) | 12 | 50.0% | 0.45 | -0.28 | -3.4 | 4.5 | -1.03 | 2 | 0 | 3/9 |
| SOLUSDT | 1d | Supertrend trend-follow | 0 | 0.0% | 0.00 | 0.00 | 0.0 | 0.0 | 0.00 | 0 | 0 | 0/9 |
| SOLUSDT | 1d | A+ stacked pullback | 0 | 0.0% | 0.00 | 0.00 | 0.0 | 0.0 | 0.00 | 0 | 0 | 0/9 |
| SOLUSDT | 1d | Trend band reversion | 0 | 0.0% | 0.00 | 0.00 | 0.0 | 0.0 | 0.00 | 0 | 0 | 0/9 |
| SOLUSDT | 1d | Trend pullback, fixed target | 1 | 100.0% | ∞ | 0.30 | 0.3 | 0.0 | 0.30 | 0 | 0 | 1/9 |
| SOLUSDT | 1d | Jurik MA confluence | 23 | 43.5% | 2.07 | 0.47 | 10.7 | 3.3 | -1.04 | 4 | 1 | 6/9 |
| SOLUSDT | 4h | Trend pullback (RSI 2) | 233 | 63.9% | 0.91 | -0.02 | -5.1 | 10.6 | -1.07 | 3 | 0 | 9/9 |
| SOLUSDT | 4h | Supertrend trend-follow | 40 | 32.5% | 1.61 | 0.32 | 13.0 | 6.8 | -1.09 | 5 | 0 | 7/9 |
| SOLUSDT | 4h | A+ stacked pullback | 32 | 56.3% | 0.59 | -0.11 | -3.5 | 4.4 | -1.04 | 4 | 0 | 6/9 |
| SOLUSDT | 4h | Trend band reversion | 77 | 63.6% | 1.31 | 0.09 | 7.3 | 6.5 | -1.05 | 7 | 0 | 9/9 |
| SOLUSDT | 4h | Trend pullback, fixed target | 47 | 51.1% | 0.69 | -0.14 | -6.4 | 6.7 | -1.06 | 4 | 0 | 6/9 |
| SOLUSDT | 4h | Jurik MA confluence | 198 | 36.9% | 1.28 | 0.12 | 24.6 | 10.6 | -1.08 | 9 | 0 | 9/9 |
| SOLUSDT | 1h | Trend pullback (RSI 2) | 273 | 63.4% | 1.07 | 0.02 | 5.3 | 11.2 | -1.14 | 4 | 0 | 9/9 |
| SOLUSDT | 1h | Supertrend trend-follow | 86 | 31.4% | 0.86 | -0.08 | -6.7 | 11.5 | -1.10 | 7 | 0 | 8/9 |
| SOLUSDT | 1h | A+ stacked pullback | 60 | 78.3% | 2.18 | 0.11 | 6.4 | 1.3 | -1.04 | 2 | 0 | 9/9 |
| SOLUSDT | 1h | Trend band reversion | 111 | 58.6% | 0.94 | -0.02 | -2.4 | 7.2 | -1.17 | 6 | 0 | 9/9 |
| SOLUSDT | 1h | Trend pullback, fixed target | 81 | 60.5% | 0.71 | -0.11 | -8.9 | 11.6 | -1.17 | 5 | 0 | 9/9 |
| SOLUSDT | 1h | Jurik MA confluence | 621 | 34.9% | 1.19 | 0.08 | 51.2 | 11.2 | -1.12 | 13 | 0 | 8/9 |

## Pooled across assets

| Strategy / TF | Trades | Win rate | PF | Avg R | Total R |
|---|---|---|---|---|---|
| rsi2-pullback 1d | 159 | 66.7% | 1.10 | 0.02 | 3.3 |
| supertrend 1d | 0 | 0.0% | 0.00 | 0.00 | 0.0 |
| stacked-pullback 1d | 0 | 0.0% | 0.00 | 0.00 | 0.0 |
| band-reversion 1d | 2 | 50.0% | 11.95 | 0.39 | 0.8 |
| pullback-scalp 1d | 31 | 61.3% | 0.72 | -0.11 | -3.5 |
| jma-confluence 1d | 209 | 36.4% | 1.41 | 0.19 | 38.7 |
| rsi2-pullback 4h | 606 | 61.9% | 0.79 | -0.05 | -32.2 |
| supertrend 4h | 189 | 34.4% | 1.83 | 0.42 | 79.6 |
| stacked-pullback 4h | 108 | 55.6% | 0.54 | -0.11 | -12.0 |
| band-reversion 4h | 232 | 60.3% | 1.07 | 0.02 | 5.4 |
| pullback-scalp 4h | 213 | 57.7% | 0.78 | -0.08 | -17.9 |
| jma-confluence 4h | 652 | 36.5% | 1.24 | 0.11 | 71.0 |
| rsi2-pullback 1h | 813 | 63.2% | 1.01 | 0.00 | 2.1 |
| supertrend 1h | 538 | 34.9% | 1.49 | 0.27 | 143.0 |
| stacked-pullback 1h | 298 | 65.1% | 0.89 | -0.03 | -7.8 |
| band-reversion 1h | 464 | 59.1% | 0.94 | -0.02 | -10.7 |
| pullback-scalp 1h | 338 | 60.4% | 0.99 | -0.00 | -0.9 |
| jma-confluence 1h | 1611 | 34.0% | 1.08 | 0.04 | 62.2 |

## Parameters chosen per window

### BTCUSDT 1d Trend pullback (RSI 2)
- 2019-08-17: {"trendLen":200,"rsiEntry":15,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":1,"htf":0}
- 2020-02-15: {"trendLen":200,"rsiEntry":15,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":1,"htf":0}
- 2020-08-15: {"trendLen":100,"rsiEntry":15,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":0,"htf":0}
- 2021-02-13: {"trendLen":100,"rsiEntry":15,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":0,"htf":0}
- 2021-08-14: {"trendLen":100,"rsiEntry":15,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":0,"htf":0}
- 2022-02-12: {"trendLen":100,"rsiEntry":15,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":0,"htf":0}
- 2022-08-13: {"trendLen":100,"rsiEntry":15,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":1,"htf":0}
- 2023-02-11: {"trendLen":100,"rsiEntry":15,"exitLen":10,"stopAtr":3,"maxBars":10,"shorts":1,"htf":0}
- 2023-08-12: {"trendLen":200,"rsiEntry":10,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":1,"htf":0}
- 2024-02-10: {"trendLen":200,"rsiEntry":10,"exitLen":5,"stopAtr":2,"maxBars":10,"shorts":1,"htf":0}
- 2024-08-10: {"trendLen":200,"rsiEntry":10,"exitLen":5,"stopAtr":2,"maxBars":10,"shorts":0,"htf":0}
- 2025-02-08: {"trendLen":200,"rsiEntry":10,"exitLen":5,"stopAtr":2,"maxBars":10,"shorts":0,"htf":0}
- 2025-08-09: {"trendLen":100,"rsiEntry":15,"exitLen":5,"stopAtr":2,"maxBars":10,"shorts":1,"htf":0}
- 2026-02-07: {"trendLen":200,"rsiEntry":5,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":1,"htf":0}
- 2026-08-08: {"trendLen":100,"rsiEntry":5,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":1,"htf":0}

### BTCUSDT 1d Supertrend trend-follow
- 2019-08-17: stand aside
- 2020-02-15: stand aside
- 2020-08-15: stand aside
- 2021-02-13: stand aside
- 2021-08-14: stand aside
- 2022-02-12: stand aside
- 2022-08-13: stand aside
- 2023-02-11: stand aside
- 2023-08-12: stand aside
- 2024-02-10: stand aside
- 2024-08-10: stand aside
- 2025-02-08: stand aside
- 2025-08-09: stand aside
- 2026-02-07: stand aside
- 2026-08-08: stand aside

### BTCUSDT 1d A+ stacked pullback
- 2019-08-17: stand aside
- 2020-02-15: stand aside
- 2020-08-15: stand aside
- 2021-02-13: stand aside
- 2021-08-14: stand aside
- 2022-02-12: stand aside
- 2022-08-13: stand aside
- 2023-02-11: stand aside
- 2023-08-12: stand aside
- 2024-02-10: stand aside
- 2024-08-10: stand aside
- 2025-02-08: stand aside
- 2025-08-09: stand aside
- 2026-02-07: stand aside
- 2026-08-08: stand aside

### BTCUSDT 1d Trend band reversion
- 2019-08-17: stand aside
- 2020-02-15: stand aside
- 2020-08-15: stand aside
- 2021-02-13: stand aside
- 2021-08-14: stand aside
- 2022-02-12: stand aside
- 2022-08-13: stand aside
- 2023-02-11: {"trendLen":200,"bbLen":20,"bbMult":2,"stopAtr":2,"maxBars":10,"shorts":1,"htf":0}
- 2023-08-12: stand aside
- 2024-02-10: stand aside
- 2024-08-10: stand aside
- 2025-02-08: stand aside
- 2025-08-09: stand aside
- 2026-02-07: stand aside
- 2026-08-08: stand aside

### BTCUSDT 1d Trend pullback, fixed target
- 2019-08-17: stand aside
- 2020-02-15: stand aside
- 2020-08-15: stand aside
- 2021-02-13: stand aside
- 2021-08-14: stand aside
- 2022-02-12: stand aside
- 2022-08-13: {"trendLen":200,"rsiEntry":40,"stopAtr":1.5,"targetR":0.33,"maxBars":20,"shorts":1,"htf":0}
- 2023-02-11: stand aside
- 2023-08-12: {"trendLen":200,"rsiEntry":40,"stopAtr":1.5,"targetR":0.5,"maxBars":20,"shorts":1,"htf":0}
- 2024-02-10: {"trendLen":200,"rsiEntry":40,"stopAtr":1.5,"targetR":0.5,"maxBars":20,"shorts":1,"htf":0}
- 2024-08-10: stand aside
- 2025-02-08: stand aside
- 2025-08-09: stand aside
- 2026-02-07: {"trendLen":200,"rsiEntry":40,"stopAtr":1.5,"targetR":0.75,"maxBars":20,"shorts":1,"htf":0}
- 2026-08-08: {"trendLen":200,"rsiEntry":40,"stopAtr":1.5,"targetR":0.5,"maxBars":20,"shorts":1,"htf":0}

### BTCUSDT 1d Jurik MA confluence
- 2019-08-17: {"minScore":3,"jmaFastLen":14,"jmaSlowLen":55}
- 2020-02-15: {"minScore":3,"jmaFastLen":14,"jmaSlowLen":55}
- 2020-08-15: {"minScore":3,"jmaFastLen":14,"jmaSlowLen":34}
- 2021-02-13: {"minScore":3,"jmaFastLen":14,"jmaSlowLen":55}
- 2021-08-14: {"minScore":3,"jmaFastLen":7,"jmaSlowLen":34}
- 2022-02-12: {"minScore":3,"jmaFastLen":14,"jmaSlowLen":34}
- 2022-08-13: {"minScore":3,"jmaFastLen":14,"jmaSlowLen":34}
- 2023-02-11: {"minScore":3,"jmaFastLen":14,"jmaSlowLen":34}
- 2023-08-12: {"minScore":4,"jmaFastLen":7,"jmaSlowLen":34}
- 2024-02-10: {"minScore":3,"jmaFastLen":7,"jmaSlowLen":34}
- 2024-08-10: {"minScore":3,"jmaFastLen":7,"jmaSlowLen":34}
- 2025-02-08: {"minScore":3,"jmaFastLen":9,"jmaSlowLen":55}
- 2025-08-09: {"minScore":3,"jmaFastLen":9,"jmaSlowLen":55}
- 2026-02-07: {"minScore":4,"jmaFastLen":7,"jmaSlowLen":55}
- 2026-08-08: {"minScore":3,"jmaFastLen":7,"jmaSlowLen":34}

### BTCUSDT 4h Trend pullback (RSI 2)
- 2019-08-17: {"trendLen":100,"rsiEntry":15,"exitLen":5,"stopAtr":3,"maxBars":10,"shorts":0,"htf":0}
- 2020-02-15: stand aside
- 2020-08-15: {"trendLen":100,"rsiEntry":5,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":0,"htf":1}
- 2021-02-13: {"trendLen":100,"rsiEntry":5,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":0,"htf":1}
- 2021-08-14: {"trendLen":100,"rsiEntry":5,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":0,"htf":1}
- 2022-02-12: {"trendLen":100,"rsiEntry":5,"exitLen":10,"stopAtr":3,"maxBars":10,"shorts":0,"htf":1}
- 2022-08-13: {"trendLen":200,"rsiEntry":5,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":1,"htf":0}
- 2023-02-11: {"trendLen":200,"rsiEntry":15,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":1,"htf":1}
- 2023-08-12: {"trendLen":100,"rsiEntry":5,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":1,"htf":0}
- 2024-02-10: {"trendLen":100,"rsiEntry":5,"exitLen":5,"stopAtr":4,"maxBars":10,"shorts":1,"htf":1}
- 2024-08-10: {"trendLen":200,"rsiEntry":5,"exitLen":5,"stopAtr":2,"maxBars":10,"shorts":0,"htf":1}
- 2025-02-08: stand aside
- 2025-08-09: stand aside
- 2026-02-07: stand aside
- 2026-08-08: stand aside

### BTCUSDT 4h Supertrend trend-follow
- 2019-08-17: {"stLen":10,"stMult":4,"trendLen":100,"stopAtr":3,"shorts":1,"htf":1}
- 2020-02-15: {"stLen":10,"stMult":4,"trendLen":100,"stopAtr":3,"shorts":1,"htf":1}
- 2020-08-15: {"stLen":14,"stMult":4,"trendLen":100,"stopAtr":3,"shorts":1,"htf":1}
- 2021-02-13: {"stLen":14,"stMult":4,"trendLen":100,"stopAtr":3,"shorts":0,"htf":0}
- 2021-08-14: {"stLen":14,"stMult":4,"trendLen":100,"stopAtr":3,"shorts":1,"htf":1}
- 2022-02-12: {"stLen":14,"stMult":4,"trendLen":100,"stopAtr":3,"shorts":0,"htf":0}
- 2022-08-13: {"stLen":14,"stMult":4,"trendLen":100,"stopAtr":3,"shorts":1,"htf":1}
- 2023-02-11: {"stLen":14,"stMult":4,"trendLen":100,"stopAtr":3,"shorts":1,"htf":0}
- 2023-08-12: {"stLen":14,"stMult":4,"trendLen":100,"stopAtr":3,"shorts":1,"htf":0}
- 2024-02-10: {"stLen":14,"stMult":4,"trendLen":100,"stopAtr":3,"shorts":1,"htf":0}
- 2024-08-10: {"stLen":14,"stMult":4,"trendLen":100,"stopAtr":3,"shorts":1,"htf":0}
- 2025-02-08: {"stLen":14,"stMult":2,"trendLen":100,"stopAtr":3,"shorts":0,"htf":0}
- 2025-08-09: {"stLen":14,"stMult":2,"trendLen":100,"stopAtr":3,"shorts":0,"htf":0}
- 2026-02-07: {"stLen":14,"stMult":2,"trendLen":100,"stopAtr":3,"shorts":0,"htf":0}
- 2026-08-08: {"stLen":14,"stMult":2,"trendLen":100,"stopAtr":3,"shorts":0,"htf":1}

### BTCUSDT 4h A+ stacked pullback
- 2019-08-17: stand aside
- 2020-02-15: stand aside
- 2020-08-15: stand aside
- 2021-02-13: stand aside
- 2021-08-14: {"trendLen":200,"rsiEntry":5,"bbMult":1.5,"stretchAtr":1,"exitLen":5,"stopAtr":4,"maxBars":10}
- 2022-02-12: {"trendLen":100,"rsiEntry":10,"bbMult":2,"stretchAtr":1,"exitLen":3,"stopAtr":3,"maxBars":10}
- 2022-08-13: {"trendLen":200,"rsiEntry":5,"bbMult":2,"stretchAtr":1,"exitLen":5,"stopAtr":3,"maxBars":10}
- 2023-02-11: {"trendLen":100,"rsiEntry":10,"bbMult":1.5,"stretchAtr":1,"exitLen":5,"stopAtr":3,"maxBars":10}
- 2023-08-12: stand aside
- 2024-02-10: {"trendLen":200,"rsiEntry":10,"bbMult":2,"stretchAtr":1.5,"exitLen":3,"stopAtr":3,"maxBars":10}
- 2024-08-10: {"trendLen":200,"rsiEntry":5,"bbMult":2,"stretchAtr":1.5,"exitLen":3,"stopAtr":2,"maxBars":10}
- 2025-02-08: {"trendLen":200,"rsiEntry":5,"bbMult":2,"stretchAtr":2,"exitLen":3,"stopAtr":2,"maxBars":10}
- 2025-08-09: {"trendLen":200,"rsiEntry":10,"bbMult":1.5,"stretchAtr":2,"exitLen":3,"stopAtr":2,"maxBars":10}
- 2026-02-07: {"trendLen":200,"rsiEntry":5,"bbMult":2,"stretchAtr":1,"exitLen":3,"stopAtr":2,"maxBars":10}
- 2026-08-08: {"trendLen":200,"rsiEntry":5,"bbMult":2,"stretchAtr":1,"exitLen":3,"stopAtr":4,"maxBars":10}

### BTCUSDT 4h Trend band reversion
- 2019-08-17: stand aside
- 2020-02-15: stand aside
- 2020-08-15: {"trendLen":200,"bbLen":20,"bbMult":2,"stopAtr":4,"maxBars":20,"shorts":0,"htf":1}
- 2021-02-13: {"trendLen":100,"bbLen":20,"bbMult":2,"stopAtr":4,"maxBars":20,"shorts":0,"htf":0}
- 2021-08-14: stand aside
- 2022-02-12: {"trendLen":100,"bbLen":20,"bbMult":2,"stopAtr":4,"maxBars":20,"shorts":1,"htf":0}
- 2022-08-13: {"trendLen":200,"bbLen":20,"bbMult":2.5,"stopAtr":4,"maxBars":10,"shorts":1,"htf":1}
- 2023-02-11: {"trendLen":200,"bbLen":20,"bbMult":2.5,"stopAtr":2,"maxBars":10,"shorts":1,"htf":1}
- 2023-08-12: {"trendLen":200,"bbLen":20,"bbMult":2.5,"stopAtr":2,"maxBars":10,"shorts":1,"htf":1}
- 2024-02-10: {"trendLen":200,"bbLen":20,"bbMult":2.5,"stopAtr":3,"maxBars":10,"shorts":1,"htf":1}
- 2024-08-10: {"trendLen":200,"bbLen":20,"bbMult":2.5,"stopAtr":4,"maxBars":20,"shorts":0,"htf":0}
- 2025-02-08: stand aside
- 2025-08-09: {"trendLen":200,"bbLen":20,"bbMult":2.5,"stopAtr":4,"maxBars":20,"shorts":1,"htf":1}
- 2026-02-07: stand aside
- 2026-08-08: stand aside

### BTCUSDT 4h Trend pullback, fixed target
- 2019-08-17: {"trendLen":100,"rsiEntry":40,"stopAtr":1.5,"targetR":0.33,"maxBars":20,"shorts":1,"htf":1}
- 2020-02-15: {"trendLen":100,"rsiEntry":40,"stopAtr":1.5,"targetR":0.33,"maxBars":20,"shorts":1,"htf":1}
- 2020-08-15: {"trendLen":100,"rsiEntry":40,"stopAtr":2,"targetR":0.75,"maxBars":20,"shorts":0,"htf":0}
- 2021-02-13: {"trendLen":100,"rsiEntry":40,"stopAtr":3,"targetR":0.5,"maxBars":20,"shorts":0,"htf":0}
- 2021-08-14: {"trendLen":200,"rsiEntry":35,"stopAtr":3,"targetR":0.33,"maxBars":20,"shorts":0,"htf":0}
- 2022-02-12: {"trendLen":200,"rsiEntry":35,"stopAtr":3,"targetR":0.33,"maxBars":20,"shorts":0,"htf":0}
- 2022-08-13: {"trendLen":100,"rsiEntry":40,"stopAtr":3,"targetR":0.75,"maxBars":20,"shorts":1,"htf":0}
- 2023-02-11: {"trendLen":200,"rsiEntry":40,"stopAtr":2,"targetR":0.5,"maxBars":20,"shorts":0,"htf":1}
- 2023-08-12: {"trendLen":200,"rsiEntry":40,"stopAtr":2,"targetR":0.5,"maxBars":20,"shorts":0,"htf":1}
- 2024-02-10: {"trendLen":200,"rsiEntry":35,"stopAtr":2,"targetR":0.5,"maxBars":20,"shorts":0,"htf":1}
- 2024-08-10: {"trendLen":200,"rsiEntry":35,"stopAtr":3,"targetR":0.33,"maxBars":20,"shorts":0,"htf":1}
- 2025-02-08: {"trendLen":200,"rsiEntry":35,"stopAtr":3,"targetR":0.33,"maxBars":20,"shorts":0,"htf":0}
- 2025-08-09: {"trendLen":200,"rsiEntry":35,"stopAtr":3,"targetR":0.75,"maxBars":20,"shorts":1,"htf":1}
- 2026-02-07: {"trendLen":200,"rsiEntry":35,"stopAtr":3,"targetR":0.75,"maxBars":20,"shorts":1,"htf":1}
- 2026-08-08: {"trendLen":200,"rsiEntry":35,"stopAtr":3,"targetR":0.75,"maxBars":20,"shorts":1,"htf":1}

### BTCUSDT 4h Jurik MA confluence
- 2019-08-17: {"minScore":3,"jmaFastLen":14,"jmaSlowLen":34}
- 2020-02-15: {"minScore":4,"jmaFastLen":7,"jmaSlowLen":55}
- 2020-08-15: {"minScore":5,"jmaFastLen":14,"jmaSlowLen":55}
- 2021-02-13: {"minScore":5,"jmaFastLen":14,"jmaSlowLen":55}
- 2021-08-14: {"minScore":5,"jmaFastLen":14,"jmaSlowLen":55}
- 2022-02-12: {"minScore":5,"jmaFastLen":14,"jmaSlowLen":34}
- 2022-08-13: {"minScore":5,"jmaFastLen":14,"jmaSlowLen":34}
- 2023-02-11: {"minScore":5,"jmaFastLen":14,"jmaSlowLen":34}
- 2023-08-12: stand aside
- 2024-02-10: stand aside
- 2024-08-10: {"minScore":4,"jmaFastLen":7,"jmaSlowLen":34}
- 2025-02-08: {"minScore":5,"jmaFastLen":14,"jmaSlowLen":55}
- 2025-08-09: {"minScore":5,"jmaFastLen":14,"jmaSlowLen":34}
- 2026-02-07: {"minScore":5,"jmaFastLen":14,"jmaSlowLen":34}
- 2026-08-08: {"minScore":3,"jmaFastLen":14,"jmaSlowLen":34}

### BTCUSDT 1h Trend pullback (RSI 2)
- 2019-08-17: {"trendLen":100,"rsiEntry":5,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":0,"htf":0}
- 2020-02-15: {"trendLen":200,"rsiEntry":5,"exitLen":10,"stopAtr":4,"maxBars":10,"shorts":0,"htf":0}
- 2020-08-15: {"trendLen":100,"rsiEntry":5,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":0,"htf":1}
- 2021-02-13: {"trendLen":100,"rsiEntry":5,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":0,"htf":1}
- 2021-08-14: {"trendLen":100,"rsiEntry":5,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":0,"htf":1}
- 2022-02-12: {"trendLen":100,"rsiEntry":5,"exitLen":5,"stopAtr":4,"maxBars":10,"shorts":0,"htf":1}
- 2022-08-13: {"trendLen":100,"rsiEntry":5,"exitLen":5,"stopAtr":4,"maxBars":10,"shorts":0,"htf":1}
- 2023-02-11: {"trendLen":100,"rsiEntry":5,"exitLen":10,"stopAtr":4,"maxBars":10,"shorts":0,"htf":1}
- 2023-08-12: stand aside
- 2024-02-10: stand aside
- 2024-08-10: stand aside
- 2025-02-08: stand aside
- 2025-08-09: stand aside
- 2026-02-07: stand aside
- 2026-08-08: stand aside

### BTCUSDT 1h Supertrend trend-follow
- 2019-08-17: {"stLen":10,"stMult":4,"trendLen":200,"stopAtr":3,"shorts":1,"htf":0}
- 2020-02-15: {"stLen":14,"stMult":4,"trendLen":200,"stopAtr":3,"shorts":1,"htf":1}
- 2020-08-15: {"stLen":14,"stMult":2,"trendLen":100,"stopAtr":3,"shorts":1,"htf":1}
- 2021-02-13: {"stLen":14,"stMult":2,"trendLen":100,"stopAtr":3,"shorts":1,"htf":1}
- 2021-08-14: {"stLen":14,"stMult":3,"trendLen":100,"stopAtr":3,"shorts":1,"htf":1}
- 2022-02-12: {"stLen":10,"stMult":4,"trendLen":100,"stopAtr":3,"shorts":0,"htf":1}
- 2022-08-13: {"stLen":10,"stMult":4,"trendLen":100,"stopAtr":3,"shorts":0,"htf":1}
- 2023-02-11: {"stLen":10,"stMult":4,"trendLen":100,"stopAtr":3,"shorts":0,"htf":0}
- 2023-08-12: {"stLen":10,"stMult":4,"trendLen":100,"stopAtr":3,"shorts":0,"htf":0}
- 2024-02-10: {"stLen":14,"stMult":3,"trendLen":100,"stopAtr":3,"shorts":0,"htf":0}
- 2024-08-10: {"stLen":14,"stMult":3,"trendLen":200,"stopAtr":3,"shorts":0,"htf":0}
- 2025-02-08: {"stLen":14,"stMult":3,"trendLen":200,"stopAtr":3,"shorts":0,"htf":0}
- 2025-08-09: {"stLen":14,"stMult":4,"trendLen":200,"stopAtr":3,"shorts":0,"htf":0}
- 2026-02-07: {"stLen":10,"stMult":3,"trendLen":200,"stopAtr":3,"shorts":0,"htf":0}
- 2026-08-08: {"stLen":10,"stMult":4,"trendLen":200,"stopAtr":3,"shorts":1,"htf":1}

### BTCUSDT 1h A+ stacked pullback
- 2019-08-17: {"trendLen":200,"rsiEntry":10,"bbMult":1.5,"stretchAtr":2,"exitLen":5,"stopAtr":2,"maxBars":10}
- 2020-02-15: {"trendLen":100,"rsiEntry":10,"bbMult":1.5,"stretchAtr":1.5,"exitLen":5,"stopAtr":3,"maxBars":10}
- 2020-08-15: {"trendLen":100,"rsiEntry":5,"bbMult":1.5,"stretchAtr":1,"exitLen":5,"stopAtr":2,"maxBars":10}
- 2021-02-13: {"trendLen":100,"rsiEntry":10,"bbMult":1.5,"stretchAtr":1,"exitLen":5,"stopAtr":2,"maxBars":10}
- 2021-08-14: {"trendLen":100,"rsiEntry":10,"bbMult":1.5,"stretchAtr":1,"exitLen":5,"stopAtr":2,"maxBars":10}
- 2022-02-12: {"trendLen":100,"rsiEntry":10,"bbMult":1.5,"stretchAtr":1,"exitLen":5,"stopAtr":2,"maxBars":10}
- 2022-08-13: {"trendLen":100,"rsiEntry":10,"bbMult":1.5,"stretchAtr":1,"exitLen":5,"stopAtr":2,"maxBars":10}
- 2023-02-11: {"trendLen":100,"rsiEntry":10,"bbMult":1.5,"stretchAtr":1,"exitLen":5,"stopAtr":2,"maxBars":10}
- 2023-08-12: {"trendLen":200,"rsiEntry":5,"bbMult":2,"stretchAtr":1,"exitLen":5,"stopAtr":2,"maxBars":10}
- 2024-02-10: {"trendLen":200,"rsiEntry":5,"bbMult":2,"stretchAtr":1.5,"exitLen":5,"stopAtr":2,"maxBars":10}
- 2024-08-10: {"trendLen":100,"rsiEntry":5,"bbMult":1.5,"stretchAtr":1.5,"exitLen":3,"stopAtr":4,"maxBars":10}
- 2025-02-08: stand aside
- 2025-08-09: stand aside
- 2026-02-07: stand aside
- 2026-08-08: stand aside

### BTCUSDT 1h Trend band reversion
- 2019-08-17: {"trendLen":200,"bbLen":20,"bbMult":2,"stopAtr":3,"maxBars":20,"shorts":0,"htf":0}
- 2020-02-15: {"trendLen":100,"bbLen":20,"bbMult":2.5,"stopAtr":2,"maxBars":20,"shorts":0,"htf":0}
- 2020-08-15: {"trendLen":100,"bbLen":20,"bbMult":2,"stopAtr":2,"maxBars":20,"shorts":0,"htf":0}
- 2021-02-13: {"trendLen":100,"bbLen":20,"bbMult":2,"stopAtr":2,"maxBars":10,"shorts":0,"htf":0}
- 2021-08-14: stand aside
- 2022-02-12: stand aside
- 2022-08-13: {"trendLen":100,"bbLen":20,"bbMult":2,"stopAtr":2,"maxBars":20,"shorts":0,"htf":1}
- 2023-02-11: {"trendLen":100,"bbLen":20,"bbMult":2,"stopAtr":2,"maxBars":20,"shorts":0,"htf":1}
- 2023-08-12: stand aside
- 2024-02-10: stand aside
- 2024-08-10: stand aside
- 2025-02-08: stand aside
- 2025-08-09: stand aside
- 2026-02-07: {"trendLen":200,"bbLen":20,"bbMult":2.5,"stopAtr":4,"maxBars":20,"shorts":0,"htf":1}
- 2026-08-08: {"trendLen":100,"bbLen":20,"bbMult":2.5,"stopAtr":3,"maxBars":10,"shorts":0,"htf":1}

### BTCUSDT 1h Trend pullback, fixed target
- 2019-08-17: {"trendLen":100,"rsiEntry":35,"stopAtr":2,"targetR":0.75,"maxBars":20,"shorts":1,"htf":0}
- 2020-02-15: {"trendLen":100,"rsiEntry":35,"stopAtr":3,"targetR":0.75,"maxBars":20,"shorts":1,"htf":1}
- 2020-08-15: {"trendLen":100,"rsiEntry":40,"stopAtr":2,"targetR":0.75,"maxBars":20,"shorts":0,"htf":0}
- 2021-02-13: {"trendLen":100,"rsiEntry":40,"stopAtr":2,"targetR":0.75,"maxBars":20,"shorts":0,"htf":0}
- 2021-08-14: stand aside
- 2022-02-12: stand aside
- 2022-08-13: stand aside
- 2023-02-11: {"trendLen":100,"rsiEntry":35,"stopAtr":2,"targetR":0.5,"maxBars":20,"shorts":1,"htf":0}
- 2023-08-12: {"trendLen":100,"rsiEntry":35,"stopAtr":2,"targetR":0.5,"maxBars":20,"shorts":1,"htf":0}
- 2024-02-10: {"trendLen":100,"rsiEntry":35,"stopAtr":2,"targetR":0.5,"maxBars":20,"shorts":1,"htf":0}
- 2024-08-10: {"trendLen":100,"rsiEntry":35,"stopAtr":2,"targetR":0.75,"maxBars":20,"shorts":1,"htf":1}
- 2025-02-08: {"trendLen":100,"rsiEntry":35,"stopAtr":1.5,"targetR":0.75,"maxBars":20,"shorts":1,"htf":1}
- 2025-08-09: stand aside
- 2026-02-07: stand aside
- 2026-08-08: stand aside

### BTCUSDT 1h Jurik MA confluence
- 2019-08-17: {"minScore":3,"jmaFastLen":14,"jmaSlowLen":55}
- 2020-02-15: stand aside
- 2020-08-15: stand aside
- 2021-02-13: {"minScore":4,"jmaFastLen":14,"jmaSlowLen":34}
- 2021-08-14: {"minScore":4,"jmaFastLen":14,"jmaSlowLen":34}
- 2022-02-12: {"minScore":5,"jmaFastLen":9,"jmaSlowLen":55}
- 2022-08-13: stand aside
- 2023-02-11: {"minScore":5,"jmaFastLen":9,"jmaSlowLen":55}
- 2023-08-12: stand aside
- 2024-02-10: stand aside
- 2024-08-10: stand aside
- 2025-02-08: stand aside
- 2025-08-09: stand aside
- 2026-02-07: stand aside
- 2026-08-08: stand aside

### ETHUSDT 1d Trend pullback (RSI 2)
- 2019-08-17: stand aside
- 2020-02-15: stand aside
- 2020-08-15: {"trendLen":100,"rsiEntry":15,"exitLen":5,"stopAtr":2,"maxBars":10,"shorts":0,"htf":0}
- 2021-02-13: {"trendLen":100,"rsiEntry":10,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":0,"htf":0}
- 2021-08-14: stand aside
- 2022-02-12: stand aside
- 2022-08-13: stand aside
- 2023-02-11: stand aside
- 2023-08-12: {"trendLen":100,"rsiEntry":10,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":0,"htf":0}
- 2024-02-10: {"trendLen":100,"rsiEntry":15,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":0,"htf":0}
- 2024-08-10: {"trendLen":100,"rsiEntry":15,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":0,"htf":0}
- 2025-02-08: {"trendLen":100,"rsiEntry":10,"exitLen":10,"stopAtr":3,"maxBars":10,"shorts":0,"htf":0}
- 2025-08-09: {"trendLen":100,"rsiEntry":15,"exitLen":10,"stopAtr":4,"maxBars":10,"shorts":0,"htf":0}
- 2026-02-07: {"trendLen":100,"rsiEntry":10,"exitLen":10,"stopAtr":4,"maxBars":10,"shorts":1,"htf":0}
- 2026-08-08: {"trendLen":100,"rsiEntry":15,"exitLen":10,"stopAtr":3,"maxBars":10,"shorts":1,"htf":0}

### ETHUSDT 1d Supertrend trend-follow
- 2019-08-17: stand aside
- 2020-02-15: stand aside
- 2020-08-15: stand aside
- 2021-02-13: stand aside
- 2021-08-14: stand aside
- 2022-02-12: stand aside
- 2022-08-13: stand aside
- 2023-02-11: stand aside
- 2023-08-12: stand aside
- 2024-02-10: stand aside
- 2024-08-10: stand aside
- 2025-02-08: stand aside
- 2025-08-09: stand aside
- 2026-02-07: stand aside
- 2026-08-08: stand aside

### ETHUSDT 1d A+ stacked pullback
- 2019-08-17: stand aside
- 2020-02-15: stand aside
- 2020-08-15: stand aside
- 2021-02-13: stand aside
- 2021-08-14: stand aside
- 2022-02-12: stand aside
- 2022-08-13: stand aside
- 2023-02-11: stand aside
- 2023-08-12: stand aside
- 2024-02-10: stand aside
- 2024-08-10: stand aside
- 2025-02-08: stand aside
- 2025-08-09: stand aside
- 2026-02-07: stand aside
- 2026-08-08: stand aside

### ETHUSDT 1d Trend band reversion
- 2019-08-17: stand aside
- 2020-02-15: stand aside
- 2020-08-15: stand aside
- 2021-02-13: stand aside
- 2021-08-14: stand aside
- 2022-02-12: stand aside
- 2022-08-13: stand aside
- 2023-02-11: stand aside
- 2023-08-12: stand aside
- 2024-02-10: stand aside
- 2024-08-10: stand aside
- 2025-02-08: stand aside
- 2025-08-09: stand aside
- 2026-02-07: stand aside
- 2026-08-08: stand aside

### ETHUSDT 1d Trend pullback, fixed target
- 2019-08-17: stand aside
- 2020-02-15: stand aside
- 2020-08-15: stand aside
- 2021-02-13: stand aside
- 2021-08-14: stand aside
- 2022-02-12: stand aside
- 2022-08-13: stand aside
- 2023-02-11: stand aside
- 2023-08-12: stand aside
- 2024-02-10: stand aside
- 2024-08-10: stand aside
- 2025-02-08: {"trendLen":200,"rsiEntry":40,"stopAtr":1.5,"targetR":0.75,"maxBars":20,"shorts":1,"htf":0}
- 2025-08-09: {"trendLen":200,"rsiEntry":40,"stopAtr":1.5,"targetR":0.75,"maxBars":20,"shorts":1,"htf":0}
- 2026-02-07: {"trendLen":200,"rsiEntry":40,"stopAtr":1.5,"targetR":0.5,"maxBars":20,"shorts":1,"htf":0}
- 2026-08-08: {"trendLen":200,"rsiEntry":40,"stopAtr":1.5,"targetR":0.33,"maxBars":20,"shorts":1,"htf":0}

### ETHUSDT 1d Jurik MA confluence
- 2019-08-17: {"minScore":3,"jmaFastLen":7,"jmaSlowLen":55}
- 2020-02-15: {"minScore":3,"jmaFastLen":7,"jmaSlowLen":55}
- 2020-08-15: {"minScore":3,"jmaFastLen":9,"jmaSlowLen":55}
- 2021-02-13: {"minScore":3,"jmaFastLen":9,"jmaSlowLen":55}
- 2021-08-14: {"minScore":3,"jmaFastLen":9,"jmaSlowLen":55}
- 2022-02-12: {"minScore":4,"jmaFastLen":7,"jmaSlowLen":34}
- 2022-08-13: {"minScore":4,"jmaFastLen":7,"jmaSlowLen":34}
- 2023-02-11: {"minScore":3,"jmaFastLen":9,"jmaSlowLen":34}
- 2023-08-12: {"minScore":4,"jmaFastLen":7,"jmaSlowLen":34}
- 2024-02-10: {"minScore":3,"jmaFastLen":7,"jmaSlowLen":34}
- 2024-08-10: {"minScore":3,"jmaFastLen":7,"jmaSlowLen":34}
- 2025-02-08: stand aside
- 2025-08-09: {"minScore":4,"jmaFastLen":7,"jmaSlowLen":55}
- 2026-02-07: {"minScore":4,"jmaFastLen":7,"jmaSlowLen":55}
- 2026-08-08: {"minScore":4,"jmaFastLen":7,"jmaSlowLen":55}

### ETHUSDT 4h Trend pullback (RSI 2)
- 2019-08-17: stand aside
- 2020-02-15: stand aside
- 2020-08-15: {"trendLen":200,"rsiEntry":15,"exitLen":10,"stopAtr":4,"maxBars":10,"shorts":0,"htf":1}
- 2021-02-13: {"trendLen":200,"rsiEntry":15,"exitLen":5,"stopAtr":4,"maxBars":10,"shorts":0,"htf":1}
- 2021-08-14: {"trendLen":100,"rsiEntry":5,"exitLen":5,"stopAtr":4,"maxBars":10,"shorts":0,"htf":0}
- 2022-02-12: {"trendLen":100,"rsiEntry":10,"exitLen":5,"stopAtr":2,"maxBars":10,"shorts":0,"htf":0}
- 2022-08-13: {"trendLen":200,"rsiEntry":10,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":0,"htf":0}
- 2023-02-11: {"trendLen":100,"rsiEntry":10,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":0,"htf":1}
- 2023-08-12: {"trendLen":100,"rsiEntry":10,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":0,"htf":1}
- 2024-02-10: {"trendLen":100,"rsiEntry":5,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":0,"htf":1}
- 2024-08-10: stand aside
- 2025-02-08: stand aside
- 2025-08-09: {"trendLen":100,"rsiEntry":5,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":1,"htf":1}
- 2026-02-07: stand aside
- 2026-08-08: stand aside

### ETHUSDT 4h Supertrend trend-follow
- 2019-08-17: {"stLen":14,"stMult":4,"trendLen":200,"stopAtr":3,"shorts":1,"htf":0}
- 2020-02-15: {"stLen":10,"stMult":3,"trendLen":200,"stopAtr":3,"shorts":1,"htf":0}
- 2020-08-15: {"stLen":10,"stMult":3,"trendLen":200,"stopAtr":3,"shorts":0,"htf":0}
- 2021-02-13: {"stLen":10,"stMult":3,"trendLen":200,"stopAtr":3,"shorts":0,"htf":0}
- 2021-08-14: {"stLen":10,"stMult":3,"trendLen":200,"stopAtr":3,"shorts":0,"htf":0}
- 2022-02-12: {"stLen":10,"stMult":3,"trendLen":200,"stopAtr":3,"shorts":0,"htf":0}
- 2022-08-13: {"stLen":14,"stMult":3,"trendLen":200,"stopAtr":3,"shorts":0,"htf":0}
- 2023-02-11: {"stLen":14,"stMult":3,"trendLen":100,"stopAtr":3,"shorts":0,"htf":0}
- 2023-08-12: {"stLen":14,"stMult":3,"trendLen":100,"stopAtr":3,"shorts":0,"htf":0}
- 2024-02-10: {"stLen":14,"stMult":3,"trendLen":100,"stopAtr":3,"shorts":0,"htf":0}
- 2024-08-10: {"stLen":14,"stMult":3,"trendLen":100,"stopAtr":3,"shorts":0,"htf":0}
- 2025-02-08: {"stLen":10,"stMult":3,"trendLen":100,"stopAtr":3,"shorts":0,"htf":0}
- 2025-08-09: {"stLen":14,"stMult":2,"trendLen":100,"stopAtr":3,"shorts":0,"htf":0}
- 2026-02-07: {"stLen":10,"stMult":2,"trendLen":100,"stopAtr":3,"shorts":0,"htf":0}
- 2026-08-08: {"stLen":14,"stMult":2,"trendLen":200,"stopAtr":3,"shorts":0,"htf":0}

### ETHUSDT 4h A+ stacked pullback
- 2019-08-17: {"trendLen":200,"rsiEntry":10,"bbMult":2,"stretchAtr":1,"exitLen":3,"stopAtr":2,"maxBars":10}
- 2020-02-15: {"trendLen":200,"rsiEntry":10,"bbMult":2,"stretchAtr":1,"exitLen":3,"stopAtr":2,"maxBars":10}
- 2020-08-15: {"trendLen":100,"rsiEntry":10,"bbMult":1.5,"stretchAtr":1,"exitLen":3,"stopAtr":2,"maxBars":10}
- 2021-02-13: {"trendLen":100,"rsiEntry":10,"bbMult":1.5,"stretchAtr":1,"exitLen":5,"stopAtr":4,"maxBars":10}
- 2021-08-14: stand aside
- 2022-02-12: {"trendLen":100,"rsiEntry":10,"bbMult":1.5,"stretchAtr":1,"exitLen":5,"stopAtr":2,"maxBars":10}
- 2022-08-13: stand aside
- 2023-02-11: {"trendLen":100,"rsiEntry":10,"bbMult":1.5,"stretchAtr":1,"exitLen":5,"stopAtr":2,"maxBars":10}
- 2023-08-12: {"trendLen":100,"rsiEntry":10,"bbMult":2,"stretchAtr":1,"exitLen":5,"stopAtr":2,"maxBars":10}
- 2024-02-10: stand aside
- 2024-08-10: stand aside
- 2025-02-08: stand aside
- 2025-08-09: stand aside
- 2026-02-07: stand aside
- 2026-08-08: stand aside

### ETHUSDT 4h Trend band reversion
- 2019-08-17: stand aside
- 2020-02-15: {"trendLen":100,"bbLen":20,"bbMult":2.5,"stopAtr":3,"maxBars":20,"shorts":1,"htf":0}
- 2020-08-15: {"trendLen":200,"bbLen":20,"bbMult":2.5,"stopAtr":2,"maxBars":10,"shorts":0,"htf":1}
- 2021-02-13: {"trendLen":200,"bbLen":20,"bbMult":2.5,"stopAtr":2,"maxBars":10,"shorts":0,"htf":1}
- 2021-08-14: {"trendLen":200,"bbLen":20,"bbMult":2.5,"stopAtr":2,"maxBars":10,"shorts":0,"htf":1}
- 2022-02-12: {"trendLen":100,"bbLen":20,"bbMult":2.5,"stopAtr":2,"maxBars":20,"shorts":0,"htf":1}
- 2022-08-13: {"trendLen":100,"bbLen":20,"bbMult":2,"stopAtr":2,"maxBars":20,"shorts":0,"htf":0}
- 2023-02-11: {"trendLen":100,"bbLen":20,"bbMult":2.5,"stopAtr":2,"maxBars":20,"shorts":1,"htf":1}
- 2023-08-12: {"trendLen":100,"bbLen":20,"bbMult":2,"stopAtr":2,"maxBars":20,"shorts":1,"htf":0}
- 2024-02-10: {"trendLen":100,"bbLen":20,"bbMult":2,"stopAtr":2,"maxBars":20,"shorts":1,"htf":0}
- 2024-08-10: {"trendLen":100,"bbLen":20,"bbMult":2.5,"stopAtr":2,"maxBars":20,"shorts":1,"htf":1}
- 2025-02-08: stand aside
- 2025-08-09: {"trendLen":100,"bbLen":20,"bbMult":2,"stopAtr":2,"maxBars":20,"shorts":1,"htf":1}
- 2026-02-07: {"trendLen":100,"bbLen":20,"bbMult":2,"stopAtr":2,"maxBars":20,"shorts":1,"htf":1}
- 2026-08-08: {"trendLen":200,"bbLen":20,"bbMult":2,"stopAtr":2,"maxBars":20,"shorts":1,"htf":1}

### ETHUSDT 4h Trend pullback, fixed target
- 2019-08-17: stand aside
- 2020-02-15: {"trendLen":100,"rsiEntry":40,"stopAtr":1.5,"targetR":0.5,"maxBars":20,"shorts":1,"htf":0}
- 2020-08-15: {"trendLen":100,"rsiEntry":40,"stopAtr":2,"targetR":0.75,"maxBars":20,"shorts":0,"htf":0}
- 2021-02-13: {"trendLen":100,"rsiEntry":40,"stopAtr":3,"targetR":0.75,"maxBars":20,"shorts":1,"htf":0}
- 2021-08-14: {"trendLen":200,"rsiEntry":35,"stopAtr":2,"targetR":0.75,"maxBars":20,"shorts":0,"htf":1}
- 2022-02-12: {"trendLen":100,"rsiEntry":40,"stopAtr":2,"targetR":0.75,"maxBars":20,"shorts":0,"htf":0}
- 2022-08-13: {"trendLen":100,"rsiEntry":40,"stopAtr":2,"targetR":0.75,"maxBars":20,"shorts":0,"htf":0}
- 2023-02-11: {"trendLen":100,"rsiEntry":40,"stopAtr":1.5,"targetR":0.75,"maxBars":20,"shorts":0,"htf":1}
- 2023-08-12: {"trendLen":100,"rsiEntry":40,"stopAtr":1.5,"targetR":0.75,"maxBars":20,"shorts":0,"htf":1}
- 2024-02-10: {"trendLen":100,"rsiEntry":40,"stopAtr":3,"targetR":0.75,"maxBars":20,"shorts":1,"htf":0}
- 2024-08-10: {"trendLen":200,"rsiEntry":40,"stopAtr":3,"targetR":0.75,"maxBars":20,"shorts":0,"htf":0}
- 2025-02-08: stand aside
- 2025-08-09: {"trendLen":100,"rsiEntry":40,"stopAtr":2,"targetR":0.75,"maxBars":20,"shorts":1,"htf":0}
- 2026-02-07: {"trendLen":100,"rsiEntry":40,"stopAtr":2,"targetR":0.75,"maxBars":20,"shorts":1,"htf":0}
- 2026-08-08: {"trendLen":100,"rsiEntry":40,"stopAtr":2,"targetR":0.75,"maxBars":20,"shorts":1,"htf":0}

### ETHUSDT 4h Jurik MA confluence
- 2019-08-17: {"minScore":3,"jmaFastLen":9,"jmaSlowLen":34}
- 2020-02-15: {"minScore":3,"jmaFastLen":9,"jmaSlowLen":34}
- 2020-08-15: {"minScore":4,"jmaFastLen":14,"jmaSlowLen":34}
- 2021-02-13: {"minScore":3,"jmaFastLen":7,"jmaSlowLen":34}
- 2021-08-14: {"minScore":3,"jmaFastLen":7,"jmaSlowLen":34}
- 2022-02-12: {"minScore":4,"jmaFastLen":14,"jmaSlowLen":34}
- 2022-08-13: {"minScore":4,"jmaFastLen":7,"jmaSlowLen":55}
- 2023-02-11: {"minScore":5,"jmaFastLen":14,"jmaSlowLen":55}
- 2023-08-12: {"minScore":5,"jmaFastLen":14,"jmaSlowLen":55}
- 2024-02-10: {"minScore":5,"jmaFastLen":14,"jmaSlowLen":55}
- 2024-08-10: {"minScore":5,"jmaFastLen":7,"jmaSlowLen":55}
- 2025-02-08: {"minScore":4,"jmaFastLen":14,"jmaSlowLen":55}
- 2025-08-09: {"minScore":5,"jmaFastLen":7,"jmaSlowLen":34}
- 2026-02-07: {"minScore":5,"jmaFastLen":7,"jmaSlowLen":34}
- 2026-08-08: {"minScore":5,"jmaFastLen":7,"jmaSlowLen":34}

### ETHUSDT 1h Trend pullback (RSI 2)
- 2019-08-17: {"trendLen":100,"rsiEntry":5,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":0,"htf":1}
- 2020-02-15: {"trendLen":100,"rsiEntry":5,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":0,"htf":0}
- 2020-08-15: {"trendLen":100,"rsiEntry":5,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":0,"htf":1}
- 2021-02-13: {"trendLen":100,"rsiEntry":10,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":0,"htf":1}
- 2021-08-14: {"trendLen":100,"rsiEntry":10,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":0,"htf":1}
- 2022-02-12: {"trendLen":100,"rsiEntry":5,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":1,"htf":1}
- 2022-08-13: {"trendLen":100,"rsiEntry":5,"exitLen":10,"stopAtr":4,"maxBars":10,"shorts":1,"htf":1}
- 2023-02-11: stand aside
- 2023-08-12: stand aside
- 2024-02-10: stand aside
- 2024-08-10: stand aside
- 2025-02-08: stand aside
- 2025-08-09: stand aside
- 2026-02-07: stand aside
- 2026-08-08: stand aside

### ETHUSDT 1h Supertrend trend-follow
- 2019-08-17: {"stLen":10,"stMult":4,"trendLen":200,"stopAtr":3,"shorts":1,"htf":1}
- 2020-02-15: {"stLen":10,"stMult":4,"trendLen":100,"stopAtr":3,"shorts":0,"htf":1}
- 2020-08-15: {"stLen":10,"stMult":4,"trendLen":100,"stopAtr":3,"shorts":0,"htf":1}
- 2021-02-13: {"stLen":10,"stMult":4,"trendLen":100,"stopAtr":3,"shorts":0,"htf":1}
- 2021-08-14: {"stLen":10,"stMult":4,"trendLen":100,"stopAtr":3,"shorts":0,"htf":1}
- 2022-02-12: {"stLen":10,"stMult":4,"trendLen":100,"stopAtr":3,"shorts":0,"htf":1}
- 2022-08-13: {"stLen":10,"stMult":4,"trendLen":100,"stopAtr":3,"shorts":0,"htf":1}
- 2023-02-11: {"stLen":10,"stMult":3,"trendLen":100,"stopAtr":3,"shorts":0,"htf":0}
- 2023-08-12: {"stLen":10,"stMult":3,"trendLen":100,"stopAtr":3,"shorts":0,"htf":0}
- 2024-02-10: {"stLen":14,"stMult":4,"trendLen":100,"stopAtr":3,"shorts":0,"htf":0}
- 2024-08-10: {"stLen":14,"stMult":4,"trendLen":100,"stopAtr":3,"shorts":0,"htf":0}
- 2025-02-08: {"stLen":14,"stMult":4,"trendLen":100,"stopAtr":3,"shorts":0,"htf":0}
- 2025-08-09: {"stLen":14,"stMult":3,"trendLen":100,"stopAtr":3,"shorts":0,"htf":1}
- 2026-02-07: {"stLen":14,"stMult":3,"trendLen":100,"stopAtr":3,"shorts":0,"htf":1}
- 2026-08-08: {"stLen":14,"stMult":3,"trendLen":100,"stopAtr":3,"shorts":1,"htf":1}

### ETHUSDT 1h A+ stacked pullback
- 2019-08-17: {"trendLen":200,"rsiEntry":10,"bbMult":1.5,"stretchAtr":2,"exitLen":3,"stopAtr":2,"maxBars":10}
- 2020-02-15: {"trendLen":200,"rsiEntry":5,"bbMult":2,"stretchAtr":1,"exitLen":3,"stopAtr":2,"maxBars":10}
- 2020-08-15: {"trendLen":200,"rsiEntry":5,"bbMult":1.5,"stretchAtr":2,"exitLen":3,"stopAtr":2,"maxBars":10}
- 2021-02-13: {"trendLen":100,"rsiEntry":10,"bbMult":1.5,"stretchAtr":1.5,"exitLen":5,"stopAtr":2,"maxBars":10}
- 2021-08-14: {"trendLen":100,"rsiEntry":5,"bbMult":1.5,"stretchAtr":1.5,"exitLen":5,"stopAtr":2,"maxBars":10}
- 2022-02-12: {"trendLen":100,"rsiEntry":5,"bbMult":1.5,"stretchAtr":1.5,"exitLen":5,"stopAtr":2,"maxBars":10}
- 2022-08-13: {"trendLen":200,"rsiEntry":5,"bbMult":2,"stretchAtr":2,"exitLen":5,"stopAtr":3,"maxBars":10}
- 2023-02-11: {"trendLen":200,"rsiEntry":5,"bbMult":2,"stretchAtr":2,"exitLen":5,"stopAtr":3,"maxBars":10}
- 2023-08-12: {"trendLen":200,"rsiEntry":5,"bbMult":1.5,"stretchAtr":2,"exitLen":5,"stopAtr":4,"maxBars":10}
- 2024-02-10: stand aside
- 2024-08-10: {"trendLen":200,"rsiEntry":5,"bbMult":1.5,"stretchAtr":1.5,"exitLen":5,"stopAtr":2,"maxBars":10}
- 2025-02-08: {"trendLen":100,"rsiEntry":10,"bbMult":1.5,"stretchAtr":1.5,"exitLen":5,"stopAtr":2,"maxBars":10}
- 2025-08-09: {"trendLen":200,"rsiEntry":5,"bbMult":1.5,"stretchAtr":1.5,"exitLen":5,"stopAtr":2,"maxBars":10}
- 2026-02-07: {"trendLen":100,"rsiEntry":10,"bbMult":1.5,"stretchAtr":1.5,"exitLen":3,"stopAtr":2,"maxBars":10}
- 2026-08-08: {"trendLen":100,"rsiEntry":10,"bbMult":1.5,"stretchAtr":1.5,"exitLen":3,"stopAtr":2,"maxBars":10}

### ETHUSDT 1h Trend band reversion
- 2019-08-17: {"trendLen":100,"bbLen":20,"bbMult":2,"stopAtr":4,"maxBars":10,"shorts":0,"htf":1}
- 2020-02-15: {"trendLen":100,"bbLen":20,"bbMult":2,"stopAtr":2,"maxBars":20,"shorts":0,"htf":0}
- 2020-08-15: {"trendLen":100,"bbLen":20,"bbMult":2,"stopAtr":2,"maxBars":20,"shorts":0,"htf":0}
- 2021-02-13: {"trendLen":100,"bbLen":20,"bbMult":2,"stopAtr":2,"maxBars":20,"shorts":0,"htf":0}
- 2021-08-14: {"trendLen":100,"bbLen":20,"bbMult":2.5,"stopAtr":2,"maxBars":20,"shorts":0,"htf":0}
- 2022-02-12: {"trendLen":100,"bbLen":20,"bbMult":2.5,"stopAtr":2,"maxBars":20,"shorts":1,"htf":1}
- 2022-08-13: {"trendLen":100,"bbLen":20,"bbMult":2.5,"stopAtr":2,"maxBars":20,"shorts":1,"htf":1}
- 2023-02-11: {"trendLen":100,"bbLen":20,"bbMult":2,"stopAtr":4,"maxBars":20,"shorts":0,"htf":1}
- 2023-08-12: stand aside
- 2024-02-10: stand aside
- 2024-08-10: {"trendLen":100,"bbLen":20,"bbMult":2.5,"stopAtr":4,"maxBars":20,"shorts":0,"htf":0}
- 2025-02-08: {"trendLen":100,"bbLen":20,"bbMult":2.5,"stopAtr":2,"maxBars":20,"shorts":1,"htf":1}
- 2025-08-09: {"trendLen":100,"bbLen":20,"bbMult":2.5,"stopAtr":2,"maxBars":20,"shorts":1,"htf":0}
- 2026-02-07: {"trendLen":100,"bbLen":20,"bbMult":2,"stopAtr":2,"maxBars":20,"shorts":0,"htf":0}
- 2026-08-08: {"trendLen":100,"bbLen":20,"bbMult":2.5,"stopAtr":2,"maxBars":20,"shorts":0,"htf":0}

### ETHUSDT 1h Trend pullback, fixed target
- 2019-08-17: {"trendLen":100,"rsiEntry":40,"stopAtr":2,"targetR":0.75,"maxBars":20,"shorts":1,"htf":1}
- 2020-02-15: {"trendLen":100,"rsiEntry":40,"stopAtr":2,"targetR":0.75,"maxBars":20,"shorts":0,"htf":1}
- 2020-08-15: {"trendLen":100,"rsiEntry":40,"stopAtr":2,"targetR":0.75,"maxBars":20,"shorts":0,"htf":1}
- 2021-02-13: {"trendLen":100,"rsiEntry":40,"stopAtr":2,"targetR":0.75,"maxBars":20,"shorts":0,"htf":0}
- 2021-08-14: {"trendLen":100,"rsiEntry":40,"stopAtr":2,"targetR":0.75,"maxBars":20,"shorts":0,"htf":0}
- 2022-02-12: {"trendLen":100,"rsiEntry":35,"stopAtr":3,"targetR":0.75,"maxBars":20,"shorts":1,"htf":0}
- 2022-08-13: {"trendLen":100,"rsiEntry":35,"stopAtr":3,"targetR":0.75,"maxBars":20,"shorts":1,"htf":0}
- 2023-02-11: {"trendLen":100,"rsiEntry":40,"stopAtr":3,"targetR":0.75,"maxBars":20,"shorts":0,"htf":0}
- 2023-08-12: stand aside
- 2024-02-10: {"trendLen":200,"rsiEntry":35,"stopAtr":3,"targetR":0.75,"maxBars":20,"shorts":1,"htf":1}
- 2024-08-10: {"trendLen":200,"rsiEntry":35,"stopAtr":3,"targetR":0.75,"maxBars":20,"shorts":1,"htf":1}
- 2025-02-08: {"trendLen":200,"rsiEntry":35,"stopAtr":3,"targetR":0.75,"maxBars":20,"shorts":1,"htf":1}
- 2025-08-09: {"trendLen":200,"rsiEntry":35,"stopAtr":3,"targetR":0.75,"maxBars":20,"shorts":1,"htf":1}
- 2026-02-07: {"trendLen":100,"rsiEntry":40,"stopAtr":2,"targetR":0.5,"maxBars":20,"shorts":0,"htf":1}
- 2026-08-08: {"trendLen":100,"rsiEntry":35,"stopAtr":1.5,"targetR":0.5,"maxBars":20,"shorts":0,"htf":0}

### ETHUSDT 1h Jurik MA confluence
- 2019-08-17: {"minScore":3,"jmaFastLen":14,"jmaSlowLen":55}
- 2020-02-15: {"minScore":4,"jmaFastLen":9,"jmaSlowLen":34}
- 2020-08-15: {"minScore":4,"jmaFastLen":9,"jmaSlowLen":34}
- 2021-02-13: {"minScore":5,"jmaFastLen":14,"jmaSlowLen":34}
- 2021-08-14: {"minScore":5,"jmaFastLen":14,"jmaSlowLen":34}
- 2022-02-12: {"minScore":5,"jmaFastLen":14,"jmaSlowLen":34}
- 2022-08-13: {"minScore":5,"jmaFastLen":9,"jmaSlowLen":55}
- 2023-02-11: {"minScore":5,"jmaFastLen":7,"jmaSlowLen":55}
- 2023-08-12: {"minScore":5,"jmaFastLen":9,"jmaSlowLen":55}
- 2024-02-10: {"minScore":5,"jmaFastLen":9,"jmaSlowLen":34}
- 2024-08-10: {"minScore":5,"jmaFastLen":7,"jmaSlowLen":34}
- 2025-02-08: stand aside
- 2025-08-09: {"minScore":4,"jmaFastLen":7,"jmaSlowLen":34}
- 2026-02-07: stand aside
- 2026-08-08: stand aside

### SOLUSDT 1d Trend pullback (RSI 2)
- 2022-08-11: stand aside
- 2023-02-09: stand aside
- 2023-08-10: stand aside
- 2024-02-08: {"trendLen":100,"rsiEntry":10,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":1,"htf":0}
- 2024-08-08: stand aside
- 2025-02-06: stand aside
- 2025-08-07: stand aside
- 2026-02-05: {"trendLen":200,"rsiEntry":5,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":1,"htf":0}
- 2026-08-06: {"trendLen":200,"rsiEntry":5,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":1,"htf":0}

### SOLUSDT 1d Supertrend trend-follow
- 2022-08-11: stand aside
- 2023-02-09: stand aside
- 2023-08-10: stand aside
- 2024-02-08: stand aside
- 2024-08-08: stand aside
- 2025-02-06: stand aside
- 2025-08-07: stand aside
- 2026-02-05: stand aside
- 2026-08-06: stand aside

### SOLUSDT 1d A+ stacked pullback
- 2022-08-11: stand aside
- 2023-02-09: stand aside
- 2023-08-10: stand aside
- 2024-02-08: stand aside
- 2024-08-08: stand aside
- 2025-02-06: stand aside
- 2025-08-07: stand aside
- 2026-02-05: stand aside
- 2026-08-06: stand aside

### SOLUSDT 1d Trend band reversion
- 2022-08-11: stand aside
- 2023-02-09: stand aside
- 2023-08-10: stand aside
- 2024-02-08: stand aside
- 2024-08-08: stand aside
- 2025-02-06: stand aside
- 2025-08-07: stand aside
- 2026-02-05: stand aside
- 2026-08-06: stand aside

### SOLUSDT 1d Trend pullback, fixed target
- 2022-08-11: stand aside
- 2023-02-09: stand aside
- 2023-08-10: stand aside
- 2024-02-08: stand aside
- 2024-08-08: stand aside
- 2025-02-06: stand aside
- 2025-08-07: stand aside
- 2026-02-05: stand aside
- 2026-08-06: {"trendLen":200,"rsiEntry":40,"stopAtr":1.5,"targetR":0.33,"maxBars":20,"shorts":1,"htf":0}

### SOLUSDT 1d Jurik MA confluence
- 2022-08-11: stand aside
- 2023-02-09: stand aside
- 2023-08-10: {"minScore":3,"jmaFastLen":7,"jmaSlowLen":34}
- 2024-02-08: stand aside
- 2024-08-08: {"minScore":3,"jmaFastLen":9,"jmaSlowLen":55}
- 2025-02-06: {"minScore":3,"jmaFastLen":9,"jmaSlowLen":55}
- 2025-08-07: {"minScore":3,"jmaFastLen":9,"jmaSlowLen":55}
- 2026-02-05: {"minScore":4,"jmaFastLen":14,"jmaSlowLen":34}
- 2026-08-06: {"minScore":3,"jmaFastLen":9,"jmaSlowLen":34}

### SOLUSDT 4h Trend pullback (RSI 2)
- 2022-08-11: {"trendLen":100,"rsiEntry":10,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":1,"htf":1}
- 2023-02-09: {"trendLen":100,"rsiEntry":15,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":1,"htf":1}
- 2023-08-10: {"trendLen":100,"rsiEntry":10,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":1,"htf":1}
- 2024-02-08: {"trendLen":100,"rsiEntry":10,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":1,"htf":1}
- 2024-08-08: {"trendLen":100,"rsiEntry":5,"exitLen":5,"stopAtr":3,"maxBars":10,"shorts":1,"htf":0}
- 2025-02-06: {"trendLen":100,"rsiEntry":5,"exitLen":5,"stopAtr":3,"maxBars":10,"shorts":1,"htf":0}
- 2025-08-07: {"trendLen":100,"rsiEntry":5,"exitLen":5,"stopAtr":2,"maxBars":10,"shorts":1,"htf":0}
- 2026-02-05: {"trendLen":100,"rsiEntry":5,"exitLen":10,"stopAtr":3,"maxBars":10,"shorts":1,"htf":0}
- 2026-08-06: {"trendLen":100,"rsiEntry":10,"exitLen":5,"stopAtr":2,"maxBars":10,"shorts":1,"htf":0}

### SOLUSDT 4h Supertrend trend-follow
- 2022-08-11: stand aside
- 2023-02-09: stand aside
- 2023-08-10: {"stLen":10,"stMult":2,"trendLen":100,"stopAtr":3,"shorts":0,"htf":0}
- 2024-02-08: {"stLen":14,"stMult":3,"trendLen":200,"stopAtr":3,"shorts":0,"htf":0}
- 2024-08-08: {"stLen":14,"stMult":3,"trendLen":100,"stopAtr":3,"shorts":0,"htf":1}
- 2025-02-06: {"stLen":14,"stMult":3,"trendLen":100,"stopAtr":3,"shorts":0,"htf":1}
- 2025-08-07: {"stLen":10,"stMult":4,"trendLen":100,"stopAtr":3,"shorts":1,"htf":1}
- 2026-02-05: {"stLen":14,"stMult":4,"trendLen":200,"stopAtr":3,"shorts":1,"htf":1}
- 2026-08-06: {"stLen":14,"stMult":2,"trendLen":200,"stopAtr":3,"shorts":0,"htf":0}

### SOLUSDT 4h A+ stacked pullback
- 2022-08-11: {"trendLen":200,"rsiEntry":10,"bbMult":2,"stretchAtr":1,"exitLen":5,"stopAtr":2,"maxBars":10}
- 2023-02-09: {"trendLen":200,"rsiEntry":10,"bbMult":2,"stretchAtr":1,"exitLen":5,"stopAtr":2,"maxBars":10}
- 2023-08-10: {"trendLen":200,"rsiEntry":5,"bbMult":1.5,"stretchAtr":1.5,"exitLen":3,"stopAtr":2,"maxBars":10}
- 2024-02-08: {"trendLen":200,"rsiEntry":10,"bbMult":1.5,"stretchAtr":1.5,"exitLen":3,"stopAtr":3,"maxBars":10}
- 2024-08-08: {"trendLen":200,"rsiEntry":5,"bbMult":1.5,"stretchAtr":1.5,"exitLen":3,"stopAtr":2,"maxBars":10}
- 2025-02-06: stand aside
- 2025-08-07: {"trendLen":100,"rsiEntry":5,"bbMult":1.5,"stretchAtr":1,"exitLen":3,"stopAtr":2,"maxBars":10}
- 2026-02-05: stand aside
- 2026-08-06: stand aside

### SOLUSDT 4h Trend band reversion
- 2022-08-11: {"trendLen":100,"bbLen":20,"bbMult":2,"stopAtr":2,"maxBars":20,"shorts":1,"htf":1}
- 2023-02-09: {"trendLen":200,"bbLen":20,"bbMult":2.5,"stopAtr":2,"maxBars":20,"shorts":1,"htf":0}
- 2023-08-10: {"trendLen":100,"bbLen":20,"bbMult":2,"stopAtr":3,"maxBars":20,"shorts":1,"htf":1}
- 2024-02-08: {"trendLen":100,"bbLen":20,"bbMult":2,"stopAtr":2,"maxBars":20,"shorts":1,"htf":1}
- 2024-08-08: {"trendLen":100,"bbLen":20,"bbMult":2,"stopAtr":2,"maxBars":20,"shorts":0,"htf":0}
- 2025-02-06: {"trendLen":100,"bbLen":20,"bbMult":2,"stopAtr":2,"maxBars":10,"shorts":1,"htf":1}
- 2025-08-07: {"trendLen":100,"bbLen":20,"bbMult":2,"stopAtr":2,"maxBars":10,"shorts":1,"htf":0}
- 2026-02-05: {"trendLen":100,"bbLen":20,"bbMult":2,"stopAtr":2,"maxBars":10,"shorts":1,"htf":0}
- 2026-08-06: {"trendLen":100,"bbLen":20,"bbMult":2,"stopAtr":2,"maxBars":10,"shorts":1,"htf":0}

### SOLUSDT 4h Trend pullback, fixed target
- 2022-08-11: {"trendLen":100,"rsiEntry":40,"stopAtr":1.5,"targetR":0.75,"maxBars":20,"shorts":1,"htf":1}
- 2023-02-09: {"trendLen":100,"rsiEntry":40,"stopAtr":1.5,"targetR":0.75,"maxBars":20,"shorts":1,"htf":1}
- 2023-08-10: {"trendLen":100,"rsiEntry":40,"stopAtr":1.5,"targetR":0.75,"maxBars":20,"shorts":1,"htf":1}
- 2024-02-08: {"trendLen":100,"rsiEntry":40,"stopAtr":2,"targetR":0.5,"maxBars":20,"shorts":1,"htf":0}
- 2024-08-08: {"trendLen":100,"rsiEntry":40,"stopAtr":2,"targetR":0.33,"maxBars":20,"shorts":1,"htf":0}
- 2025-02-06: stand aside
- 2025-08-07: {"trendLen":100,"rsiEntry":40,"stopAtr":2,"targetR":0.75,"maxBars":20,"shorts":1,"htf":0}
- 2026-02-05: stand aside
- 2026-08-06: stand aside

### SOLUSDT 4h Jurik MA confluence
- 2022-08-11: {"minScore":5,"jmaFastLen":14,"jmaSlowLen":55}
- 2023-02-09: {"minScore":4,"jmaFastLen":9,"jmaSlowLen":55}
- 2023-08-10: {"minScore":4,"jmaFastLen":9,"jmaSlowLen":55}
- 2024-02-08: {"minScore":4,"jmaFastLen":9,"jmaSlowLen":55}
- 2024-08-08: {"minScore":4,"jmaFastLen":9,"jmaSlowLen":55}
- 2025-02-06: {"minScore":4,"jmaFastLen":9,"jmaSlowLen":55}
- 2025-08-07: {"minScore":3,"jmaFastLen":14,"jmaSlowLen":55}
- 2026-02-05: {"minScore":3,"jmaFastLen":14,"jmaSlowLen":55}
- 2026-08-06: {"minScore":3,"jmaFastLen":14,"jmaSlowLen":34}

### SOLUSDT 1h Trend pullback (RSI 2)
- 2022-08-11: {"trendLen":100,"rsiEntry":5,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":1,"htf":1}
- 2023-02-09: {"trendLen":100,"rsiEntry":5,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":0,"htf":0}
- 2023-08-10: {"trendLen":100,"rsiEntry":5,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":0,"htf":0}
- 2024-02-08: {"trendLen":200,"rsiEntry":5,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":0,"htf":1}
- 2024-08-08: {"trendLen":200,"rsiEntry":5,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":0,"htf":1}
- 2025-02-06: {"trendLen":100,"rsiEntry":5,"exitLen":5,"stopAtr":2,"maxBars":10,"shorts":0,"htf":1}
- 2025-08-07: {"trendLen":200,"rsiEntry":10,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":0,"htf":1}
- 2026-02-05: {"trendLen":100,"rsiEntry":5,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":0,"htf":1}
- 2026-08-06: {"trendLen":100,"rsiEntry":5,"exitLen":10,"stopAtr":3,"maxBars":10,"shorts":0,"htf":1}

### SOLUSDT 1h Supertrend trend-follow
- 2022-08-11: {"stLen":10,"stMult":4,"trendLen":200,"stopAtr":3,"shorts":1,"htf":1}
- 2023-02-09: {"stLen":14,"stMult":4,"trendLen":100,"stopAtr":3,"shorts":0,"htf":1}
- 2023-08-10: {"stLen":10,"stMult":4,"trendLen":200,"stopAtr":3,"shorts":0,"htf":1}
- 2024-02-08: {"stLen":10,"stMult":3,"trendLen":100,"stopAtr":3,"shorts":0,"htf":1}
- 2024-08-08: {"stLen":14,"stMult":3,"trendLen":100,"stopAtr":3,"shorts":0,"htf":1}
- 2025-02-06: {"stLen":10,"stMult":3,"trendLen":100,"stopAtr":3,"shorts":0,"htf":1}
- 2025-08-07: {"stLen":14,"stMult":4,"trendLen":200,"stopAtr":3,"shorts":0,"htf":0}
- 2026-02-05: {"stLen":14,"stMult":4,"trendLen":200,"stopAtr":3,"shorts":0,"htf":0}
- 2026-08-06: stand aside

### SOLUSDT 1h A+ stacked pullback
- 2022-08-11: {"trendLen":100,"rsiEntry":5,"bbMult":2,"stretchAtr":1,"exitLen":5,"stopAtr":3,"maxBars":10}
- 2023-02-09: {"trendLen":100,"rsiEntry":10,"bbMult":2,"stretchAtr":1,"exitLen":5,"stopAtr":2,"maxBars":10}
- 2023-08-10: {"trendLen":100,"rsiEntry":5,"bbMult":2,"stretchAtr":1,"exitLen":5,"stopAtr":3,"maxBars":10}
- 2024-02-08: {"trendLen":100,"rsiEntry":5,"bbMult":2,"stretchAtr":1,"exitLen":5,"stopAtr":2,"maxBars":10}
- 2024-08-08: {"trendLen":100,"rsiEntry":5,"bbMult":2,"stretchAtr":1,"exitLen":5,"stopAtr":2,"maxBars":10}
- 2025-02-06: {"trendLen":100,"rsiEntry":5,"bbMult":1.5,"stretchAtr":1,"exitLen":5,"stopAtr":2,"maxBars":10}
- 2025-08-07: {"trendLen":100,"rsiEntry":5,"bbMult":1.5,"stretchAtr":1,"exitLen":5,"stopAtr":2,"maxBars":10}
- 2026-02-05: {"trendLen":100,"rsiEntry":5,"bbMult":1.5,"stretchAtr":1,"exitLen":5,"stopAtr":2,"maxBars":10}
- 2026-08-06: {"trendLen":200,"rsiEntry":10,"bbMult":1.5,"stretchAtr":2,"exitLen":5,"stopAtr":2,"maxBars":10}

### SOLUSDT 1h Trend band reversion
- 2022-08-11: {"trendLen":100,"bbLen":20,"bbMult":2,"stopAtr":2,"maxBars":10,"shorts":0,"htf":0}
- 2023-02-09: {"trendLen":100,"bbLen":20,"bbMult":2.5,"stopAtr":2,"maxBars":20,"shorts":1,"htf":0}
- 2023-08-10: {"trendLen":100,"bbLen":20,"bbMult":2,"stopAtr":2,"maxBars":10,"shorts":1,"htf":1}
- 2024-02-08: {"trendLen":100,"bbLen":20,"bbMult":2,"stopAtr":2,"maxBars":20,"shorts":0,"htf":1}
- 2024-08-08: {"trendLen":100,"bbLen":20,"bbMult":2.5,"stopAtr":2,"maxBars":20,"shorts":1,"htf":1}
- 2025-02-06: {"trendLen":100,"bbLen":20,"bbMult":2.5,"stopAtr":2,"maxBars":20,"shorts":0,"htf":1}
- 2025-08-07: {"trendLen":100,"bbLen":20,"bbMult":2.5,"stopAtr":2,"maxBars":20,"shorts":0,"htf":1}
- 2026-02-05: {"trendLen":100,"bbLen":20,"bbMult":2.5,"stopAtr":2,"maxBars":20,"shorts":1,"htf":1}
- 2026-08-06: {"trendLen":100,"bbLen":20,"bbMult":2.5,"stopAtr":4,"maxBars":20,"shorts":1,"htf":1}

### SOLUSDT 1h Trend pullback, fixed target
- 2022-08-11: {"trendLen":100,"rsiEntry":40,"stopAtr":2,"targetR":0.5,"maxBars":20,"shorts":1,"htf":1}
- 2023-02-09: {"trendLen":100,"rsiEntry":35,"stopAtr":1.5,"targetR":0.75,"maxBars":20,"shorts":1,"htf":0}
- 2023-08-10: {"trendLen":100,"rsiEntry":35,"stopAtr":1.5,"targetR":0.75,"maxBars":20,"shorts":1,"htf":0}
- 2024-02-08: {"trendLen":100,"rsiEntry":35,"stopAtr":3,"targetR":0.75,"maxBars":20,"shorts":1,"htf":1}
- 2024-08-08: {"trendLen":100,"rsiEntry":35,"stopAtr":3,"targetR":0.75,"maxBars":20,"shorts":1,"htf":0}
- 2025-02-06: {"trendLen":100,"rsiEntry":40,"stopAtr":1.5,"targetR":0.33,"maxBars":20,"shorts":0,"htf":1}
- 2025-08-07: {"trendLen":200,"rsiEntry":35,"stopAtr":3,"targetR":0.33,"maxBars":20,"shorts":0,"htf":1}
- 2026-02-05: {"trendLen":100,"rsiEntry":40,"stopAtr":2,"targetR":0.75,"maxBars":20,"shorts":1,"htf":1}
- 2026-08-06: {"trendLen":200,"rsiEntry":35,"stopAtr":1.5,"targetR":0.75,"maxBars":20,"shorts":0,"htf":1}

### SOLUSDT 1h Jurik MA confluence
- 2022-08-11: {"minScore":3,"jmaFastLen":9,"jmaSlowLen":34}
- 2023-02-09: {"minScore":3,"jmaFastLen":9,"jmaSlowLen":34}
- 2023-08-10: {"minScore":3,"jmaFastLen":9,"jmaSlowLen":34}
- 2024-02-08: {"minScore":5,"jmaFastLen":9,"jmaSlowLen":34}
- 2024-08-08: {"minScore":5,"jmaFastLen":9,"jmaSlowLen":34}
- 2025-02-06: {"minScore":5,"jmaFastLen":9,"jmaSlowLen":34}
- 2025-08-07: {"minScore":5,"jmaFastLen":7,"jmaSlowLen":34}
- 2026-02-05: {"minScore":5,"jmaFastLen":7,"jmaSlowLen":34}
- 2026-08-06: stand aside
