import type {
  DexPair,
  DexTokenProfile,
  DexSearchResult,
  CoinMarket,
  CoinDetail,
  TrendingCoin,
  Currency,
} from '@/types/coin';

const BASE_URL = 'https://api.dexscreener.com';

// Simple in-memory cache
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_DURATION = 15_000; // 15 seconds

function getFromCache<T>(key: string): T | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data as T;
  }
  cache.delete(key);
  return null;
}

function setCache(key: string, data: unknown): void {
  cache.set(key, { data, timestamp: Date.now() });
}

async function fetchDex<T>(endpoint: string, retries = 2): Promise<T> {
  const cached = getFromCache<T>(endpoint);
  if (cached) return cached;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        headers: { Accept: 'application/json' },
        next: { revalidate: 30 },
      });

      if (res.status === 429) {
        const wait = Math.pow(2, attempt) * 1000;
        if (attempt < retries) {
          await new Promise((r) => setTimeout(r, wait));
          continue;
        }
        throw new Error('Rate limit exceeded');
      }

      if (!res.ok) {
        if (attempt < retries) {
          await new Promise((r) => setTimeout(r, 1000));
          continue;
        }
        throw new Error(`DexScreener API error: ${res.status}`);
      }

      const data = await res.json();
      setCache(endpoint, data);
      return data as T;
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
    }
  }
  throw new Error('Max retries exceeded');
}

// Deduplicate pairs: keep highest liquidity pair per token (chainId:baseToken.address)
function deduplicatePairs(pairs: DexPair[]): DexPair[] {
  const best = new Map<string, DexPair>();
  for (const pair of pairs) {
    const key = `${pair.chainId}:${pair.baseToken.address}`;
    const existing = best.get(key);
    if (!existing || (pair.liquidity?.usd || 0) > (existing.liquidity?.usd || 0)) {
      best.set(key, pair);
    }
  }
  return Array.from(best.values());
}

// Convert DexScreener pair to our CoinMarket format
function pairToCoinMarket(pair: DexPair): CoinMarket {
  return {
    id: `${pair.chainId}:${pair.baseToken.address}`,
    symbol: pair.baseToken.symbol,
    name: pair.baseToken.name,
    image: pair.info?.imageUrl || '',
    current_price: parseFloat(pair.priceUsd) || 0,
    market_cap: pair.marketCap || 0,
    market_cap_rank: 0,
    fully_diluted_valuation: pair.fdv || null,
    total_volume: pair.volume?.h24 || 0,
    high_24h: 0,
    low_24h: 0,
    price_change_percentage_24h: pair.priceChange?.h24 || 0,
    price_change_percentage_7d_in_currency: undefined,
    price_change_percentage_1h_in_currency: pair.priceChange?.h1 || 0,
    circulating_supply: 0,
    total_supply: null,
    max_supply: null,
    sparkline_in_7d: undefined,
    ath: 0,
    ath_change_percentage: 0,
    ath_date: '',
    atl: 0,
    atl_change_percentage: 0,
    atl_date: '',
    last_updated: '',
    // Extra DexScreener fields
    chainId: pair.chainId,
    pairAddress: pair.pairAddress,
    dexId: pair.dexId,
    liquidity: pair.liquidity,
    txns: pair.txns,
    baseToken: pair.baseToken,
    quoteToken: pair.quoteToken,
  };
}

// Convert DexScreener pair to CoinDetail format
function pairToCoinDetail(pair: DexPair): CoinDetail {
  const price = parseFloat(pair.priceUsd) || 0;
  return {
    id: pair.pairAddress,
    symbol: pair.baseToken.symbol,
    name: pair.baseToken.name,
    description: { en: pair.info?.description || '' },
    image: { large: pair.info?.imageUrl || '' },
    market_cap_rank: 0,
    market_data: {
      current_price: { usd: price },
      market_cap: { usd: pair.marketCap || 0 },
      total_volume: { usd: pair.volume?.h24 || 0 },
      high_24h: { usd: price * (1 + (pair.priceChange?.h24 || 0) / 100) },
      low_24h: { usd: price * (1 - Math.abs(pair.priceChange?.h24 || 0) / 100) },
      price_change_percentage_24h: pair.priceChange?.h24 || 0,
      price_change_percentage_7d: pair.priceChange?.h6 || 0,
      price_change_percentage_30d: 0,
      price_change_percentage_1y: 0,
      ath: { usd: 0 },
      ath_date: { usd: '' },
      atl: { usd: 0 },
      atl_date: { usd: '' },
      circulating_supply: 0,
      total_supply: null,
      max_supply: null,
    },
    links: {
      homepage: pair.info?.websites?.map((w) => w.url) || [],
      blockchain_site: [],
    },
    // Extra DexScreener fields
    chainId: pair.chainId,
    pairAddress: pair.pairAddress,
    dexId: pair.dexId,
    liquidity: pair.liquidity,
    fdv: pair.fdv,
    txns: pair.txns,
    baseToken: pair.baseToken,
    quoteToken: pair.quoteToken,
    priceChange: pair.priceChange,
    volume: pair.volume,
    info: pair.info,
    pairCreatedAt: pair.pairCreatedAt,
  };
}

// Get top pairs for market table (use search for popular tokens)
export async function getMarketCoins(
  _currency: Currency = 'usd',
  page: number = 1,
  _perPage: number = 50
): Promise<CoinMarket[]> {
  // Fetch multiple search terms in parallel for a diverse market table
  const queries = [
    ['bitcoin', 'ethereum', 'solana', 'usdt', 'bnb'],
    ['pepe', 'doge', 'shib', 'bonk', 'wojak'],
    ['ai', 'agent', 'virtual', 'render', 'fet'],
    ['defi', 'aave', 'uni', 'link', 'mkr'],
    ['meme', 'floki', 'brett', 'mog', 'popcat'],
  ];
  const batch = queries[(page - 1) % queries.length];

  try {
    const results = await Promise.allSettled(
      batch.map((q) => fetchDex<DexSearchResult>(`/latest/dex/search?q=${q}`))
    );

    const allPairs: DexPair[] = [];
    for (const r of results) {
      if (r.status === 'fulfilled' && r.value.pairs) {
        allPairs.push(...r.value.pairs.filter((p) => p.priceUsd && parseFloat(p.priceUsd) > 0));
      }
    }

    return deduplicatePairs(allPairs)
      .sort((a, b) => (b.volume?.h24 || 0) - (a.volume?.h24 || 0))
      .slice(0, 50)
      .map(pairToCoinMarket);
  } catch {
    return [];
  }
}

// Get top tokens by volume across popular chains
export async function getTopTokens(): Promise<CoinMarket[]> {
  const chains = ['ethereum', 'solana', 'base', 'arbitrum'];
  const results = await Promise.allSettled(
    chains.map((chain) =>
      fetchDex<DexPair[]>(`/token-profiles/latest/v1`).then((profiles) => {
        const chainProfiles = (profiles || [])
          .filter((p) => p.chainId === chain)
          .slice(0, 10);
        return chainProfiles;
      })
    )
  );

  // Fallback: just get a search-based list
  try {
    const result = await fetchDex<DexSearchResult>('/latest/dex/search?q=usdt');
    return deduplicatePairs(
      (result.pairs || []).filter((p) => p.priceUsd && parseFloat(p.priceUsd) > 0)
    )
      .sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0))
      .slice(0, 50)
      .map(pairToCoinMarket);
  } catch {
    return [];
  }
}

// Get coin detail by chain and address
export async function getCoinDetail(chainId: string, address: string): Promise<CoinDetail | null> {
  try {
    const pairs = await fetchDex<DexPair[]>(`/tokens/v1/${chainId}/${address}`);
    if (!pairs || pairs.length === 0) return null;

    // Use the pair with highest liquidity
    const bestPair = pairs.sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0];
    return pairToCoinDetail(bestPair);
  } catch {
    return null;
  }
}

// Get pairs for chart data
export async function getTokenPairs(chainId: string, address: string): Promise<DexPair[]> {
  try {
    const pairs = await fetchDex<DexPair[]>(`/tokens/v1/${chainId}/${address}`);
    return pairs || [];
  } catch {
    return [];
  }
}

// Get trending / latest token profiles
export async function getTrending(): Promise<TrendingCoin[]> {
  try {
    const profiles = await fetchDex<DexTokenProfile[]>('/token-profiles/latest/v1');
    return (profiles || []).slice(0, 30).map((p) => ({
      item: {
        id: `${p.chainId}:${p.tokenAddress}`,
        name: p.description || p.tokenAddress,
        symbol: p.tokenAddress.slice(0, 6),
        thumb: p.icon || '',
        market_cap_rank: 0,
        score: 0,
        price_btc: 0,
        chainId: p.chainId,
        tokenAddress: p.tokenAddress,
      },
    }));
  } catch {
    return [];
  }
}

// Search for tokens
export async function searchCoins(query: string): Promise<{ coins: { id: string; name: string; symbol: string; thumb: string; market_cap_rank: number; chainId?: string; tokenAddress?: string }[] }> {
  try {
    const result = await fetchDex<DexSearchResult>(`/latest/dex/search?q=${encodeURIComponent(query)}`);
    const seen = new Set<string>();
    const coins = (result.pairs || [])
      .filter((p) => {
        const key = `${p.chainId}:${p.baseToken.address}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 20)
      .map((p) => ({
        id: `${p.chainId}:${p.baseToken.address}`,
        name: p.baseToken.name,
        symbol: p.baseToken.symbol,
        thumb: p.info?.imageUrl || '',
        market_cap_rank: 0,
        chainId: p.chainId,
        tokenAddress: p.baseToken.address,
      }));
    return { coins };
  } catch {
    return { coins: [] };
  }
}

// Get price for a specific token (for portfolio/alerts)
export async function getSimplePrices(
  tokens: { chainId: string; address: string }[]
): Promise<Record<string, { usd: number; usd_24h_change: number }>> {
  const results: Record<string, { usd: number; usd_24h_change: number }> = {};

  await Promise.allSettled(
    tokens.map(async (t) => {
      try {
        const pairs = await fetchDex<DexPair[]>(`/tokens/v1/${t.chainId}/${t.address}`);
        if (pairs && pairs.length > 0) {
          const best = pairs.sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0];
          results[`${t.chainId}:${t.address}`] = {
            usd: parseFloat(best.priceUsd) || 0,
            usd_24h_change: best.priceChange?.h24 || 0,
          };
        }
      } catch {
        // Skip failed tokens
      }
    })
  );

  return results;
}

// Get global market stats (derived from top tokens)
export async function getGlobalData(): Promise<{
  data: {
    active_cryptocurrencies: number;
    markets: number;
    total_market_cap: { usd: number };
    total_volume: { usd: number };
    market_cap_percentage: { btc: number; eth: number };
    market_cap_change_percentage_24h_usd: number;
  };
}> {
  try {
    // Fetch a few searches to get a broad picture
    const result = await fetchDex<DexSearchResult>('/latest/dex/search?q=usdt');
    const pairs = (result.pairs || []).filter((p) => p.marketCap && p.marketCap > 0);

    const totalMcap = pairs.reduce((sum, p) => sum + (p.marketCap || 0), 0);
    const totalVol = pairs.reduce((sum, p) => sum + (p.volume?.h24 || 0), 0);

    return {
      data: {
        active_cryptocurrencies: pairs.length,
        markets: pairs.length,
        total_market_cap: { usd: totalMcap },
        total_volume: { usd: totalVol },
        market_cap_percentage: { btc: 0, eth: 0 },
        market_cap_change_percentage_24h_usd: 0,
      },
    };
  } catch {
    return {
      data: {
        active_cryptocurrencies: 0,
        markets: 0,
        total_market_cap: { usd: 0 },
        total_volume: { usd: 0 },
        market_cap_percentage: { btc: 0, eth: 0 },
        market_cap_change_percentage_24h_usd: 0,
      },
    };
  }
}

// Helper: get top movers (biggest gainers/losers)
export async function getTopMovers(): Promise<{ gainers: CoinMarket[]; losers: CoinMarket[] }> {
  const queries = ['sol', 'eth', 'meme', 'ai', 'defi'];
  const rawPairs: DexPair[] = [];

  await Promise.allSettled(
    queries.map(async (q) => {
      try {
        const result = await fetchDex<DexSearchResult>(`/latest/dex/search?q=${q}`);
        const pairs = (result.pairs || [])
          .filter((p) => p.priceUsd && parseFloat(p.priceUsd) > 0 && p.volume?.h24 && p.volume.h24 > 1000);
        rawPairs.push(...pairs);
      } catch {
        // Skip
      }
    })
  );

  const unique = deduplicatePairs(rawPairs).map(pairToCoinMarket);

  const sorted = [...unique].sort(
    (a, b) => (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0)
  );

  return {
    gainers: sorted.slice(0, 10),
    losers: sorted.slice(-10).reverse(),
  };
}

// Re-export helpers
export function isContractAddress(input: string): boolean {
  if (/^0x[a-fA-F0-9]{40}$/.test(input)) return true;
  if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(input) && !input.includes(' ')) return true;
  return false;
}

export function getPlatformFromAddress(address: string): string {
  if (address.startsWith('0x')) return 'ethereum';
  return 'solana';
}
