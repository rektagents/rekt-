'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTopMovers } from '@/hooks/useTrending';
import { formatCurrency, formatPercentage } from '@/lib/formatters';
import { Skeleton } from '@/components/ui/Skeleton';
import type { CoinMarket } from '@/types/coin';
import { clsx } from 'clsx';

export function TopMovers() {
  const { data, isLoading } = useTopMovers();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-px border border-white/10 bg-white/10">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-black p-6">
            <Skeleton className="h-5 w-32 mb-4" />
            {[...Array(5)].map((_, j) => (
              <div key={j} className="flex items-center gap-3 py-3">
                <Skeleton className="h-7 w-7" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16 ml-auto" />
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-px border border-white/10 bg-white/10">
      <MoverList title="Top Gainers" coins={data.gainers} />
      <MoverList title="Top Losers" coins={data.losers} />
    </div>
  );
}

function MoverList({
  title,
  coins,
}: {
  title: string;
  coins: CoinMarket[];
}) {
  return (
    <div className="bg-black p-6">
      <h3 className="text-sm font-bold text-white/60 uppercase font-mono tracking-widest mb-4">{title}</h3>
      <div className="space-y-1">
        {coins.slice(0, 10).map((coin) => {
          const href = coin.chainId && coin.baseToken
            ? `/coins/${coin.chainId}/${coin.baseToken.address}`
            : '#';
          return (
            <Link
              key={coin.id}
              href={href}
              className="flex items-center gap-3 py-2 px-2 hover:bg-white/[0.03] transition-colors"
            >
              {coin.image ? (
                <Image
                  src={coin.image}
                  alt={coin.name}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              ) : (
                <span className="w-6 h-6 rounded-full bg-white/10 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white truncate">{coin.name}</div>
                <div className="text-[10px] text-white/30 uppercase font-mono">{coin.symbol}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-white font-mono tabular-nums">
                  {formatCurrency(coin.current_price, 'usd')}
                </div>
                <span
                  className={clsx(
                    'text-[11px] font-mono tabular-nums',
                    coin.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'
                  )}
                >
                  {coin.price_change_percentage_24h >= 0 ? '+' : ''}
                  {formatPercentage(coin.price_change_percentage_24h)}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
