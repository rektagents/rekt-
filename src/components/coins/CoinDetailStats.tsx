'use client';

import { useCurrency } from '@/context/CurrencyContext';
import { formatCurrency, formatLargeNumber, formatSupply } from '@/lib/formatters';
import type { CoinDetail } from '@/types/coin';

interface CoinDetailStatsProps {
  coin: CoinDetail;
}

export function CoinDetailStats({ coin }: CoinDetailStatsProps) {
  const { currency } = useCurrency();
  const md = coin.market_data;

  const stats = [
    {
      label: 'Market Cap',
      value: formatLargeNumber(md.market_cap[currency] || 0),
    },
    {
      label: '24h Volume',
      value: formatLargeNumber(md.total_volume[currency] || 0),
    },
    {
      label: '24h High',
      value: formatCurrency(md.high_24h[currency] || 0, currency),
    },
    {
      label: '24h Low',
      value: formatCurrency(md.low_24h[currency] || 0, currency),
    },
    {
      label: 'All-Time High',
      value: formatCurrency(md.ath[currency] || 0, currency),
    },
    {
      label: 'All-Time Low',
      value: formatCurrency(md.atl[currency] || 0, currency),
    },
    {
      label: 'Circulating Supply',
      value: formatSupply(md.circulating_supply),
    },
    {
      label: 'Max Supply',
      value: formatSupply(md.max_supply),
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-gray-900 rounded-xl p-4 border border-gray-800"
        >
          <div className="text-sm text-gray-400 mb-1">{stat.label}</div>
          <div className="text-base font-semibold text-white">{stat.value}</div>
        </div>
      ))}
    </div>
  );
}
