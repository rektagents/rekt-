'use client';

import { useQuery } from '@tanstack/react-query';
import { getMarketCoins } from '@/lib/coingecko';
import { AGENT_TOKEN_IDS, REFRESH_INTERVALS } from '@/lib/constants';
import type { Currency } from '@/types/coin';

// Mock agent data - in production, this would come from an API
const MOCK_AGENTS = [
  {
    id: 'ai16z',
    name: 'AI16Z',
    description: 'AI-powered venture capital DAO that autonomously invests in promising projects',
    category: 'defi' as const,
    status: 'live' as const,
    creator: 'AI16Z Team',
    avatar: '',
    website: 'https://ai16z.ai',
    twitter: '@aiaborai16z',
    tokenSymbol: 'AI16Z',
    chain: 'solana',
    metrics: { users: 15000, transactions: 500000, volume: 120000000, rating: 4.5, reviews: 230 },
    tags: ['DAO', 'Investment', 'Autonomous'],
    featured: true,
    createdAt: '2024-10-01',
  },
  {
    id: 'virtuals-protocol',
    name: 'Virtuals Protocol',
    description: 'Platform for creating and monetizing AI agents in gaming and metaverse',
    category: 'gaming' as const,
    status: 'live' as const,
    creator: 'Virtuals Protocol',
    avatar: '',
    website: 'https://virtuals.io',
    tokenSymbol: 'VIRTUAL',
    chain: 'base',
    metrics: { users: 50000, transactions: 2000000, volume: 80000000, rating: 4.2, reviews: 180 },
    tags: ['Gaming', 'Metaverse', 'AI Agents'],
    featured: true,
    createdAt: '2024-09-15',
  },
  {
    id: 'zerebro',
    name: 'Zerebro',
    description: 'Autonomous AI agent that creates and distributes content across social platforms',
    category: 'social' as const,
    status: 'live' as const,
    creator: 'Zerebro Team',
    avatar: '',
    website: 'https://zerebro.org',
    tokenSymbol: 'ZEREBRO',
    chain: 'solana',
    metrics: { users: 25000, transactions: 800000, volume: 45000000, rating: 4.0, reviews: 150 },
    tags: ['Content', 'Social Media', 'Autonomous'],
    featured: true,
    createdAt: '2024-11-01',
  },
  {
    id: 'goatseus-maximus',
    name: 'GOAT',
    description: 'The first AI agent to achieve viral memecoin status through autonomous social engagement',
    category: 'social' as const,
    status: 'live' as const,
    creator: 'Truth Terminal',
    avatar: '',
    tokenSymbol: 'GOAT',
    chain: 'solana',
    metrics: { users: 100000, transactions: 5000000, volume: 200000000, rating: 3.8, reviews: 500 },
    tags: ['Memecoin', 'Viral', 'Social'],
    featured: true,
    createdAt: '2024-10-10',
  },
  {
    id: 'act-i-the-ai-prophecy',
    name: 'ACT',
    description: 'AI agent focused on research and knowledge synthesis',
    category: 'research' as const,
    status: 'beta' as const,
    creator: 'ACT Team',
    avatar: '',
    tokenSymbol: 'ACT',
    chain: 'solana',
    metrics: { users: 8000, transactions: 150000, volume: 20000000, rating: 4.1, reviews: 90 },
    tags: ['Research', 'Knowledge', 'Analysis'],
    createdAt: '2024-11-15',
  },
];

export function useAgents() {
  return useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      // In production, fetch from API
      return MOCK_AGENTS;
    },
    staleTime: 300_000,
  });
}

export function useAgentTokens(currency: Currency = 'usd') {
  return useQuery({
    queryKey: ['agentTokens', currency],
    queryFn: () => getMarketCoins(currency, 1, 100),
    staleTime: REFRESH_INTERVALS.market,
    refetchInterval: REFRESH_INTERVALS.market,
    select: (data) => {
      // Filter for agent-related tokens
      return data.filter((coin) =>
        AGENT_TOKEN_IDS.includes(coin.id) ||
        coin.name.toLowerCase().includes('ai') ||
        coin.name.toLowerCase().includes('agent') ||
        coin.symbol.toLowerCase().includes('ai')
      );
    },
  });
}

export function useFeaturedAgents() {
  const { data: agents, ...rest } = useAgents();
  return {
    ...rest,
    data: agents?.filter((a) => a.featured),
  };
}
