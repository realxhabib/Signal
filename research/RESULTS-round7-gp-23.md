# Round 7 · Genetic programming (seed 23)

Formulas evolved on the training years only (daily samples), then traded market-neutral on the next years they never saw.


## Trained to 2022-01-01

| Formula | Training IC | Training IR |
|---|---|---|
| `(tanh(((abs(path-24) + path-8) / dist 42-bar low)) / dist 42-bar high)` | 0.071 | 7.1 |
| `(tanh(((abs(path-24) + path-8) / abs(path-24))) / dist 42-bar high)` | 0.072 | 7.2 |
| `(tanh(((abs(path-24) + path-8) / tanh(abs(path-24)))) / dist 42-bar high)` | 0.073 | 7.2 |
| `(tanh((abs(path-24) + path-8)) / dist 42-bar high)` | 0.068 | 6.6 |
| `(tanh(((abs(path-24) + path-8) / tanh(dist 42-bar low))) / dist 42-bar high)` | 0.071 | 7.0 |

Unseen-years IC of the top formula: 0.001, ensemble sum: 0.001.

## Trained to 2023-09-24

| Formula | Training IC | Training IR |
|---|---|---|
| `((sign(path-4) / dist 42-bar low) / dist 42-bar high)` | 0.042 | 5.7 |
| `((sign(path-4) / dist 42-bar high) / dist 42-bar low)` | 0.042 | 5.7 |
| `((max(sign(path-4), path-4) / dist 42-bar low) / dist 42-bar high)` | 0.044 | 5.9 |
| `((sign(sign(path-4)) / dist 42-bar high) / dist 42-bar low)` | 0.042 | 5.7 |
| `(((sign(path-4) / dist 42-bar low) / dist 42-bar high) / dist 42-bar high)` | 0.044 | 5.7 |

Unseen-years IC of the top formula: 0.008, ensemble sum: 0.010.

## Traded on the unseen years (Jan 2022 → Sep 2025)

| Sleeve | CAGR | Max DD | Sharpe | Corr. with account | Account Sharpe → with 20% sleeve | Turnover / day |
|---|---|---|---|---|---|---|
| GP formulas (seed 23), hold 6 bars, fee 0.05% | -6% | 33% | -0.23 | 0.13 | 1.56 → **1.52** | 1.32 |
| GP formulas (seed 23), hold 18 bars, fee 0.02% | +8% | 14% | 0.71 | 0.11 | 1.56 → **1.59** | 0.47 |
