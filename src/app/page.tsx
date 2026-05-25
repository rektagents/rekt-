'use client';

import { useState } from 'react';
import { CoinTable } from '@/components/coins/CoinTable';
import { HeroBanner } from '@/components/coins/HeroBanner';
import { ChainSelector } from '@/components/ui/ChainSelector';
import type { ChainId } from '@/types/chain';

export default function Home() {
  const [selectedChain, setSelectedChain] = useState<ChainId | null>(null);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="animate-fade-in-up">
        <HeroBanner />
      </div>
      <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-white">
            Top Cryptocurrencies
          </h2>
          <ChainSelector selected={selectedChain} onSelect={setSelectedChain} />
        </div>
        <CoinTable selectedChain={selectedChain} />
      </div>
    </div>
  );
}
