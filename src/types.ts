export interface Candle {
  time: number; // unix seconds, bar open time
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type Side = 'long' | 'short';

export interface Signal {
  index: number; // bar on which the signal was confirmed (closed bar)
  time: number;
  side: Side;
  score: number; // number of confluence filters passed
  maxScore: number;
  reasons: string[];
}

export interface StrategyParams {
  jmaFastLen: number;
  jmaSlowLen: number;
  jmaPhase: number;
  jmaPower: number;
  trendEmaLen: number;
  rsiLen: number;
  adxLen: number;
  adxMin: number;
  atrLen: number;
  volLen: number;
  minScore: number; // required confluence filters (of maxScore)
}

export interface RiskParams {
  leverage: number;
  riskPct: number; // % of equity lost if stop is hit
  stopAtr: number; // initial stop distance in ATRs
  takeProfitR: number; // take profit at N x initial risk (0 = off)
  trailAtr: number; // chandelier trailing stop in ATRs (0 = off)
  feePct: number; // per side, % of notional
  slippagePct: number; // per side
  maintenanceMarginPct: number;
  fundingPct8h?: number; // perpetual funding paid per 8h, % of notional
  partialR?: number; // take partial profit at N x initial risk (0/undefined = off)
  partialFrac?: number; // fraction of the position closed at the partial target
  breakevenAfterPartial?: boolean; // move the stop to entry once the partial is taken
  /** Level-based position management (all sizes are fractions of the planned full position). */
  entryFrac?: number; // bought at the signal; the rest comes from scaleIn levels (default 1)
  scaleIn?: { atr: number; frac: number; bars: number }[]; // limit adds at first entry ∓ atr × ATR, valid for `bars`
  pyramid?: { r: number; frac: number }[]; // adds when price reaches first entry ± r × initial risk
  breakevenAfterAdd?: boolean; // after a pyramid add, raise the stop to the first entry
  scaleOut?: { r: number; frac: number }[]; // take profit on part of the position at first entry ± r × initial risk
  swingStop?: number; // stop beyond the extreme of the last N bars (min 1 ATR, max 5 ATR) instead of stopAtr
  startEquity: number;
}

export interface Trade {
  side: Side;
  entryIndex: number;
  entryTime: number;
  entryPrice: number;
  exitIndex: number;
  exitTime: number;
  exitPrice: number;
  exitReason: 'stop' | 'trail' | 'target' | 'reverse' | 'exit' | 'liquidation' | 'end';
  qty: number;
  pnl: number; // net of fees
  rMultiple: number;
  /** Every fill of the trade, for level-based position management. */
  fills?: { index: number; price: number; qty: number; kind: 'entry' | 'scale-in' | 'add' | 'scale-out' | 'exit' }[];
}
