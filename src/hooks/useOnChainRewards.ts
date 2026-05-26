'use client';

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { REWARD_DISTRIBUTOR_ADDRESS, REWARD_DISTRIBUTOR_ABI, REKT_TOKEN_ADDRESS, REKT_TOKEN_ABI, isOnChainEnabled } from '@/lib/contracts';

// Read: Get agent info from contract
export function useAgentOnChain(wallet?: string) {
  return useReadContract({
    address: REWARD_DISTRIBUTOR_ADDRESS,
    abi: REWARD_DISTRIBUTOR_ABI,
    functionName: 'getAgent',
    args: wallet ? [wallet as `0x${string}`] : undefined,
    query: { enabled: isOnChainEnabled && !!wallet },
  });
}

// Read: Get pending reward from contract
export function usePendingRewardOnChain(wallet?: string) {
  return useReadContract({
    address: REWARD_DISTRIBUTOR_ADDRESS,
    abi: REWARD_DISTRIBUTOR_ABI,
    functionName: 'getPendingReward',
    args: wallet ? [wallet as `0x${string}`] : undefined,
    query: { enabled: isOnChainEnabled && !!wallet },
  });
}

// Read: Get reward pool balance
export function useRewardPoolBalance() {
  return useReadContract({
    address: REWARD_DISTRIBUTOR_ADDRESS,
    abi: REWARD_DISTRIBUTOR_ABI,
    functionName: 'getBalance',
    query: { enabled: isOnChainEnabled },
  });
}

// Write: Register agent on-chain
export function useRegisterOnChain() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const register = () => {
    if (!isOnChainEnabled) return;
    writeContract({
      address: REWARD_DISTRIBUTOR_ADDRESS,
      abi: REWARD_DISTRIBUTOR_ABI,
      functionName: 'register',
    });
  };

  return { register, hash, isPending, isConfirming, isSuccess, error };
}

// Write: Claim rewards on-chain
export function useClaimOnChain() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const claim = () => {
    if (!isOnChainEnabled) return;
    writeContract({
      address: REWARD_DISTRIBUTOR_ADDRESS,
      abi: REWARD_DISTRIBUTOR_ABI,
      functionName: 'claim',
    });
  };

  return { claim, hash, isPending, isConfirming, isSuccess, error };
}
