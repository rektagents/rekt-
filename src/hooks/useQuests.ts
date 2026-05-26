'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { QuestProgress, Streak } from '@/types/quests';

interface QuestsResponse {
  quests: QuestProgress[];
  streak: Streak;
}

export function useQuests(wallet?: string) {
  return useQuery<QuestsResponse>({
    queryKey: ['quests', wallet],
    queryFn: async () => {
      const res = await fetch(`/api/quests?wallet=${wallet}`);
      if (!res.ok) throw new Error('Failed to fetch quests');
      return res.json();
    },
    enabled: !!wallet,
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}

export function useClaimQuest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ wallet, questId }: { wallet: string; questId: string }) => {
      const res = await fetch('/api/quests/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet, questId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to claim quest');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quests'] });
      queryClient.invalidateQueries({ queryKey: ['pending'] });
    },
  });
}
