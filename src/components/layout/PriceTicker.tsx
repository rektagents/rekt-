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
    <div className="border-y border-white/10 overflow-hidden py-3">
      <div className="marquee-inner flex whitespace-nowrap">
        {tickerItems.map((coin, i) => (
          <span
            key={`${coin.id}-${i}`}
            className="inline-flex items-center gap-4 px-8 text-xs text-white/30 font-mono uppercase tracking-wider"
          >
            <span className="text-white/10">◆</span>
            <span className="flex items-center gap-2">
              <Image
                src={coin.image}
                alt={coin.name}
                width={14}
                height={14}
                className="rounded-full opacity-60"
              />
              <span className="text-white/50">{coin.symbol}</span>
            </span>
            <span className="text-white/40">
              {formatCurrency(coin.current_price, currency)}
            </span>
            <span
              className={
                coin.price_change_percentage_24h >= 0
                  ? 'text-green-400/60'
                  : 'text-red-400/60'
              }
            >
              {formatPercentage(coin.price_change_percentage_24h)}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
