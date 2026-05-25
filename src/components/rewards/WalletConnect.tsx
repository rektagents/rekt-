'use client';

import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi';
import { clsx } from 'clsx';

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
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({ address });

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
    <div className="border border-white/10 p-6">
      <p className="text-[10px] text-white/30 font-mono uppercase tracking-widest mb-4 text-center">
        connect wallet
      </p>
      <div className="space-y-2">
        {connectors.map((connector) => (
          <button
            key={connector.uid}
            onClick={() => connect({ connector })}
            disabled={isPending}
            className="w-full flex items-center gap-3 px-4 py-3 border border-white/10 text-white/60 hover:text-white hover:border-white/30 hover:bg-white/[0.02] transition-colors disabled:opacity-30"
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
      </div>
      <p className="text-[10px] text-white/15 font-mono text-center mt-4">
        Base network (mainnet / testnet)
      </p>
    </div>
  );
}
