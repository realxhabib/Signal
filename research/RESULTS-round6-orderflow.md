# Round 6 · Order flow and futures basis

Average result (R) of the shipped signals by quintile of each feature at the signal candle, research years only. Features are signed so higher = flow supports the trade (for the basis: higher = futures priced richer in the trade direction, i.e. more crowded).


## 4h

| Feature | Q1 (against) | Q2 | Q3 | Q4 | Q5 (with) | Q5 − Q1 |
|---|---|---|---|---|---|---|
| Taker flow, last 6 bars | 0.14R · 44% | 0.34R · 39% | 0.15R · 34% | 0.23R · 36% | 0.14R · 37% | -0.00R |
| Taker flow, last 24 bars | 0.30R · 39% | 0.19R · 39% | 0.14R · 36% | 0.19R · 39% | 0.16R · 37% | -0.13R |
| Taker flow z-score (24 vs last 500 bars) | 0.05R · 40% | 0.27R · 39% | 0.14R · 38% | 0.29R · 37% | 0.23R · 35% | +0.18R |
| Price/flow agreement (24 bars) | 0.18R · 37% | 0.17R · 39% | 0.22R · 38% | 0.19R · 38% | 0.23R · 38% | +0.06R |
| Futures basis z-score (30 days) | 0.19R · 41% | 0.25R · 39% | 0.15R · 37% | 0.22R · 37% | 0.15R · 36% | -0.04R |

## 1h

| Feature | Q1 (against) | Q2 | Q3 | Q4 | Q5 (with) | Q5 − Q1 |
|---|---|---|---|---|---|---|
| Taker flow, last 6 bars | 0.00R · 61% | 0.04R · 61% | 0.07R · 56% | 0.06R · 49% | 0.11R · 43% | +0.11R |
| Taker flow, last 24 bars | 0.05R · 56% | 0.07R · 55% | 0.08R · 53% | 0.03R · 53% | 0.07R · 52% | +0.02R |
| Taker flow z-score (24 vs last 500 bars) | -0.01R · 56% | 0.06R · 55% | 0.08R · 54% | 0.04R · 52% | 0.11R · 52% | +0.11R |
| Price/flow agreement (24 bars) | 0.01R · 53% | 0.08R · 54% | 0.06R · 54% | 0.04R · 54% | 0.10R · 55% | +0.09R |
| Futures basis z-score (30 days) | 0.08R · 54% | 0.05R · 53% | 0.07R · 55% | 0.02R · 53% | 0.06R · 54% | -0.03R |

## Whole account with a flow filter (research years)

| Variant | CAGR | Max DD | Sharpe | By year |
|---|---|---|---|---|
| Baseline | +155% | 44% | 2.00 | +15% · +314% · +531% · +5% · +309% · +183% · +113% · +0% |
| Skip trades with taker flow (24) most against them (bottom 20%) | +126% | 46% | 1.88 (-0.12) | +9% · +143% · +483% · +22% · +266% · +124% · +115% · +0% |
| Skip trades with flow z-score most against them (bottom 20%) | +146% | 46% | 1.99 (-0.02) | +14% · +303% · +437% · +11% · +258% · +196% · +108% · +0% |
| Skip trades where price and flow disagree most (bottom 20%) | +136% | 39% | 1.96 (-0.05) | +10% · +259% · +482% · +6% · +331% · +82% · +133% · +0% |
| Skip trades with the most crowded basis (top 20%) | +155% | 41% | 2.08 (+0.08) | +15% · +313% · +445% · +23% · +294% · +162% · +132% · +0% |
