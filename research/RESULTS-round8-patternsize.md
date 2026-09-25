# Round 8 · Pattern-guided sizing of the Signal Composite

Research years. Size × clip(1 + k·z, lo, hi), where z = the coin's pattern z-score in the trade's direction at the signal.

| Variant | CAGR | Max DD | Sharpe | By year |
|---|---|---|---|---|
| Baseline | +155% | 44% | 2.00 | +15% · +314% · +531% · +5% · +309% · +183% · +113% · +0% |
| Pattern sizing k=0.25 (0.5×–1.5×) | +162% | 48% | 1.97 (-0.03) | +15% · +352% · +533% · -0% · +327% · +202% · +121% · +0% |
| Pattern sizing k=0.5 (0.5×–1.5×) | +165% | 48% | 1.96 (-0.05) | +15% · +382% · +562% · -1% · +293% · +203% · +133% · +0% |
| Pattern sizing k=0.5 (0.25×–2×) | +168% | 51% | 1.93 (-0.07) | +15% · +390% · +538% · -5% · +340% · +224% · +128% · +0% |
| Pattern veto: skip trades with z < −1 | +152% | 45% | 1.99 (-0.01) | +15% · +283% · +449% · +11% · +308% · +205% · +111% · +0% |
