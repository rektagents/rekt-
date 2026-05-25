'use client';

import { use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCoinDetail } from '@/hooks/useCoinDetail';
import { useCurrency } from '@/context/CurrencyContext';
import { formatCurrency, formatPercentage } from '@/lib/formatters';
import { PriceChart } from '@/components/coins/PriceChart';
import { CoinDetailStats } from '@/components/coins/CoinDetailStats';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';

export default function CoinDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { currency } = useCurrency();
  const { data: coin, isLoading, error } = useCoinDetail(id);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !coin) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 text-center">
        <p className="text-red-400 mb-4">Failed to load coin data</p>
        <Link href="/" className="text-blue-400 hover:underline">
          Back to Market
        </Link>
      </div>
    );
  }

  const currentPrice = coin.market_data.current_price[currency] || 0;
  const priceChange24h = coin.market_data.price_change_percentage_24h || 0;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/" className="text-gray-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <Image
          src={coin.image.large}
          alt={coin.name}
          width={40}
          height={40}
          className="rounded-full"
        />
        <div>
          <h1 className="text-2xl font-bold text-white">
            {coin.name}
            <span className="ml-2 text-lg text-gray-400 uppercase">
              {coin.symbol}
            </span>
          </h1>
          <div className="text-sm text-gray-400">
            Rank #{coin.market_cap_rank}
          </div>
        </div>
      </div>

      {/* Price */}
      <div className="mb-8">
        <div className="text-4xl font-bold text-white mb-2">
          {formatCurrency(currentPrice, currency)}
        </div>
        <Badge
          value={priceChange24h}
          variant={priceChange24h >= 0 ? 'gain' : 'loss'}
          className="text-lg"
        />
      </div>

      {/* Chart */}
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 mb-8">
        <PriceChart coinId={id} />
      </div>

      {/* Stats */}
      <h2 className="text-xl font-semibold text-white mb-4">Market Stats</h2>
      <CoinDetailStats coin={coin} />

      {/* Description */}
      {coin.description?.en && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-white mb-4">About {coin.name}</h2>
          <div
            className="text-gray-300 leading-relaxed prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: coin.description.en }}
          />
        </div>
      )}
    </div>
  );
}
