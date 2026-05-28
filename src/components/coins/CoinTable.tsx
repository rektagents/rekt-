'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { clsx } from 'clsx';
import { useQuery } from '@tanstack/react-query';
import { getMarketCoins } from '@/lib/dexscreener';
import { TokenIcon } from '@/components/ui/TokenIcon';
import { useCurrency } from '@/context/CurrencyContext';
import { REFRESH_INTERVALS } from '@/lib/constants';
import { formatCurrency, formatLargeNumber } from '@/lib/formatters';
import { TableSkeleton } from '@/components/ui/Skeleton';
import type { CoinMarket } from '@/types/coin';

type SortKey = 'market_cap_rank' | 'current_price' | 'price_change_percentage_24h' | 'market_cap' | 'total_volume';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'market_cap_rank', label: 'Rank' },
  { value: 'current_price', label: 'Price' },
  { value: 'price_change_percentage_24h', label: '24h Change' },
  { value: 'market_cap', label: 'Market Cap' },
  { value: 'total_volume', label: 'Volume' },
];

interface CoinTableProps {
  selectedChain?: string | null;
}

export function CoinTable({ selectedChain }: CoinTableProps) {
  const { currency } = useCurrency();
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>('market_cap_rank');
  const [sortAsc, setSortAsc] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [chainFilter, setChainFilter] = useState<string>('all');

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

  // Dedup by chainId:symbol
  const uniqueCoins = useMemo(() => {
    if (!coins) return [];
    const seen = new Set<string>();
    return coins.filter((coin) => {
      const key = `${coin.chainId}:${coin.symbol}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [coins]);

  // Extract unique chains for filter pills
  const chains = useMemo(() => {
    const set = new Set<string>();
    for (const c of uniqueCoins) {
      if (c.chainId) set.add(c.chainId);
    }
    return Array.from(set).sort();
  }, [uniqueCoins]);

  // Filter by chain + search
  const filteredCoins = useMemo(() => {
    let result = uniqueCoins;
    if (chainFilter !== 'all') {
      result = result.filter((c) => c.chainId === chainFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((c) =>
        c.name?.toLowerCase().includes(q) || c.symbol?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [uniqueCoins, chainFilter, searchQuery]);

  // Sort
  const sortedCoins = useMemo(() => {
    return [...filteredCoins].sort((a, b) => {
      const aVal = a[sortKey] ?? 0;
      const bVal = b[sortKey] ?? 0;
      return sortAsc ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
  }, [filteredCoins, sortKey, sortAsc]);

  // Client-side pagination on sorted results
  const pageSize = 20;
  const totalPages = Math.max(1, Math.ceil(sortedCoins.length / pageSize));
  const paginatedCoins = sortedCoins.slice((page - 1) * pageSize, page * pageSize);

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
    <div id="market-table">
      {/* Search + Sort + Chain Pills */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="flex-1 relative min-w-0">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            placeholder="Search tokens..."
            className="w-full bg-white/5 border border-white/10 text-white pl-10 pr-4 py-2.5 font-mono text-sm focus:outline-none focus:border-white/30 placeholder-white/20"
          />
        </div>
        <select
          value={sortKey}
          onChange={(e) => { setSortKey(e.target.value as SortKey); setSortAsc(true); }}
          className="bg-white/5 border border-white/10 text-white/50 px-3 py-2.5 font-mono text-xs focus:outline-none focus:border-white/30 shrink-0"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <button
          onClick={() => setSortAsc(!sortAsc)}
          className="px-3 py-2.5 border border-white/10 text-white/40 text-xs font-mono hover:text-white transition-colors shrink-0"
        >
          {sortAsc ? '↑' : '↓'}
        </button>
      </div>

      {/* Chain filter pills */}
      {chains.length > 1 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          <button
            onClick={() => { setChainFilter('all'); setPage(1); }}
            className={clsx(
              'px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest transition-colors border',
              chainFilter === 'all'
                ? 'border-white/30 text-white bg-white/5'
                : 'border-white/10 text-white/30 hover:text-white hover:border-white/20'
            )}
          >
            All Chains
          </button>
          {chains.map((chain) => (
            <button
              key={chain}
              onClick={() => { setChainFilter(chain); setPage(1); }}
              className={clsx(
                'px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest transition-colors border',
                chainFilter === chain
                  ? 'border-white/30 text-white bg-white/5'
                  : 'border-white/10 text-white/30 hover:text-white hover:border-white/20'
              )}
            >
              {chain}
            </button>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="border border-white/10 overflow-hidden">
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
              ) : paginatedCoins.length > 0 ? (
                paginatedCoins.map((coin) => (
                  <CoinRow key={coin.id} coin={coin} currency={currency} />
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <p className="text-white/30 font-mono text-sm">No tokens found</p>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="text-white/40 text-xs font-mono hover:text-white transition-colors mt-2"
                      >
                        Clear search
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {sortedCoins.length > pageSize && (
          <div className="flex items-center justify-between py-4 px-4 border-t border-white/10">
            <p className="text-white/30 text-xs font-mono">
              Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, sortedCoins.length)} of {sortedCoins.length}
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 border border-white/10 text-white/40 text-xs font-mono hover:text-white disabled:opacity-30 transition-colors"
              >
                Prev
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                if (pageNum > totalPages) return null;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={clsx(
                      'px-3 py-1.5 border text-xs font-mono transition-colors',
                      page === pageNum
                        ? 'border-white/30 text-white bg-white/5'
                        : 'border-white/10 text-white/30 hover:text-white'
                    )}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 border border-white/10 text-white/40 text-xs font-mono hover:text-white disabled:opacity-30 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
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
