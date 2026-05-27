'use client';

import { useCurrency } from '@/context/CurrencyContext';
import { formatCurrency, formatLargeNumber } from '@/lib/formatters';
import type { CoinDetail } from '@/types/coin';

interface CoinDetailStatsProps {
  coin: CoinDetail;
}

export function CoinDetailStats({ coin }: CoinDetailStatsProps) {
  const md = coin.market_data;

  const stats = [
    {
      label: 'Market Cap',
      value: formatLargeNumber(md.market_cap?.usd || 0),
    },
    {
      label: '24h Volume',
      value: formatLargeNumber(md.total_volume?.usd || 0),
    },
    {
      label: 'FDV',
      value: coin.fdv ? formatLargeNumber(coin.fdv) : '—',
    },
    {
      label: 'Liquidity',
      value: coin.liquidity?.usd ? formatLargeNumber(coin.liquidity.usd) : '—',
    },
    {
      label: '24h Change',
      value: coin.priceChange?.h24 !== undefined ? `${coin.priceChange.h24 >= 0 ? '+' : ''}${coin.priceChange.h24.toFixed(2)}%` : '—',
    },
    {
      label: '1h Change',
      value: coin.priceChange?.h1 !== undefined ? `${coin.priceChange.h1 >= 0 ? '+' : ''}${coin.priceChange.h1.toFixed(2)}%` : '—',
    },
    {
      label: 'DEX',
      value: coin.dexId || '—',
    },
    {
      label: 'Chain',
      value: coin.chainId || '—',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-px border border-white/10 bg-white/10">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-black p-4"
        >
          <div className="text-[10px] text-white/30 font-mono uppercase tracking-widest mb-1">{stat.label}</div>
          <div className="text-sm font-bold text-white font-mono tabular-nums">{stat.value}</div>
        </div>
      ))}
    </div>
  );
}
