'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchCoins } from '@/lib/coingecko';
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
      coinId: selectedCoin.id,
      coinName: selectedCoin.name,
      coinSymbol: selectedCoin.symbol,
      coinImage: selectedCoin.thumb,
      condition,
      targetPrice: parseFloat(targetPrice),
    });

    // Reset form
    setSelectedCoin(null);
    setSearchQuery('');
    setCondition('above');
    setTargetPrice('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Price Alert">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Coin search */}
        {!selectedCoin ? (
          <div>
            <label className="block text-sm text-gray-400 mb-1">Search Coin</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Bitcoin, Ethereum..."
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-2.5 border border-gray-700 focus:outline-none focus:border-gray-600"
            />
            {searchResults?.coins && searchResults.coins.length > 0 && (
              <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-gray-700">
                {searchResults.coins.slice(0, 5).map((coin) => (
                  <button
                    key={coin.id}
                    type="button"
                    onClick={() => {
                      setSelectedCoin(coin);
                      setSearchQuery('');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-800 transition-colors"
                  >
                    <Image
                      src={coin.thumb}
                      alt={coin.name}
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                    <span className="text-white">{coin.name}</span>
                    <span className="text-gray-400 text-sm uppercase">{coin.symbol}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
            <Image
              src={selectedCoin.thumb}
              alt={selectedCoin.name}
              width={32}
              height={32}
              className="rounded-full"
            />
            <div>
              <div className="text-white font-medium">{selectedCoin.name}</div>
              <div className="text-sm text-gray-400 uppercase">{selectedCoin.symbol}</div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedCoin(null)}
              className="ml-auto text-gray-400 hover:text-white"
            >
              Change
            </button>
          </div>
        )}

        {/* Condition */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Condition</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setCondition('above')}
              className={`flex-1 py-2.5 rounded-lg font-medium transition-colors ${
                condition === 'above'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              Price goes above
            </button>
            <button
              type="button"
              onClick={() => setCondition('below')}
              className={`flex-1 py-2.5 rounded-lg font-medium transition-colors ${
                condition === 'below'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              Price goes below
            </button>
          </div>
        </div>

        {/* Target Price */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Target Price (USD)</label>
          <input
            type="number"
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
            placeholder="0.00"
            step="any"
            required
            className="w-full bg-gray-800 text-white rounded-lg px-4 py-2.5 border border-gray-700 focus:outline-none focus:border-gray-600"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!selectedCoin || !targetPrice}
          className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Create Alert
        </button>
      </form>
    </Modal>
  );
}
