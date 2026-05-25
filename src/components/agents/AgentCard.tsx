'use client';

import { clsx } from 'clsx';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/types/agent';
import type { Agent } from '@/types/agent';

interface AgentCardProps {
  agent: Agent;
  onClick?: () => void;
}

export function AgentCard({ agent, onClick }: AgentCardProps) {
  const categoryColor = CATEGORY_COLORS[agent.category];

  return (
    <div
      onClick={onClick}
      className="glass rounded-xl p-5 cursor-pointer hover:border-gray-600 transition-all group"
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
          style={{ backgroundColor: `${categoryColor}20` }}
        >
          {agent.avatar || agent.name.charAt(0)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-white truncate">{agent.name}</h3>
            {agent.tokenSymbol && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">
                ${agent.tokenSymbol}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-400 line-clamp-2 mb-3">
            {agent.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            <span
              className="px-2 py-0.5 rounded-full text-xs font-medium"
              style={{
                backgroundColor: `${categoryColor}20`,
                color: categoryColor,
              }}
            >
              {CATEGORY_LABELS[agent.category]}
            </span>
            {agent.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-full text-xs bg-gray-800 text-gray-400"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Metrics */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            {agent.metrics.users > 0 && (
              <span>{formatNumber(agent.metrics.users)} users</span>
            )}
            {agent.metrics.rating && (
              <span className="flex items-center gap-1">
                <span className="text-yellow-500">★</span> {agent.metrics.rating}
              </span>
            )}
            {agent.chain && (
              <span className="uppercase">{agent.chain}</span>
            )}
          </div>
        </div>

        {/* Status badge */}
        <div
          className={clsx(
            'px-2 py-1 rounded-full text-xs font-medium shrink-0',
            {
              'bg-green-900/30 text-green-400': agent.status === 'live',
              'bg-yellow-900/30 text-yellow-400': agent.status === 'beta',
              'bg-gray-800 text-gray-500': agent.status === 'coming-soon',
            }
          )}
        >
          {agent.status === 'live' ? 'Live' : agent.status === 'beta' ? 'Beta' : 'Soon'}
        </div>
      </div>
    </div>
  );
}

function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}
