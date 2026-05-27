'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useAgentTokens } from '@/hooks/useAgents';
import { useCurrency } from '@/context/CurrencyContext';
import { formatCurrency, formatLargeNumber } from '@/lib/formatters';
import { SparklineChart } from '@/components/ui/SparklineChart';
import { Skeleton } from '@/components/ui/Skeleton';
import { clsx } from 'clsx';

export function AgentTokens() {
  const { currency } = useCurrency();
  const { data: tokens, isLoading } = useAgentTokens(currency);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px border border-white/10 bg-white/10">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-black p-5">
            <div className="flex items-center gap-3 mb-3">
              <Skeleton className="h-8 w-8" />
              <div>
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-5 w-28 mb-2" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (!tokens || tokens.length === 0) {
    return (
      <div className="text-center py-8 text-white/30 font-mono text-sm border border-white/10">
        No agent tokens found
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px border border-white/10 bg-white/10">
      {tokens.map((token) => (
        <Link
          key={token.id}
          href={token.chainId ? `/coins/${token.chainId}/${token.id}` : `/coins/${token.id}`}
          className="bg-black p-5 hover:bg-white/[0.03] transition-colors group"
        >
          <div className="flex items-center gap-3 mb-3">
            <Image
              src={token.image}
              alt={token.name}
              width={32}
              height={32}
              className="rounded-full"
            />
            <div>
              <div className="text-sm font-medium text-white group-hover:text-white transition-colors">
                {token.name}
              </div>
              <div className="text-[10px] text-white/30 uppercase font-mono">{token.symbol}</div>
            </div>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <div className="text-lg font-bold text-white font-mono tabular-nums">
                {formatCurrency(token.current_price, currency)}
              </div>
              <span
                className={clsx(
                  'text-xs font-mono tabular-nums',
                  token.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'
                )}
              >
                {token.price_change_percentage_24h >= 0 ? '+' : ''}
                {token.price_change_percentage_24h?.toFixed(2)}%
              </span>
            </div>

            {token.sparkline_in_7d?.price && (
              <div className="opacity-40 group-hover:opacity-80 transition-opacity">
                <SparklineChart
                  data={token.sparkline_in_7d.price}
                  width={80}
                  height={28}
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5 text-[10px] text-white/20 font-mono">
            <span>MCap: {formatLargeNumber(token.market_cap)}</span>
            <span>Vol: {formatLargeNumber(token.total_volume)}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
