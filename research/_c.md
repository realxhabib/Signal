# Walk-forward results

Generated 2026-09-24. Train 730d → test 182d, rolling. Parameters are chosen on the
train window only (needs ≥15 trades, win rate ≥0%, PF ≥1.2, no liquidations); when none
qualify the strategy stands aside. **Every number below is out-of-sample.** Costs: 0.02% fee + 0% slippage
per side, 0.01%/8h funding always paid, 5x isolated margin. R = multiples of the initial stop risk.

| Asset | TF | Strategy | OOS trades | Win rate | PF | Avg R | Total R | Max DD (R) | Worst trade (R) | Max losing streak | Liq | Windows traded |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| BTCUSDT | 1d | Supertrend trend-follow | 0 | 0.0% | 0.00 | 0.00 | 0.0 | 0.0 | 0.00 | 0 | 0 | 0/15 |
| BTCUSDT | 1d | Signal Composite | 31 | 45.2% | 1.42 | 0.10 | 3.1 | 2.3 | -1.05 | 6 | 0 | 11/15 |
| BTCUSDT | 4h | Supertrend trend-follow | 72 | 33.3% | 1.51 | 0.28 | 20.5 | 11.5 | -1.10 | 9 | 0 | 15/15 |
| BTCUSDT | 4h | Signal Composite | 149 | 32.2% | 0.92 | -0.03 | -4.6 | 22.3 | -1.05 | 9 | 0 | 15/15 |
| BTCUSDT | 1h | Supertrend trend-follow | 275 | 36.0% | 1.44 | 0.21 | 58.9 | 25.2 | -1.09 | 13 | 0 | 15/15 |
| BTCUSDT | 1h | Signal Composite | 408 | 40.7% | 1.51 | 0.18 | 74.6 | 11.3 | -1.09 | 11 | 0 | 15/15 |
| ETHUSDT | 1d | Supertrend trend-follow | 0 | 0.0% | 0.00 | 0.00 | 0.0 | 0.0 | 0.00 | 0 | 0 | 0/15 |
| ETHUSDT | 1d | Signal Composite | 28 | 50.0% | 2.51 | 0.42 | 11.7 | 2.6 | -1.02 | 3 | 2 | 9/15 |
| ETHUSDT | 4h | Supertrend trend-follow | 77 | 36.4% | 2.50 | 0.64 | 49.4 | 9.8 | -1.05 | 9 | 0 | 15/15 |
| ETHUSDT | 4h | Signal Composite | 118 | 40.7% | 2.34 | 0.47 | 54.9 | 10.1 | -1.05 | 18 | 0 | 15/15 |
| ETHUSDT | 1h | Supertrend trend-follow | 202 | 36.1% | 2.00 | 0.54 | 109.9 | 14.3 | -1.12 | 14 | 0 | 15/15 |
| ETHUSDT | 1h | Signal Composite | 385 | 37.4% | 1.50 | 0.21 | 82.3 | 14.7 | -1.12 | 12 | 0 | 15/15 |
| SOLUSDT | 1d | Supertrend trend-follow | 0 | 0.0% | 0.00 | 0.00 | 0.0 | 0.0 | 0.00 | 0 | 0 | 0/9 |
| SOLUSDT | 1d | Signal Composite | 3 | 33.3% | 0.40 | -0.31 | -0.9 | 1.0 | -1.02 | 1 | 0 | 3/9 |
| SOLUSDT | 4h | Supertrend trend-follow | 41 | 31.7% | 1.57 | 0.31 | 12.5 | 6.7 | -1.07 | 5 | 0 | 7/9 |
| SOLUSDT | 4h | Signal Composite | 84 | 45.2% | 1.93 | 0.27 | 22.6 | 7.3 | -1.03 | 9 | 0 | 9/9 |
| SOLUSDT | 1h | Supertrend trend-follow | 101 | 34.7% | 1.28 | 0.14 | 14.4 | 12.2 | -1.05 | 10 | 0 | 9/9 |
| SOLUSDT | 1h | Signal Composite | 261 | 39.1% | 1.34 | 0.11 | 29.5 | 6.5 | -1.03 | 7 | 0 | 9/9 |

## Pooled across assets

| Strategy / TF | Trades | Win rate | PF | Avg R | Total R |
|---|---|---|---|---|---|
| supertrend 1d | 0 | 0.0% | 0.00 | 0.00 | 0.0 |
| composite 1d | 62 | 46.8% | 1.84 | 0.22 | 13.9 |
| supertrend 4h | 190 | 34.2% | 1.87 | 0.43 | 82.4 |
| composite 4h | 351 | 38.2% | 1.59 | 0.21 | 72.9 |
| supertrend 1h | 578 | 35.8% | 1.62 | 0.32 | 183.2 |
| composite 1h | 1054 | 39.1% | 1.47 | 0.18 | 186.3 |

## Parameters chosen per window

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

### BTCUSDT 1d Signal Composite
- 2019-08-17: stand aside
- 2020-02-15: stand aside
- 2020-08-15: {"mask":34,"threshold":1,"gate":1,"shorts":0,"stopAtr":3}
- 2021-02-13: {"mask":35,"threshold":1,"gate":0,"shorts":0,"stopAtr":3}
- 2021-08-14: {"mask":51,"threshold":1,"gate":2,"shorts":0,"stopAtr":3}
- 2022-02-12: {"mask":38,"threshold":1,"gate":2,"shorts":0,"stopAtr":3}
- 2022-08-13: stand aside
- 2023-02-11: stand aside
- 2023-08-12: {"mask":38,"threshold":1,"gate":0,"shorts":0,"stopAtr":3}
- 2024-02-10: {"mask":35,"threshold":1,"gate":2,"shorts":0,"stopAtr":3}
- 2024-08-10: {"mask":35,"threshold":1,"gate":2,"shorts":0,"stopAtr":3}
- 2025-02-08: {"mask":35,"threshold":1,"gate":2,"shorts":0,"stopAtr":3}
- 2025-08-09: {"mask":39,"threshold":1,"gate":2,"shorts":0,"stopAtr":3}
- 2026-02-07: {"mask":43,"threshold":1,"gate":0,"shorts":0,"stopAtr":3}
- 2026-08-08: {"mask":50,"threshold":1,"gate":0,"shorts":0,"stopAtr":3}

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

### BTCUSDT 4h Signal Composite
- 2019-08-17: {"mask":1,"threshold":1,"gate":0,"shorts":0,"stopAtr":3}
- 2020-02-15: {"mask":33,"threshold":1,"gate":0,"shorts":0,"stopAtr":3}
- 2020-08-15: {"mask":1,"threshold":1,"gate":2,"shorts":0,"stopAtr":3}
- 2021-02-13: {"mask":1,"threshold":1,"gate":1,"shorts":0,"stopAtr":3}
- 2021-08-14: {"mask":1,"threshold":1,"gate":1,"shorts":0,"stopAtr":3}
- 2022-02-12: {"mask":1,"threshold":1,"gate":1,"shorts":0,"stopAtr":3}
- 2022-08-13: {"mask":1,"threshold":1,"gate":1,"shorts":0,"stopAtr":3}
- 2023-02-11: {"mask":60,"threshold":1,"gate":0,"shorts":0,"stopAtr":3}
- 2023-08-12: {"mask":21,"threshold":2,"gate":0,"shorts":0,"stopAtr":3}
- 2024-02-10: {"mask":48,"threshold":1,"gate":2,"shorts":0,"stopAtr":3}
- 2024-08-10: {"mask":56,"threshold":1,"gate":1,"shorts":0,"stopAtr":3}
- 2025-02-08: {"mask":43,"threshold":1,"gate":1,"shorts":0,"stopAtr":3}
- 2025-08-09: {"mask":33,"threshold":1,"gate":1,"shorts":0,"stopAtr":3}
- 2026-02-07: {"mask":1,"threshold":1,"gate":0,"shorts":0,"stopAtr":3}
- 2026-08-08: {"mask":1,"threshold":1,"gate":0,"shorts":0,"stopAtr":3}

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

### BTCUSDT 1h Signal Composite
- 2019-08-17: {"mask":37,"threshold":1,"gate":0,"shorts":0,"stopAtr":3}
- 2020-02-15: {"mask":32,"threshold":1,"gate":2,"shorts":0,"stopAtr":3}
- 2020-08-15: {"mask":34,"threshold":1,"gate":2,"shorts":0,"stopAtr":3}
- 2021-02-13: {"mask":33,"threshold":1,"gate":0,"shorts":0,"stopAtr":3}
- 2021-08-14: {"mask":1,"threshold":1,"gate":0,"shorts":0,"stopAtr":3}
- 2022-02-12: {"mask":1,"threshold":1,"gate":1,"shorts":0,"stopAtr":3}
- 2022-08-13: {"mask":1,"threshold":1,"gate":1,"shorts":0,"stopAtr":3}
- 2023-02-11: {"mask":1,"threshold":1,"gate":1,"shorts":0,"stopAtr":3}
- 2023-08-12: {"mask":1,"threshold":1,"gate":1,"shorts":0,"stopAtr":3}
- 2024-02-10: {"mask":1,"threshold":1,"gate":1,"shorts":0,"stopAtr":3}
- 2024-08-10: {"mask":1,"threshold":1,"gate":1,"shorts":0,"stopAtr":3}
- 2025-02-08: {"mask":1,"threshold":1,"gate":1,"shorts":0,"stopAtr":3}
- 2025-08-09: {"mask":1,"threshold":1,"gate":1,"shorts":0,"stopAtr":3}
- 2026-02-07: {"mask":1,"threshold":1,"gate":1,"shorts":0,"stopAtr":3}
- 2026-08-08: {"mask":1,"threshold":1,"gate":1,"shorts":0,"stopAtr":3}

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

### ETHUSDT 1d Signal Composite
- 2019-08-17: stand aside
- 2020-02-15: stand aside
- 2020-08-15: {"mask":35,"threshold":1,"gate":1,"shorts":0,"stopAtr":3}
- 2021-02-13: {"mask":3,"threshold":1,"gate":0,"shorts":0,"stopAtr":3}
- 2021-08-14: stand aside
- 2022-02-12: stand aside
- 2022-08-13: stand aside
- 2023-02-11: stand aside
- 2023-08-12: {"mask":11,"threshold":1,"gate":0,"shorts":0,"stopAtr":3}
- 2024-02-10: {"mask":23,"threshold":1,"gate":1,"shorts":0,"stopAtr":3}
- 2024-08-10: {"mask":3,"threshold":1,"gate":0,"shorts":0,"stopAtr":3}
- 2025-02-08: {"mask":39,"threshold":1,"gate":1,"shorts":0,"stopAtr":3}
- 2025-08-09: {"mask":39,"threshold":1,"gate":0,"shorts":0,"stopAtr":3}
- 2026-02-07: {"mask":23,"threshold":1,"gate":0,"shorts":0,"stopAtr":3}
- 2026-08-08: {"mask":59,"threshold":1,"gate":1,"shorts":0,"stopAtr":3}

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

### ETHUSDT 4h Signal Composite
- 2019-08-17: {"mask":33,"threshold":1,"gate":2,"shorts":0,"stopAtr":3}
- 2020-02-15: {"mask":33,"threshold":1,"gate":0,"shorts":0,"stopAtr":3}
- 2020-08-15: {"mask":1,"threshold":1,"gate":0,"shorts":0,"stopAtr":3}
- 2021-02-13: {"mask":1,"threshold":1,"gate":0,"shorts":0,"stopAtr":3}
- 2021-08-14: {"mask":1,"threshold":1,"gate":0,"shorts":0,"stopAtr":3}
- 2022-02-12: {"mask":1,"threshold":1,"gate":0,"shorts":0,"stopAtr":3}
- 2022-08-13: {"mask":49,"threshold":1,"gate":0,"shorts":0,"stopAtr":3}
- 2023-02-11: {"mask":1,"threshold":1,"gate":0,"shorts":0,"stopAtr":3}
- 2023-08-12: {"mask":23,"threshold":1,"gate":0,"shorts":0,"stopAtr":3}
- 2024-02-10: {"mask":1,"threshold":1,"gate":0,"shorts":0,"stopAtr":3}
- 2024-08-10: {"mask":1,"threshold":1,"gate":0,"shorts":0,"stopAtr":3}
- 2025-02-08: {"mask":5,"threshold":1,"gate":1,"shorts":0,"stopAtr":3}
- 2025-08-09: {"mask":33,"threshold":1,"gate":0,"shorts":0,"stopAtr":3}
- 2026-02-07: {"mask":21,"threshold":1,"gate":2,"shorts":0,"stopAtr":3}
- 2026-08-08: {"mask":4,"threshold":1,"gate":2,"shorts":0,"stopAtr":3}

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

### ETHUSDT 1h Signal Composite
- 2019-08-17: {"mask":1,"threshold":1,"gate":0,"shorts":0,"stopAtr":3}
- 2020-02-15: {"mask":1,"threshold":1,"gate":0,"shorts":0,"stopAtr":3}
- 2020-08-15: {"mask":1,"threshold":1,"gate":0,"shorts":0,"stopAtr":3}
- 2021-02-13: {"mask":1,"threshold":1,"gate":0,"shorts":0,"stopAtr":3}
- 2021-08-14: {"mask":47,"threshold":1,"gate":0,"shorts":0,"stopAtr":3}
- 2022-02-12: {"mask":37,"threshold":1,"gate":1,"shorts":0,"stopAtr":3}
- 2022-08-13: {"mask":61,"threshold":1,"gate":1,"shorts":0,"stopAtr":3}
- 2023-02-11: {"mask":1,"threshold":1,"gate":0,"shorts":0,"stopAtr":3}
- 2023-08-12: {"mask":1,"threshold":1,"gate":0,"shorts":0,"stopAtr":3}
- 2024-02-10: {"mask":1,"threshold":1,"gate":0,"shorts":0,"stopAtr":3}
- 2024-08-10: {"mask":1,"threshold":1,"gate":0,"shorts":0,"stopAtr":3}
- 2025-02-08: {"mask":33,"threshold":2,"gate":0,"shorts":0,"stopAtr":3}
- 2025-08-09: {"mask":1,"threshold":1,"gate":0,"shorts":0,"stopAtr":3}
- 2026-02-07: {"mask":1,"threshold":1,"gate":0,"shorts":0,"stopAtr":3}
- 2026-08-08: {"mask":37,"threshold":2,"gate":2,"shorts":0,"stopAtr":3}

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

### SOLUSDT 1d Signal Composite
- 2022-08-11: stand aside
- 2023-02-09: stand aside
- 2023-08-10: stand aside
- 2024-02-08: stand aside
- 2024-08-08: stand aside
- 2025-02-06: {"mask":39,"threshold":1,"gate":2,"shorts":0,"stopAtr":3}
- 2025-08-07: {"mask":35,"threshold":1,"gate":2,"shorts":0,"stopAtr":3}
- 2026-02-05: {"mask":34,"threshold":1,"gate":2,"shorts":0,"stopAtr":3}
- 2026-08-06: stand aside

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

### SOLUSDT 4h Signal Composite
- 2022-08-11: {"mask":40,"threshold":1,"gate":0,"shorts":0,"stopAtr":3}
- 2023-02-09: {"mask":40,"threshold":1,"gate":0,"shorts":0,"stopAtr":3}
- 2023-08-10: {"mask":44,"threshold":1,"gate":0,"shorts":0,"stopAtr":3}
- 2024-02-08: {"mask":17,"threshold":1,"gate":2,"shorts":0,"stopAtr":3}
- 2024-08-08: {"mask":1,"threshold":1,"gate":0,"shorts":0,"stopAtr":3}
- 2025-02-06: {"mask":1,"threshold":1,"gate":0,"shorts":0,"stopAtr":3}
- 2025-08-07: {"mask":1,"threshold":1,"gate":0,"shorts":0,"stopAtr":3}
- 2026-02-05: {"mask":49,"threshold":1,"gate":0,"shorts":0,"stopAtr":3}
- 2026-08-06: {"mask":49,"threshold":1,"gate":0,"shorts":0,"stopAtr":3}

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

### SOLUSDT 1h Signal Composite
- 2022-08-11: {"mask":31,"threshold":1,"gate":1,"shorts":0,"stopAtr":3}
- 2023-02-09: {"mask":63,"threshold":1,"gate":0,"shorts":0,"stopAtr":3}
- 2023-08-10: {"mask":21,"threshold":1,"gate":2,"shorts":0,"stopAtr":3}
- 2024-02-08: {"mask":1,"threshold":1,"gate":2,"shorts":0,"stopAtr":3}
- 2024-08-08: {"mask":1,"threshold":1,"gate":1,"shorts":0,"stopAtr":3}
- 2025-02-06: {"mask":1,"threshold":1,"gate":0,"shorts":0,"stopAtr":3}
- 2025-08-07: {"mask":11,"threshold":1,"gate":0,"shorts":0,"stopAtr":3}
- 2026-02-05: {"mask":19,"threshold":1,"gate":1,"shorts":0,"stopAtr":3}
- 2026-08-06: {"mask":33,"threshold":2,"gate":0,"shorts":0,"stopAtr":3}
