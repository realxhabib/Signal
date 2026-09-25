# Round 6 · New data and higher-level math

All picks were made on the research years (to 2025-09-24) with the full account (80% 4h + 20% 1h, market modes,
pyramid). The locked final year was not used, because nothing reached the finalist stage. Every variant is recorded
in `trials.json`.

| Idea | Best variant (Sharpe, baseline 2.00) | Verdict | Details |
|---|---|---|---|
| Order flow: taker buy/sell imbalance, CVD z-score, price/flow divergence | 1.99 | No edge: quintiles aren't monotonic, and filters don't help | [orderflow](RESULTS-round6-orderflow.md) |
| Futures basis (premium index z-score) | 2.08 | Too small to trust: the quintile table shows no pattern | [orderflow](RESULTS-round6-orderflow.md) |
| Hidden Markov Model market modes (2–3 states, walk-forward, causal filter) | 2.13 with 1-month features | Rejected: 3-week features 1.75, 6-week 1.98, so the peak is luck | [hmm](RESULTS-round6-hmm.md), [180](RESULTS-round6-hmm-180.md), [120](RESULTS-round6-hmm-120.md), [252](RESULTS-round6-hmm-252.md) |
| Volatility forecasts (HAR-RV, GARCH(1,1)) to scale risk | 2.06 | No risk-adjusted gain. ATR stops already size every trade by volatility | [vol](RESULTS-round6-vol.md) |
| Hurst exponent / variance ratio to pick trend vs reversion strategies | 2.03 | Wrong way round: trend trades did best in mean-reverting coins | [hurst](RESULTS-round6-hurst.md) |
| Boosted trees + triple-barrier labels + purged walk-forward for gold picks | 68.9% win, +0.067R | Same as the shipped Grade A (69.7%, +0.068R) and a linear model | [boosting](RESULTS-round6-boosting.md) |
| Pairs trading (cointegration-style, 5–10 pairs) | Sleeve Sharpe −0.73 | Loses money: crypto spreads trend rather than revert | [pairs](RESULTS-round6-pairs.md) |

**Deflated Sharpe** ([dsr](RESULTS-round6-dsr.md)). Against the 31 account variants tried this round, and even
assuming 1,000 trials, the account's edge is very unlikely to be luck (DSR ≈ 100%). The variants themselves range
from Sharpe 1.15 to 2.13 with a median of 1.98. Differences of ±0.1–0.2 between variants are noise.

**What this means.** The current system already captures the edge that these extra sources could reach. Order flow,
basis, volatility and regime math all collapse to information the price-based trend rules already use. Nothing was
shipped from this round. The next real test is forward data: `research/forward.ts` scores the rules frozen on
2026-09-25, and the alert server can log what it actually sent.
