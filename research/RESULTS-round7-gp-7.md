# Round 7 · Genetic programming (seed 7)

Formulas evolved on the training years only (daily samples), then traded market-neutral on the next years they never saw.


## Trained to 2022-01-01

| Formula | Training IC | Training IR |
|---|---|---|
| `(max(dist 42-bar high, btc-24) / dist 42-bar high)` | 0.041 | 6.1 |
| `(max((path-2 * path-20), dist 42-bar low) / dist 42-bar high)` | 0.066 | 6.3 |
| `(max(dist 42-bar low, (path-2 * path-20)) / dist 42-bar high)` | 0.066 | 6.3 |
| `(max(max(dist 42-bar low, (path-2 * path-20)), dist 42-bar low) / dist 42-bar high)` | 0.066 | 6.3 |
| `(max(max((path-2 * path-20), dist 42-bar low), dist 42-bar low) / dist 42-bar high)` | 0.066 | 6.3 |

Unseen-years IC of the top formula: 0.002, ensemble sum: 0.005.

## Trained to 2023-09-24

| Formula | Training IC | Training IR |
|---|---|---|
| `((btc-20 * path-12) - dist 42-bar high)` | 0.040 | 5.1 |
| `((path-12 * btc-20) - dist 42-bar high)` | 0.040 | 5.1 |
| `(((path-12 * btc-20) - dist 42-bar high) - btc-20)` | 0.040 | 5.1 |
| `(((btc-20 * path-12) - btc-4) - dist 42-bar high)` | 0.040 | 5.1 |
| `(((btc-20 * path-12) - btc-20) - dist 42-bar high)` | 0.040 | 5.1 |

Unseen-years IC of the top formula: 0.014, ensemble sum: 0.014.

## Traded on the unseen years (Jan 2022 → Sep 2025)

| Sleeve | CAGR | Max DD | Sharpe | Corr. with account | Account Sharpe → with 20% sleeve | Turnover / day |
|---|---|---|---|---|---|---|
| GP formulas (seed 7), hold 6 bars, fee 0.05% | +3% | 26% | 0.22 | 0.18 | 1.56 → **1.55** | 0.98 |
| GP formulas (seed 7), hold 18 bars, fee 0.02% | +24% | 14% | 1.43 | 0.18 | 1.56 → **1.64** | 0.42 |
