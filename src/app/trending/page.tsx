'use client';

import { useState } from 'react';
import { TrendingCoins } from '@/components/trending/TrendingCoins';
import { TopMovers } from '@/components/trending/TopMovers';
import { ChainSelector } from '@/components/ui/ChainSelector';
import type { ChainId } from '@/types/chain';

export default function TrendingPage() {
  const [selectedChain, setSelectedChain] = useState<ChainId | null>(null);

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="mb-12">
        <p className="text-white/30 text-xs font-mono uppercase tracking-widest mb-4">
          market signals
        </p>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <h1 className="text-4xl font-black tracking-tight">Trending</h1>
          <ChainSelector selected={selectedChain} onSelect={setSelectedChain} />
        </div>
      </div>

      <section className="mb-16">
        <div className="mb-6 flex items-center gap-3">
          <h2 className="text-lg font-bold tracking-tight">Trending Coins</h2>
          <span className="text-white/20 text-[10px] border border-white/10 px-2 py-0.5 font-mono uppercase tracking-widest">
            24h
          </span>
        </div>
        <TrendingCoins selectedChain={selectedChain} />
      </section>

      <section className="border-t border-white/10 pt-16">
        <div className="mb-6 flex items-center gap-3">
          <h2 className="text-lg font-bold tracking-tight">Top Movers</h2>
          <span className="text-white/20 text-[10px] border border-white/10 px-2 py-0.5 font-mono uppercase tracking-widest">
            gainers & losers
          </span>
        </div>
        <TopMovers selectedChain={selectedChain} />
      </section>
    </div>
  );
}
