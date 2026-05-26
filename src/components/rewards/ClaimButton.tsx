'use client';

import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { usePendingRewards, useClaimRewards } from '@/hooks/useRewards';
import { useClaimOnChain, usePendingRewardOnChain } from '@/hooks/useOnChainRewards';
import { TransactionStatus } from './TransactionStatus';
import { isOnChainEnabled } from '@/lib/contracts';
import { formatEther } from 'viem';

export function ClaimButton() {
  const { address } = useWallet();
  const { data } = usePendingRewards(address);
  const claimOffChain = useClaimRewards();
  const { data: onChainPending } = usePendingRewardOnChain(address);
  const claimOnChain = useClaimOnChain();
  const [step, setStep] = useState<'idle' | 'offchain' | 'onchain'>('idle');

  const hasPending = (data?.pending?.total || 0) > 0;
  const onChainAmount = onChainPending ? Number(formatEther(onChainPending as bigint)) : 0;
  const hasOnChainPending = onChainAmount > 0;

  const handleClaim = async () => {
    if (!address) return;
    setStep('offchain');
    try {
      await claimOffChain.mutateAsync({ wallet: address });
      if (isOnChainEnabled) {
        setStep('onchain');
      } else {
        setStep('idle');
      }
    } catch {
      setStep('idle');
    }
  };

  const handleOnChainClaim = () => {
    setStep('onchain');
    claimOnChain.claim();
  };

  if (!isOnChainEnabled) {
    return (
      <div>
        <button
          onClick={handleClaim}
          disabled={!hasPending || claimOffChain.isPending}
          className="w-full py-2.5 bg-white text-black text-xs font-bold font-mono uppercase tracking-widest hover:bg-white/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {claimOffChain.isPending ? 'claiming...' : hasPending ? 'claim rewards' : 'no rewards to claim'}
        </button>
        {claimOffChain.isSuccess && (
          <p className="text-green-400 text-xs font-mono text-center mt-2">
            Claimed {claimOffChain.data.totalClaimed.toFixed(2)} REKT
          </p>
        )}
        {claimOffChain.isError && (
          <p className="text-red-400 text-xs font-mono text-center mt-2">{claimOffChain.error?.message}</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {hasOnChainPending && (
        <div className="border border-white/10 p-4">
          <p className="text-[10px] text-white/30 font-mono uppercase tracking-widest mb-1">on-chain pending</p>
          <p className="text-lg font-bold text-white font-mono tabular-nums">
            {onChainAmount.toFixed(2)} <span className="text-white/30 text-sm">REKT</span>
          </p>
          <button
            onClick={handleOnChainClaim}
            disabled={claimOnChain.isPending || claimOnChain.isConfirming}
            className="mt-3 w-full py-2.5 bg-white text-black text-xs font-bold font-mono uppercase tracking-widest hover:bg-white/90 transition-colors disabled:opacity-30"
          >
            {claimOnChain.isPending ? 'confirm in wallet...' : claimOnChain.isConfirming ? 'confirming...' : 'claim on-chain'}
          </button>
          <TransactionStatus
            hash={claimOnChain.hash}
            isPending={claimOnChain.isPending}
            isConfirming={claimOnChain.isConfirming}
            isSuccess={claimOnChain.isSuccess}
            error={claimOnChain.error}
            label="Claim"
          />
        </div>
      )}

      {hasPending && !hasOnChainPending && (
        <button
          onClick={handleClaim}
          disabled={claimOffChain.isPending}
          className="w-full py-2.5 bg-white text-black text-xs font-bold font-mono uppercase tracking-widest hover:bg-white/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {claimOffChain.isPending ? 'preparing...' : 'prepare on-chain claim'}
        </button>
      )}

      {!hasPending && !hasOnChainPending && (
        <p className="text-white/30 text-xs font-mono text-center py-2">no rewards to claim</p>
      )}

      {claimOffChain.isSuccess && step === 'offchain' && !hasOnChainPending && (
        <p className="text-green-400 text-xs font-mono text-center">
          Off-chain rewards marked. Complete on-chain claim above.
        </p>
      )}
    </div>
  );
}
