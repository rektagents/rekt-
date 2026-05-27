'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { searchCoins, isContractAddress, getPlatformFromAddress } from '@/lib/dexscreener';
import { useDebounce } from '@/hooks/useDebounce';
import { useSearch } from '@/context/SearchContext';
import Image from 'next/image';

export function SearchOverlay() {
  const { isOpen, openSearch, closeSearch } = useSearch();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => searchCoins(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
    staleTime: 60_000,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openSearch();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [openSearch]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSelect = (chainId: string | undefined, tokenAddress: string | undefined) => {
    closeSearch();
    setQuery('');
    if (chainId && tokenAddress) {
      router.push(`/coins/${chainId}/${tokenAddress}`);
    }
  };

  const handleClose = () => {
    closeSearch();
    setQuery('');
  };

  if (!isOpen) return null;

  const coins = searchResults?.coins || [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/80 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="w-full max-w-lg border border-white/10 bg-black shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
          <svg className="w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, symbol, or contract address..."
            className="flex-1 bg-transparent text-white text-sm font-mono placeholder-white/20 outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 border border-white/10 text-white/20 text-[10px] font-mono">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {isSearching && debouncedQuery.length >= 2 ? (
            <div className="py-8 text-center">
              <div className="inline-block animate-spin h-4 w-4 border border-white/20 border-t-white" />
            </div>
          ) : coins.length > 0 ? (
            <div className="py-2">
              <div className="px-4 py-1.5 text-[10px] text-white/20 uppercase tracking-widest font-mono">
                Tokens
              </div>
              {coins.slice(0, 10).map((coin) => (
                <button
                  key={coin.id}
                  onClick={() => handleSelect(coin.chainId, coin.tokenAddress)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.03] transition-colors"
                >
                  {coin.thumb ? (
                    <Image
                      src={coin.thumb}
                      alt={coin.name}
                      width={20}
                      height={20}
                      className="rounded-full"
                    />
                  ) : (
                    <span className="w-5 h-5 rounded-full bg-white/10 shrink-0" />
                  )}
                  <span className="text-white text-sm">{coin.name}</span>
                  <span className="text-white/30 text-xs uppercase font-mono">{coin.symbol}</span>
                  {coin.chainId && (
                    <span className="ml-auto text-[10px] text-white/15 uppercase font-mono border border-white/5 px-1">{coin.chainId}</span>
                  )}
                </button>
              ))}
            </div>
          ) : debouncedQuery.length >= 2 ? (
            <div className="py-8 text-center text-white/30 font-mono text-sm">No results</div>
          ) : (
            <div className="py-8 text-center text-white/20 font-mono text-sm">
              <div>Search by name, symbol, or contract address</div>
              <div className="text-[10px] text-white/10 mt-2 uppercase tracking-widest">
                ETH · SOL · BASE · ARB
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
