# Round 6 · Trend vs mean reversion (Hurst exponent, variance ratio)

Average result (R) and win rate by Hurst quintile at the signal candle, split by which kind of strategy opened the trade. Research years only.


## 4h (Hurst quintile edges 0.427, 0.459, 0.485, 0.516)

| Opened by | n | Q1 (reverting) | Q2 | Q3 | Q4 | Q5 (trending) |
|---|---|---|---|---|---|---|
| trend | 5491 | 0.38R · 33% | 0.17R · 32% | 0.26R · 32% | 0.26R · 32% | 0.18R · 33% |
| reversion | 1337 | -0.03R · 64% | 0.00R · 63% | -0.01R · 63% | -0.01R · 56% | -0.04R · 61% |
| both | 3 | 0.01R · 100% | -0.36R · 0% | — | — | — |

## 1h (Hurst quintile edges 0.419, 0.452, 0.479, 0.509)

| Opened by | n | Q1 (reverting) | Q2 | Q3 | Q4 | Q5 (trending) |
|---|---|---|---|---|---|---|
| trend | 5592 | 0.21R · 31% | 0.24R · 31% | 0.15R · 29% | 0.24R · 30% | -0.07R · 26% |
| reversion | 11958 | -0.01R · 64% | 0.00R · 65% | 0.02R · 66% | 0.02R · 66% | 0.02R · 66% |
| both | 2 | — | 4.95R · 100% | — | — | -0.98R · 0% |

## Whole account with the regime gate (research years)

| Variant | CAGR | Max DD | Sharpe | By year |
|---|---|---|---|---|
| Baseline | +155% | 44% | 2.00 | +15% · +314% · +531% · +5% · +309% · +183% · +113% · +0% |
| Hurst gate: trend trades need H above bottom 20%, reversion trades below top 20% | +99% | 41% | 1.77 (-0.24) | +13% · +197% · +197% · -10% · +241% · +119% · +99% · +0% |
| Hurst gate: trend trades only | +97% | 42% | 1.73 (-0.28) | +13% · +198% · +200% · -11% · +227% · +115% · +98% · +0% |
| Hurst gate: reversion trades only | +158% | 44% | 2.03 (+0.03) | +15% · +310% · +517% · +6% · +325% · +197% · +116% · +0% |
| Variance-ratio gate (both kinds) | +119% | 40% | 1.90 (-0.11) | +16% · +228% · +163% · +5% · +290% · +179% · +132% · +0% |
