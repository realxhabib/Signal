# Round 4: priority, grade sizing, drawdown brake (20 coins, 4h, from 2021-09-04)

| Variant | CAGR | Max DD | Sharpe | 2022 | Stress: bad-case DD |
|---|---|---|---|---|---|
| Base: longs + half-size shorts | 43.1% | 26.8% | 1.24 | -12.2% | 45.2% |
| + take A-grades first | 43.4% | 32.5% | 1.25 | -12.3% | 46.1% |
| + size by grade (A 1.5× / B 1× / C 0.5×) | 55.3% | 34.4% | 1.30 | -16.6% | 52.0% |
| + skip C-grades | 42.9% | 29.3% | 1.27 | -10.0% | 44.7% |
| + A first + size by grade | 57.1% | 37.3% | 1.31 | -16.7% | 52.6% |
| + drawdown brake 10%→25%, half risk | 32.1% | 25.6% | 1.11 | -11.1% | 43.4% |
| + drawdown brake 15%→30%, half risk | 36.2% | 27.1% | 1.16 | -11.5% | 45.3% |
| + drawdown brake 10%→30%, quarter risk | 30.4% | 25.3% | 1.09 | -10.9% | 42.8% |

## Short designs at the account level (`research/shorts-portfolio.ts`, full test period)

Shorts sharing the 5 position slots with longs lowered the Sharpe ratio in every design (they crowd out longs in
choppy markets: 2024 fell from +32% to +5%). With **their own 3 slots at half risk**:

| Design | CAGR | Max DD | Sharpe | 2022 | 2024 |
|---|---|---|---|---|---|
| Long only | 72.0% | 31.2% | 1.64 | −16.5% | +31.7% |
| **+ shorts when the coin isn't bullish (shipped)** | **74.4%** | **26.8%** | **1.70** | **−12.2%** | +32.7% |
| + shorts, coin bear + BTC bear | 73.9% | 35.2% | 1.66 | −16.4% | +26.7% |
| + Supertrend-only shorts | 72.3% | 33.9% | 1.64 | −16.2% | +27.5% |

Robustness (short risk 0.25–0.75× of a long, 2–5 short slots): Sharpe 1.67–1.72 in every cell, all above long-only.
