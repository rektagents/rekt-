'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { searchCoins, getCoinByContract, isContractAddress } from '@/lib/coingecko';
import { useDebounce } from '@/hooks/useDebounce';
import { useSearch } from '@/context/SearchContext';
import { CHAINS, detectChain } from '@/types/chain';
import Image from 'next/image';
import type { ChainId } from '@/types/chain';

export function SearchOverlay() {
  const { isOpen, openSearch, closeSearch } = useSearch();
  const [query, setQuery] = useState('');
  const [selectedChain, setSelectedChain] = useState<ChainId | null>(null);
  const debouncedQuery = useDebounce(query, 300);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const isContract = isContractAddress(debouncedQuery);

  useEffect(() => {
    if (isContract) {
      const detected = detectChain(debouncedQuery);
      if (detected) {
        setSelectedChain(detected.id);
      }
    }
  }, [isContract, debouncedQuery]);

  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => searchCoins(debouncedQuery),
    enabled: debouncedQuery.length >= 2 && !isContract,
    staleTime: 60_000,
  });

  const { data: contractResult, isLoading: isContractLoading } = useQuery({
    queryKey: ['contract', selectedChain, debouncedQuery],
    queryFn: () => getCoinByContract(selectedChain || 'ethereum', debouncedQuery),
    enabled: isContract && !!selectedChain,
    staleTime: 60_000,
    retry: false,
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

  const handleSelect = (coinId: string) => {
    closeSearch();
    setQuery('');
    setSelectedChain(null);
    router.push(`/coins/${coinId}`);
  };

  const handleClose = () => {
    closeSearch();
    setQuery('');
    setSelectedChain(null);
  };

  if (!isOpen) return null;

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
            placeholder="Search by name, symbol, or contract..."
            className="flex-1 bg-transparent text-white text-sm font-mono placeholder-white/20 outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 border border-white/10 text-white/20 text-[10px] font-mono">
            ESC
          </kbd>
        </div>

        {isContract && (
          <div className="px-4 py-2 border-b border-white/10 flex items-center gap-2 overflow-x-auto">
            <span className="text-[10px] text-white/30 font-mono uppercase tracking-widest shrink-0">chain:</span>
            {CHAINS.filter((c) => c.contractPattern.test(debouncedQuery) || c.id === 'solana').map((chain) => (
              <button
                key={chain.id}
                onClick={() => setSelectedChain(chain.id)}
                className={`px-2 py-1 text-[11px] font-mono transition-colors flex items-center gap-1 border ${
                  selectedChain === chain.id
                    ? 'border-white/30 text-white bg-white/[0.05]'
                    : 'border-white/10 text-white/30 hover:text-white hover:border-white/20'
                }`}
              >
                {chain.icon} {chain.shortName}
              </button>
            ))}
          </div>
        )}

        <div className="max-h-80 overflow-y-auto">
          {isContract && (
            <>
              {isContractLoading ? (
                <div className="py-8 text-center text-white/30 font-mono text-sm">
                  <div className="inline-block animate-spin h-4 w-4 border border-white/20 border-t-white mb-2" />
                  <div>Looking up contract...</div>
                </div>
              ) : contractResult ? (
                <div className="py-2">
                  <div className="px-4 py-1.5 text-[10px] text-white/20 uppercase tracking-widest font-mono">
                    Contract Match
                  </div>
                  <button
                    onClick={() => handleSelect(contractResult.id)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.03] transition-colors"
                  >
                    <Image
                      src={contractResult.image?.large || '/placeholder.png'}
                      alt={contractResult.name}
                      width={28}
                      height={28}
                      className="rounded-full"
                    />
                    <div className="text-left">
                      <div className="text-white text-sm font-medium">{contractResult.name}</div>
                      <div className="text-white/30 text-xs uppercase font-mono">{contractResult.symbol}</div>
                    </div>
                    {contractResult.market_cap_rank && (
                      <span className="ml-auto text-white/20 text-xs font-mono">#{contractResult.market_cap_rank}</span>
                    )}
                  </button>
                </div>
              ) : (
                <div className="py-8 text-center text-white/30 font-mono text-sm">
                  No token found for this contract
                </div>
              )}
            </>
          )}

          {!isContract && (
            <>
              {isSearching && debouncedQuery.length >= 2 ? (
                <div className="py-8 text-center">
                  <div className="inline-block animate-spin h-4 w-4 border border-white/20 border-t-white" />
                </div>
              ) : searchResults?.coins && searchResults.coins.length > 0 ? (
                <div className="py-2">
                  <div className="px-4 py-1.5 text-[10px] text-white/20 uppercase tracking-widest font-mono">
                    Coins
                  </div>
                  {searchResults.coins.slice(0, 10).map((coin) => (
                    <button
                      key={coin.id}
                      onClick={() => handleSelect(coin.id)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.03] transition-colors"
                    >
                      <Image
                        src={coin.thumb}
                        alt={coin.name}
                        width={20}
                        height={20}
                        className="rounded-full"
                      />
                      <span className="text-white text-sm">{coin.name}</span>
                      <span className="text-white/30 text-xs uppercase font-mono">{coin.symbol}</span>
                      {coin.market_cap_rank && (
                        <span className="ml-auto text-white/20 text-xs font-mono">#{coin.market_cap_rank}</span>
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
                    ETH · SOL · BSC · Polygon · Arbitrum · Base
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
