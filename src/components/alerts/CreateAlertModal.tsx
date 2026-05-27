'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchCoins } from '@/lib/dexscreener';
import { useDebounce } from '@/hooks/useDebounce';
import { Modal } from '@/components/ui/Modal';
import Image from 'next/image';

interface CreateAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (alert: {
    coinId: string;
    coinName: string;
    coinSymbol: string;
    coinImage: string;
    condition: 'above' | 'below';
    targetPrice: number;
  }) => void;
}

export function CreateAlertModal({ isOpen, onClose, onCreate }: CreateAlertModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCoin, setSelectedCoin] = useState<{
    id: string;
    name: string;
    symbol: string;
    thumb: string;
  } | null>(null);
  const [condition, setCondition] = useState<'above' | 'below'>('above');
  const [targetPrice, setTargetPrice] = useState('');

  const debouncedQuery = useDebounce(searchQuery, 300);

  const { data: searchResults } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => searchCoins(debouncedQuery),
    enabled: debouncedQuery.length >= 2 && !selectedCoin,
    staleTime: 60_000,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCoin || !targetPrice) return;

    onCreate({
      coinId: selectedCoin.id, // chainId:address format
      coinName: selectedCoin.name,
      coinSymbol: selectedCoin.symbol,
      coinImage: selectedCoin.thumb,
      condition,
      targetPrice: parseFloat(targetPrice),
    });

    setSelectedCoin(null);
    setSearchQuery('');
    setCondition('above');
    setTargetPrice('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Price Alert">
      <form onSubmit={handleSubmit} className="space-y-4">
        {!selectedCoin ? (
          <div>
            <label className="block text-[10px] text-white/30 font-mono uppercase tracking-widest mb-2">Search Token</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Bitcoin, Ethereum, PEPE..."
              className="w-full bg-transparent text-white text-sm font-mono px-4 py-2.5 border border-white/10 focus:outline-none focus:border-white/30 placeholder-white/20"
            />
            {searchResults?.coins && searchResults.coins.length > 0 && (
              <div className="mt-2 max-h-48 overflow-y-auto border border-white/10">
                {searchResults.coins.slice(0, 5).map((coin) => (
                  <button
                    key={coin.id}
                    type="button"
                    onClick={() => {
                      setSelectedCoin(coin);
                      setSearchQuery('');
                    }}
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
                      <span className="ml-auto text-[10px] text-white/15 uppercase font-mono">{coin.chainId}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3 p-3 border border-white/10 bg-white/[0.02]">
            {selectedCoin.thumb ? (
              <Image
                src={selectedCoin.thumb}
                alt={selectedCoin.name}
                width={24}
                height={24}
                className="rounded-full"
              />
            ) : (
              <span className="w-6 h-6 rounded-full bg-white/10" />
            )}
            <div>
              <div className="text-white text-sm">{selectedCoin.name}</div>
              <div className="text-[10px] text-white/30 uppercase font-mono">{selectedCoin.symbol}</div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedCoin(null)}
              className="ml-auto text-white/30 hover:text-white text-xs font-mono"
            >
              change
            </button>
          </div>
        )}

        <div>
          <label className="block text-[10px] text-white/30 font-mono uppercase tracking-widest mb-2">Condition</label>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setCondition('above')}
              className={`flex-1 py-2 text-xs font-mono transition-colors border ${
                condition === 'above'
                  ? 'border-green-500/20 text-green-400 bg-green-500/5'
                  : 'border-white/10 text-white/30 hover:text-white hover:border-white/20'
              }`}
            >
              above
            </button>
            <button
              type="button"
              onClick={() => setCondition('below')}
              className={`flex-1 py-2 text-xs font-mono transition-colors border ${
                condition === 'below'
                  ? 'border-red-500/20 text-red-400 bg-red-500/5'
                  : 'border-white/10 text-white/30 hover:text-white hover:border-white/20'
              }`}
            >
              below
            </button>
          </div>
        </div>

        <div>
          <label className="block text-[10px] text-white/30 font-mono uppercase tracking-widest mb-2">Target Price (USD)</label>
          <input
            type="number"
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
            placeholder="0.00"
            step="any"
            required
            className="w-full bg-transparent text-white text-sm font-mono px-4 py-2.5 border border-white/10 focus:outline-none focus:border-white/30 placeholder-white/20 tabular-nums"
          />
        </div>

        <button
          type="submit"
          disabled={!selectedCoin || !targetPrice}
          className="w-full py-2.5 bg-white text-black text-xs font-bold font-mono uppercase tracking-widest hover:bg-white/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          create alert
        </button>
      </form>
    </Modal>
  );
}
