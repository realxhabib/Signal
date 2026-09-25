# Gold alerts: stricter signal subsets

Win = trade closed in profit after fees and funding. +1R = price reached one stop-distance of profit before the stop. Per month = across all 20 coins.


## 4h

| Filter | Research: per month / win / +1R / avg R | **Locked year**: per month / win / +1R / avg R |
|---|---|---|
| All signals (today) | 85.7 / 40% / 30% / 0.25R (n=8190) | **119.4 / 38% / 28% / 0.05R (n=1436)** |
| With BTC (long in bull / short in bear) | 45.4 / 38% / 32% / 0.25R (n=4342) | **61.4 / 37% / 31% / 0.06R (n=738)** |
| Coin trend agrees | 41.8 / 39% / 35% / 0.33R (n=4000) | **60.2 / 37% / 32% / 0.06R (n=724)** |
| Higher timeframe agrees | 37.6 / 41% / 28% / 0.24R (n=3593) | **60.4 / 43% / 27% / 0.01R (n=726)** |
| 2+ strategies agree | 6.9 / 45% / 34% / 0.48R (n=656) | **12.2 / 47% / 28% / 0.07R (n=147)** |
| 3+ strategies agree | 0.0 / 0% / 100% / -0.11R (n=1) | **—** |
| Grade A (longs) | 11.4 / 35% / 43% / 0.74R (n=1086) | **16.3 / 30% / 36% / 0.21R (n=196)** |
| Grade A, model trained before the locked year | 12.0 / 36% / 42% / 0.73R (n=1147) | **17.6 / 30% / 34% / 0.06R (n=212)** |
| With BTC + higher TF | 22.2 / 38% / 30% / 0.15R (n=2122) | **33.8 / 38% / 30% / 0.04R (n=406)** |
| With BTC + 2+ agree | 3.8 / 43% / 38% / 0.38R (n=362) | **6.3 / 39% / 28% / -0.06R (n=76)** |
| Higher TF + 2+ agree | 3.6 / 43% / 31% / 0.62R (n=348) | **5.9 / 52% / 30% / 0.08R (n=71)** |
| With BTC + higher TF + 2+ agree | 2.0 / 39% / 37% / 0.25R (n=195) | **3.2 / 55% / 39% / 0.30R (n=38)** |
| With BTC + higher TF + coin trend | 17.2 / 36% / 32% / 0.21R (n=1641) | **28.1 / 36% / 32% / 0.07R (n=338)** |
| Grade A + with BTC | 6.3 / 35% / 44% / 0.66R (n=606) | **8.1 / 32% / 42% / -0.05R (n=97)** |
| Grade A + higher TF | 3.4 / 39% / 46% / 1.12R (n=322) | **1.4 / 41% / 41% / 0.12R (n=17)** |

## 1h

| Filter | Research: per month / win / +1R / avg R | **Locked year**: per month / win / +1R / avg R |
|---|---|---|
| All signals (today) | 224.0 / 56% / 18% / 0.08R (n=21680) | **313.0 / 54% / 18% / -0.00R (n=3765)** |
| With BTC (long in bull / short in bear) | 155.1 / 57% / 17% / 0.07R (n=15008) | **204.4 / 55% / 17% / 0.00R (n=2458)** |
| Coin trend agrees | 138.1 / 53% / 22% / 0.12R (n=13364) | **194.7 / 51% / 22% / -0.01R (n=2342)** |
| Higher timeframe agrees | 180.8 / 58% / 15% / 0.07R (n=17495) | **252.7 / 56% / 17% / 0.00R (n=3039)** |
| 2+ strategies agree | 13.6 / 64% / 7% / 0.06R (n=1315) | **16.3 / 57% / 8% / -0.02R (n=196)** |
| 3+ strategies agree | — | **—** |
| Grade A (longs) | 24.8 / 38% / 44% / 0.32R (n=2404) | **24.6 / 32% / 50% / 0.13R (n=296)** |
| Grade A, model trained before the locked year | 25.7 / 39% / 44% / 0.30R (n=2489) | **26.9 / 33% / 50% / 0.11R (n=324)** |
| With BTC + higher TF | 138.0 / 58% / 16% / 0.05R (n=13353) | **187.3 / 56% / 17% / 0.00R (n=2253)** |
| With BTC + 2+ agree | 9.9 / 64% / 8% / 0.06R (n=959) | **12.5 / 59% / 7% / -0.00R (n=150)** |
| Higher TF + 2+ agree | 12.2 / 64% / 6% / 0.06R (n=1179) | **14.9 / 57% / 7% / -0.02R (n=179)** |
| With BTC + higher TF + 2+ agree | 9.4 / 65% / 8% / 0.07R (n=910) | **12.1 / 59% / 8% / 0.00R (n=145)** |
| With BTC + higher TF + coin trend | 86.2 / 54% / 21% / 0.09R (n=8345) | **119.6 / 51% / 22% / -0.02R (n=1438)** |
| Grade A + with BTC | 17.0 / 39% / 44% / 0.28R (n=1641) | **11.9 / 36% / 50% / 0.13R (n=143)** |
| Grade A + higher TF | 16.4 / 38% / 41% / 0.27R (n=1589) | **11.7 / 33% / 50% / 0.23R (n=141)** |

## Fixed target/stop brackets (in ATRs, max 30 bars) on the same signals

A near target raises the win rate by geometry alone: with a random entry, target 1 / stop 3 wins about 75% of the time and makes nothing. The edge is the win rate above that break-even line.


### 4h

| Filter | Bracket | Break-even win | Research: win / avg R | **Locked year**: win / avg R |
|---|---|---|---|---|
| All signals (today) | 1 / 3 | 75% | 74% / 0.020R (n=8190) | **70% / -0.046R (n=1436)** |
| All signals (today) | 1.5 / 3 | 67% | 66% / 0.028R (n=8190) | **62% / -0.045R (n=1436)** |
| All signals (today) | 2 / 3 | 60% | 59% / 0.035R (n=8190) | **55% / -0.052R (n=1436)** |
| All signals (today) | 1 / 2 | 67% | 69% / 0.034R (n=8190) | **64% / -0.049R (n=1436)** |
| All signals (today) | 1.5 / 2 | 57% | 60% / 0.047R (n=8190) | **55% / -0.044R (n=1436)** |
| All signals (today) | 0.75 / 1.5 | 67% | 69% / 0.024R (n=8190) | **65% / -0.034R (n=1436)** |
| All signals (today) | 1 / 1.5 | 60% | 63% / 0.037R (n=8190) | **59% / -0.034R (n=1436)** |
| With BTC (long in bull / short in bear) | 1 / 3 | 75% | 74% / 0.022R (n=4342) | **70% / -0.040R (n=738)** |
| With BTC (long in bull / short in bear) | 1.5 / 3 | 67% | 65% / 0.027R (n=4342) | **61% / -0.052R (n=738)** |
| With BTC (long in bull / short in bear) | 2 / 3 | 60% | 59% / 0.032R (n=4342) | **52% / -0.077R (n=738)** |
| With BTC (long in bull / short in bear) | 1 / 2 | 67% | 69% / 0.028R (n=4342) | **64% / -0.041R (n=738)** |
| With BTC (long in bull / short in bear) | 1.5 / 2 | 57% | 59% / 0.038R (n=4342) | **55% / -0.043R (n=738)** |
| With BTC (long in bull / short in bear) | 0.75 / 1.5 | 67% | 69% / 0.020R (n=4342) | **66% / -0.024R (n=738)** |
| With BTC (long in bull / short in bear) | 1 / 1.5 | 60% | 62% / 0.023R (n=4342) | **60% / -0.020R (n=738)** |
| Coin trend agrees | 1 / 3 | 75% | 75% / 0.031R (n=4000) | **71% / -0.036R (n=724)** |
| Coin trend agrees | 1.5 / 3 | 67% | 65% / 0.033R (n=4000) | **60% / -0.054R (n=724)** |
| Coin trend agrees | 2 / 3 | 60% | 59% / 0.041R (n=4000) | **52% / -0.076R (n=724)** |
| Coin trend agrees | 1 / 2 | 67% | 70% / 0.049R (n=4000) | **64% / -0.041R (n=724)** |
| Coin trend agrees | 1.5 / 2 | 57% | 60% / 0.053R (n=4000) | **54% / -0.047R (n=724)** |
| Coin trend agrees | 0.75 / 1.5 | 67% | 69% / 0.028R (n=4000) | **66% / -0.028R (n=724)** |
| Coin trend agrees | 1 / 1.5 | 60% | 63% / 0.045R (n=4000) | **59% / -0.031R (n=724)** |
| Higher timeframe agrees | 1 / 3 | 75% | 74% / 0.017R (n=3593) | **74% / -0.003R (n=726)** |
| Higher timeframe agrees | 1.5 / 3 | 67% | 65% / 0.019R (n=3593) | **65% / -0.001R (n=726)** |
| Higher timeframe agrees | 2 / 3 | 60% | 59% / 0.022R (n=3593) | **58% / -0.003R (n=726)** |
| Higher timeframe agrees | 1 / 2 | 67% | 69% / 0.031R (n=3593) | **67% / 0.006R (n=726)** |
| Higher timeframe agrees | 1.5 / 2 | 57% | 60% / 0.042R (n=3593) | **59% / 0.021R (n=726)** |
| Higher timeframe agrees | 0.75 / 1.5 | 67% | 68% / 0.014R (n=3593) | **69% / 0.021R (n=726)** |
| Higher timeframe agrees | 1 / 1.5 | 60% | 63% / 0.037R (n=3593) | **64% / 0.046R (n=726)** |
| 2+ strategies agree | 1 / 3 | 75% | 75% / 0.023R (n=656) | **71% / -0.031R (n=147)** |
| 2+ strategies agree | 1.5 / 3 | 67% | 66% / 0.046R (n=656) | **61% / -0.046R (n=147)** |
| 2+ strategies agree | 2 / 3 | 60% | 60% / 0.055R (n=656) | **55% / -0.040R (n=147)** |
| 2+ strategies agree | 1 / 2 | 67% | 70% / 0.054R (n=656) | **61% / -0.080R (n=147)** |
| 2+ strategies agree | 1.5 / 2 | 57% | 62% / 0.089R (n=656) | **54% / -0.059R (n=147)** |
| 2+ strategies agree | 0.75 / 1.5 | 67% | 69% / 0.026R (n=656) | **64% / -0.056R (n=147)** |
| 2+ strategies agree | 1 / 1.5 | 60% | 64% / 0.056R (n=656) | **56% / -0.077R (n=147)** |
| 3+ strategies agree | 1 / 3 | 75% | 100% / 0.328R (n=1) | **—** |
| 3+ strategies agree | 1.5 / 3 | 67% | 100% / 0.495R (n=1) | **—** |
| 3+ strategies agree | 2 / 3 | 60% | 100% / 0.661R (n=1) | **—** |
| 3+ strategies agree | 1 / 2 | 67% | 100% / 0.492R (n=1) | **—** |
| 3+ strategies agree | 1.5 / 2 | 57% | 100% / 0.742R (n=1) | **—** |
| 3+ strategies agree | 0.75 / 1.5 | 67% | 100% / 0.489R (n=1) | **—** |
| 3+ strategies agree | 1 / 1.5 | 60% | 100% / 0.656R (n=1) | **—** |
| Grade A (longs) | 1 / 3 | 75% | 77% / 0.044R (n=1086) | **70% / -0.056R (n=196)** |
| Grade A (longs) | 1.5 / 3 | 67% | 68% / 0.053R (n=1086) | **59% / -0.100R (n=196)** |
| Grade A (longs) | 2 / 3 | 60% | 63% / 0.075R (n=1086) | **52% / -0.127R (n=196)** |
| Grade A (longs) | 1 / 2 | 67% | 71% / 0.063R (n=1086) | **62% / -0.078R (n=196)** |
| Grade A (longs) | 1.5 / 2 | 57% | 62% / 0.090R (n=1086) | **51% / -0.128R (n=196)** |
| Grade A (longs) | 0.75 / 1.5 | 67% | 71% / 0.057R (n=1086) | **67% / -0.015R (n=196)** |
| Grade A (longs) | 1 / 1.5 | 60% | 65% / 0.067R (n=1086) | **57% / -0.065R (n=196)** |
| Grade A, model trained before the locked year | 1 / 3 | 75% | 78% / 0.056R (n=1147) | **70% / -0.055R (n=212)** |
| Grade A, model trained before the locked year | 1.5 / 3 | 67% | 68% / 0.060R (n=1147) | **60% / -0.080R (n=212)** |
| Grade A, model trained before the locked year | 2 / 3 | 60% | 62% / 0.083R (n=1147) | **51% / -0.123R (n=212)** |
| Grade A, model trained before the locked year | 1 / 2 | 67% | 72% / 0.071R (n=1147) | **63% / -0.070R (n=212)** |
| Grade A, model trained before the locked year | 1.5 / 2 | 57% | 62% / 0.087R (n=1147) | **52% / -0.095R (n=212)** |
| Grade A, model trained before the locked year | 0.75 / 1.5 | 67% | 72% / 0.065R (n=1147) | **64% / -0.062R (n=212)** |
| Grade A, model trained before the locked year | 1 / 1.5 | 60% | 65% / 0.066R (n=1147) | **56% / -0.089R (n=212)** |
| With BTC + higher TF | 1 / 3 | 75% | 73% / 0.012R (n=2122) | **71% / -0.029R (n=406)** |
| With BTC + higher TF | 1.5 / 3 | 67% | 65% / 0.018R (n=2122) | **61% / -0.057R (n=406)** |
| With BTC + higher TF | 2 / 3 | 60% | 58% / 0.010R (n=2122) | **52% / -0.086R (n=406)** |
| With BTC + higher TF | 1 / 2 | 67% | 68% / 0.016R (n=2122) | **66% / -0.017R (n=406)** |
| With BTC + higher TF | 1.5 / 2 | 57% | 59% / 0.032R (n=2122) | **56% / -0.026R (n=406)** |
| With BTC + higher TF | 0.75 / 1.5 | 67% | 68% / 0.008R (n=2122) | **70% / 0.031R (n=406)** |
| With BTC + higher TF | 1 / 1.5 | 60% | 62% / 0.017R (n=2122) | **63% / 0.039R (n=406)** |
| With BTC + 2+ agree | 1 / 3 | 75% | 73% / 0.018R (n=362) | **68% / -0.032R (n=76)** |
| With BTC + 2+ agree | 1.5 / 3 | 67% | 64% / 0.035R (n=362) | **53% / -0.120R (n=76)** |
| With BTC + 2+ agree | 2 / 3 | 60% | 59% / 0.062R (n=362) | **45% / -0.163R (n=76)** |
| With BTC + 2+ agree | 1 / 2 | 67% | 69% / 0.038R (n=362) | **57% / -0.133R (n=76)** |
| With BTC + 2+ agree | 1.5 / 2 | 57% | 60% / 0.067R (n=362) | **46% / -0.174R (n=76)** |
| With BTC + 2+ agree | 0.75 / 1.5 | 67% | 69% / 0.028R (n=362) | **62% / -0.087R (n=76)** |
| With BTC + 2+ agree | 1 / 1.5 | 60% | 63% / 0.040R (n=362) | **51% / -0.159R (n=76)** |
| Higher TF + 2+ agree | 1 / 3 | 75% | 73% / -0.002R (n=348) | **77% / 0.026R (n=71)** |
| Higher TF + 2+ agree | 1.5 / 3 | 67% | 65% / 0.018R (n=348) | **66% / 0.003R (n=71)** |
| Higher TF + 2+ agree | 2 / 3 | 60% | 57% / 0.018R (n=348) | **61% / 0.018R (n=71)** |
| Higher TF + 2+ agree | 1 / 2 | 67% | 68% / 0.015R (n=348) | **66% / -0.018R (n=71)** |
| Higher TF + 2+ agree | 1.5 / 2 | 57% | 60% / 0.047R (n=348) | **61% / 0.045R (n=71)** |
| Higher TF + 2+ agree | 0.75 / 1.5 | 67% | 69% / 0.022R (n=348) | **66% / -0.022R (n=71)** |
| Higher TF + 2+ agree | 1 / 1.5 | 60% | 63% / 0.037R (n=348) | **62% / 0.018R (n=71)** |
| With BTC + higher TF + 2+ agree | 1 / 3 | 75% | 69% / -0.033R (n=195) | **87% / 0.151R (n=38)** |
| With BTC + higher TF + 2+ agree | 1.5 / 3 | 67% | 62% / -0.010R (n=195) | **66% / 0.012R (n=38)** |
| With BTC + higher TF + 2+ agree | 2 / 3 | 60% | 56% / 0.004R (n=195) | **55% / -0.043R (n=38)** |
| With BTC + higher TF + 2+ agree | 1 / 2 | 67% | 64% / -0.035R (n=195) | **74% / 0.094R (n=38)** |
| With BTC + higher TF + 2+ agree | 1.5 / 2 | 57% | 56% / -0.003R (n=195) | **63% / 0.088R (n=38)** |
| With BTC + higher TF + 2+ agree | 0.75 / 1.5 | 67% | 68% / 0.010R (n=195) | **79% / 0.169R (n=38)** |
| With BTC + higher TF + 2+ agree | 1 / 1.5 | 60% | 61% / 0.007R (n=195) | **74% / 0.213R (n=38)** |
| With BTC + higher TF + coin trend | 1 / 3 | 75% | 73% / 0.018R (n=1641) | **71% / -0.034R (n=338)** |
| With BTC + higher TF + coin trend | 1.5 / 3 | 67% | 64% / 0.015R (n=1641) | **59% / -0.079R (n=338)** |
| With BTC + higher TF + coin trend | 2 / 3 | 60% | 57% / 0.013R (n=1641) | **49% / -0.125R (n=338)** |
| With BTC + higher TF + coin trend | 1 / 2 | 67% | 69% / 0.032R (n=1641) | **65% / -0.030R (n=338)** |
| With BTC + higher TF + coin trend | 1.5 / 2 | 57% | 59% / 0.036R (n=1641) | **54% / -0.060R (n=338)** |
| With BTC + higher TF + coin trend | 0.75 / 1.5 | 67% | 69% / 0.024R (n=1641) | **69% / 0.020R (n=338)** |
| With BTC + higher TF + coin trend | 1 / 1.5 | 60% | 62% / 0.028R (n=1641) | **62% / 0.020R (n=338)** |
| Grade A + with BTC | 1 / 3 | 75% | 79% / 0.065R (n=606) | **75% / 0.016R (n=97)** |
| Grade A + with BTC | 1.5 / 3 | 67% | 70% / 0.080R (n=606) | **64% / -0.016R (n=97)** |
| Grade A + with BTC | 2 / 3 | 60% | 64% / 0.097R (n=606) | **57% / -0.043R (n=97)** |
| Grade A + with BTC | 1 / 2 | 67% | 73% / 0.089R (n=606) | **67% / -0.008R (n=97)** |
| Grade A + with BTC | 1.5 / 2 | 57% | 64% / 0.126R (n=606) | **56% / -0.036R (n=97)** |
| Grade A + with BTC | 0.75 / 1.5 | 67% | 73% / 0.079R (n=606) | **69% / 0.018R (n=97)** |
| Grade A + with BTC | 1 / 1.5 | 60% | 67% / 0.098R (n=606) | **62% / 0.013R (n=97)** |
| Grade A + higher TF | 1 / 3 | 75% | 80% / 0.097R (n=322) | **76% / 0.008R (n=17)** |
| Grade A + higher TF | 1.5 / 3 | 67% | 72% / 0.118R (n=322) | **76% / 0.135R (n=17)** |
| Grade A + higher TF | 2 / 3 | 60% | 67% / 0.144R (n=322) | **59% / -0.032R (n=17)** |
| Grade A + higher TF | 1 / 2 | 67% | 75% / 0.119R (n=322) | **65% / -0.047R (n=17)** |
| Grade A + higher TF | 1.5 / 2 | 57% | 65% / 0.143R (n=322) | **65% / 0.114R (n=17)** |
| Grade A + higher TF | 0.75 / 1.5 | 67% | 72% / 0.071R (n=322) | **76% / 0.123R (n=17)** |
| Grade A + higher TF | 1 / 1.5 | 60% | 69% / 0.139R (n=322) | **65% / 0.055R (n=17)** |

### 1h

| Filter | Bracket | Break-even win | Research: win / avg R | **Locked year**: win / avg R |
|---|---|---|---|---|
| All signals (today) | 1 / 3 | 75% | 74% / 0.011R (n=21680) | **75% / 0.007R (n=3765)** |
| All signals (today) | 1.5 / 3 | 67% | 65% / 0.018R (n=21680) | **66% / 0.018R (n=3765)** |
| All signals (today) | 2 / 3 | 60% | 59% / 0.020R (n=21680) | **60% / 0.020R (n=3765)** |
| All signals (today) | 1 / 2 | 67% | 68% / 0.015R (n=21680) | **68% / 0.010R (n=3765)** |
| All signals (today) | 1.5 / 2 | 57% | 59% / 0.020R (n=21680) | **59% / 0.021R (n=3765)** |
| All signals (today) | 0.75 / 1.5 | 67% | 68% / 0.000R (n=21680) | **68% / -0.017R (n=3765)** |
| All signals (today) | 1 / 1.5 | 60% | 62% / 0.012R (n=21680) | **62% / -0.004R (n=3765)** |
| With BTC (long in bull / short in bear) | 1 / 3 | 75% | 74% / 0.005R (n=15008) | **74% / 0.007R (n=2458)** |
| With BTC (long in bull / short in bear) | 1.5 / 3 | 67% | 65% / 0.016R (n=15008) | **67% / 0.023R (n=2458)** |
| With BTC (long in bull / short in bear) | 2 / 3 | 60% | 59% / 0.018R (n=15008) | **61% / 0.031R (n=2458)** |
| With BTC (long in bull / short in bear) | 1 / 2 | 67% | 68% / 0.005R (n=15008) | **68% / 0.011R (n=2458)** |
| With BTC (long in bull / short in bear) | 1.5 / 2 | 57% | 58% / 0.014R (n=15008) | **60% / 0.032R (n=2458)** |
| With BTC (long in bull / short in bear) | 0.75 / 1.5 | 67% | 67% / -0.011R (n=15008) | **67% / -0.018R (n=2458)** |
| With BTC (long in bull / short in bear) | 1 / 1.5 | 60% | 61% / -0.000R (n=15008) | **62% / -0.002R (n=2458)** |
| Coin trend agrees | 1 / 3 | 75% | 74% / 0.017R (n=13364) | **73% / -0.008R (n=2342)** |
| Coin trend agrees | 1.5 / 3 | 67% | 66% / 0.027R (n=13364) | **64% / -0.002R (n=2342)** |
| Coin trend agrees | 2 / 3 | 60% | 59% / 0.030R (n=13364) | **58% / -0.001R (n=2342)** |
| Coin trend agrees | 1 / 2 | 67% | 68% / 0.016R (n=13364) | **67% / -0.005R (n=2342)** |
| Coin trend agrees | 1.5 / 2 | 57% | 59% / 0.027R (n=13364) | **58% / -0.001R (n=2342)** |
| Coin trend agrees | 0.75 / 1.5 | 67% | 68% / -0.001R (n=13364) | **66% / -0.037R (n=2342)** |
| Coin trend agrees | 1 / 1.5 | 60% | 62% / 0.011R (n=13364) | **60% / -0.026R (n=2342)** |
| Higher timeframe agrees | 1 / 3 | 75% | 74% / 0.006R (n=17495) | **74% / 0.003R (n=3039)** |
| Higher timeframe agrees | 1.5 / 3 | 67% | 65% / 0.011R (n=17495) | **66% / 0.015R (n=3039)** |
| Higher timeframe agrees | 2 / 3 | 60% | 58% / 0.011R (n=17495) | **60% / 0.021R (n=3039)** |
| Higher timeframe agrees | 1 / 2 | 67% | 68% / 0.005R (n=17495) | **68% / 0.012R (n=3039)** |
| Higher timeframe agrees | 1.5 / 2 | 57% | 58% / 0.007R (n=17495) | **59% / 0.020R (n=3039)** |
| Higher timeframe agrees | 0.75 / 1.5 | 67% | 68% / -0.009R (n=17495) | **68% / -0.017R (n=3039)** |
| Higher timeframe agrees | 1 / 1.5 | 60% | 61% / 0.002R (n=17495) | **62% / -0.002R (n=3039)** |
| 2+ strategies agree | 1 / 3 | 75% | 76% / 0.035R (n=1315) | **74% / 0.003R (n=196)** |
| 2+ strategies agree | 1.5 / 3 | 67% | 68% / 0.052R (n=1315) | **65% / 0.006R (n=196)** |
| 2+ strategies agree | 2 / 3 | 60% | 61% / 0.048R (n=1315) | **58% / -0.010R (n=196)** |
| 2+ strategies agree | 1 / 2 | 67% | 70% / 0.042R (n=1315) | **69% / 0.006R (n=196)** |
| 2+ strategies agree | 1.5 / 2 | 57% | 61% / 0.058R (n=1315) | **61% / 0.039R (n=196)** |
| 2+ strategies agree | 0.75 / 1.5 | 67% | 69% / 0.008R (n=1315) | **65% / -0.054R (n=196)** |
| 2+ strategies agree | 1 / 1.5 | 60% | 64% / 0.046R (n=1315) | **60% / -0.038R (n=196)** |
| 3+ strategies agree | 1 / 3 | 75% | — | **—** |
| 3+ strategies agree | 1.5 / 3 | 67% | — | **—** |
| 3+ strategies agree | 2 / 3 | 60% | — | **—** |
| 3+ strategies agree | 1 / 2 | 67% | — | **—** |
| 3+ strategies agree | 1.5 / 2 | 57% | — | **—** |
| 3+ strategies agree | 0.75 / 1.5 | 67% | — | **—** |
| 3+ strategies agree | 1 / 1.5 | 60% | — | **—** |
| Grade A (longs) | 1 / 3 | 75% | 78% / 0.046R (n=2404) | **77% / 0.028R (n=296)** |
| Grade A (longs) | 1.5 / 3 | 67% | 69% / 0.065R (n=2404) | **71% / 0.064R (n=296)** |
| Grade A (longs) | 2 / 3 | 60% | 63% / 0.081R (n=2404) | **65% / 0.082R (n=296)** |
| Grade A (longs) | 1 / 2 | 67% | 71% / 0.049R (n=2404) | **67% / -0.016R (n=296)** |
| Grade A (longs) | 1.5 / 2 | 57% | 62% / 0.074R (n=2404) | **60% / 0.036R (n=296)** |
| Grade A (longs) | 0.75 / 1.5 | 67% | 70% / 0.024R (n=2404) | **66% / -0.055R (n=296)** |
| Grade A (longs) | 1 / 1.5 | 60% | 64% / 0.043R (n=2404) | **61% / -0.013R (n=296)** |
| Grade A, model trained before the locked year | 1 / 3 | 75% | 78% / 0.046R (n=2489) | **79% / 0.049R (n=324)** |
| Grade A, model trained before the locked year | 1.5 / 3 | 67% | 69% / 0.067R (n=2489) | **72% / 0.089R (n=324)** |
| Grade A, model trained before the locked year | 2 / 3 | 60% | 63% / 0.080R (n=2489) | **66% / 0.109R (n=324)** |
| Grade A, model trained before the locked year | 1 / 2 | 67% | 71% / 0.046R (n=2489) | **67% / -0.019R (n=324)** |
| Grade A, model trained before the locked year | 1.5 / 2 | 57% | 62% / 0.076R (n=2489) | **61% / 0.049R (n=324)** |
| Grade A, model trained before the locked year | 0.75 / 1.5 | 67% | 69% / 0.018R (n=2489) | **65% / -0.069R (n=324)** |
| Grade A, model trained before the locked year | 1 / 1.5 | 60% | 64% / 0.040R (n=2489) | **60% / -0.029R (n=324)** |
| With BTC + higher TF | 1 / 3 | 75% | 73% / 0.001R (n=13353) | **74% / 0.008R (n=2253)** |
| With BTC + higher TF | 1.5 / 3 | 67% | 65% / 0.010R (n=13353) | **66% / 0.021R (n=2253)** |
| With BTC + higher TF | 2 / 3 | 60% | 58% / 0.010R (n=13353) | **60% / 0.031R (n=2253)** |
| With BTC + higher TF | 1 / 2 | 67% | 67% / -0.000R (n=13353) | **69% / 0.015R (n=2253)** |
| With BTC + higher TF | 1.5 / 2 | 57% | 58% / 0.007R (n=13353) | **60% / 0.029R (n=2253)** |
| With BTC + higher TF | 0.75 / 1.5 | 67% | 67% / -0.017R (n=13353) | **68% / -0.014R (n=2253)** |
| With BTC + higher TF | 1 / 1.5 | 60% | 61% / -0.005R (n=13353) | **62% / 0.001R (n=2253)** |
| With BTC + 2+ agree | 1 / 3 | 75% | 76% / 0.034R (n=959) | **75% / 0.006R (n=150)** |
| With BTC + 2+ agree | 1.5 / 3 | 67% | 68% / 0.055R (n=959) | **65% / 0.013R (n=150)** |
| With BTC + 2+ agree | 2 / 3 | 60% | 61% / 0.051R (n=959) | **60% / 0.024R (n=150)** |
| With BTC + 2+ agree | 1 / 2 | 67% | 70% / 0.040R (n=959) | **69% / 0.014R (n=150)** |
| With BTC + 2+ agree | 1.5 / 2 | 57% | 61% / 0.059R (n=959) | **61% / 0.052R (n=150)** |
| With BTC + 2+ agree | 0.75 / 1.5 | 67% | 68% / -0.002R (n=959) | **67% / -0.022R (n=150)** |
| With BTC + 2+ agree | 1 / 1.5 | 60% | 63% / 0.036R (n=959) | **61% / -0.021R (n=150)** |
| Higher TF + 2+ agree | 1 / 3 | 75% | 76% / 0.038R (n=1179) | **73% / -0.011R (n=179)** |
| Higher TF + 2+ agree | 1.5 / 3 | 67% | 68% / 0.055R (n=1179) | **64% / -0.013R (n=179)** |
| Higher TF + 2+ agree | 2 / 3 | 60% | 61% / 0.055R (n=1179) | **58% / -0.015R (n=179)** |
| Higher TF + 2+ agree | 1 / 2 | 67% | 70% / 0.047R (n=1179) | **68% / -0.004R (n=179)** |
| Higher TF + 2+ agree | 1.5 / 2 | 57% | 61% / 0.062R (n=1179) | **60% / 0.023R (n=179)** |
| Higher TF + 2+ agree | 0.75 / 1.5 | 67% | 68% / 0.003R (n=1179) | **66% / -0.043R (n=179)** |
| Higher TF + 2+ agree | 1 / 1.5 | 60% | 64% / 0.044R (n=1179) | **60% / -0.027R (n=179)** |
| With BTC + higher TF + 2+ agree | 1 / 3 | 75% | 76% / 0.042R (n=910) | **74% / 0.005R (n=145)** |
| With BTC + higher TF + 2+ agree | 1.5 / 3 | 67% | 68% / 0.065R (n=910) | **65% / 0.007R (n=145)** |
| With BTC + higher TF + 2+ agree | 2 / 3 | 60% | 61% / 0.064R (n=910) | **60% / 0.026R (n=145)** |
| With BTC + higher TF + 2+ agree | 1 / 2 | 67% | 71% / 0.051R (n=910) | **69% / 0.008R (n=145)** |
| With BTC + higher TF + 2+ agree | 1.5 / 2 | 57% | 62% / 0.073R (n=910) | **61% / 0.041R (n=145)** |
| With BTC + higher TF + 2+ agree | 0.75 / 1.5 | 67% | 68% / 0.002R (n=910) | **68% / -0.018R (n=145)** |
| With BTC + higher TF + 2+ agree | 1 / 1.5 | 60% | 64% / 0.045R (n=910) | **61% / -0.020R (n=145)** |
| With BTC + higher TF + coin trend | 1 / 3 | 75% | 74% / 0.007R (n=8345) | **73% / -0.008R (n=1438)** |
| With BTC + higher TF + coin trend | 1.5 / 3 | 67% | 65% / 0.019R (n=8345) | **64% / -0.003R (n=1438)** |
| With BTC + higher TF + coin trend | 2 / 3 | 60% | 58% / 0.017R (n=8345) | **59% / 0.010R (n=1438)** |
| With BTC + higher TF + coin trend | 1 / 2 | 67% | 67% / -0.001R (n=8345) | **67% / -0.011R (n=1438)** |
| With BTC + higher TF + coin trend | 1.5 / 2 | 57% | 58% / 0.011R (n=8345) | **57% / -0.010R (n=1438)** |
| With BTC + higher TF + coin trend | 0.75 / 1.5 | 67% | 67% / -0.019R (n=8345) | **66% / -0.045R (n=1438)** |
| With BTC + higher TF + coin trend | 1 / 1.5 | 60% | 61% / -0.010R (n=8345) | **60% / -0.032R (n=1438)** |
| Grade A + with BTC | 1 / 3 | 75% | 77% / 0.042R (n=1641) | **75% / 0.005R (n=143)** |
| Grade A + with BTC | 1.5 / 3 | 67% | 69% / 0.071R (n=1641) | **71% / 0.065R (n=143)** |
| Grade A + with BTC | 2 / 3 | 60% | 63% / 0.087R (n=1641) | **64% / 0.071R (n=143)** |
| Grade A + with BTC | 1 / 2 | 67% | 69% / 0.030R (n=1641) | **65% / -0.044R (n=143)** |
| Grade A + with BTC | 1.5 / 2 | 57% | 61% / 0.063R (n=1641) | **62% / 0.048R (n=143)** |
| Grade A + with BTC | 0.75 / 1.5 | 67% | 69% / 0.016R (n=1641) | **62% / -0.115R (n=143)** |
| Grade A + with BTC | 1 / 1.5 | 60% | 63% / 0.028R (n=1641) | **59% / -0.059R (n=143)** |
| Grade A + higher TF | 1 / 3 | 75% | 78% / 0.046R (n=1589) | **74% / 0.008R (n=141)** |
| Grade A + higher TF | 1.5 / 3 | 67% | 69% / 0.060R (n=1589) | **68% / 0.047R (n=141)** |
| Grade A + higher TF | 2 / 3 | 60% | 62% / 0.065R (n=1589) | **65% / 0.100R (n=141)** |
| Grade A + higher TF | 1 / 2 | 67% | 70% / 0.037R (n=1589) | **64% / -0.062R (n=141)** |
| Grade A + higher TF | 1.5 / 2 | 57% | 61% / 0.055R (n=1589) | **58% / -0.004R (n=141)** |
| Grade A + higher TF | 0.75 / 1.5 | 67% | 69% / 0.019R (n=1589) | **62% / -0.112R (n=141)** |
| Grade A + higher TF | 1 / 1.5 | 60% | 63% / 0.030R (n=1589) | **57% / -0.091R (n=141)** |

## Candidate: 1h Grade A longs, 3-ATR stop — by year and by fee

Fees per side: 0.02% (limit orders) and 0.05% (market orders).

| Year | n | T1.5: win / avg R @0.02% / @0.05% | T1: win / avg R @0.02% / @0.05% | T2: win / avg R @0.02% / @0.05% |
|---|---|---|---|---|
| 2017 | 14 | 64% / 0.049 / 0.039 | 71% / 0.037 / 0.027 | 57% / -0.011 / -0.021 |
| 2018 | 92 | 68% / 0.074 / 0.058 | 75% / 0.039 / 0.024 | 64% / 0.109 / 0.094 |
| 2019 | 163 | 63% / -0.003 / -0.021 | 70% / -0.035 / -0.053 | 58% / 0.011 / -0.007 |
| 2020 | 340 | 69% / 0.083 / 0.066 | 79% / 0.076 / 0.059 | 62% / 0.082 / 0.065 |
| 2021 | 437 | 72% / 0.115 / 0.103 | 81% / 0.088 / 0.076 | 65% / 0.133 / 0.121 |
| 2022 | 248 | 69% / 0.033 / 0.015 | 76% / 0.004 / -0.014 | 59% / 0.021 / 0.003 |
| 2023 | 430 | 70% / 0.071 / 0.049 | 79% / 0.063 / 0.040 | 64% / 0.097 / 0.075 |
| 2024 | 403 | 69% / 0.069 / 0.049 | 79% / 0.055 / 0.035 | 64% / 0.094 / 0.074 |
| 2025 | 343 | 68% / 0.023 / -0.002 | 75% / -0.004 / -0.028 | 62% / 0.040 / 0.016 |
| 2026 | 230 | 70% / 0.068 / 0.040 | 77% / 0.033 / 0.005 | 65% / 0.095 / 0.067 |
| locked year | 296 | 71% / 0.064 / 0.035 | 77% / 0.028 / -0.000 | 65% / 0.082 / 0.054 |
