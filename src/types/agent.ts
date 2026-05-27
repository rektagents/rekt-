export type AgentCategory =
  | 'defi'
  | 'trading'
  | 'research'
  | 'social'
  | 'coding'
  | 'gaming'
  | 'data'
  | 'other';

export type AgentStatus = 'live' | 'beta' | 'coming-soon';

export interface Agent {
  id: string;
  name: string;
  description: string;
  category: AgentCategory;
  status: AgentStatus;
  creator: string;
  avatar: string;
  website?: string;
  twitter?: string;
  discord?: string;
  tokenSymbol?: string;
  tokenAddress?: string;
  chain?: string;
  metrics: AgentMetrics;
  tags: string[];
  featured?: boolean;
  createdAt: string;
}

export interface AgentMetrics {
  users: number;
  transactions: number;
  volume?: number;
  uptime?: number;
  rating?: number;
  reviews?: number;
}

export interface AgentToken {
  id: string;
  name: string;
  symbol: string;
  agentId: string;
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
  holders: number;
}

export interface BuilderTool {
  id: string;
  name: string;
  description: string;
  category: 'api' | 'sdk' | 'framework' | 'tool';
  documentation: string;
  github?: string;
  icon: string;
}

export const CATEGORY_LABELS: Record<AgentCategory, string> = {
  defi: 'DeFi',
  trading: 'Trading',
  research: 'Research',
  social: 'Social',
  coding: 'Coding',
  gaming: 'Gaming',
  data: 'Data',
  other: 'Other',
};

export const CATEGORY_COLORS: Record<AgentCategory, string> = {
  defi: '#22c55e',
  trading: '#3b82f6',
  research: '#8b5cf6',
  social: '#ec4899',
  coding: '#06b6d4',
  gaming: '#f97316',
  data: '#eab308',
  other: '#6b7280',
};
