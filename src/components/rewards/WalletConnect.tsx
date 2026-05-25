'use client';

import { useState, useRef, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi';

const WALLET_ICONS: Record<string, string> = {
  MetaMask: 'M',
  'Coinbase Wallet': 'C',
  WalletConnect: 'W',
  Injected: '◈',
};

const WALLET_LABELS: Record<string, string> = {
  MetaMask: 'MetaMask',
  'Coinbase Wallet': 'Coinbase',
  WalletConnect: 'WalletConnect',
  Injected: 'Browser Wallet',
};

export function WalletConnect() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({ address });

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  if (isConnected && address) {
    return (
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="w-full p-4 border border-white/10 hover:border-white/20 transition-colors text-left"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] text-white/30 font-mono uppercase tracking-widest">connected</p>
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-green-400" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-400" />
              </span>
              <span className="text-[10px] text-green-400 font-mono">{chain?.name || 'Unknown'}</span>
            </span>
          </div>
          <p className="text-sm text-white font-mono tabular-nums mb-1">
            {address.slice(0, 6)}...{address.slice(-4)}
          </p>
          {balance && (
            <p className="text-xs text-white/40 font-mono tabular-nums">
              {(Number(balance.value) / 10 ** balance.decimals).toFixed(4)} {balance.symbol}
            </p>
          )}
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-white/20 font-mono">
            {open ? '▲' : '▼'}
          </span>
        </button>

        {open && (
          <div className="absolute z-10 w-full border border-white/10 border-t-0 bg-black">
            <button
              onClick={() => { disconnect(); setOpen(false); }}
              className="w-full px-4 py-3 text-left text-xs font-mono text-white/30 hover:text-white hover:bg-white/[0.03] transition-colors uppercase tracking-widest"
            >
              disconnect
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full p-6 border border-white/10 hover:border-white/20 transition-colors"
      >
        <p className="text-[10px] text-white/30 font-mono uppercase tracking-widest mb-2 text-center">
          connect wallet
        </p>
        <p className="text-center text-[10px] text-white/15 font-mono">
          {open ? '▲' : '▼'} select wallet
        </p>
      </button>

      {open && (
        <div className="absolute z-10 w-full border border-white/10 border-t-0 bg-black">
          {connectors.map((connector) => (
            <button
              key={connector.uid}
              onClick={() => { connect({ connector }); setOpen(false); }}
              disabled={isPending}
              className="w-full flex items-center gap-3 px-4 py-3 text-white/60 hover:text-white hover:bg-white/[0.03] transition-colors disabled:opacity-30 border-b border-white/5 last:border-b-0"
            >
              <span className="w-6 h-6 border border-white/10 flex items-center justify-center text-xs font-mono text-white/40 bg-white/[0.03]">
                {WALLET_ICONS[connector.name] || '◈'}
              </span>
              <span className="text-sm font-mono flex-1 text-left">
                {WALLET_LABELS[connector.name] || connector.name}
              </span>
              <span className="text-[10px] text-white/20 font-mono">→</span>
            </button>
          ))}
          <div className="px-4 py-2">
            <p className="text-[10px] text-white/15 font-mono text-center">
              Base network (mainnet / testnet)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
