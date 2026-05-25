'use client';

import { useState } from 'react';
import { CoinTable } from '@/components/coins/CoinTable';
import { HeroBanner } from '@/components/coins/HeroBanner';
import { MarketStats } from '@/components/coins/MarketStats';
import { ChainSelector } from '@/components/ui/ChainSelector';
import type { ChainId } from '@/types/chain';

export default function Home() {
  const [selectedChain, setSelectedChain] = useState<ChainId | null>(null);

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[70vh] flex flex-col justify-center grid-bg overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-6 py-24">
          <HeroBanner />
        </div>
      </section>

      {/* Market Stats bar */}
      <MarketStats />

      {/* Coin Table */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-white/30 text-xs font-mono uppercase tracking-widest mb-2">
              live data
            </p>
            <h2 className="text-2xl font-black tracking-tight font-mono">
              Top Cryptocurrencies
            </h2>
          </div>
          <ChainSelector selected={selectedChain} onSelect={setSelectedChain} />
        </div>
        <CoinTable selectedChain={selectedChain} />
      </section>

      {/* Why section */}
      <section className="border-t border-white/10 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-14 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-white/30 text-xs font-mono uppercase tracking-widest mb-4">
                why rekt
              </p>
              <h2 className="text-4xl font-black tracking-tight">
                Data before hype.
              </h2>
            </div>
            <p className="text-white/45 text-sm font-mono max-w-xl">
              Real-time crypto intelligence for builders, traders, and autonomous agents. Track everything. React fast.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px border border-white/10 bg-white/10">
            {[
              {
                num: '01',
                title: 'Real-time market data',
                desc: 'Live prices, volume, and market cap across 10,000+ tokens. Refreshed every 15 seconds.',
              },
              {
                num: '02',
                title: 'Agent-native intelligence',
                desc: 'AI agent directory with on-chain performance tracking, trust scores, and builder tools.',
              },
              {
                num: '03',
                title: 'Portfolio tracking',
                desc: 'Track holdings across chains. Allocation charts, PnL, and real-time valuation in any currency.',
              },
              {
                num: '04',
                title: 'Price alerts',
                desc: 'Set custom price alerts. Get notified when targets hit. Never miss a move.',
              },
            ].map((item) => (
              <div
                key={item.num}
                className="bg-black p-8 hover:bg-white/5 transition-colors"
              >
                <p className="text-white/20 text-xs font-mono mb-4">{item.num}</p>
                <h3 className="text-white text-lg font-bold mb-3 tracking-tight">
                  {item.title}
                </h3>
                <p className="text-white/50 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
