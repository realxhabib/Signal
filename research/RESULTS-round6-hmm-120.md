# Round 6 · Market modes from a Hidden Markov Model

Research years only (locked year untouched). 80% 4h + 20% 1h account, 1% base risk.

| Variant | CAGR | Max DD | Sharpe | By year |
|---|---|---|---|---|
| Baseline: EMA market mode | +155% | 44% | 2.00 | +15% · +314% · +531% · +5% · +309% · +183% · +113% · +0% |
| HMM 3 states (most likely state), 120-bar features (61% same as EMA) | +108% | 45% | 1.75 (-0.26) | +6% · +362% · +151% · -15% · +298% · +90% · +126% · +0% |
| HMM 3 states, 60% confidence, 120-bar features (61% same as EMA) | +107% | 46% | 1.74 (-0.26) | +6% · +362% · +148% · -15% · +301% · +91% · +126% · +0% |
| HMM 3 states AND EMA agree, 120-bar features (69% same as EMA) | +140% | 48% | 1.96 (-0.05) | +7% · +344% · +503% · -18% · +295% · +147% · +116% · +0% |
| HMM 2 states, 70% confidence, 120-bar features (59% same as EMA) | +64% | 48% | 1.32 (-0.69) | +8% · +380% · +123% · +22% · +166% · +19% · -26% · +0% |

Mode changes over the whole history: EMA 1457, HMM 3 states 404, HMM 3 states, 60% confidence 399, HMM 3 states AND EMA agree 764, HMM 2 states, 70% confidence 432.
