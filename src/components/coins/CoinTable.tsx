'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { clsx } from 'clsx';
import { useQuery } from '@tanstack/react-query';
import { getMarketCoins } from '@/lib/dexscreener';
import { TokenIcon } from '@/components/ui/TokenIcon';
import { useCurrency } from '@/context/CurrencyContext';
import { REFRESH_INTERVALS } from '@/lib/constants';
import { formatCurrency, formatPercentage, formatLargeNumber } from '@/lib/formatters';
import { TableSkeleton } from '@/components/ui/Skeleton';
import type { CoinMarket } from '@/types/coin';

type SortKey = 'market_cap_rank' | 'current_price' | 'price_change_percentage_24h' | 'market_cap' | 'total_volume';

interface CoinTableProps {
  selectedChain?: string | null;
}

export function CoinTable({ selectedChain }: CoinTableProps) {
  const { currency } = useCurrency();
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>('market_cap_rank');
  const [sortAsc, setSortAsc] = useState(true);

  const { data: coins, isLoading, error } = useQuery({
    queryKey: ['coins', currency, page, selectedChain],
    queryFn: () => getMarketCoins(currency, page),
    staleTime: REFRESH_INTERVALS.market,
    refetchInterval: REFRESH_INTERVALS.market,
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  // Dedup by chainId:symbol before sorting
  const uniqueCoins = coins
    ? coins.filter((coin, i, arr) => {
        const key = `${coin.chainId}:${coin.symbol}`.toLowerCase();
        return i === arr.findIndex((c) => `${c.chainId}:${c.symbol}`.toLowerCase() === key);
      })
    : [];

  const sortedCoins = uniqueCoins
    ? [...uniqueCoins].sort((a, b) => {
        const aVal = a[sortKey] ?? 0;
        const bVal = b[sortKey] ?? 0;
        return sortAsc ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
      })
    : [];

  if (error) {
    return (
      <div className="text-center py-12 border border-white/10">
        <p className="text-red-400 mb-4 font-mono text-sm">Failed to load market data</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 border border-white/20 text-white text-xs font-mono hover:bg-white/5 transition-colors"
        >
          retry →
        </button>
      </div>
    );
  }

  return (
    <div id="market-table" className="border border-white/10 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              {[
                { key: 'market_cap_rank' as SortKey, label: '#', align: 'left' },
                { key: null, label: 'Token', align: 'left' },
                { key: 'current_price' as SortKey, label: 'Price', align: 'right' },
                { key: 'price_change_percentage_24h' as SortKey, label: '24h %', align: 'right' },
                { key: 'market_cap' as SortKey, label: 'Market Cap', align: 'right', hide: 'md' },
                { key: 'total_volume' as SortKey, label: 'Volume', align: 'right', hide: 'lg' },
              ].map((col) => (
                <th
                  key={col.label}
                  onClick={() => col.key && handleSort(col.key)}
                  className={clsx(
                    'py-3 px-4 text-[11px] font-mono uppercase tracking-[0.16em] text-white/30',
                    col.align === 'right' ? 'text-right' : 'text-left',
                    col.key && 'cursor-pointer hover:text-white/60',
                    col.hide === 'md' && 'hidden md:table-cell',
                    col.hide === 'lg' && 'hidden lg:table-cell'
                  )}
                >
                  {col.label}
                  {col.key && sortKey === col.key && (
                    <span className="ml-1">{sortAsc ? '↑' : '↓'}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-4 px-4">
                  <TableSkeleton />
                </td>
              </tr>
            ) : (
              sortedCoins.map((coin) => (
                <CoinRow key={coin.id} coin={coin} currency={currency} />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-4 py-4 border-t border-white/10">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-4 py-2 border border-white/10 text-white/50 text-xs font-mono disabled:opacity-30 disabled:cursor-not-allowed hover:text-white hover:border-white/30 transition-colors"
        >
          ← prev
        </button>
        <span className="text-white/30 text-xs font-mono">page {page}</span>
        <button
          onClick={() => setPage((p) => p + 1)}
          className="px-4 py-2 border border-white/10 text-white/50 text-xs font-mono hover:text-white hover:border-white/30 transition-colors"
        >
          next →
        </button>
      </div>
    </div>
  );
}

function CoinRow({ coin, currency }: { coin: CoinMarket; currency: string }) {
  const change24h = coin.price_change_percentage_24h;
  const href = coin.chainId && coin.baseToken
    ? `/coins/${coin.chainId}/${coin.baseToken.address}`
    : `/coins/${coin.pairAddress || coin.id}`;

  return (
    <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
      <td className="py-4 px-4 text-xs text-white/30 font-mono">
        {coin.market_cap_rank || '—'}
      </td>
      <td className="py-4 px-4">
        <Link href={href} className="flex items-center gap-3">
          <TokenIcon src={coin.image} alt={coin.name} symbol={coin.symbol} size={28} chainId={coin.chainId} address={coin.baseToken?.address} />
          <div>
            <div className="text-sm font-medium text-white">{coin.name}</div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-white/30 uppercase font-mono">{coin.symbol}</span>
              {coin.chainId && (
                <span className="text-[9px] text-white/15 uppercase font-mono border border-white/5 px-1">{coin.chainId}</span>
              )}
            </div>
          </div>
        </Link>
      </td>
      <td className="py-4 px-4 text-right text-sm font-medium text-white font-mono tabular-nums">
        {formatCurrency(coin.current_price, currency)}
      </td>
      <td className="py-4 px-4 text-right">
        <span
          className={clsx(
            'text-xs font-mono tabular-nums',
            change24h >= 0 ? 'text-green-400' : 'text-red-400'
          )}
        >
          {change24h >= 0 ? '+' : ''}
          {change24h?.toFixed(2)}%
        </span>
      </td>
      <td className="py-4 px-4 text-right text-xs text-white/40 font-mono tabular-nums hidden md:table-cell">
        {coin.market_cap > 0 ? formatLargeNumber(coin.market_cap) : '—'}
      </td>
      <td className="py-4 px-4 text-right text-xs text-white/40 font-mono tabular-nums hidden lg:table-cell">
        {coin.total_volume > 0 ? formatLargeNumber(coin.total_volume) : '—'}
      </td>
    </tr>
  );
}
