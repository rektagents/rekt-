export const API_BASE_URL = 'https://api.coingecko.com/api/v3';

export const COIN_IMAGE_BASE = 'https://assets.coingecko.com/coins/images';

export const REFRESH_INTERVALS = {
  market: 30_000,
  detail: 15_000,
  portfolio: 30_000,
  alerts: 30_000,
  trending: 120_000,
} as const;

export const PAGE_SIZE = 50;

export const CURRENCY_SYMBOLS: Record<string, string> = {
  usd: '$',
  eur: '€',
  gbp: '£',
  btc: '₿',
  eth: 'Ξ',
};

export const TIMEFRAMES = [
  { label: '1H', value: '1' },
  { label: '24H', value: '7' },
  { label: '7D', value: '7' },
  { label: '1M', value: '30' },
  { label: '3M', value: '90' },
  { label: '1Y', value: '365' },
  { label: 'ALL', value: 'max' },
] as const;

export const AGENT_TOKEN_IDS = [
  'ai16z',
  'virtuals-protocol',
  'goatseus-maximus',
  'zerebro',
  'act-i-the-ai-prophecy',
  'bittensor',
  'render-token',
  'fetch-ai',
  'singularitynet',
  'ocean-protocol',
];
