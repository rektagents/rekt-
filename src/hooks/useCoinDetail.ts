'use client';

import { useQuery } from '@tanstack/react-query';
import { getCoinDetail, getCoinMarketChart } from '@/lib/coingecko';
import { REFRESH_INTERVALS } from '@/lib/constants';
import type { Currency, TimeFrame } from '@/types/coin';

export function useCoinDetail(id: string) {
  return useQuery({
    queryKey: ['coin', id],
    queryFn: () => getCoinDetail(id),
    staleTime: REFRESH_INTERVALS.detail,
    refetchInterval: REFRESH_INTERVALS.detail,
    enabled: !!id,
  });
}

export function useCoinChart(id: string, currency: Currency = 'usd', days: TimeFrame = '7') {
  return useQuery({
    queryKey: ['coinChart', id, currency, days],
    queryFn: () => getCoinMarketChart(id, currency, days),
    staleTime: REFRESH_INTERVALS.detail,
    enabled: !!id,
  });
}
