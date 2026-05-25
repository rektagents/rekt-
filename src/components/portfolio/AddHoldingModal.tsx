'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchCoins } from '@/lib/coingecko';
import { useDebounce } from '@/hooks/useDebounce';
import { Modal } from '@/components/ui/Modal';
import Image from 'next/image';

interface AddHoldingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (holding: {
    coinId: string;
    coinName: string;
    coinSymbol: string;
    coinImage: string;
    quantity: number;
    buyPrice: number;
    buyDate: string;
  }) => void;
}

export function AddHoldingModal({ isOpen, onClose, onAdd }: AddHoldingModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCoin, setSelectedCoin] = useState<{
    id: string;
    name: string;
    symbol: string;
    thumb: string;
  } | null>(null);
  const [quantity, setQuantity] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [buyDate, setBuyDate] = useState(new Date().toISOString().split('T')[0]);

  const debouncedQuery = useDebounce(searchQuery, 300);

  const { data: searchResults } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => searchCoins(debouncedQuery),
    enabled: debouncedQuery.length >= 2 && !selectedCoin,
    staleTime: 60_000,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCoin || !quantity || !buyPrice) return;

    onAdd({
      coinId: selectedCoin.id,
      coinName: selectedCoin.name,
      coinSymbol: selectedCoin.symbol,
      coinImage: selectedCoin.thumb,
      quantity: parseFloat(quantity),
      buyPrice: parseFloat(buyPrice),
      buyDate,
    });

    setSelectedCoin(null);
    setSearchQuery('');
    setQuantity('');
    setBuyPrice('');
    setBuyDate(new Date().toISOString().split('T')[0]);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Holding">
      <form onSubmit={handleSubmit} className="space-y-4">
        {!selectedCoin ? (
          <div>
            <label className="block text-[10px] text-white/30 font-mono uppercase tracking-widest mb-2">Search Coin</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Bitcoin, Ethereum..."
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
                    <Image
                      src={coin.thumb}
                      alt={coin.name}
                      width={20}
                      height={20}
                      className="rounded-full"
                    />
                    <span className="text-white text-sm">{coin.name}</span>
                    <span className="text-white/30 text-xs uppercase font-mono">{coin.symbol}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3 p-3 border border-white/10 bg-white/[0.02]">
            <Image
              src={selectedCoin.thumb}
              alt={selectedCoin.name}
              width={24}
              height={24}
              className="rounded-full"
            />
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
          <label className="block text-[10px] text-white/30 font-mono uppercase tracking-widest mb-2">Quantity</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="0.00"
            step="any"
            required
            className="w-full bg-transparent text-white text-sm font-mono px-4 py-2.5 border border-white/10 focus:outline-none focus:border-white/30 placeholder-white/20 tabular-nums"
          />
        </div>

        <div>
          <label className="block text-[10px] text-white/30 font-mono uppercase tracking-widest mb-2">Buy Price (USD)</label>
          <input
            type="number"
            value={buyPrice}
            onChange={(e) => setBuyPrice(e.target.value)}
            placeholder="0.00"
            step="any"
            required
            className="w-full bg-transparent text-white text-sm font-mono px-4 py-2.5 border border-white/10 focus:outline-none focus:border-white/30 placeholder-white/20 tabular-nums"
          />
        </div>

        <div>
          <label className="block text-[10px] text-white/30 font-mono uppercase tracking-widest mb-2">Buy Date</label>
          <input
            type="date"
            value={buyDate}
            onChange={(e) => setBuyDate(e.target.value)}
            className="w-full bg-transparent text-white text-sm font-mono px-4 py-2.5 border border-white/10 focus:outline-none focus:border-white/30"
          />
        </div>

        <button
          type="submit"
          disabled={!selectedCoin || !quantity || !buyPrice}
          className="w-full py-2.5 bg-white text-black text-xs font-bold font-mono uppercase tracking-widest hover:bg-white/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          add holding
        </button>
      </form>
    </Modal>
  );
}
