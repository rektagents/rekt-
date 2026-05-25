import { API_BASE_URL } from './constants';
import type {
  CoinMarket,
  CoinDetail,
  MarketChart,
  GlobalData,
  TrendingCoin,
  SearchResult,
  Currency,
  TimeFrame,
} from '@/types/coin';

// Simple in-memory cache to reduce API calls
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 10_000; // 10 seconds

function getCacheKey(endpoint: string, params?: Record<string, string>): string {
  const sortedParams = params
    ? Object.entries(params)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}=${v}`)
        .join('&')
    : '';
  return `${endpoint}?${sortedParams}`;
}

function getFromCache<T>(key: string): T | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data as T;
  }
  cache.delete(key);
  return null;
}

function setCache(key: string, data: any): void {
  cache.set(key, { data, timestamp: Date.now() });
}

async function fetchAPI<T>(
  endpoint: string,
  params?: Record<string, string>,
  retries: number = 2
): Promise<T> {
  const cacheKey = getCacheKey(endpoint, params);

  // Check cache first
  const cachedData = getFromCache<T>(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  const url = new URL(`${API_BASE_URL}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url.toString(), {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 30 },
      });

      if (res.status === 429) {
        // Rate limited - wait and retry
        const waitTime = Math.pow(2, attempt) * 1000;
        if (attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, waitTime));
          continue;
        }
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      if (!res.ok) {
        if (attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue;
        }
        throw new Error(`API error: ${res.status}`);
      }

      const data = await res.json();

      // Cache the response
      setCache(cacheKey, data);

      return data as T;
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }
      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }

  throw new Error('Max retries exceeded');
}

export async function getMarketCoins(
  currency: Currency = 'usd',
  page: number = 1,
  perPage: number = 50,
  order: string = 'market_cap_desc'
): Promise<CoinMarket[]> {
  return fetchAPI<CoinMarket[]>('/coins/markets', {
    vs_currency: currency,
    order,
    per_page: perPage.toString(),
    page: page.toString(),
    sparkline: 'true',
    price_change_percentage: '1h,24h,7d',
  });
}

export async function getCoinDetail(id: string): Promise<CoinDetail> {
  return fetchAPI<CoinDetail>(`/coins/${id}`, {
    localization: 'false',
    tickers: 'false',
    market_data: 'true',
    community_data: 'false',
    developer_data: 'false',
  });
}

export async function getCoinMarketChart(
  id: string,
  currency: Currency = 'usd',
  days: TimeFrame = '7'
): Promise<MarketChart> {
  return fetchAPI<MarketChart>(`/coins/${id}/market_chart`, {
    vs_currency: currency,
    days,
  });
}

export async function getGlobalData(): Promise<GlobalData> {
  return fetchAPI<GlobalData>('/global');
}

export async function getTrending(): Promise<{ coins: TrendingCoin[] }> {
  return fetchAPI<{ coins: TrendingCoin[] }>('/search/trending');
}

export async function searchCoins(query: string): Promise<SearchResult> {
  return fetchAPI<SearchResult>('/search', {
    query,
  });
}

export async function getSimplePrices(
  ids: string[],
  currency: Currency = 'usd'
): Promise<Record<string, Record<string, number>>> {
  if (ids.length === 0) return {};
  return fetchAPI<Record<string, Record<string, number>>>('/simple/price', {
    ids: ids.join(','),
    vs_currency: currency,
    include_24hr_change: 'true',
  });
}

export async function getCoinByContract(
  platform: string,
  contractAddress: string
): Promise<CoinDetail> {
  return fetchAPI<CoinDetail>(`/coins/${platform}/contract/${contractAddress}`);
}

// Detect if input looks like a contract address
export function isContractAddress(input: string): boolean {
  // Ethereum/EVM: starts with 0x, 42 chars
  if (/^0x[a-fA-F0-9]{40}$/.test(input)) return true;
  // Solana: base58, 32-44 chars
  if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(input) && !input.includes(' ')) return true;
  return false;
}

// Get platform from contract address format
export function getPlatformFromAddress(address: string): string {
  if (address.startsWith('0x')) return 'ethereum';
  return 'solana';
}

// Get coins list by category (for chain filtering)
export async function getCoinsByCategory(
  category: string,
  currency: string = 'usd',
  page: number = 1,
  perPage: number = 50
): Promise<CoinMarket[]> {
  return fetchAPI<CoinMarket[]>('/coins/markets', {
    vs_currency: currency,
    category,
    order: 'market_cap_desc',
    per_page: perPage.toString(),
    page: page.toString(),
    sparkline: 'true',
    price_change_percentage: '1h,24h,7d',
  });
}

// CoinGecko chain platform IDs
export const CHAIN_CATEGORIES: Record<string, string> = {
  ethereum: 'ethereum-ecosystem',
  solana: 'solana-ecosystem',
  'binance-smart-chain': 'binance-smart-chain',
  'polygon-pos': 'polygon-ecosystem',
  avalanche: 'avalanche-ecosystem',
  'arbitrum-one': 'arbitrum-ecosystem',
  'optimistic-ethereum': 'optimism-ecosystem',
  base: 'base-ecosystem',
};
