'use client';

import { use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCoinDetail } from '@/hooks/useCoinDetail';
import { useCurrency } from '@/context/CurrencyContext';
import { formatCurrency } from '@/lib/formatters';
import { PriceChart } from '@/components/coins/PriceChart';
import { CoinDetailStats } from '@/components/coins/CoinDetailStats';
import { Skeleton } from '@/components/ui/Skeleton';
import { clsx } from 'clsx';

export default function CoinDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { currency } = useCurrency();
  const { data: coin, isLoading, error } = useCoinDetail(id);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-16">
        <Skeleton className="h-6 w-48 mb-6" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !coin) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-16 text-center">
        <p className="text-red-400 font-mono text-sm mb-4">Failed to load coin data</p>
        <Link href="/" className="text-white/40 hover:text-white text-xs font-mono transition-colors">
          ← back to market
        </Link>
      </div>
    );
  }

  const currentPrice = coin.market_data.current_price[currency] || 0;
  const priceChange24h = coin.market_data.price_change_percentage_24h || 0;

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="text-white/30 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <Image
          src={coin.image.large}
          alt={coin.name}
          width={36}
          height={36}
          className="rounded-full"
        />
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            {coin.name}
            <span className="ml-2 text-sm text-white/30 uppercase font-mono">
              {coin.symbol}
            </span>
          </h1>
          <div className="text-xs text-white/30 font-mono">
            Rank #{coin.market_cap_rank}
          </div>
        </div>
      </div>

      {/* Price */}
      <div className="mb-8">
        <div className="text-4xl font-black text-white font-mono tabular-nums tracking-tight mb-2">
          {formatCurrency(currentPrice, currency)}
        </div>
        <span
          className={clsx(
            'text-sm font-mono tabular-nums',
            priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'
          )}
        >
          {priceChange24h >= 0 ? '+' : ''}
          {priceChange24h?.toFixed(2)}%
        </span>
      </div>

      {/* Chart */}
      <div className="border border-white/10 p-6 mb-8">
        <PriceChart coinId={id} />
      </div>

      {/* Stats */}
      <h2 className="text-xs font-bold text-white/60 uppercase font-mono tracking-widest mb-4">
        Market Stats
      </h2>
      <CoinDetailStats coin={coin} />

      {/* Description */}
      {coin.description?.en && (
        <div className="mt-12 border-t border-white/10 pt-12">
          <h2 className="text-xs font-bold text-white/60 uppercase font-mono tracking-widest mb-4">
            About {coin.name}
          </h2>
          <div
            className="text-white/50 text-sm leading-relaxed prose prose-invert max-w-none font-mono"
            dangerouslySetInnerHTML={{ __html: coin.description.en }}
          />
        </div>
      )}
    </div>
  );
}
