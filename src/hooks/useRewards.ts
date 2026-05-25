'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AgentRegistration, RewardRecord, RewardLeaderboardEntry, TaskType } from '@/types/rewards';

// Register agent
export function useRegisterAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ agentId, wallet }: { agentId: string; wallet: string }) => {
      const res = await fetch('/api/rewards/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, wallet }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      return res.json() as Promise<AgentRegistration>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
    },
  });
}

// Submit task
export function useSubmitTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      agentId,
      wallet,
      type,
      score,
      proof,
    }: {
      agentId: string;
      wallet: string;
      type: TaskType;
      score: number;
      proof: string;
    }) => {
      const res = await fetch('/api/rewards/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, wallet, type, score, proof }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
    },
  });
}

// Verify task
export function useVerifyTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId }: { taskId: string }) => {
      const res = await fetch('/api/rewards/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
    },
  });
}

// Get pending rewards
export function usePendingRewards(wallet: string | undefined) {
  return useQuery({
    queryKey: ['rewards', 'pending', wallet],
    queryFn: async () => {
      const res = await fetch(`/api/rewards/pending?wallet=${wallet}`);
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json() as Promise<{
        registration: AgentRegistration | null;
        pending: { total: number; rewards: RewardRecord[] };
        tasks: any[];
      }>;
    },
    enabled: !!wallet,
    refetchInterval: 15_000,
  });
}

// Claim rewards
export function useClaimRewards() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ wallet }: { wallet: string }) => {
      const res = await fetch('/api/rewards/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      return res.json() as Promise<{ claimed: RewardRecord[]; totalClaimed: number }>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
    },
  });
}

// Get leaderboard
export function useRewardLeaderboard() {
  return useQuery({
    queryKey: ['rewards', 'leaderboard'],
    queryFn: async () => {
      const res = await fetch('/api/rewards/leaderboard');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json() as Promise<AgentRegistration[]>;
    },
    refetchInterval: 30_000,
  });
}
