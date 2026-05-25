'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { getMarketCoins, getCoinsByCategory, CHAIN_CATEGORIES } from '@/lib/coingecko';
import { useCurrency } from '@/context/CurrencyContext';
import { REFRESH_INTERVALS } from '@/lib/constants';
import { formatCurrency, formatPercentage } from '@/lib/formatters';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import type { CoinMarket } from '@/types/coin';
import type { ChainId } from '@/types/chain';

interface TopMoversProps {
  selectedChain?: ChainId | null;
}

export function TopMovers({ selectedChain }: TopMoversProps) {
  const { currency } = useCurrency();
  const category = selectedChain ? CHAIN_CATEGORIES[selectedChain] : undefined;

  const { data, isLoading } = useQuery({
    queryKey: ['topMovers', currency, category],
    queryFn: () => {
      if (category) {
        return getCoinsByCategory(category, currency, 1, 100);
      }
      return getMarketCoins(currency, 1, 100);
    },
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

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16 ml-auto" />
            </div>
          ))}
        </div>
        <div className="glass rounded-xl p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16 ml-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <MoverList title="Top Gainers" coins={data.gainers} currency={currency} />
      <MoverList title="Top Losers" coins={data.losers} currency={currency} />
    </div>
  );
}

function MoverList({
  title,
  coins,
  currency,
}: {
  title: string;
  coins: CoinMarket[];
  currency: string;
}) {
  return (
    <div className="glass rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <div className="space-y-3">
        {coins.slice(0, 10).map((coin) => (
          <Link
            key={coin.id}
            href={`/coins/${coin.id}`}
            className="flex items-center gap-3 py-2 hover:bg-white/5 rounded-lg px-2 transition-colors"
          >
            <Image
              src={coin.image}
              alt={coin.name}
              width={32}
              height={32}
              className="rounded-full"
            />
            <div className="flex-1">
              <div className="font-medium text-white">{coin.name}</div>
              <div className="text-sm text-gray-400 uppercase">{coin.symbol}</div>
            </div>
            <div className="text-right">
              <div className="text-white">
                {formatCurrency(coin.current_price, currency)}
              </div>
              <Badge
                value={coin.price_change_percentage_24h}
                variant={coin.price_change_percentage_24h >= 0 ? 'gain' : 'loss'}
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
