'use client';

import { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';
import { CHAINS } from '@/types/chain';
import { ChainIcon } from './ChainIcon';
import type { Chain, ChainId } from '@/types/chain';

interface ChainSelectorProps {
  selected: ChainId | null;
  onSelect: (chain: ChainId | null) => void;
  className?: string;
}

export function ChainSelector({ selected, onSelect, className }: ChainSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedChain = selected ? CHAINS.find((c) => c.id === selected) : null;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={clsx('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg border border-gray-700 hover:border-gray-600 hover:text-white transition-colors min-w-[180px]"
      >
        {selectedChain ? (
          <>
            <ChainIcon chainId={selectedChain.id} size={18} />
            <span className="flex-1 text-left">{selectedChain.name}</span>
          </>
        ) : (
          <>
            <div className="w-[18px] h-[18px] rounded-full bg-gray-600 flex items-center justify-center">
              <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </div>
            <span className="flex-1 text-left">All Chains</span>
          </>
        )}
        <svg
          className={clsx('w-4 h-4 transition-transform', isOpen && 'rotate-180')}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full min-w-[220px] bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="py-1">
            <button
              onClick={() => {
                onSelect(null);
                setIsOpen(false);
              }}
              className={clsx(
                'w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                selected === null
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              )}
            >
              <div className="w-5 h-5 rounded-full bg-gray-600 flex items-center justify-center">
                <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </div>
              <span className="flex-1 text-left">All Chains</span>
            </button>

            <div className="border-t border-gray-800 my-1" />

            {CHAINS.map((chain) => (
              <button
                key={chain.id}
                onClick={() => {
                  onSelect(chain.id);
                  setIsOpen(false);
                }}
                className={clsx(
                  'w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                  selected === chain.id
                    ? 'text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                )}
                style={
                  selected === chain.id
                    ? { backgroundColor: `${chain.color}30` }
                    : undefined
                }
              >
                <ChainIcon chainId={chain.id} size={20} />
                <span className="flex-1 text-left">{chain.name}</span>
                <span className="text-xs text-gray-600 uppercase">{chain.symbol}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
