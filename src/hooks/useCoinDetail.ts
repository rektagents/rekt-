'use client';

import { useQuery } from '@tanstack/react-query';
import { getCoinDetail, getTokenPairs } from '@/lib/dexscreener';
import { REFRESH_INTERVALS } from '@/lib/constants';

export function useCoinDetail(chainId: string, address: string) {
  return useQuery({
    queryKey: ['coin', chainId, address],
    queryFn: () => getCoinDetail(chainId, address),
    staleTime: REFRESH_INTERVALS.detail,
    refetchInterval: REFRESH_INTERVALS.detail,
    enabled: !!chainId && !!address,
  });
}

export function useCoinPairs(chainId: string, address: string) {
  return useQuery({
    queryKey: ['coinPairs', chainId, address],
    queryFn: () => getTokenPairs(chainId, address),
    staleTime: REFRESH_INTERVALS.detail,
    enabled: !!chainId && !!address,
  });
}
