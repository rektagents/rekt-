'use client';

import { useGlobalData } from '@/hooks/useCoins';
import { useCurrency } from '@/context/CurrencyContext';
import { formatLargeNumber } from '@/lib/formatters';
import { Skeleton } from '@/components/ui/Skeleton';

export function MarketStats() {
  const { currency } = useCurrency();
  const { data, isLoading } = useGlobalData();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-6 w-32" />
          </div>
        ))}
      </div>
    );
  }

  if (!data) return null;

  const globalData = data.data;
  const totalMarketCap = globalData.total_market_cap[currency] || 0;
  const totalVolume = globalData.total_volume[currency] || 0;
  const btcDominance = globalData.market_cap_percentage?.btc || 0;
  const activeCryptos = globalData.active_cryptocurrencies;

  const stats = [
    {
      label: 'Total Market Cap',
      value: formatLargeNumber(totalMarketCap),
    },
    {
      label: '24h Volume',
      value: formatLargeNumber(totalVolume),
    },
    {
      label: 'BTC Dominance',
      value: `${btcDominance.toFixed(1)}%`,
    },
    {
      label: 'Active Coins',
      value: activeCryptos.toLocaleString(),
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-gray-900 rounded-xl p-4 border border-gray-800"
        >
          <div className="text-sm text-gray-400 mb-1">{stat.label}</div>
          <div className="text-lg font-semibold text-white">{stat.value}</div>
        </div>
      ))}
    </div>
  );
}
