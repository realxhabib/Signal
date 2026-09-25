# Round 7 · Pattern library (k-means on chart shapes, purged walk-forward)

Market-neutral sleeve, research years, market-order fees. Each pattern's score = average relative 24h move after it on past data, shrunk by n/(n+200); only patterns with |t| > 2 in training are traded.

| Sleeve | CAGR | Max DD | Sharpe | Corr. with account | Account Sharpe → with 20% sleeve | Turnover / day |
|---|---|---|---|---|---|---|
| Pattern library: 24-bar shapes, 64 patterns | +10% | 28% | 0.59 | 0.10 | 2.03 → **2.06** | 1.25 |
| Pattern library: 24-bar shapes, 32 patterns | +12% | 28% | 0.63 | 0.05 | 2.03 → **2.07** | 1.17 |
| Pattern library: 24-bar shapes, 128 patterns | -5% | 42% | -0.17 | 0.08 | 2.03 → **2.00** | 1.28 |
| Pattern library: 12-bar shapes, 64 patterns | +3% | 37% | 0.25 | 0.11 | 2.03 → **2.03** | 1.29 |
| Pattern library: 48-bar shapes, 64 patterns | +5% | 38% | 0.32 | 0.10 | 2.03 → **2.04** | 1.19 |
