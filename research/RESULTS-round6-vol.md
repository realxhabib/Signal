# Round 6 · Volatility forecasts for account risk

Forecast quality (correlation of forecast with next-day log realised variance, research years): HAR-RV 0.66, GARCH(1,1) 0.58, yesterday's value 0.65.

Risk per trade × (typical vol / forecast vol), clipped. Research years only.

| Variant | CAGR | Max DD | Sharpe | By year |
|---|---|---|---|---|
| Baseline (fixed risk) | +155% | 44% | 2.00 | +15% · +314% · +531% · +5% · +309% · +183% · +113% · +0% |
| HAR-RV, 0.5×–1.5× | +176% | 46% | 1.98 (-0.03) | +22% · +352% · +280% · +22% · +515% · +198% · +191% · +0% |
| HAR-RV, cut only (0.5×–1×) | +137% | 43% | 1.98 (-0.03) | +15% · +289% · +274% · +12% · +308% · +177% · +116% · +0% |
| HAR-RV, 0.25×–2× | +204% | 45% | 2.01 (+0.01) | +23% · +416% · +263% · +34% · +748% · +192% · +249% · +0% |
| GARCH(1,1), 0.5×–1.5× | +186% | 50% | 2.06 (+0.05) | +20% · +356% · +437% · +13% · +467% · +242% · +170% · +0% |
