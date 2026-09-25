# Round 7 · Liquidations, stablecoin liquidity and options fear

## 1. Liquidation flush sleeve (1h, research years, market-order fees)

| Sleeve | CAGR | Max DD | Sharpe | Corr. with account | Account Sharpe → with 20% sleeve | Turnover / day |
|---|---|---|---|---|---|---|
| Liquidation flush: 4h drop > 2σ with OI −2%, hold 12h | -7% | 49% | 0.03 | 0.05 | 1.94 → **1.90** | 1.14 |
| Liquidation flush: 4h drop > 2σ with OI −4%, hold 12h | +0% | 42% | 0.21 | 0.03 | 1.94 → **1.94** | 0.95 |
| Liquidation flush: 4h drop > 2σ with OI −2%, hold 24h | +0% | 64% | 0.25 | 0.10 | 1.94 → **1.91** | 0.99 |
| Liquidation flush: 4h drop > 2σ with OI −2%, hold 6h | -4% | 64% | 0.04 | 0.02 | 1.94 → **1.92** | 1.23 |
| Liquidation flush: 4h drop > 2σ with OI −2%, hold 12h, both sides | -15% | 64% | -0.21 | 0.05 | 1.94 → **1.86** | 1.23 |

## 2–3. Filters on the account's long trades (research years)

| Variant | CAGR | Max DD | Sharpe | By year |
|---|---|---|---|---|
| Baseline | +155% | 44% | 2.00 | +15% · +314% · +531% · +5% · +309% · +183% · +113% · +0% |
| Longs only while stablecoin supply grew over 30 days | +126% | 44% | 1.88 (-0.12) | +15% · +297% · +531% · +7% · +79% · +182% · +113% · +0% |
| Longs only while stablecoin supply grew > 1% over 30 days | +115% | 45% | 1.81 (-0.20) | +15% · +326% · +531% · +17% · +23% · +144% · +112% · +0% |
| Skip longs when DVOL is extreme (90-day z > 1.5) | +161% | 45% | 2.04 (+0.04) | +15% · +314% · +531% · +5% · +275% · +256% · +114% · +0% |
| Skip longs when DVOL is very low (90-day z < −1) | +125% | 47% | 1.85 (-0.15) | +15% · +314% · +552% · -7% · +149% · +136% · +87% · +0% |
| Skip longs when realised vol exceeds implied (DVOL − RV < 0) | +161% | 41% | 2.05 (+0.04) | +15% · +314% · +531% · +21% · +301% · +147% · +151% · +0% |
