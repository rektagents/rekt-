'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { getTrending, getCoinsByCategory, CHAIN_CATEGORIES } from '@/lib/coingecko';
import { REFRESH_INTERVALS } from '@/lib/constants';
import { Skeleton } from '@/components/ui/Skeleton';
import type { ChainId } from '@/types/chain';

interface TrendingCoinsProps {
  selectedChain?: ChainId | null;
}

export function TrendingCoins({ selectedChain }: TrendingCoinsProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['trending', selectedChain],
    queryFn: async () => {
      if (selectedChain) {
        const category = CHAIN_CATEGORIES[selectedChain];
        if (category) {
          const coins = await getCoinsByCategory(category, 'usd', 1, 10);
          return {
            coins: coins.map((coin) => ({
              item: {
                id: coin.id,
                name: coin.name,
                symbol: coin.symbol,
                thumb: coin.image,
                market_cap_rank: coin.market_cap_rank,
                score: 0,
              },
            })),
          };
        }
      }
      return getTrending();
    },
    staleTime: REFRESH_INTERVALS.trending,
    refetchInterval: REFRESH_INTERVALS.trending,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass rounded-xl p-4">
            <Skeleton className="h-6 w-6 rounded-full mb-2" />
            <Skeleton className="h-4 w-24 mb-1" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (!data?.coins || data.coins.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No trending coins found {selectedChain ? 'for this chain' : ''}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {data.coins.slice(0, 8).map((item) => (
        <Link
          key={item.item.id}
          href={`/coins/${item.item.id}`}
          className="glass rounded-xl p-4 hover:border-gray-600 transition-all"
        >
          <div className="flex items-center gap-3">
            <Image
              src={item.item.thumb}
              alt={item.item.name}
              width={32}
              height={32}
              className="rounded-full"
            />
            <div>
              <div className="font-medium text-white">{item.item.name}</div>
              <div className="text-sm text-gray-400 uppercase">
                {item.item.symbol}
              </div>
            </div>
          </div>
          {item.item.market_cap_rank && (
            <div className="mt-2 text-sm text-gray-500">
              Rank #{item.item.market_cap_rank}
            </div>
          )}
        </Link>
      ))}
    </div>
  );
}
