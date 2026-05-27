// DexScreener API types
export interface DexToken {
  address: string;
  name: string;
  symbol: string;
}

export interface DexTxns {
  m5?: { buys: number; sells: number };
  h1?: { buys: number; sells: number };
  h6?: { buys: number; sells: number };
  h24?: { buys: number; sells: number };
}

export interface DexVolume {
  m5?: number;
  h1?: number;
  h6?: number;
  h24?: number;
}

export interface DexPriceChange {
  m5?: number;
  h1?: number;
  h6?: number;
  h24?: number;
}

export interface DexLiquidity {
  usd: number;
  base: number;
  quote: number;
}

export interface DexPairInfo {
  imageUrl?: string;
  header?: string;
  websites?: { url: string; label: string }[];
  socials?: { url: string; type: string }[];
  description?: string;
}

export interface DexPair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  labels?: string[];
  baseToken: DexToken;
  quoteToken: DexToken;
  priceNative: string;
  priceUsd: string;
  txns: DexTxns;
  volume: DexVolume;
  priceChange: DexPriceChange;
  liquidity: DexLiquidity;
  fdv: number;
  marketCap: number;
  pairCreatedAt: number;
  info?: DexPairInfo;
}

export interface DexSearchResult {
  schemaVersion?: string;
  pairs: DexPair[];
}

export interface DexTokenProfile {
  url: string;
  chainId: string;
  tokenAddress: string;
  icon?: string;
  header?: string;
  openGraph?: string;
  description?: string;
  links?: { label?: string; type?: string; url: string }[];
  cto?: boolean;
  updatedAt?: string;
}

// App types (backwards-compatible, extended with DexScreener fields)
export interface CoinMarket {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number | null;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency?: number;
  price_change_percentage_1h_in_currency?: number;
  circulating_supply: number;
  total_supply: number | null;
  max_supply: number | null;
  sparkline_in_7d?: { price: number[] };
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  last_updated: string;
  // DexScreener extras
  chainId?: string;
  pairAddress?: string;
  dexId?: string;
  liquidity?: DexLiquidity;
  txns?: DexTxns;
  baseToken?: DexToken;
  quoteToken?: DexToken;
}

export interface CoinDetail {
  id: string;
  symbol: string;
  name: string;
  description: { en: string };
  image: { large: string };
  market_cap_rank: number;
  market_data: {
    current_price: { [key: string]: number };
    market_cap: { [key: string]: number };
    total_volume: { [key: string]: number };
    high_24h: { [key: string]: number };
    low_24h: { [key: string]: number };
    price_change_percentage_24h: number;
    price_change_percentage_7d: number;
    price_change_percentage_30d: number;
    price_change_percentage_1y: number;
    ath: { [key: string]: number };
    ath_date: { [key: string]: string };
    atl: { [key: string]: number };
    atl_date: { [key: string]: string };
    circulating_supply: number;
    total_supply: number | null;
    max_supply: number | null;
  };
  links: {
    homepage: string[];
    blockchain_site: string[];
  };
  // DexScreener extras
  chainId?: string;
  pairAddress?: string;
  dexId?: string;
  liquidity?: DexLiquidity;
  fdv?: number;
  txns?: DexTxns;
  baseToken?: DexToken;
  quoteToken?: DexToken;
  priceChange?: DexPriceChange;
  volume?: DexVolume;
  info?: DexPairInfo;
  pairCreatedAt?: number;
}

export interface MarketChart {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

export interface GlobalData {
  data: {
    active_cryptocurrencies: number;
    markets: number;
    total_market_cap: { [key: string]: number };
    total_volume: { [key: string]: number };
    market_cap_percentage: { [key: string]: number };
    market_cap_change_percentage_24h_usd: number;
  };
}

export interface TrendingCoin {
  item: {
    id: string;
    name: string;
    symbol: string;
    thumb: string;
    price_btc: number;
    market_cap_rank: number;
    score: number;
    // DexScreener extras
    chainId?: string;
    tokenAddress?: string;
  };
}

export interface SearchResult {
  coins: {
    id: string;
    name: string;
    symbol: string;
    thumb: string;
    market_cap_rank: number;
    // DexScreener extras
    chainId?: string;
    tokenAddress?: string;
  }[];
}

export type Currency = 'usd' | 'eur' | 'gbp' | 'btc' | 'eth';

export type TimeFrame = '1' | '7' | '30' | '90' | '365' | 'max';
