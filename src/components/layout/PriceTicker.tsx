'use client';

import { useQuery } from '@tanstack/react-query';
import { getMarketCoins } from '@/lib/coingecko';
import { useCurrency } from '@/context/CurrencyContext';
import { formatCurrency, formatPercentage } from '@/lib/formatters';
import Image from 'next/image';

export function PriceTicker() {
  const { currency } = useCurrency();
  const { data: coins } = useQuery({
    queryKey: ['ticker', currency],
    queryFn: () => getMarketCoins(currency, 1, 20),
    staleTime: 30_000,
    refetchInterval: 30_000,
  });

  if (!coins) return null;

  const tickerItems = [...coins, ...coins]; // Duplicate for seamless loop

  return (
    <div className="relative overflow-hidden bg-gray-900/50 border-b border-gray-800/50 py-2">
      <div className="flex animate-scroll">
        {tickerItems.map((coin, i) => (
          <div
            key={`${coin.id}-${i}`}
            className="flex items-center gap-2 px-4 whitespace-nowrap"
          >
            <Image
              src={coin.image}
              alt={coin.name}
              width={16}
              height={16}
              className="rounded-full"
            />
            <span className="text-sm font-medium text-white uppercase">
              {coin.symbol}
            </span>
            <span className="text-sm text-gray-300">
              {formatCurrency(coin.current_price, currency)}
            </span>
            <span
              className={`text-xs ${
                coin.price_change_percentage_24h >= 0
                  ? 'text-green-400'
                  : 'text-red-400'
              }`}
            >
              {formatPercentage(coin.price_change_percentage_24h)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
