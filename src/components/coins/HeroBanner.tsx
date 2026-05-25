'use client';

import { useQuery } from '@tanstack/react-query';
import { getMarketCoins, getGlobalData } from '@/lib/coingecko';
import { useCurrency } from '@/context/CurrencyContext';
import { formatCurrency, formatLargeNumber, formatPercentage } from '@/lib/formatters';
import { Badge } from '@/components/ui/Badge';
import { SparklineChart } from '@/components/ui/SparklineChart';
import { Skeleton } from '@/components/ui/Skeleton';
import Image from 'next/image';
import Link from 'next/link';

export function HeroBanner() {
  const { currency } = useCurrency();
  const { data: coins, isLoading: coinsLoading } = useQuery({
    queryKey: ['heroCoins', currency],
    queryFn: () => getMarketCoins(currency, 1, 5),
    staleTime: 30_000,
  });
  const { data: global, isLoading: globalLoading } = useQuery({
    queryKey: ['heroGlobal'],
    queryFn: getGlobalData,
    staleTime: 30_000,
  });

  const btc = coins?.find((c) => c.id === 'bitcoin');
  const isLoading = coinsLoading || globalLoading;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 border border-gray-700/50 p-6 md:p-8 mb-8">
      {/* Glow effect */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-12 w-64" />
            <Skeleton className="h-6 w-32" />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm text-gray-400">Bitcoin</span>
              {btc && (
                <Badge
                  value={btc.price_change_percentage_24h}
                  variant={btc.price_change_percentage_24h >= 0 ? 'gain' : 'loss'}
                />
              )}
            </div>

            {btc && (
              <div className="flex flex-col md:flex-row md:items-end gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Image
                      src={btc.image}
                      alt="Bitcoin"
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                    <h1 className="text-4xl md:text-5xl font-bold text-white">
                      {formatCurrency(btc.current_price, currency)}
                    </h1>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>MCap: {formatLargeNumber(btc.market_cap)}</span>
                    <span>Vol: {formatLargeNumber(btc.total_volume)}</span>
                  </div>
                </div>

                {/* Mini sparkline */}
                {btc.sparkline_in_7d?.price && (
                  <div className="flex-1 max-w-xs">
                    <SparklineChart
                      data={btc.sparkline_in_7d.price}
                      width={200}
                      height={60}
                    />
                  </div>
                )}

                <Link
                  href="/coins/bitcoin"
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors backdrop-blur-sm"
                >
                  View Details
                </Link>
              </div>
            )}

            {/* Global stats */}
            {global && (
              <div className="flex flex-wrap gap-6 mt-6 pt-6 border-t border-gray-700/50">
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Market Cap</div>
                  <div className="text-white font-semibold">
                    {formatLargeNumber(global.data.total_market_cap[currency] || 0)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">24h Volume</div>
                  <div className="text-white font-semibold">
                    {formatLargeNumber(global.data.total_volume[currency] || 0)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">BTC Dominance</div>
                  <div className="text-white font-semibold">
                    {(global.data.market_cap_percentage?.btc || 0).toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Active Coins</div>
                  <div className="text-white font-semibold">
                    {global.data.active_cryptocurrencies.toLocaleString()}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
