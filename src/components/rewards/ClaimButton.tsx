'use client';

import { useWallet } from '@/hooks/useWallet';
import { usePendingRewards, useClaimRewards } from '@/hooks/useRewards';

export function ClaimButton() {
  const { address } = useWallet();
  const { data } = usePendingRewards(address);
  const claim = useClaimRewards();

  const hasPending = (data?.pending?.total || 0) > 0;

  const handleClaim = async () => {
    if (!address) return;
    await claim.mutateAsync({ wallet: address });
  };

  return (
    <div>
      <button
        onClick={handleClaim}
        disabled={!hasPending || claim.isPending}
        className="w-full py-2.5 bg-white text-black text-xs font-bold font-mono uppercase tracking-widest hover:bg-white/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        {claim.isPending ? 'claiming...' : hasPending ? 'claim rewards' : 'no rewards to claim'}
      </button>
      {claim.isSuccess && (
        <p className="text-green-400 text-xs font-mono text-center mt-2">
          Claimed {claim.data.totalClaimed.toFixed(2)} REKT
        </p>
      )}
      {claim.isError && (
        <p className="text-red-400 text-xs font-mono text-center mt-2">
          {claim.error?.message}
        </p>
      )}
    </div>
  );
}
