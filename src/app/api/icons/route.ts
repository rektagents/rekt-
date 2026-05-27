import { NextRequest, NextResponse } from 'next/server';

// CoinGecko platform mapping
const COINGECKO_PLATFORMS: Record<string, string> = {
  ethereum: 'ethereum',
  bsc: 'binance-smart-chain',
  base: 'base',
  arbitrum: 'arbitrum-one',
  polygon: 'polygon-pos',
  avalanche: 'avalanche',
  optimism: 'optimistic-ethereum',
  solana: 'solana',
  linea: 'linea',
  scroll: 'scroll',
  zksync: 'zksync',
  mantle: 'mantle',
  blast: 'blast',
  sonic: 'sonic',
  bnb: 'binance-smart-chain',
  cronos: 'cronos',
  fantom: 'fantom',
  pulsechain: 'pulsechain',
};

// Server-side icon cache (persists across requests)
const iconCache = new Map<string, string>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const cacheTimestamps = new Map<string, number>();

// Rate limiting
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second between CoinGecko calls

async function fetchCoinGeckoIcon(chainId: string, address: string): Promise<string> {
  const key = `${chainId}:${address.toLowerCase()}`;
  const cached = iconCache.get(key);
  const ts = cacheTimestamps.get(key);
  if (cached && ts && Date.now() - ts < CACHE_DURATION) return cached;

  const platform = COINGECKO_PLATFORMS[chainId];
  if (!platform) return '';

  // Rate limit: wait between requests
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise((r) => setTimeout(r, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
  }
  lastRequestTime = Date.now();

  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/${platform}/contract/${address}`,
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) return '';
    const data = await res.json();
    const img = data.image?.small || data.image?.thumb || '';
    if (img) {
      iconCache.set(key, img);
      cacheTimestamps.set(key, Date.now());
    }
    return img;
  } catch {
    return '';
  }
}

// GET /api/icons?chain=ethereum&address=0x...
export async function GET(request: NextRequest) {
  const chain = request.nextUrl.searchParams.get('chain');
  const address = request.nextUrl.searchParams.get('address');

  if (!chain || !address) {
    return NextResponse.json({ error: 'Missing chain or address' }, { status: 400 });
  }

  const icon = await fetchCoinGeckoIcon(chain, address);
  return NextResponse.json({ icon });
}

// POST /api/icons  { tokens: [{ chainId, address }] }
export async function POST(request: NextRequest) {
  const body = await request.json();
  const tokens = body.tokens;

  if (!Array.isArray(tokens)) {
    return NextResponse.json({ error: 'tokens must be an array' }, { status: 400 });
  }

  const icons: Record<string, string> = {};

  // Process sequentially to respect rate limits
  for (const token of tokens) {
    const key = `${token.chainId}:${token.address.toLowerCase()}`;
    const icon = await fetchCoinGeckoIcon(token.chainId, token.address);
    if (icon) icons[key] = icon;
  }

  return NextResponse.json({ icons });
}
