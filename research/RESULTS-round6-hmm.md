# Round 6 · Market modes from a Hidden Markov Model

Research years only (locked year untouched). 80% 4h + 20% 1h account, 1% base risk.

| Variant | CAGR | Max DD | Sharpe | By year |
|---|---|---|---|---|
| Baseline: EMA market mode | +155% | 44% | 2.00 | +15% · +314% · +531% · +5% · +309% · +183% · +113% · +0% |
| HMM 3 states (most likely state) (59% same as EMA) | +104% | 46% | 1.70 (-0.30) | +8% · +287% · +96% · -9% · +280% · +160% · +117% · +0% |
| HMM 3 states, 60% confidence (58% same as EMA) | +107% | 46% | 1.73 (-0.27) | +8% · +288% · +112% · -9% · +278% · +163% · +118% · +0% |
| HMM 3 states AND EMA agree (67% same as EMA) | +143% | 49% | 1.97 (-0.03) | +8% · +342% · +455% · -11% · +288% · +184% · +111% · +0% |
| HMM 2 states, 70% confidence (54% same as EMA) | +48% | 42% | 1.15 (-0.85) | +21% · +89% · +119% · +36% · +105% · +64% · -28% · +0% |

Mode changes over the whole history: EMA 1457, HMM 3 states 545, HMM 3 states, 60% confidence 571, HMM 3 states AND EMA agree 611, HMM 2 states, 70% confidence 674.
