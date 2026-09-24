# Walk-forward results

Generated 2026-09-24. Train 730d → test 182d, rolling. Parameters are chosen on the
train window only (needs ≥15 trades, win rate ≥0%, PF ≥1.2, no liquidations); when none
qualify the strategy stands aside. **Every number below is out-of-sample.** Costs: 0.02% fee + 0% slippage
per side, 0.01%/8h funding always paid, 5x isolated margin. R = multiples of the initial stop risk.

| Asset | TF | Strategy | OOS trades | Win rate | PF | Avg R | Total R | Max DD (R) | Worst trade (R) | Max losing streak | Liq | Windows traded |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| BTCUSDT | 1d | Trend pullback (RSI 2) | 102 | 68.6% | 1.38 | 0.07 | 7.3 | 3.4 | -1.07 | 4 | 0 | 15/15 |
| BTCUSDT | 1d | Supertrend trend-follow | 0 | 0.0% | 0.00 | 0.00 | 0.0 | 0.0 | 0.00 | 0 | 0 | 0/15 |
| BTCUSDT | 1d | A+ stacked pullback | 0 | 0.0% | 0.00 | 0.00 | 0.0 | 0.0 | 0.00 | 0 | 0 | 0/15 |
| BTCUSDT | 1d | Trend band reversion | 2 | 50.0% | 16.47 | 0.41 | 0.8 | 0.1 | -0.05 | 1 | 0 | 1/15 |
| BTCUSDT | 1d | Trend pullback, fixed target | 21 | 61.9% | 0.65 | -0.14 | -2.9 | 4.8 | -1.09 | 3 | 0 | 6/15 |
| BTCUSDT | 1d | Jurik MA confluence | 100 | 32.0% | 1.36 | 0.17 | 16.6 | 8.4 | -1.06 | 8 | 0 | 15/15 |
| BTCUSDT | 4h | Trend pullback (RSI 2) | 354 | 63.6% | 0.92 | -0.02 | -7.6 | 15.0 | -1.06 | 4 | 0 | 13/15 |
| BTCUSDT | 4h | Supertrend trend-follow | 72 | 33.3% | 1.51 | 0.28 | 20.5 | 11.5 | -1.10 | 9 | 0 | 15/15 |
| BTCUSDT | 4h | A+ stacked pullback | 37 | 59.5% | 1.00 | -0.00 | -0.0 | 1.5 | -1.03 | 3 | 0 | 11/15 |
| BTCUSDT | 4h | Trend band reversion | 93 | 55.9% | 0.90 | -0.04 | -3.3 | 7.0 | -1.04 | 6 | 0 | 11/15 |
| BTCUSDT | 4h | Trend pullback, fixed target | 104 | 57.7% | 0.77 | -0.09 | -9.2 | 15.0 | -1.07 | 4 | 0 | 15/15 |
| BTCUSDT | 4h | Jurik MA confluence | 296 | 33.4% | 1.07 | 0.03 | 10.2 | 28.2 | -1.06 | 17 | 0 | 14/15 |
| BTCUSDT | 1h | Trend pullback (RSI 2) | 785 | 65.7% | 1.03 | 0.01 | 5.4 | 18.1 | -1.14 | 5 | 0 | 13/15 |
| BTCUSDT | 1h | Supertrend trend-follow | 275 | 36.0% | 1.44 | 0.21 | 58.9 | 25.2 | -1.09 | 13 | 0 | 15/15 |
| BTCUSDT | 1h | A+ stacked pullback | 153 | 64.1% | 0.99 | -0.00 | -0.2 | 9.5 | -1.08 | 4 | 0 | 15/15 |
| BTCUSDT | 1h | Trend band reversion | 257 | 59.5% | 1.00 | 0.00 | 0.1 | 9.9 | -1.08 | 6 | 0 | 14/15 |
| BTCUSDT | 1h | Trend pullback, fixed target | 182 | 62.1% | 0.99 | -0.00 | -0.5 | 12.2 | -1.12 | 5 | 0 | 13/15 |
| BTCUSDT | 1h | Jurik MA confluence | 1121 | 33.7% | 1.10 | 0.04 | 49.5 | 28.8 | -1.17 | 14 | 0 | 12/15 |
| ETHUSDT | 1d | Trend pullback (RSI 2) | 45 | 66.7% | 1.11 | 0.02 | 1.0 | 3.4 | -1.03 | 2 | 2 | 9/15 |
| ETHUSDT | 1d | Supertrend trend-follow | 0 | 0.0% | 0.00 | 0.00 | 0.0 | 0.0 | 0.00 | 0 | 0 | 0/15 |
| ETHUSDT | 1d | A+ stacked pullback | 0 | 0.0% | 0.00 | 0.00 | 0.0 | 0.0 | 0.00 | 0 | 0 | 0/15 |
| ETHUSDT | 1d | Trend band reversion | 0 | 0.0% | 0.00 | 0.00 | 0.0 | 0.0 | 0.00 | 0 | 0 | 0/15 |
| ETHUSDT | 1d | Trend pullback, fixed target | 12 | 66.7% | 1.12 | 0.04 | 0.5 | 2.0 | -1.06 | 2 | 0 | 4/15 |
| ETHUSDT | 1d | Jurik MA confluence | 87 | 41.4% | 1.43 | 0.18 | 16.0 | 7.3 | -1.05 | 8 | 0 | 14/15 |
| ETHUSDT | 4h | Trend pullback (RSI 2) | 328 | 65.5% | 0.93 | -0.02 | -5.1 | 13.3 | -1.03 | 8 | 0 | 13/15 |
| ETHUSDT | 4h | Supertrend trend-follow | 77 | 36.4% | 2.50 | 0.64 | 49.4 | 9.8 | -1.05 | 9 | 0 | 15/15 |
| ETHUSDT | 4h | A+ stacked pullback | 55 | 60.0% | 0.49 | -0.15 | -8.4 | 9.2 | -1.03 | 4 | 0 | 8/15 |
| ETHUSDT | 4h | Trend band reversion | 84 | 64.3% | 1.27 | 0.09 | 7.7 | 4.5 | -1.04 | 4 | 0 | 13/15 |
| ETHUSDT | 4h | Trend pullback, fixed target | 76 | 51.3% | 0.76 | -0.12 | -8.8 | 11.3 | -1.04 | 6 | 0 | 13/15 |
| ETHUSDT | 4h | Jurik MA confluence | 303 | 37.0% | 1.27 | 0.12 | 37.0 | 21.6 | -1.03 | 9 | 0 | 15/15 |
| ETHUSDT | 1h | Trend pullback (RSI 2) | 838 | 66.3% | 1.00 | 0.00 | 0.4 | 25.7 | -1.07 | 4 | 0 | 12/15 |
| ETHUSDT | 1h | Supertrend trend-follow | 202 | 36.1% | 2.00 | 0.54 | 109.9 | 14.3 | -1.12 | 14 | 0 | 15/15 |
| ETHUSDT | 1h | A+ stacked pullback | 136 | 66.9% | 1.13 | 0.03 | 3.9 | 5.4 | -1.04 | 4 | 0 | 15/15 |
| ETHUSDT | 1h | Trend band reversion | 279 | 59.1% | 0.98 | -0.01 | -2.5 | 16.8 | -1.06 | 5 | 0 | 15/15 |
| ETHUSDT | 1h | Trend pullback, fixed target | 219 | 58.9% | 1.11 | 0.04 | 8.3 | 9.4 | -1.06 | 6 | 0 | 14/15 |
| ETHUSDT | 1h | Jurik MA confluence | 1030 | 35.3% | 1.22 | 0.10 | 106.0 | 32.5 | -1.08 | 14 | 0 | 14/15 |
| SOLUSDT | 1d | Trend pullback (RSI 2) | 12 | 50.0% | 0.46 | -0.27 | -3.3 | 4.4 | -1.03 | 2 | 0 | 3/9 |
| SOLUSDT | 1d | Supertrend trend-follow | 0 | 0.0% | 0.00 | 0.00 | 0.0 | 0.0 | 0.00 | 0 | 0 | 0/9 |
| SOLUSDT | 1d | A+ stacked pullback | 0 | 0.0% | 0.00 | 0.00 | 0.0 | 0.0 | 0.00 | 0 | 0 | 0/9 |
| SOLUSDT | 1d | Trend band reversion | 0 | 0.0% | 0.00 | 0.00 | 0.0 | 0.0 | 0.00 | 0 | 0 | 0/9 |
| SOLUSDT | 1d | Trend pullback, fixed target | 1 | 100.0% | ∞ | 0.32 | 0.3 | 0.0 | 0.32 | 0 | 0 | 1/9 |
| SOLUSDT | 1d | Jurik MA confluence | 23 | 43.5% | 2.10 | 0.47 | 10.9 | 3.3 | -1.03 | 4 | 1 | 6/9 |
| SOLUSDT | 4h | Trend pullback (RSI 2) | 270 | 64.8% | 1.01 | 0.00 | 0.3 | 8.3 | -1.03 | 3 | 0 | 9/9 |
| SOLUSDT | 4h | Supertrend trend-follow | 41 | 31.7% | 1.57 | 0.31 | 12.5 | 6.7 | -1.07 | 5 | 0 | 7/9 |
| SOLUSDT | 4h | A+ stacked pullback | 32 | 59.4% | 0.64 | -0.09 | -3.0 | 3.9 | -1.02 | 4 | 0 | 6/9 |
| SOLUSDT | 4h | Trend band reversion | 77 | 63.6% | 1.38 | 0.11 | 8.7 | 6.3 | -1.03 | 7 | 0 | 9/9 |
| SOLUSDT | 4h | Trend pullback, fixed target | 56 | 55.4% | 0.76 | -0.10 | -5.4 | 6.2 | -1.04 | 4 | 0 | 7/9 |
| SOLUSDT | 4h | Jurik MA confluence | 198 | 37.9% | 1.35 | 0.15 | 28.9 | 10.0 | -1.03 | 9 | 0 | 9/9 |
| SOLUSDT | 1h | Trend pullback (RSI 2) | 316 | 63.6% | 1.17 | 0.04 | 14.0 | 7.5 | -1.05 | 4 | 0 | 9/9 |
| SOLUSDT | 1h | Supertrend trend-follow | 101 | 34.7% | 1.28 | 0.14 | 14.4 | 12.2 | -1.05 | 10 | 0 | 9/9 |
| SOLUSDT | 1h | A+ stacked pullback | 60 | 78.3% | 2.76 | 0.15 | 8.7 | 1.2 | -1.02 | 2 | 0 | 9/9 |
| SOLUSDT | 1h | Trend band reversion | 152 | 57.9% | 1.06 | 0.02 | 3.3 | 6.6 | -1.05 | 6 | 0 | 9/9 |
| SOLUSDT | 1h | Trend pullback, fixed target | 72 | 69.4% | 1.12 | 0.04 | 2.5 | 3.6 | -1.05 | 2 | 0 | 9/9 |
| SOLUSDT | 1h | Jurik MA confluence | 917 | 35.3% | 1.21 | 0.09 | 84.7 | 18.9 | -1.05 | 16 | 0 | 8/9 |

## Pooled across assets

| Strategy / TF | Trades | Win rate | PF | Avg R | Total R |
|---|---|---|---|---|---|
| rsi2-pullback 1d | 159 | 66.7% | 1.15 | 0.03 | 5.0 |
| supertrend 1d | 0 | 0.0% | 0.00 | 0.00 | 0.0 |
| stacked-pullback 1d | 0 | 0.0% | 0.00 | 0.00 | 0.0 |
| band-reversion 1d | 2 | 50.0% | 16.47 | 0.41 | 0.8 |
| pullback-scalp 1d | 34 | 64.7% | 0.83 | -0.06 | -2.1 |
| jma-confluence 1d | 210 | 37.1% | 1.47 | 0.21 | 43.5 |
| rsi2-pullback 4h | 952 | 64.6% | 0.95 | -0.01 | -12.5 |
| supertrend 4h | 190 | 34.2% | 1.87 | 0.43 | 82.4 |
| stacked-pullback 4h | 124 | 59.7% | 0.62 | -0.09 | -11.4 |
| band-reversion 4h | 254 | 61.0% | 1.16 | 0.05 | 13.1 |
| pullback-scalp 4h | 236 | 55.1% | 0.76 | -0.10 | -23.3 |
| jma-confluence 4h | 797 | 35.9% | 1.21 | 0.10 | 76.2 |
| rsi2-pullback 1h | 1939 | 65.7% | 1.04 | 0.01 | 19.8 |
| supertrend 1h | 578 | 35.8% | 1.62 | 0.32 | 183.2 |
| stacked-pullback 1h | 349 | 67.6% | 1.17 | 0.04 | 12.4 |
| band-reversion 1h | 688 | 59.0% | 1.00 | 0.00 | 0.9 |
| pullback-scalp 1h | 473 | 61.7% | 1.06 | 0.02 | 10.4 |
| jma-confluence 1h | 3068 | 34.7% | 1.17 | 0.08 | 240.2 |

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
- 2023-02-11: {"trendLen":200,"rsiEntry":40,"stopAtr":1.5,"targetR":0.33,"maxBars":20,"shorts":1,"htf":0}
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
- 2023-08-12: {"minScore":3,"jmaFastLen":9,"jmaSlowLen":34}
- 2024-02-10: {"minScore":3,"jmaFastLen":7,"jmaSlowLen":34}
- 2024-08-10: {"minScore":3,"jmaFastLen":7,"jmaSlowLen":34}
- 2025-02-08: {"minScore":3,"jmaFastLen":9,"jmaSlowLen":55}
- 2025-08-09: {"minScore":3,"jmaFastLen":9,"jmaSlowLen":55}
- 2026-02-07: {"minScore":4,"jmaFastLen":7,"jmaSlowLen":55}
- 2026-08-08: {"minScore":3,"jmaFastLen":7,"jmaSlowLen":34}

### BTCUSDT 4h Trend pullback (RSI 2)
- 2019-08-17: {"trendLen":100,"rsiEntry":15,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":1,"htf":0}
- 2020-02-15: {"trendLen":100,"rsiEntry":15,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":1,"htf":0}
- 2020-08-15: {"trendLen":100,"rsiEntry":5,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":0,"htf":1}
- 2021-02-13: {"trendLen":100,"rsiEntry":5,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":0,"htf":1}
- 2021-08-14: {"trendLen":100,"rsiEntry":5,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":0,"htf":1}
- 2022-02-12: {"trendLen":100,"rsiEntry":10,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":1,"htf":1}
- 2022-08-13: {"trendLen":200,"rsiEntry":5,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":1,"htf":0}
- 2023-02-11: {"trendLen":200,"rsiEntry":15,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":1,"htf":1}
- 2023-08-12: {"trendLen":200,"rsiEntry":15,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":1,"htf":1}
- 2024-02-10: {"trendLen":100,"rsiEntry":5,"exitLen":5,"stopAtr":2,"maxBars":10,"shorts":1,"htf":0}
- 2024-08-10: {"trendLen":200,"rsiEntry":5,"exitLen":5,"stopAtr":2,"maxBars":10,"shorts":0,"htf":1}
- 2025-02-08: stand aside
- 2025-08-09: {"trendLen":200,"rsiEntry":5,"exitLen":5,"stopAtr":2,"maxBars":10,"shorts":0,"htf":1}
- 2026-02-07: {"trendLen":200,"rsiEntry":5,"exitLen":5,"stopAtr":2,"maxBars":10,"shorts":1,"htf":1}
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
- 2021-02-13: {"trendLen":100,"rsiEntry":10,"bbMult":1.5,"stretchAtr":1,"exitLen":3,"stopAtr":4,"maxBars":10}
- 2021-08-14: {"trendLen":200,"rsiEntry":5,"bbMult":1.5,"stretchAtr":1,"exitLen":5,"stopAtr":4,"maxBars":10}
- 2022-02-12: {"trendLen":100,"rsiEntry":10,"bbMult":2,"stretchAtr":1,"exitLen":3,"stopAtr":3,"maxBars":10}
- 2022-08-13: {"trendLen":200,"rsiEntry":5,"bbMult":2,"stretchAtr":1,"exitLen":5,"stopAtr":3,"maxBars":10}
- 2023-02-11: {"trendLen":100,"rsiEntry":10,"bbMult":1.5,"stretchAtr":1,"exitLen":5,"stopAtr":3,"maxBars":10}
- 2023-08-12: stand aside
- 2024-02-10: {"trendLen":200,"rsiEntry":10,"bbMult":2,"stretchAtr":1.5,"exitLen":3,"stopAtr":2,"maxBars":10}
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
- 2021-08-14: {"trendLen":200,"bbLen":20,"bbMult":2.5,"stopAtr":4,"maxBars":20,"shorts":1,"htf":0}
- 2022-02-12: {"trendLen":100,"bbLen":20,"bbMult":2,"stopAtr":4,"maxBars":20,"shorts":1,"htf":0}
- 2022-08-13: {"trendLen":200,"bbLen":20,"bbMult":2.5,"stopAtr":3,"maxBars":10,"shorts":1,"htf":1}
- 2023-02-11: {"trendLen":200,"bbLen":20,"bbMult":2.5,"stopAtr":2,"maxBars":10,"shorts":1,"htf":1}
- 2023-08-12: {"trendLen":200,"bbLen":20,"bbMult":2.5,"stopAtr":2,"maxBars":10,"shorts":1,"htf":1}
- 2024-02-10: {"trendLen":200,"bbLen":20,"bbMult":2.5,"stopAtr":2,"maxBars":10,"shorts":1,"htf":1}
- 2024-08-10: {"trendLen":100,"bbLen":20,"bbMult":2.5,"stopAtr":2,"maxBars":10,"shorts":1,"htf":1}
- 2025-02-08: {"trendLen":200,"bbLen":20,"bbMult":2.5,"stopAtr":4,"maxBars":20,"shorts":1,"htf":0}
- 2025-08-09: {"trendLen":200,"bbLen":20,"bbMult":2.5,"stopAtr":4,"maxBars":20,"shorts":1,"htf":0}
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
- 2023-02-11: {"trendLen":200,"rsiEntry":40,"stopAtr":1.5,"targetR":0.75,"maxBars":20,"shorts":1,"htf":0}
- 2023-08-12: {"trendLen":200,"rsiEntry":40,"stopAtr":2,"targetR":0.5,"maxBars":20,"shorts":0,"htf":1}
- 2024-02-10: {"trendLen":200,"rsiEntry":40,"stopAtr":2,"targetR":0.5,"maxBars":20,"shorts":0,"htf":1}
- 2024-08-10: {"trendLen":200,"rsiEntry":40,"stopAtr":2,"targetR":0.5,"maxBars":20,"shorts":0,"htf":1}
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
- 2022-02-12: {"minScore":3,"jmaFastLen":7,"jmaSlowLen":34}
- 2022-08-13: {"minScore":5,"jmaFastLen":14,"jmaSlowLen":34}
- 2023-02-11: {"minScore":5,"jmaFastLen":14,"jmaSlowLen":34}
- 2023-08-12: stand aside
- 2024-02-10: {"minScore":4,"jmaFastLen":7,"jmaSlowLen":34}
- 2024-08-10: {"minScore":4,"jmaFastLen":7,"jmaSlowLen":34}
- 2025-02-08: {"minScore":3,"jmaFastLen":14,"jmaSlowLen":34}
- 2025-08-09: {"minScore":3,"jmaFastLen":14,"jmaSlowLen":34}
- 2026-02-07: {"minScore":5,"jmaFastLen":14,"jmaSlowLen":34}
- 2026-08-08: {"minScore":3,"jmaFastLen":14,"jmaSlowLen":34}

### BTCUSDT 1h Trend pullback (RSI 2)
- 2019-08-17: {"trendLen":100,"rsiEntry":10,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":0,"htf":0}
- 2020-02-15: {"trendLen":100,"rsiEntry":5,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":1,"htf":0}
- 2020-08-15: {"trendLen":100,"rsiEntry":5,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":1,"htf":0}
- 2021-02-13: {"trendLen":100,"rsiEntry":10,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":1,"htf":0}
- 2021-08-14: {"trendLen":100,"rsiEntry":10,"exitLen":5,"stopAtr":2,"maxBars":10,"shorts":0,"htf":1}
- 2022-02-12: {"trendLen":100,"rsiEntry":10,"exitLen":5,"stopAtr":2,"maxBars":10,"shorts":1,"htf":1}
- 2022-08-13: {"trendLen":100,"rsiEntry":10,"exitLen":5,"stopAtr":2,"maxBars":10,"shorts":0,"htf":1}
- 2023-02-11: {"trendLen":100,"rsiEntry":10,"exitLen":5,"stopAtr":2,"maxBars":10,"shorts":0,"htf":1}
- 2023-08-12: {"trendLen":100,"rsiEntry":5,"exitLen":10,"stopAtr":4,"maxBars":10,"shorts":0,"htf":1}
- 2024-02-10: {"trendLen":100,"rsiEntry":5,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":0,"htf":1}
- 2024-08-10: {"trendLen":100,"rsiEntry":5,"exitLen":10,"stopAtr":4,"maxBars":10,"shorts":0,"htf":0}
- 2025-02-08: stand aside
- 2025-08-09: {"trendLen":100,"rsiEntry":10,"exitLen":10,"stopAtr":4,"maxBars":10,"shorts":0,"htf":1}
- 2026-02-07: stand aside
- 2026-08-08: {"trendLen":100,"rsiEntry":15,"exitLen":5,"stopAtr":2,"maxBars":10,"shorts":0,"htf":1}

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
- 2024-08-10: {"trendLen":100,"rsiEntry":5,"bbMult":1.5,"stretchAtr":1.5,"exitLen":3,"stopAtr":3,"maxBars":10}
- 2025-02-08: {"trendLen":100,"rsiEntry":5,"bbMult":2,"stretchAtr":1,"exitLen":3,"stopAtr":4,"maxBars":10}
- 2025-08-09: {"trendLen":100,"rsiEntry":5,"bbMult":2,"stretchAtr":1.5,"exitLen":3,"stopAtr":4,"maxBars":10}
- 2026-02-07: {"trendLen":200,"rsiEntry":5,"bbMult":2,"stretchAtr":1,"exitLen":3,"stopAtr":3,"maxBars":10}
- 2026-08-08: {"trendLen":200,"rsiEntry":5,"bbMult":2,"stretchAtr":1,"exitLen":3,"stopAtr":2,"maxBars":10}

### BTCUSDT 1h Trend band reversion
- 2019-08-17: {"trendLen":200,"bbLen":20,"bbMult":2.5,"stopAtr":2,"maxBars":20,"shorts":0,"htf":0}
- 2020-02-15: {"trendLen":100,"bbLen":20,"bbMult":2.5,"stopAtr":2,"maxBars":20,"shorts":0,"htf":0}
- 2020-08-15: {"trendLen":100,"bbLen":20,"bbMult":2,"stopAtr":2,"maxBars":20,"shorts":0,"htf":0}
- 2021-02-13: {"trendLen":100,"bbLen":20,"bbMult":2,"stopAtr":2,"maxBars":20,"shorts":1,"htf":0}
- 2021-08-14: {"trendLen":100,"bbLen":20,"bbMult":2,"stopAtr":2,"maxBars":20,"shorts":0,"htf":0}
- 2022-02-12: {"trendLen":100,"bbLen":20,"bbMult":2,"stopAtr":2,"maxBars":20,"shorts":1,"htf":1}
- 2022-08-13: {"trendLen":100,"bbLen":20,"bbMult":2,"stopAtr":2,"maxBars":20,"shorts":0,"htf":1}
- 2023-02-11: {"trendLen":100,"bbLen":20,"bbMult":2,"stopAtr":2,"maxBars":20,"shorts":0,"htf":1}
- 2023-08-12: {"trendLen":100,"bbLen":20,"bbMult":2,"stopAtr":2,"maxBars":20,"shorts":0,"htf":1}
- 2024-02-10: stand aside
- 2024-08-10: {"trendLen":100,"bbLen":20,"bbMult":2,"stopAtr":3,"maxBars":20,"shorts":0,"htf":0}
- 2025-02-08: {"trendLen":100,"bbLen":20,"bbMult":2.5,"stopAtr":3,"maxBars":20,"shorts":1,"htf":1}
- 2025-08-09: {"trendLen":200,"bbLen":20,"bbMult":2.5,"stopAtr":2,"maxBars":20,"shorts":0,"htf":1}
- 2026-02-07: {"trendLen":200,"bbLen":20,"bbMult":2.5,"stopAtr":4,"maxBars":10,"shorts":0,"htf":1}
- 2026-08-08: {"trendLen":200,"bbLen":20,"bbMult":2.5,"stopAtr":2,"maxBars":10,"shorts":0,"htf":1}

### BTCUSDT 1h Trend pullback, fixed target
- 2019-08-17: {"trendLen":100,"rsiEntry":40,"stopAtr":1.5,"targetR":0.75,"maxBars":20,"shorts":0,"htf":0}
- 2020-02-15: {"trendLen":100,"rsiEntry":40,"stopAtr":1.5,"targetR":0.75,"maxBars":20,"shorts":0,"htf":0}
- 2020-08-15: {"trendLen":100,"rsiEntry":40,"stopAtr":2,"targetR":0.75,"maxBars":20,"shorts":0,"htf":0}
- 2021-02-13: {"trendLen":100,"rsiEntry":40,"stopAtr":2,"targetR":0.75,"maxBars":20,"shorts":0,"htf":0}
- 2021-08-14: {"trendLen":100,"rsiEntry":40,"stopAtr":1.5,"targetR":0.75,"maxBars":20,"shorts":0,"htf":0}
- 2022-02-12: {"trendLen":100,"rsiEntry":40,"stopAtr":2,"targetR":0.5,"maxBars":20,"shorts":0,"htf":0}
- 2022-08-13: stand aside
- 2023-02-11: {"trendLen":200,"rsiEntry":40,"stopAtr":1.5,"targetR":0.5,"maxBars":20,"shorts":0,"htf":1}
- 2023-08-12: {"trendLen":100,"rsiEntry":35,"stopAtr":2,"targetR":0.5,"maxBars":20,"shorts":1,"htf":0}
- 2024-02-10: {"trendLen":100,"rsiEntry":35,"stopAtr":2,"targetR":0.5,"maxBars":20,"shorts":1,"htf":0}
- 2024-08-10: {"trendLen":100,"rsiEntry":35,"stopAtr":2,"targetR":0.75,"maxBars":20,"shorts":1,"htf":1}
- 2025-02-08: {"trendLen":100,"rsiEntry":35,"stopAtr":1.5,"targetR":0.75,"maxBars":20,"shorts":1,"htf":1}
- 2025-08-09: stand aside
- 2026-02-07: {"trendLen":200,"rsiEntry":35,"stopAtr":2,"targetR":0.75,"maxBars":20,"shorts":1,"htf":0}
- 2026-08-08: {"trendLen":200,"rsiEntry":35,"stopAtr":2,"targetR":0.75,"maxBars":20,"shorts":1,"htf":0}

### BTCUSDT 1h Jurik MA confluence
- 2019-08-17: {"minScore":3,"jmaFastLen":14,"jmaSlowLen":55}
- 2020-02-15: {"minScore":3,"jmaFastLen":14,"jmaSlowLen":55}
- 2020-08-15: {"minScore":3,"jmaFastLen":14,"jmaSlowLen":55}
- 2021-02-13: {"minScore":4,"jmaFastLen":14,"jmaSlowLen":34}
- 2021-08-14: {"minScore":3,"jmaFastLen":9,"jmaSlowLen":55}
- 2022-02-12: {"minScore":3,"jmaFastLen":14,"jmaSlowLen":34}
- 2022-08-13: {"minScore":4,"jmaFastLen":14,"jmaSlowLen":55}
- 2023-02-11: {"minScore":4,"jmaFastLen":9,"jmaSlowLen":55}
- 2023-08-12: stand aside
- 2024-02-10: stand aside
- 2024-08-10: stand aside
- 2025-02-08: {"minScore":5,"jmaFastLen":7,"jmaSlowLen":34}
- 2025-08-09: {"minScore":5,"jmaFastLen":14,"jmaSlowLen":34}
- 2026-02-07: {"minScore":5,"jmaFastLen":9,"jmaSlowLen":55}
- 2026-08-08: {"minScore":5,"jmaFastLen":14,"jmaSlowLen":34}

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
- 2026-08-08: {"trendLen":200,"rsiEntry":40,"stopAtr":2,"targetR":0.33,"maxBars":20,"shorts":1,"htf":0}

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
- 2020-02-15: {"trendLen":200,"rsiEntry":15,"exitLen":10,"stopAtr":4,"maxBars":10,"shorts":0,"htf":1}
- 2020-08-15: {"trendLen":200,"rsiEntry":15,"exitLen":5,"stopAtr":2,"maxBars":10,"shorts":0,"htf":1}
- 2021-02-13: {"trendLen":200,"rsiEntry":15,"exitLen":5,"stopAtr":4,"maxBars":10,"shorts":0,"htf":0}
- 2021-08-14: {"trendLen":100,"rsiEntry":15,"exitLen":5,"stopAtr":4,"maxBars":10,"shorts":0,"htf":0}
- 2022-02-12: {"trendLen":100,"rsiEntry":15,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":0,"htf":0}
- 2022-08-13: {"trendLen":200,"rsiEntry":10,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":0,"htf":0}
- 2023-02-11: {"trendLen":100,"rsiEntry":10,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":0,"htf":1}
- 2023-08-12: {"trendLen":100,"rsiEntry":10,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":0,"htf":1}
- 2024-02-10: {"trendLen":100,"rsiEntry":5,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":0,"htf":1}
- 2024-08-10: {"trendLen":100,"rsiEntry":15,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":0,"htf":1}
- 2025-02-08: stand aside
- 2025-08-09: {"trendLen":100,"rsiEntry":5,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":1,"htf":1}
- 2026-02-07: {"trendLen":100,"rsiEntry":5,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":1,"htf":0}
- 2026-08-08: {"trendLen":200,"rsiEntry":15,"exitLen":5,"stopAtr":2,"maxBars":10,"shorts":1,"htf":0}

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
- 2021-02-13: {"trendLen":200,"rsiEntry":10,"bbMult":1.5,"stretchAtr":1.5,"exitLen":5,"stopAtr":2,"maxBars":10}
- 2021-08-14: stand aside
- 2022-02-12: {"trendLen":100,"rsiEntry":10,"bbMult":1.5,"stretchAtr":1,"exitLen":5,"stopAtr":2,"maxBars":10}
- 2022-08-13: {"trendLen":200,"rsiEntry":10,"bbMult":1.5,"stretchAtr":1,"exitLen":5,"stopAtr":3,"maxBars":10}
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
- 2022-02-12: {"trendLen":100,"bbLen":20,"bbMult":2,"stopAtr":2,"maxBars":20,"shorts":0,"htf":1}
- 2022-08-13: {"trendLen":100,"bbLen":20,"bbMult":2,"stopAtr":2,"maxBars":20,"shorts":0,"htf":1}
- 2023-02-11: {"trendLen":100,"bbLen":20,"bbMult":2,"stopAtr":2,"maxBars":20,"shorts":1,"htf":0}
- 2023-08-12: {"trendLen":100,"bbLen":20,"bbMult":2,"stopAtr":2,"maxBars":20,"shorts":1,"htf":0}
- 2024-02-10: {"trendLen":100,"bbLen":20,"bbMult":2,"stopAtr":2,"maxBars":20,"shorts":1,"htf":0}
- 2024-08-10: {"trendLen":100,"bbLen":20,"bbMult":2.5,"stopAtr":2,"maxBars":20,"shorts":1,"htf":1}
- 2025-02-08: stand aside
- 2025-08-09: {"trendLen":100,"bbLen":20,"bbMult":2,"stopAtr":2,"maxBars":20,"shorts":1,"htf":1}
- 2026-02-07: {"trendLen":100,"bbLen":20,"bbMult":2,"stopAtr":2,"maxBars":20,"shorts":1,"htf":1}
- 2026-08-08: {"trendLen":200,"bbLen":20,"bbMult":2,"stopAtr":2,"maxBars":20,"shorts":1,"htf":1}

### ETHUSDT 4h Trend pullback, fixed target
- 2019-08-17: stand aside
- 2020-02-15: {"trendLen":100,"rsiEntry":40,"stopAtr":1.5,"targetR":0.75,"maxBars":20,"shorts":1,"htf":0}
- 2020-08-15: {"trendLen":100,"rsiEntry":40,"stopAtr":2,"targetR":0.75,"maxBars":20,"shorts":0,"htf":0}
- 2021-02-13: {"trendLen":100,"rsiEntry":40,"stopAtr":2,"targetR":0.75,"maxBars":20,"shorts":1,"htf":0}
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
- 2026-08-08: {"trendLen":200,"rsiEntry":40,"stopAtr":1.5,"targetR":0.75,"maxBars":20,"shorts":1,"htf":1}

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
- 2019-08-17: {"trendLen":100,"rsiEntry":15,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":1,"htf":1}
- 2020-02-15: {"trendLen":200,"rsiEntry":15,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":1,"htf":1}
- 2020-08-15: {"trendLen":100,"rsiEntry":5,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":0,"htf":0}
- 2021-02-13: {"trendLen":100,"rsiEntry":10,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":0,"htf":1}
- 2021-08-14: {"trendLen":100,"rsiEntry":10,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":0,"htf":1}
- 2022-02-12: {"trendLen":100,"rsiEntry":10,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":1,"htf":1}
- 2022-08-13: {"trendLen":100,"rsiEntry":10,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":0,"htf":1}
- 2023-02-11: {"trendLen":100,"rsiEntry":5,"exitLen":5,"stopAtr":4,"maxBars":10,"shorts":1,"htf":1}
- 2023-08-12: stand aside
- 2024-02-10: {"trendLen":200,"rsiEntry":5,"exitLen":5,"stopAtr":3,"maxBars":10,"shorts":1,"htf":1}
- 2024-08-10: stand aside
- 2025-02-08: stand aside
- 2025-08-09: {"trendLen":200,"rsiEntry":5,"exitLen":5,"stopAtr":2,"maxBars":10,"shorts":1,"htf":1}
- 2026-02-07: {"trendLen":200,"rsiEntry":5,"exitLen":5,"stopAtr":2,"maxBars":10,"shorts":0,"htf":1}
- 2026-08-08: {"trendLen":100,"rsiEntry":5,"exitLen":5,"stopAtr":2,"maxBars":10,"shorts":1,"htf":1}

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
- 2024-02-10: {"stLen":14,"stMult":3,"trendLen":100,"stopAtr":3,"shorts":1,"htf":0}
- 2024-08-10: {"stLen":14,"stMult":4,"trendLen":100,"stopAtr":3,"shorts":0,"htf":0}
- 2025-02-08: {"stLen":14,"stMult":4,"trendLen":100,"stopAtr":3,"shorts":0,"htf":0}
- 2025-08-09: {"stLen":14,"stMult":3,"trendLen":100,"stopAtr":3,"shorts":0,"htf":1}
- 2026-02-07: {"stLen":14,"stMult":3,"trendLen":100,"stopAtr":3,"shorts":0,"htf":1}
- 2026-08-08: {"stLen":14,"stMult":3,"trendLen":100,"stopAtr":3,"shorts":1,"htf":1}

### ETHUSDT 1h A+ stacked pullback
- 2019-08-17: {"trendLen":200,"rsiEntry":5,"bbMult":1.5,"stretchAtr":1,"exitLen":5,"stopAtr":2,"maxBars":10}
- 2020-02-15: {"trendLen":200,"rsiEntry":5,"bbMult":2,"stretchAtr":1,"exitLen":3,"stopAtr":2,"maxBars":10}
- 2020-08-15: {"trendLen":200,"rsiEntry":5,"bbMult":1.5,"stretchAtr":2,"exitLen":3,"stopAtr":2,"maxBars":10}
- 2021-02-13: {"trendLen":100,"rsiEntry":10,"bbMult":1.5,"stretchAtr":1.5,"exitLen":5,"stopAtr":2,"maxBars":10}
- 2021-08-14: {"trendLen":100,"rsiEntry":5,"bbMult":1.5,"stretchAtr":1.5,"exitLen":5,"stopAtr":2,"maxBars":10}
- 2022-02-12: {"trendLen":100,"rsiEntry":5,"bbMult":1.5,"stretchAtr":1,"exitLen":5,"stopAtr":2,"maxBars":10}
- 2022-08-13: {"trendLen":200,"rsiEntry":5,"bbMult":2,"stretchAtr":2,"exitLen":5,"stopAtr":3,"maxBars":10}
- 2023-02-11: {"trendLen":200,"rsiEntry":5,"bbMult":2,"stretchAtr":2,"exitLen":5,"stopAtr":3,"maxBars":10}
- 2023-08-12: {"trendLen":200,"rsiEntry":5,"bbMult":1.5,"stretchAtr":2,"exitLen":5,"stopAtr":4,"maxBars":10}
- 2024-02-10: {"trendLen":200,"rsiEntry":5,"bbMult":1.5,"stretchAtr":1.5,"exitLen":5,"stopAtr":2,"maxBars":10}
- 2024-08-10: {"trendLen":200,"rsiEntry":5,"bbMult":1.5,"stretchAtr":1.5,"exitLen":5,"stopAtr":2,"maxBars":10}
- 2025-02-08: {"trendLen":100,"rsiEntry":10,"bbMult":1.5,"stretchAtr":1.5,"exitLen":5,"stopAtr":2,"maxBars":10}
- 2025-08-09: {"trendLen":200,"rsiEntry":5,"bbMult":1.5,"stretchAtr":1.5,"exitLen":5,"stopAtr":2,"maxBars":10}
- 2026-02-07: {"trendLen":100,"rsiEntry":10,"bbMult":1.5,"stretchAtr":1,"exitLen":5,"stopAtr":2,"maxBars":10}
- 2026-08-08: {"trendLen":100,"rsiEntry":10,"bbMult":1.5,"stretchAtr":1,"exitLen":5,"stopAtr":2,"maxBars":10}

### ETHUSDT 1h Trend band reversion
- 2019-08-17: {"trendLen":100,"bbLen":20,"bbMult":2,"stopAtr":4,"maxBars":10,"shorts":0,"htf":1}
- 2020-02-15: {"trendLen":100,"bbLen":20,"bbMult":2,"stopAtr":2,"maxBars":20,"shorts":0,"htf":0}
- 2020-08-15: {"trendLen":100,"bbLen":20,"bbMult":2,"stopAtr":2,"maxBars":20,"shorts":0,"htf":0}
- 2021-02-13: {"trendLen":100,"bbLen":20,"bbMult":2,"stopAtr":2,"maxBars":20,"shorts":0,"htf":0}
- 2021-08-14: {"trendLen":100,"bbLen":20,"bbMult":2.5,"stopAtr":2,"maxBars":20,"shorts":0,"htf":0}
- 2022-02-12: {"trendLen":100,"bbLen":20,"bbMult":2.5,"stopAtr":2,"maxBars":20,"shorts":1,"htf":1}
- 2022-08-13: {"trendLen":100,"bbLen":20,"bbMult":2.5,"stopAtr":2,"maxBars":20,"shorts":1,"htf":1}
- 2023-02-11: {"trendLen":100,"bbLen":20,"bbMult":2,"stopAtr":2,"maxBars":20,"shorts":0,"htf":1}
- 2023-08-12: {"trendLen":100,"bbLen":20,"bbMult":2,"stopAtr":4,"maxBars":20,"shorts":0,"htf":0}
- 2024-02-10: {"trendLen":200,"bbLen":20,"bbMult":2.5,"stopAtr":2,"maxBars":10,"shorts":1,"htf":1}
- 2024-08-10: {"trendLen":200,"bbLen":20,"bbMult":2.5,"stopAtr":2,"maxBars":20,"shorts":1,"htf":1}
- 2025-02-08: {"trendLen":100,"bbLen":20,"bbMult":2.5,"stopAtr":2,"maxBars":20,"shorts":1,"htf":0}
- 2025-08-09: {"trendLen":100,"bbLen":20,"bbMult":2.5,"stopAtr":2,"maxBars":20,"shorts":1,"htf":0}
- 2026-02-07: {"trendLen":100,"bbLen":20,"bbMult":2,"stopAtr":2,"maxBars":20,"shorts":0,"htf":0}
- 2026-08-08: {"trendLen":100,"bbLen":20,"bbMult":2.5,"stopAtr":2,"maxBars":20,"shorts":0,"htf":0}

### ETHUSDT 1h Trend pullback, fixed target
- 2019-08-17: {"trendLen":100,"rsiEntry":40,"stopAtr":1.5,"targetR":0.75,"maxBars":20,"shorts":1,"htf":0}
- 2020-02-15: {"trendLen":100,"rsiEntry":40,"stopAtr":2,"targetR":0.75,"maxBars":20,"shorts":0,"htf":1}
- 2020-08-15: {"trendLen":100,"rsiEntry":40,"stopAtr":2,"targetR":0.75,"maxBars":20,"shorts":0,"htf":1}
- 2021-02-13: {"trendLen":100,"rsiEntry":40,"stopAtr":2,"targetR":0.75,"maxBars":20,"shorts":0,"htf":0}
- 2021-08-14: {"trendLen":100,"rsiEntry":40,"stopAtr":2,"targetR":0.75,"maxBars":20,"shorts":0,"htf":0}
- 2022-02-12: {"trendLen":100,"rsiEntry":35,"stopAtr":3,"targetR":0.75,"maxBars":20,"shorts":1,"htf":0}
- 2022-08-13: {"trendLen":100,"rsiEntry":40,"stopAtr":1.5,"targetR":0.75,"maxBars":20,"shorts":1,"htf":1}
- 2023-02-11: {"trendLen":100,"rsiEntry":40,"stopAtr":2,"targetR":0.75,"maxBars":20,"shorts":1,"htf":1}
- 2023-08-12: stand aside
- 2024-02-10: {"trendLen":200,"rsiEntry":35,"stopAtr":2,"targetR":0.75,"maxBars":20,"shorts":1,"htf":1}
- 2024-08-10: {"trendLen":200,"rsiEntry":35,"stopAtr":2,"targetR":0.75,"maxBars":20,"shorts":1,"htf":1}
- 2025-02-08: {"trendLen":200,"rsiEntry":35,"stopAtr":3,"targetR":0.75,"maxBars":20,"shorts":1,"htf":1}
- 2025-08-09: {"trendLen":200,"rsiEntry":35,"stopAtr":3,"targetR":0.75,"maxBars":20,"shorts":1,"htf":1}
- 2026-02-07: {"trendLen":100,"rsiEntry":40,"stopAtr":2,"targetR":0.5,"maxBars":20,"shorts":0,"htf":1}
- 2026-08-08: {"trendLen":100,"rsiEntry":35,"stopAtr":1.5,"targetR":0.5,"maxBars":20,"shorts":0,"htf":0}

### ETHUSDT 1h Jurik MA confluence
- 2019-08-17: {"minScore":3,"jmaFastLen":9,"jmaSlowLen":34}
- 2020-02-15: {"minScore":3,"jmaFastLen":9,"jmaSlowLen":34}
- 2020-08-15: {"minScore":4,"jmaFastLen":9,"jmaSlowLen":34}
- 2021-02-13: {"minScore":3,"jmaFastLen":9,"jmaSlowLen":34}
- 2021-08-14: {"minScore":5,"jmaFastLen":14,"jmaSlowLen":34}
- 2022-02-12: {"minScore":5,"jmaFastLen":14,"jmaSlowLen":34}
- 2022-08-13: {"minScore":5,"jmaFastLen":9,"jmaSlowLen":55}
- 2023-02-11: {"minScore":5,"jmaFastLen":7,"jmaSlowLen":55}
- 2023-08-12: {"minScore":5,"jmaFastLen":9,"jmaSlowLen":55}
- 2024-02-10: {"minScore":5,"jmaFastLen":9,"jmaSlowLen":34}
- 2024-08-10: {"minScore":4,"jmaFastLen":7,"jmaSlowLen":34}
- 2025-02-08: {"minScore":4,"jmaFastLen":7,"jmaSlowLen":34}
- 2025-08-09: {"minScore":4,"jmaFastLen":7,"jmaSlowLen":34}
- 2026-02-07: {"minScore":5,"jmaFastLen":7,"jmaSlowLen":34}
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
- 2023-08-10: {"trendLen":100,"rsiEntry":15,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":1,"htf":1}
- 2024-02-08: {"trendLen":100,"rsiEntry":10,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":1,"htf":1}
- 2024-08-08: {"trendLen":100,"rsiEntry":5,"exitLen":5,"stopAtr":3,"maxBars":10,"shorts":1,"htf":0}
- 2025-02-06: {"trendLen":100,"rsiEntry":5,"exitLen":5,"stopAtr":3,"maxBars":10,"shorts":1,"htf":0}
- 2025-08-07: {"trendLen":100,"rsiEntry":5,"exitLen":5,"stopAtr":2,"maxBars":10,"shorts":1,"htf":0}
- 2026-02-05: {"trendLen":100,"rsiEntry":10,"exitLen":5,"stopAtr":2,"maxBars":10,"shorts":1,"htf":0}
- 2026-08-06: {"trendLen":100,"rsiEntry":10,"exitLen":5,"stopAtr":2,"maxBars":10,"shorts":1,"htf":0}

### SOLUSDT 4h Supertrend trend-follow
- 2022-08-11: stand aside
- 2023-02-09: stand aside
- 2023-08-10: {"stLen":10,"stMult":2,"trendLen":100,"stopAtr":3,"shorts":0,"htf":0}
- 2024-02-08: {"stLen":14,"stMult":3,"trendLen":200,"stopAtr":3,"shorts":0,"htf":0}
- 2024-08-08: {"stLen":14,"stMult":3,"trendLen":100,"stopAtr":3,"shorts":0,"htf":1}
- 2025-02-06: {"stLen":14,"stMult":3,"trendLen":100,"stopAtr":3,"shorts":0,"htf":0}
- 2025-08-07: {"stLen":10,"stMult":4,"trendLen":100,"stopAtr":3,"shorts":1,"htf":1}
- 2026-02-05: {"stLen":14,"stMult":4,"trendLen":200,"stopAtr":3,"shorts":1,"htf":0}
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
- 2024-08-08: {"trendLen":100,"rsiEntry":40,"stopAtr":2,"targetR":0.33,"maxBars":20,"shorts":1,"htf":1}
- 2025-02-06: {"trendLen":100,"rsiEntry":40,"stopAtr":2,"targetR":0.33,"maxBars":20,"shorts":1,"htf":0}
- 2025-08-07: {"trendLen":100,"rsiEntry":40,"stopAtr":2,"targetR":0.75,"maxBars":20,"shorts":1,"htf":1}
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
- 2023-08-10: {"trendLen":100,"rsiEntry":5,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":1,"htf":0}
- 2024-02-08: {"trendLen":100,"rsiEntry":10,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":0,"htf":1}
- 2024-08-08: {"trendLen":200,"rsiEntry":5,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":0,"htf":1}
- 2025-02-06: {"trendLen":100,"rsiEntry":5,"exitLen":5,"stopAtr":2,"maxBars":10,"shorts":0,"htf":1}
- 2025-08-07: {"trendLen":200,"rsiEntry":10,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":0,"htf":1}
- 2026-02-05: {"trendLen":100,"rsiEntry":5,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":0,"htf":1}
- 2026-08-06: {"trendLen":100,"rsiEntry":5,"exitLen":10,"stopAtr":2,"maxBars":10,"shorts":0,"htf":1}

### SOLUSDT 1h Supertrend trend-follow
- 2022-08-11: {"stLen":10,"stMult":4,"trendLen":200,"stopAtr":3,"shorts":1,"htf":1}
- 2023-02-09: {"stLen":14,"stMult":4,"trendLen":100,"stopAtr":3,"shorts":0,"htf":1}
- 2023-08-10: {"stLen":10,"stMult":4,"trendLen":200,"stopAtr":3,"shorts":0,"htf":1}
- 2024-02-08: {"stLen":10,"stMult":3,"trendLen":100,"stopAtr":3,"shorts":0,"htf":1}
- 2024-08-08: {"stLen":14,"stMult":3,"trendLen":100,"stopAtr":3,"shorts":0,"htf":1}
- 2025-02-06: {"stLen":10,"stMult":3,"trendLen":100,"stopAtr":3,"shorts":0,"htf":1}
- 2025-08-07: {"stLen":14,"stMult":4,"trendLen":200,"stopAtr":3,"shorts":0,"htf":0}
- 2026-02-05: {"stLen":14,"stMult":4,"trendLen":200,"stopAtr":3,"shorts":0,"htf":0}
- 2026-08-06: {"stLen":10,"stMult":2,"trendLen":100,"stopAtr":3,"shorts":1,"htf":0}

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
- 2024-02-08: {"trendLen":100,"bbLen":20,"bbMult":2,"stopAtr":2,"maxBars":10,"shorts":1,"htf":1}
- 2024-08-08: {"trendLen":100,"bbLen":20,"bbMult":2.5,"stopAtr":2,"maxBars":20,"shorts":1,"htf":1}
- 2025-02-06: {"trendLen":100,"bbLen":20,"bbMult":2.5,"stopAtr":2,"maxBars":20,"shorts":1,"htf":0}
- 2025-08-07: {"trendLen":100,"bbLen":20,"bbMult":2.5,"stopAtr":2,"maxBars":20,"shorts":1,"htf":1}
- 2026-02-05: {"trendLen":100,"bbLen":20,"bbMult":2.5,"stopAtr":2,"maxBars":20,"shorts":1,"htf":1}
- 2026-08-06: {"trendLen":200,"bbLen":20,"bbMult":2,"stopAtr":2,"maxBars":20,"shorts":0,"htf":0}

### SOLUSDT 1h Trend pullback, fixed target
- 2022-08-11: {"trendLen":100,"rsiEntry":40,"stopAtr":2,"targetR":0.5,"maxBars":20,"shorts":1,"htf":1}
- 2023-02-09: {"trendLen":100,"rsiEntry":35,"stopAtr":2,"targetR":0.75,"maxBars":20,"shorts":1,"htf":0}
- 2023-08-10: {"trendLen":100,"rsiEntry":35,"stopAtr":1.5,"targetR":0.75,"maxBars":20,"shorts":1,"htf":0}
- 2024-02-08: {"trendLen":100,"rsiEntry":35,"stopAtr":3,"targetR":0.75,"maxBars":20,"shorts":1,"htf":1}
- 2024-08-08: {"trendLen":100,"rsiEntry":40,"stopAtr":1.5,"targetR":0.33,"maxBars":20,"shorts":0,"htf":1}
- 2025-02-06: {"trendLen":100,"rsiEntry":40,"stopAtr":1.5,"targetR":0.33,"maxBars":20,"shorts":0,"htf":1}
- 2025-08-07: {"trendLen":200,"rsiEntry":35,"stopAtr":2,"targetR":0.5,"maxBars":20,"shorts":0,"htf":1}
- 2026-02-05: {"trendLen":200,"rsiEntry":35,"stopAtr":1.5,"targetR":0.75,"maxBars":20,"shorts":0,"htf":1}
- 2026-08-06: {"trendLen":200,"rsiEntry":35,"stopAtr":1.5,"targetR":0.75,"maxBars":20,"shorts":0,"htf":1}

### SOLUSDT 1h Jurik MA confluence
- 2022-08-11: {"minScore":3,"jmaFastLen":9,"jmaSlowLen":34}
- 2023-02-09: {"minScore":3,"jmaFastLen":9,"jmaSlowLen":34}
- 2023-08-10: {"minScore":3,"jmaFastLen":9,"jmaSlowLen":34}
- 2024-02-08: {"minScore":3,"jmaFastLen":9,"jmaSlowLen":55}
- 2024-08-08: {"minScore":5,"jmaFastLen":9,"jmaSlowLen":34}
- 2025-02-06: {"minScore":3,"jmaFastLen":7,"jmaSlowLen":34}
- 2025-08-07: {"minScore":5,"jmaFastLen":7,"jmaSlowLen":34}
- 2026-02-05: {"minScore":5,"jmaFastLen":7,"jmaSlowLen":34}
- 2026-08-06: stand aside
