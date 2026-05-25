'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useAgentTokens } from '@/hooks/useAgents';
import { useCurrency } from '@/context/CurrencyContext';
import { formatCurrency, formatPercentage, formatLargeNumber } from '@/lib/formatters';
import { Badge } from '@/components/ui/Badge';
import { SparklineChart } from '@/components/ui/SparklineChart';
import { Skeleton } from '@/components/ui/Skeleton';

export function AgentTokens() {
  const { currency } = useCurrency();
  const { data: tokens, isLoading } = useAgentTokens(currency);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="glass rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div>
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (!tokens || tokens.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No agent tokens found
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tokens.map((token) => (
        <Link
          key={token.id}
          href={`/coins/${token.id}`}
          className="glass rounded-xl p-4 hover:border-gray-600 transition-all group"
        >
          <div className="flex items-center gap-3 mb-3">
            <Image
              src={token.image}
              alt={token.name}
              width={40}
              height={40}
              className="rounded-full"
            />
            <div>
              <div className="font-medium text-white group-hover:text-blue-400 transition-colors">
                {token.name}
              </div>
              <div className="text-sm text-gray-400 uppercase">{token.symbol}</div>
            </div>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <div className="text-xl font-bold text-white">
                {formatCurrency(token.current_price, currency)}
              </div>
              <Badge
                value={token.price_change_percentage_24h}
                variant={token.price_change_percentage_24h >= 0 ? 'gain' : 'loss'}
              />
            </div>

            {token.sparkline_in_7d?.price && (
              <div className="opacity-60 group-hover:opacity-100 transition-opacity">
                <SparklineChart
                  data={token.sparkline_in_7d.price}
                  width={80}
                  height={32}
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-800 text-xs text-gray-500">
            <span>MCap: {formatLargeNumber(token.market_cap)}</span>
            <span>Vol: {formatLargeNumber(token.total_volume)}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
