'use client';

import { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';
import { CHAINS } from '@/types/chain';
import { ChainIcon } from './ChainIcon';
import type { ChainId } from '@/types/chain';

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
        className="flex items-center gap-2 px-3 py-1.5 border border-white/10 text-white/40 hover:text-white hover:border-white/30 text-xs font-mono transition-colors min-w-[160px]"
      >
        {selectedChain ? (
          <>
            <ChainIcon chainId={selectedChain.id} size={14} />
            <span className="flex-1 text-left">{selectedChain.name}</span>
          </>
        ) : (
          <>
            <span className="text-white/20">◈</span>
            <span className="flex-1 text-left">All Chains</span>
          </>
        )}
        <svg
          className={clsx('w-3 h-3 transition-transform', isOpen && 'rotate-180')}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-full min-w-[200px] bg-black border border-white/10 z-50">
          <div className="py-1">
            <button
              onClick={() => {
                onSelect(null);
                setIsOpen(false);
              }}
              className={clsx(
                'w-full flex items-center gap-3 px-4 py-2 text-xs font-mono transition-colors',
                selected === null
                  ? 'bg-white/[0.05] text-white'
                  : 'text-white/40 hover:bg-white/[0.03] hover:text-white'
              )}
            >
              <span className="text-white/20">◈</span>
              <span className="flex-1 text-left">All Chains</span>
            </button>

            <div className="border-t border-white/5 my-1" />

            {CHAINS.map((chain) => (
              <button
                key={chain.id}
                onClick={() => {
                  onSelect(chain.id);
                  setIsOpen(false);
                }}
                className={clsx(
                  'w-full flex items-center gap-3 px-4 py-2 text-xs font-mono transition-colors',
                  selected === chain.id
                    ? 'bg-white/[0.05] text-white'
                    : 'text-white/40 hover:bg-white/[0.03] hover:text-white'
                )}
              >
                <ChainIcon chainId={chain.id} size={14} />
                <span className="flex-1 text-left">{chain.name}</span>
                <span className="text-[10px] text-white/20 uppercase">{chain.symbol}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
