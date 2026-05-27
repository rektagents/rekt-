'use client';

import { useQuery } from '@tanstack/react-query';
import { getMarketCoins, getTopTokens, getGlobalData } from '@/lib/dexscreener';
import { REFRESH_INTERVALS, PAGE_SIZE } from '@/lib/constants';
import type { Currency } from '@/types/coin';

export function useCoins(currency: Currency = 'usd', page: number = 1) {
  return useQuery({
    queryKey: ['coins', currency, page],
    queryFn: () => getMarketCoins(currency, page, PAGE_SIZE),
    staleTime: REFRESH_INTERVALS.market,
    refetchInterval: REFRESH_INTERVALS.market,
  });
}

export function useTopTokens() {
  return useQuery({
    queryKey: ['topTokens'],
    queryFn: getTopTokens,
    staleTime: REFRESH_INTERVALS.market,
    refetchInterval: REFRESH_INTERVALS.market,
  });
}

export function useGlobalData() {
  return useQuery({
    queryKey: ['global'],
    queryFn: getGlobalData,
    staleTime: REFRESH_INTERVALS.market,
    refetchInterval: REFRESH_INTERVALS.market,
  });
}
