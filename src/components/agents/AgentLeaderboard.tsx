'use client';

import { clsx } from 'clsx';
import { CATEGORY_LABELS } from '@/types/agent';
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
    <div className="border border-white/10 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              {['Rank', 'Agent', 'Category', 'Users', 'Rating', 'Volume', 'Txns'].map((h) => (
                <th
                  key={h}
                  className={clsx(
                    'py-3 px-4 text-[11px] font-mono uppercase tracking-[0.16em] text-white/30',
                    h === 'Rank' || h === 'Agent' ? 'text-left' : 'text-right',
                    h === 'Category' && 'hidden md:table-cell text-left',
                    h === 'Rating' && 'hidden sm:table-cell',
                    h === 'Volume' && 'hidden lg:table-cell',
                    h === 'Txns' && 'hidden lg:table-cell'
                  )}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((agent, index) => (
              <tr
                key={agent.id}
                className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
              >
                <td className="py-4 px-4">
                  <span
                    className={clsx(
                      'w-7 h-7 inline-flex items-center justify-center text-xs font-mono',
                      index < 3 ? 'text-white font-bold' : 'text-white/30'
                    )}
                  >
                    {index + 1}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 border border-white/10 flex items-center justify-center text-sm shrink-0 bg-white/[0.03]">
                      {agent.avatar || agent.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white flex items-center gap-2">
                        {agent.name}
                        {agent.tokenSymbol && (
                          <span className="text-[10px] px-1.5 py-0.5 border border-white/10 text-white/30 font-mono uppercase">
                            ${agent.tokenSymbol}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-white/30 truncate max-w-[200px]">
                        {agent.description}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 hidden md:table-cell">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-white/30">
                    {CATEGORY_LABELS[agent.category]}
                  </span>
                </td>
                <td className="py-4 px-4 text-right text-sm text-white font-mono tabular-nums">
                  {formatNumber(agent.metrics.users)}
                </td>
                <td className="py-4 px-4 text-right hidden sm:table-cell">
                  <span className="text-sm text-white/50 font-mono tabular-nums">
                    {agent.metrics.rating?.toFixed(1) || '—'}
                  </span>
                </td>
                <td className="py-4 px-4 text-right text-xs text-white/40 font-mono tabular-nums hidden lg:table-cell">
                  {agent.metrics.volume ? `$${formatNumber(agent.metrics.volume)}` : '—'}
                </td>
                <td className="py-4 px-4 text-right text-xs text-white/40 font-mono tabular-nums hidden lg:table-cell">
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
