# Round 7 · Genetic programming (seed 11)

Formulas evolved on the training years only (daily samples), then traded market-neutral on the next years they never saw.


## Trained to 2022-01-01

| Formula | Training IC | Training IR |
|---|---|---|
| `max((btc-8 / dist 42-bar high), (path-24 / dist 42-bar low))` | 0.061 | 6.1 |
| `max((btc-8 / dist 42-bar high), ((0.03 - dist 42-bar high) / dist 42-bar low))` | 0.063 | 6.3 |
| `max((btc-8 / dist 42-bar high), ((dist 42-bar low - dist 42-bar high) / dist 42-bar low))` | 0.062 | 6.3 |
| `max((btc-8 / dist 42-bar high), (sign(tanh(path-4)) - dist 42-bar high))` | 0.063 | 6.2 |
| `max((btc-8 / dist 42-bar high), ((path-24 - dist 42-bar high) / dist 42-bar low))` | 0.064 | 6.2 |

Unseen-years IC of the top formula: -0.002, ensemble sum: 0.003.

## Trained to 2023-09-24

| Formula | Training IC | Training IR |
|---|---|---|
| `(((btc-24 - dist 42-bar high) * path-2) - dist 42-bar high)` | 0.049 | 6.3 |
| `((path-2 * (btc-24 - dist 42-bar high)) - dist 42-bar high)` | 0.049 | 6.3 |
| `(((0.11 - dist 42-bar high) * (dist 42-bar high * path-2)) - dist 42-bar high)` | 0.042 | 5.8 |
| `((((abs(-0.42) - dist 42-bar high) * path-2) - dist 42-bar high) - dist 42-bar high)` | 0.045 | 5.9 |
| `((((btc-24 - dist 42-bar high) * path-2) * dist 42-bar high) - dist 42-bar high)` | 0.042 | 5.6 |

Unseen-years IC of the top formula: 0.019, ensemble sum: 0.020.

## Traded on the unseen years (Jan 2022 → Sep 2025)

| Sleeve | CAGR | Max DD | Sharpe | Corr. with account | Account Sharpe → with 20% sleeve | Turnover / day |
|---|---|---|---|---|---|---|
| GP formulas (seed 11), hold 6 bars, fee 0.05% | -3% | 24% | -0.08 | 0.08 | 1.56 → **1.54** | 1.16 |
| GP formulas (seed 11), hold 18 bars, fee 0.02% | +15% | 11% | 1.20 | 0.09 | 1.56 → **1.62** | 0.45 |
