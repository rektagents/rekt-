'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTrending } from '@/hooks/useTrending';
import { Skeleton } from '@/components/ui/Skeleton';
import type { ChainId } from '@/types/chain';

interface TrendingCoinsProps {
  selectedChain?: ChainId | null;
}

export function TrendingCoins({ selectedChain }: TrendingCoinsProps) {
  const { data, isLoading } = useTrending();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px border border-white/10 bg-white/10">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-black p-4">
            <Skeleton className="h-6 w-6 mb-2" />
            <Skeleton className="h-4 w-24 mb-1" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    );
  }

  const items = data || [];
  const filtered = selectedChain
    ? items.filter((t) => t.item.chainId === selectedChain)
    : items;

  if (filtered.length === 0) {
    return (
      <div className="text-center py-8 text-white/30 font-mono text-sm border border-white/10">
        No trending tokens found {selectedChain ? 'for this chain' : ''}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px border border-white/10 bg-white/10">
      {filtered.slice(0, 8).map((item) => {
        const href = item.item.chainId && item.item.tokenAddress
          ? `/coins/${item.item.chainId}/${item.item.tokenAddress}`
          : '#';
        return (
          <Link
            key={item.item.id}
            href={href}
            className="bg-black p-5 hover:bg-white/[0.03] transition-colors"
          >
            <div className="flex items-center gap-3">
              {item.item.thumb ? (
                <Image
                  src={item.item.thumb}
                  alt={item.item.name}
                  width={28}
                  height={28}
                  className="rounded-full"
                />
              ) : (
                <span className="w-7 h-7 rounded-full bg-white/10 shrink-0" />
              )}
              <div>
                <div className="text-sm font-medium text-white truncate max-w-[140px]">{item.item.name}</div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-white/30 uppercase font-mono">{item.item.symbol}</span>
                  {item.item.chainId && (
                    <span className="text-[9px] text-white/15 uppercase font-mono border border-white/5 px-1">{item.item.chainId}</span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
