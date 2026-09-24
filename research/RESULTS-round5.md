# Round 5: making money in bull and bear markets

Momentum lookback picks (blind, every 6 months): 2020-07:30d, 2021-01:7d, 2021-07:30d, 2022-01:30d, 2022-07:7d, 2023-01:30d, 2023-07:14d, 2024-01:30d, 2024-07:30d, 2025-01:14d, 2025-07:14d, 2026-01:14d, 2026-07:14d. Daily correlation between the composite account and the momentum sleeve: 0.22.

Common period 2020-07-11 → 2026-09-23.

| Capital split (composite / momentum) | CAGR | Max DD | Sharpe | Losing quarters | Worst quarter | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 | 2026 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 100 / 0 | +89% | 30.4% | 1.82 | 7/25 | -14% | +83% | +264% | +2% | +113% | +27% | +130% | +24% |
| 80 / 20 | +77% | 25.4% | 1.87 | 7/25 | -12% | +74% | +184% | +4% | +98% | +28% | +119% | +21% |
| 70 / 30 | +70% | 25.1% | 1.86 | 6/25 | -11% | +70% | +149% | +4% | +90% | +29% | +113% | +19% |
| 60 / 40 | +64% | 25.1% | 1.83 | 6/25 | -10% | +65% | +118% | +5% | +82% | +29% | +107% | +17% |
| 50 / 50 | +57% | 25.1% | 1.75 | 6/25 | -10% | +61% | +89% | +5% | +74% | +29% | +101% | +15% |
| 0 / 100 | +24% | 44.5% | 0.82 | 9/25 | -13% | +36% | -13% | +5% | +38% | +27% | +68% | +3% |

## Regime-adaptive allocation (`research/regime-adaptive.ts`)

Bitcoin's trend regime (price vs EMA 50/200, 200 rising/falling) sets the market mode.

| Setup | CAGR | Max DD | Sharpe | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 | 2026 |
|---|---|---|---|---|---|---|---|---|---|---|
| Static (longs 1×/5, shorts ½×/3) | 74.4% | 26.8% | 1.70 | 165% | 226% | −12% | 93% | 33% | 128% | 18% |
| Bear: shorts 1×/5 | 84.4% | 33.5% | 1.70 | 160% | 255% | 8% | 105% | 26% | 131% | 28% |
| Bear: shorts 1×/5, bull: no shorts | 87.8% | 32.7% | 1.73 | 158% | 275% | 9% | 116% | 24% | 134% | 31% |
| Bear: shorts 1.5×/5, bull: no shorts | 93.9% | 39.7% | 1.66 | 156% | 295% | 21% | 121% | 19% | 140% | 38% |
| **Shipped: bear shorts ¾×/5, neutral shorts ½×/3, bull no shorts** | **84.3%** | **30.9%** | **1.75** | | | **+3%** | | | | |

Robustness grid (bear short risk 0.75/1/1.25×, 3/5/7 slots, neutral shorts 0.25/0.5×): Sharpe 1.56–1.75; with 5 or 7
bear slots no year lost money; with 3 bear slots 2022 was −1% to −8%. About 8 of 29 quarters were negative in every
variant (worst quarter −13% to −22%).

## Sleeves (`research/sleeves.ts`)

Momentum (long top 4 / short bottom 4 by trailing return, weekly, dollar-neutral, 1× gross, real funding):
7d 29%/yr (Sharpe 1.02), 14d 30% (0.95), 30d 31% (1.03), 60d 19% (0.72), 90d 11% (0.45). The reversal versions lost
24–36%/yr, confirming momentum. Blind lookback selection: 24%/yr, Sharpe 0.82.

Funding carry (spot long + perp short on coins with positive trailing funding, 3× perp leverage): 7–9%/yr overall,
max DD ≤ 3%, but 16–34%/yr came in 2020–21 and ~0–9% since 2022. Dropped.
