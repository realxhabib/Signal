# Round 6 · Market modes from a Hidden Markov Model

Research years only (locked year untouched). 80% 4h + 20% 1h account, 1% base risk.

| Variant | CAGR | Max DD | Sharpe | By year |
|---|---|---|---|---|
| Baseline: EMA market mode | +155% | 44% | 2.00 | +15% · +314% · +531% · +5% · +309% · +183% · +113% · +0% |
| HMM 3 states (most likely state), 180-bar features (59% same as EMA) | +164% | 39% | 2.13 (+0.13) | +8% · +352% · +576% · -1% · +319% · +187% · +154% · +0% |
| HMM 3 states, 60% confidence, 180-bar features (59% same as EMA) | +163% | 39% | 2.13 (+0.12) | +8% · +351% · +577% · -4% · +317% · +189% · +154% · +0% |
| HMM 3 states AND EMA agree, 180-bar features (68% same as EMA) | +153% | 46% | 2.05 (+0.04) | +8% · +347% · +531% · -14% · +307% · +201% · +126% · +0% |
| HMM 2 states, 70% confidence, 180-bar features (61% same as EMA) | +110% | 40% | 1.75 (-0.26) | +21% · +416% · +412% · +21% · +184% · +119% · -20% · +0% |

Mode changes over the whole history: EMA 1457, HMM 3 states 346, HMM 3 states, 60% confidence 349, HMM 3 states AND EMA agree 780, HMM 2 states, 70% confidence 342.
