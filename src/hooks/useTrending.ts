'use client';

import { useQuery } from '@tanstack/react-query';
import { getTrending, getTopMovers } from '@/lib/dexscreener';
import { REFRESH_INTERVALS } from '@/lib/constants';

export function useTrending() {
  return useQuery({
    queryKey: ['trending'],
    queryFn: getTrending,
    staleTime: REFRESH_INTERVALS.trending,
    refetchInterval: REFRESH_INTERVALS.trending,
  });
}

export function useTopMovers() {
  return useQuery({
    queryKey: ['topMovers'],
    queryFn: getTopMovers,
    staleTime: REFRESH_INTERVALS.market,
    refetchInterval: REFRESH_INTERVALS.market,
  });
}
