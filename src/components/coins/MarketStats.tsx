'use client';

import { useGlobalData } from '@/hooks/useCoins';
import { formatLargeNumber } from '@/lib/formatters';

export function MarketStats() {
  const { data } = useGlobalData();

  if (!data) return null;

  const d = data.data;

  return (
    <section className="border-b border-white/10 bg-white/[0.015]">
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex flex-wrap items-center gap-x-12 gap-y-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-green-400" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
            </span>
            <span className="text-white/30 text-xs font-mono">dex live</span>
          </div>

          <div className="flex flex-wrap gap-x-10 gap-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-white font-black text-2xl font-mono tabular-nums">
                {formatLargeNumber(d.total_market_cap?.usd || 0)}
              </span>
              <span className="text-white/30 text-xs font-mono">market cap</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-white font-black text-2xl font-mono tabular-nums">
                {formatLargeNumber(d.total_volume?.usd || 0)}
              </span>
              <span className="text-white/30 text-xs font-mono">24h volume</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-white font-black text-2xl font-mono tabular-nums">
                {d.active_cryptocurrencies?.toLocaleString() || '—'}
              </span>
              <span className="text-white/30 text-xs font-mono">pairs</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
