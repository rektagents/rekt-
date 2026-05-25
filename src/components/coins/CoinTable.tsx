'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { clsx } from 'clsx';
import { useQuery } from '@tanstack/react-query';
import { getMarketCoins, getCoinsByCategory, CHAIN_CATEGORIES } from '@/lib/coingecko';
import { useCurrency } from '@/context/CurrencyContext';
import { REFRESH_INTERVALS, PAGE_SIZE } from '@/lib/constants';
import { formatCurrency, formatPercentage, formatLargeNumber } from '@/lib/formatters';
import { Badge } from '@/components/ui/Badge';
import { SparklineChart } from '@/components/ui/SparklineChart';
import { TableSkeleton } from '@/components/ui/Skeleton';
import type { CoinMarket } from '@/types/coin';
import type { ChainId } from '@/types/chain';

type SortKey = 'market_cap_rank' | 'current_price' | 'price_change_percentage_24h' | 'market_cap' | 'total_volume';

interface CoinTableProps {
  selectedChain?: ChainId | null;
}

export function CoinTable({ selectedChain }: CoinTableProps) {
  const { currency } = useCurrency();
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>('market_cap_rank');
  const [sortAsc, setSortAsc] = useState(true);

  // Use chain-specific endpoint if chain selected
  const category = selectedChain ? CHAIN_CATEGORIES[selectedChain] : undefined;

  const { data: coins, isLoading, error } = useQuery({
    queryKey: ['coins', currency, page, category],
    queryFn: () => {
      if (category) {
        return getCoinsByCategory(category, currency, page, PAGE_SIZE);
      }
      return getMarketCoins(currency, page, PAGE_SIZE);
    },
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

  const sortedCoins = coins
    ? [...coins].sort((a, b) => {
        const aVal = a[sortKey] ?? 0;
        const bVal = b[sortKey] ?? 0;
        return sortAsc ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
      })
    : [];

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-4">Failed to load market data</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-gray-800 rounded-lg text-white hover:bg-gray-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th
                onClick={() => handleSort('market_cap_rank')}
                className="text-left py-3 px-4 text-sm font-medium text-gray-400 cursor-pointer hover:text-white"
              >
                # {sortKey === 'market_cap_rank' && (sortAsc ? '↑' : '↓')}
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">
                Coin
              </th>
              <th
                onClick={() => handleSort('current_price')}
                className="text-right py-3 px-4 text-sm font-medium text-gray-400 cursor-pointer hover:text-white"
              >
                Price {sortKey === 'current_price' && (sortAsc ? '↑' : '↓')}
              </th>
              <th
                onClick={() => handleSort('price_change_percentage_24h')}
                className="text-right py-3 px-4 text-sm font-medium text-gray-400 cursor-pointer hover:text-white"
              >
                24h % {sortKey === 'price_change_percentage_24h' && (sortAsc ? '↑' : '↓')}
              </th>
              <th
                onClick={() => handleSort('market_cap')}
                className="text-right py-3 px-4 text-sm font-medium text-gray-400 cursor-pointer hover:text-white hidden md:table-cell"
              >
                Market Cap {sortKey === 'market_cap' && (sortAsc ? '↑' : '↓')}
              </th>
              <th
                onClick={() => handleSort('total_volume')}
                className="text-right py-3 px-4 text-sm font-medium text-gray-400 cursor-pointer hover:text-white hidden lg:table-cell"
              >
                Volume {sortKey === 'total_volume' && (sortAsc ? '↑' : '↓')}
              </th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-400 hidden xl:table-cell">
                Last 7 Days
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-4">
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
      <div className="flex items-center justify-center gap-4 mt-6 py-4">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-4 py-2 rounded-lg bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
        >
          Previous
        </button>
        <span className="text-gray-400">Page {page}</span>
        <button
          onClick={() => setPage((p) => p + 1)}
          className="px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function CoinRow({ coin, currency }: { coin: CoinMarket; currency: string }) {
  const change24h = coin.price_change_percentage_24h;

  return (
    <tr className="border-b border-gray-800/50 hover:bg-white/5 transition-colors group">
      <td className="py-4 px-4 text-sm text-gray-400">
        {coin.market_cap_rank}
      </td>
      <td className="py-4 px-4">
        <Link href={`/coins/${coin.id}`} className="flex items-center gap-3">
          <Image
            src={coin.image}
            alt={coin.name}
            width={32}
            height={32}
            className="rounded-full"
          />
          <div>
            <div className="font-medium text-white">{coin.name}</div>
            <div className="text-sm text-gray-400 uppercase">{coin.symbol}</div>
          </div>
        </Link>
      </td>
      <td className="py-4 px-4 text-right font-medium text-white">
        {formatCurrency(coin.current_price, currency)}
      </td>
      <td className="py-4 px-4 text-right">
        <Badge
          value={change24h}
          variant={change24h >= 0 ? 'gain' : 'loss'}
        />
      </td>
      <td className="py-4 px-4 text-right text-gray-300 hidden md:table-cell">
        {formatLargeNumber(coin.market_cap)}
      </td>
      <td className="py-4 px-4 text-right text-gray-300 hidden lg:table-cell">
        {formatLargeNumber(coin.total_volume)}
      </td>
      <td className="py-4 px-4 text-right hidden xl:table-cell">
        {coin.sparkline_in_7d?.price && (
          <div className="flex justify-end">
            <SparklineChart data={coin.sparkline_in_7d.price} />
          </div>
        )}
      </td>
    </tr>
  );
}
