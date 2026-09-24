// Top coins by market cap (CoinGecko, Sep 2026) that trade on Binance spot and
// USDT perpetuals with enough history for a 2-year train + test. Note: picking
// today's winners adds survivorship bias; coins that died are not in the list.
export const UNIVERSE = [
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'XRPUSDT', 'SOLUSDT', 'TRXUSDT', 'ZECUSDT', 'DOGEUSDT', 'LINKUSDT',
  'ADAUSDT', 'XLMUSDT', 'BCHUSDT', 'NEARUSDT', 'UNIUSDT', 'LTCUSDT', 'AVAXUSDT', 'SUIUSDT', 'HBARUSDT', 'DOTUSDT', 'ETCUSDT',
];

/** 13 more liquid coins (Binance spot + USDT perps) for the extended-universe test. */
export const EXTRA = ['AAVEUSDT', 'ICPUSDT', 'FILUSDT', 'ATOMUSDT', 'APTUSDT', 'ARBUSDT', 'OPUSDT', 'INJUSDT', 'WLDUSDT', 'TIAUSDT', 'SEIUSDT', 'ALGOUSDT', 'VETUSDT'];
