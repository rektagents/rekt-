'use client';

import { useQuery } from '@tanstack/react-query';
import { getTrending, getMarketCoins } from '@/lib/coingecko';
import { REFRESH_INTERVALS } from '@/lib/constants';
import type { Currency } from '@/types/coin';

export function useTrending() {
  return useQuery({
    queryKey: ['trending'],
    queryFn: getTrending,
    staleTime: REFRESH_INTERVALS.trending,
    refetchInterval: REFRESH_INTERVALS.trending,
  });
}

export function useTopMovers(currency: Currency = 'usd') {
  return useQuery({
    queryKey: ['topMovers', currency],
    queryFn: () => getMarketCoins(currency, 1, 100),
    staleTime: REFRESH_INTERVALS.market,
    select: (data) => {
      const sorted = [...data].sort(
        (a, b) => (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0)
      );
      return {
        gainers: sorted.slice(0, 10),
        losers: sorted.slice(-10).reverse(),
      };
    },
  });
}
