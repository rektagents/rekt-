'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMarketCoins } from '@/lib/dexscreener';
import { REFRESH_INTERVALS } from '@/lib/constants';
import type { Currency } from '@/types/coin';
import type { Agent } from '@/types/agent';

interface AgentsResponse {
  agents: Agent[];
  total: number;
}

export function useAgents(category?: string, sort?: string, limit?: number) {
  return useQuery<AgentsResponse>({
    queryKey: ['agents', category, sort, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (category && category !== 'all') params.set('category', category);
      if (sort) params.set('sort', sort);
      if (limit) params.set('limit', String(limit));

      const res = await fetch(`/api/agents?${params}`);
      if (!res.ok) throw new Error('Failed to fetch agents');
      return res.json();
    },
    staleTime: 60_000,
  });
}

export function useAgent(id: string) {
  return useQuery<Agent>({
    queryKey: ['agent', id],
    queryFn: async () => {
      const res = await fetch(`/api/agents/${id}`);
      if (!res.ok) throw new Error('Agent not found');
      return res.json();
    },
    enabled: !!id,
  });
}

export function useFeaturedAgents() {
  return useQuery<AgentsResponse>({
    queryKey: ['agents', 'featured'],
    queryFn: async () => {
      const res = await fetch('/api/agents?featured=true');
      if (!res.ok) throw new Error('Failed to fetch featured agents');
      return res.json();
    },
    staleTime: 300_000,
  });
}

export function useSubmitAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (agent: {
      name: string;
      description: string;
      category: string;
      creator_wallet: string;
      website?: string;
      twitter?: string;
      discord?: string;
      github?: string;
      token_symbol?: string;
      chain?: string;
      tags?: string[];
    }) => {
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agent),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to submit agent');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });
}

export function useAgentReviews(agentId: string) {
  return useQuery({
    queryKey: ['agentReviews', agentId],
    queryFn: async () => {
      const res = await fetch(`/api/agents/${agentId}/reviews`);
      if (!res.ok) throw new Error('Failed to fetch reviews');
      return res.json();
    },
    enabled: !!agentId,
  });
}

export function useSubmitReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      agentId,
      reviewer_wallet,
      reviewer_name,
      rating,
      comment,
    }: {
      agentId: string;
      reviewer_wallet: string;
      reviewer_name?: string;
      rating: number;
      comment: string;
    }) => {
      const res = await fetch(`/api/agents/${agentId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewer_wallet, reviewer_name, rating, comment }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to submit review');
      }
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['agentReviews', variables.agentId] });
    },
  });
}

export function useAgentTokens(currency: Currency = 'usd') {
  return useQuery({
    queryKey: ['agentTokens', currency],
    queryFn: () => getMarketCoins(currency, 1),
    staleTime: REFRESH_INTERVALS.market,
    refetchInterval: REFRESH_INTERVALS.market,
    select: (data) => {
      return data.filter((coin) =>
        coin.name.toLowerCase().includes('ai') ||
        coin.name.toLowerCase().includes('agent') ||
        coin.symbol.toLowerCase().includes('ai')
      );
    },
  });
}
