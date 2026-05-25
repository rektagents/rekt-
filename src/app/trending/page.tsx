'use client';

import { useState } from 'react';
import { TrendingCoins } from '@/components/trending/TrendingCoins';
import { TopMovers } from '@/components/trending/TopMovers';
import { ChainSelector } from '@/components/ui/ChainSelector';
import type { ChainId } from '@/types/chain';

export default function TrendingPage() {
  const [selectedChain, setSelectedChain] = useState<ChainId | null>(null);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-white">Trending</h1>
        <ChainSelector selected={selectedChain} onSelect={setSelectedChain} />
      </div>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Trending Coins</h2>
        <TrendingCoins selectedChain={selectedChain} />
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mb-4">24h Movers</h2>
        <TopMovers selectedChain={selectedChain} />
      </section>
    </div>
  );
}
