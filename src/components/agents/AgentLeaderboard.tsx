'use client';

import Image from 'next/image';
import { clsx } from 'clsx';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/types/agent';
import type { Agent } from '@/types/agent';

interface AgentLeaderboardProps {
  agents: Agent[];
  sortBy?: 'users' | 'rating' | 'volume' | 'transactions';
}

export function AgentLeaderboard({ agents, sortBy = 'users' }: AgentLeaderboardProps) {
  const sorted = [...agents].sort((a, b) => {
    switch (sortBy) {
      case 'users':
        return b.metrics.users - a.metrics.users;
      case 'rating':
        return (b.metrics.rating || 0) - (a.metrics.rating || 0);
      case 'volume':
        return (b.metrics.volume || 0) - (a.metrics.volume || 0);
      case 'transactions':
        return b.metrics.transactions - a.metrics.transactions;
      default:
        return 0;
    }
  });

  return (
    <div className="glass rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400 w-12">Rank</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Agent</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400 hidden md:table-cell">Category</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Users</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-400 hidden sm:table-cell">Rating</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-400 hidden lg:table-cell">Volume</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-400 hidden lg:table-cell">Txns</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((agent, index) => (
              <tr
                key={agent.id}
                className="border-b border-gray-800/50 hover:bg-white/5 transition-colors"
              >
                <td className="py-4 px-4">
                  <div
                    className={clsx(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                      {
                        'bg-yellow-500/20 text-yellow-500': index === 0,
                        'bg-gray-400/20 text-gray-400': index === 1,
                        'bg-orange-500/20 text-orange-500': index === 2,
                        'bg-gray-800 text-gray-500': index > 2,
                      }
                    )}
                  >
                    {index + 1}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                      style={{ backgroundColor: `${CATEGORY_COLORS[agent.category]}20` }}
                    >
                      {agent.avatar || agent.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-white flex items-center gap-2">
                        {agent.name}
                        {agent.tokenSymbol && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">
                            ${agent.tokenSymbol}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-400 truncate max-w-[200px]">
                        {agent.description}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 hidden md:table-cell">
                  <span
                    className="px-2 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: `${CATEGORY_COLORS[agent.category]}20`,
                      color: CATEGORY_COLORS[agent.category],
                    }}
                  >
                    {CATEGORY_LABELS[agent.category]}
                  </span>
                </td>
                <td className="py-4 px-4 text-right text-white font-medium">
                  {formatNumber(agent.metrics.users)}
                </td>
                <td className="py-4 px-4 text-right hidden sm:table-cell">
                  <div className="flex items-center justify-end gap-1">
                    <span className="text-yellow-500">★</span>
                    <span className="text-white">{agent.metrics.rating?.toFixed(1) || '—'}</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-right text-gray-300 hidden lg:table-cell">
                  {agent.metrics.volume ? `$${formatNumber(agent.metrics.volume)}` : '—'}
                </td>
                <td className="py-4 px-4 text-right text-gray-300 hidden lg:table-cell">
                  {formatNumber(agent.metrics.transactions)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatNumber(num: number): string {
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toLocaleString();
}
