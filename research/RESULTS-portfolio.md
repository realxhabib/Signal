# Portfolio simulation (Signal Composite, 20 coins, real funding, limit orders)


## 4h · long only (2787 trades)

| Sizing | Caps | CAGR | Max DD | Sharpe | Avg lev | Peak lev | Taken | Skipped |
|---|---|---|---|---|---|---|---|---|
| equal notional | none | 55.8% | 54.8% | 1.18 | 0.36x | 2.30x | 2787 | 0 |
| risk-based (vol-scaled) | none | 67.2% | 56.1% | 1.25 | 0.48x | 4.06x | 2787 | 0 |
| risk-based (vol-scaled) | open risk ≤ 10% | 70.7% | 48.8% | 1.36 | 0.45x | 2.98x | 2438 | 349 |
| risk-based (vol-scaled) | open risk ≤ 6% | 72.0% | 34.8% | 1.56 | 0.38x | 2.09x | 1799 | 988 |

Stress test (block bootstrap of 85 monthly returns, 5,000 five-year paths; open risk capped at 10× the per-trade risk):

| Risk per trade | Median CAGR | Bad case CAGR (5th pct) | Median max DD | Bad case max DD (95th pct) | P(drawdown ≥ 50%) | Avg leverage |
|---|---|---|---|---|---|---|
| 0.5% | 33.5% | 10.6% | 17.3% | 31.5% | 0.0% | 0.22x |
| 1% | 66.0% | 16.6% | 32.6% | 54.6% | 9.6% | 0.45x |
| 1.5% | 94.8% | 18.1% | 46.1% | 71.3% | 40.8% | 0.67x |
| 2% | 118.4% | 15.3% | 57.9% | 82.6% | 71.4% | 0.90x |
| 3% | 143.9% | 0.2% | 76.4% | 95.1% | 98.5% | 1.35x |

## 4h · long + short (not bull) (6296 trades)

| Sizing | Caps | CAGR | Max DD | Sharpe | Avg lev | Peak lev | Taken | Skipped |
|---|---|---|---|---|---|---|---|---|
| equal notional | none | 71.2% | 59.1% | 1.18 | 0.80x | 2.49x | 6296 | 0 |
| risk-based (vol-scaled) | none | 88.4% | 59.3% | 1.29 | 0.99x | 4.75x | 6296 | 0 |
| risk-based (vol-scaled) | open risk ≤ 10% | 85.8% | 54.6% | 1.35 | 0.86x | 3.33x | 5072 | 1224 |
| risk-based (vol-scaled) | open risk ≤ 6% | 72.8% | 47.7% | 1.46 | 0.62x | 2.28x | 3416 | 2880 |

Stress test (block bootstrap of 86 monthly returns, 5,000 five-year paths; open risk capped at 10× the per-trade risk):

| Risk per trade | Median CAGR | Bad case CAGR (5th pct) | Median max DD | Bad case max DD (95th pct) | P(drawdown ≥ 50%) | Avg leverage |
|---|---|---|---|---|---|---|
| 0.5% | 41.3% | 16.1% | 18.3% | 30.7% | 0.0% | 0.43x |
| 1% | 85.1% | 27.5% | 34.7% | 54.2% | 10.3% | 0.86x |
| 1.5% | 127.6% | 32.8% | 49.3% | 72.1% | 47.7% | 1.29x |
| 2% | 164.1% | 30.9% | 62.1% | 84.6% | 87.2% | 1.72x |
| 3% | 198.5% | 3.6% | 82.9% | 97.4% | 99.1% | 2.58x |
