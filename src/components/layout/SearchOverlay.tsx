'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { searchCoins, getCoinByContract, isContractAddress } from '@/lib/coingecko';
import { useDebounce } from '@/hooks/useDebounce';
import { useSearch } from '@/context/SearchContext';
import { CHAINS, detectChain } from '@/types/chain';
import { ChainBadge } from '@/components/ui/ChainBadge';
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

  // Auto-detect chain from address
  useEffect(() => {
    if (isContract) {
      const detected = detectChain(debouncedQuery);
      if (detected) {
        setSelectedChain(detected.id);
      }
    }
  }, [isContract, debouncedQuery]);

  // Regular search
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => searchCoins(debouncedQuery),
    enabled: debouncedQuery.length >= 2 && !isContract,
    staleTime: 60_000,
  });

  // Contract address lookup
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
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="w-full max-w-lg rounded-xl bg-gray-900 border border-gray-800 shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800">
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, symbol, or contract address..."
            className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 rounded bg-gray-800 text-gray-400 text-xs">
            ESC
          </kbd>
        </div>

        {/* Chain selector for contract addresses */}
        {isContract && (
          <div className="px-4 py-2 border-b border-gray-800 flex items-center gap-2 overflow-x-auto">
            <span className="text-xs text-gray-500 shrink-0">Chain:</span>
            {CHAINS.filter((c) => c.contractPattern.test(debouncedQuery) || c.id === 'solana').map((chain) => (
              <button
                key={chain.id}
                onClick={() => setSelectedChain(chain.id)}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1 ${
                  selectedChain === chain.id
                    ? 'text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
                style={
                  selectedChain === chain.id
                    ? { backgroundColor: chain.color }
                    : undefined
                }
              >
                {chain.icon} {chain.shortName}
              </button>
            ))}
          </div>
        )}

        <div className="max-h-80 overflow-y-auto">
          {/* Contract address result */}
          {isContract && (
            <>
              {isContractLoading ? (
                <div className="py-8 text-center text-gray-500">
                  <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400 mb-2" />
                  <div>Looking up contract on {CHAINS.find((c) => c.id === selectedChain)?.name}...</div>
                </div>
              ) : contractResult ? (
                <div className="py-2">
                  <div className="px-4 py-1.5 text-xs text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    Contract Match
                    {selectedChain && (
                      <ChainBadge chain={CHAINS.find((c) => c.id === selectedChain)!} size="sm" />
                    )}
                  </div>
                  <button
                    onClick={() => handleSelect(contractResult.id)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-800 transition-colors"
                  >
                    <Image
                      src={contractResult.image?.large || '/placeholder.png'}
                      alt={contractResult.name}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                    <div className="text-left">
                      <div className="text-white font-medium">{contractResult.name}</div>
                      <div className="text-gray-400 text-sm uppercase">
                        {contractResult.symbol}
                      </div>
                    </div>
                    {contractResult.market_cap_rank && (
                      <span className="ml-auto text-gray-500 text-sm">
                        #{contractResult.market_cap_rank}
                      </span>
                    )}
                  </button>
                </div>
              ) : (
                <div className="py-8 text-center text-gray-500">
                  No token found for this contract on {CHAINS.find((c) => c.id === selectedChain)?.name}
                </div>
              )}
            </>
          )}

          {/* Regular search results */}
          {!isContract && (
            <>
              {isSearching && debouncedQuery.length >= 2 ? (
                <div className="py-8 text-center text-gray-500">
                  <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400" />
                </div>
              ) : searchResults?.coins && searchResults.coins.length > 0 ? (
                <div className="py-2">
                  <div className="px-4 py-1.5 text-xs text-gray-500 uppercase tracking-wider">
                    Coins
                  </div>
                  {searchResults.coins.slice(0, 10).map((coin) => (
                    <button
                      key={coin.id}
                      onClick={() => handleSelect(coin.id)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-800 transition-colors"
                    >
                      <Image
                        src={coin.thumb}
                        alt={coin.name}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                      <span className="text-white font-medium">{coin.name}</span>
                      <span className="text-gray-400 text-sm uppercase">{coin.symbol}</span>
                      {coin.market_cap_rank && (
                        <span className="ml-auto text-gray-500 text-sm">
                          #{coin.market_cap_rank}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              ) : debouncedQuery.length >= 2 ? (
                <div className="py-8 text-center text-gray-500">No results found</div>
              ) : (
                <div className="py-8 text-center text-gray-500">
                  <div>Search by name, symbol, or contract address</div>
                  <div className="text-xs text-gray-600 mt-2">
                    Supports ETH, SOL, BSC, Polygon, Avalanche, Arbitrum, Optimism, Base
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
