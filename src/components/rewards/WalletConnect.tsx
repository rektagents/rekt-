'use client';

import { useWallet } from '@/hooks/useWallet';
import { clsx } from 'clsx';

export function WalletConnect() {
  const { address, isConnected, isConnecting, chain, balance, connectWallet, disconnect } = useWallet();

  if (isConnected && address) {
    return (
      <div className="border border-white/10 p-4">
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
        <button
          onClick={() => disconnect()}
          className="mt-3 w-full py-2 border border-white/10 text-white/30 hover:text-white hover:border-white/30 text-xs font-mono transition-colors"
        >
          disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="border border-white/10 p-6 text-center">
      <p className="text-white/30 text-xs font-mono uppercase tracking-widest mb-4">
        connect wallet
      </p>
      <p className="text-white/50 text-sm mb-4 font-mono">
        Connect your wallet to start earning REKT tokens
      </p>
      <button
        onClick={connectWallet}
        disabled={isConnecting}
        className="w-full py-2.5 bg-white text-black text-xs font-bold font-mono uppercase tracking-widest hover:bg-white/90 transition-colors disabled:opacity-30"
      >
        {isConnecting ? 'connecting...' : 'connect metamask'}
      </button>
      <p className="text-[10px] text-white/20 font-mono mt-3">
        Supports MetaMask and other injected wallets
      </p>
    </div>
  );
}
