'use client';

import { useChainId } from 'wagmi';

interface TransactionStatusProps {
  hash?: `0x${string}`;
  isPending?: boolean;
  isConfirming?: boolean;
  isSuccess?: boolean;
  error?: Error | null;
  label?: string;
}

export function TransactionStatus({ hash, isPending, isConfirming, isSuccess, error, label = 'Transaction' }: TransactionStatusProps) {
  const chainId = useChainId();
  const explorerUrl = chainId === 8453 ? 'https://basescan.org' : 'https://sepolia.basescan.org';

  if (error) {
    return (
      <div className="border border-red-500/20 p-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 bg-red-500 rounded-full" />
          <p className="text-red-400 text-sm font-mono">{label} failed</p>
        </div>
        <p className="text-red-400/60 text-xs font-mono">{error.message}</p>
      </div>
    );
  }

  if (isSuccess && hash) {
    return (
      <div className="border border-green-500/20 p-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 bg-green-500 rounded-full" />
          <p className="text-green-400 text-sm font-mono">{label} confirmed</p>
        </div>
        <a
          href={`${explorerUrl}/tx/${hash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/40 text-xs font-mono hover:text-white transition-colors"
        >
          view on explorer →
        </a>
      </div>
    );
  }

  if (isConfirming) {
    return (
      <div className="border border-blue-500/20 p-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <p className="text-blue-400 text-sm font-mono">Confirming...</p>
        </div>
        {hash && (
          <a
            href={`${explorerUrl}/tx/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/40 text-xs font-mono hover:text-white transition-colors"
          >
            {hash.slice(0, 10)}...{hash.slice(-8)}
          </a>
        )}
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="border border-yellow-500/20 p-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
          <p className="text-yellow-400 text-sm font-mono">Waiting for wallet...</p>
        </div>
      </div>
    );
  }

  return null;
}
