export const API_BASE_URL = 'https://api.dexscreener.com';

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
  { label: '24H', value: '1' },
  { label: '7D', value: '7' },
  { label: '1M', value: '30' },
  { label: '3M', value: '90' },
  { label: '1Y', value: '365' },
  { label: 'ALL', value: 'max' },
] as const;

// Agent tokens (chain:address format for DexScreener)
export const AGENT_TOKENS = [
  { chainId: 'solana', address: 'HeLp6NuQkmYB1pYV2vfEqBKpHhZqEUYjEXkXpNjKLASw', symbol: 'AI16Z', name: 'ai16z' },
  { chainId: 'ethereum', address: '0x44ff8620b8cA30902395A7bD3F2407e1A091BF73', symbol: 'VIRTUAL', name: 'Virtuals Protocol' },
  { chainId: 'solana', address: 'z3dn17yLaGMKffVogeFHQ9zWVcXgqgfX7SBR9CyGRA', symbol: 'GOAT', name: 'Goatseus Maximus' },
  { chainId: 'solana', address: '8x5VqbHA8D7NkD52uNuS5nnt3PwApspXJHApYghjVi4', symbol: 'ZEREBRO', name: 'Zerebro' },
  { chainId: 'solana', address: 'GJAFwWjJ3vnTsrQVabjBVK2TYB1YtRCQXRDfDgUnpump', symbol: 'ACT', name: 'ACT I' },
];
