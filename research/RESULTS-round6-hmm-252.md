# Round 6 · Market modes from a Hidden Markov Model

Research years only (locked year untouched). 80% 4h + 20% 1h account, 1% base risk.

| Variant | CAGR | Max DD | Sharpe | By year |
|---|---|---|---|---|
| Baseline: EMA market mode | +155% | 44% | 2.00 | +15% · +314% · +531% · +5% · +309% · +183% · +113% · +0% |
| HMM 3 states (most likely state), 252-bar features (56% same as EMA) | +141% | 42% | 1.98 (-0.02) | +9% · +268% · +344% · +1% · +318% · +187% · +136% · +0% |
| HMM 3 states, 60% confidence, 252-bar features (56% same as EMA) | +141% | 42% | 1.99 (-0.01) | +9% · +269% · +344% · +0% · +318% · +194% · +136% · +0% |
| HMM 3 states AND EMA agree, 252-bar features (67% same as EMA) | +151% | 44% | 2.03 (+0.02) | +7% · +330% · +508% · -13% · +298% · +209% · +128% · +0% |
| HMM 2 states, 70% confidence, 252-bar features (61% same as EMA) | +62% | 35% | 1.26 (-0.75) | +23% · +82% · +344% · +25% · +21% · +115% · -6% · +0% |

Mode changes over the whole history: EMA 1457, HMM 3 states 278, HMM 3 states, 60% confidence 280, HMM 3 states AND EMA agree 731, HMM 2 states, 70% confidence 308.
