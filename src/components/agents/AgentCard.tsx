'use client';

import { clsx } from 'clsx';
import { CATEGORY_LABELS } from '@/types/agent';
import type { Agent } from '@/types/agent';

interface AgentCardProps {
  agent: Agent;
  onClick?: () => void;
}

export function AgentCard({ agent, onClick }: AgentCardProps) {
  return (
    <div
      onClick={onClick}
      className="p-5 cursor-pointer hover:bg-white/[0.02] transition-colors group"
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 border border-white/10 flex items-center justify-center text-lg shrink-0 bg-white/[0.03]">
          {agent.avatar || agent.name.charAt(0)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-medium text-white truncate">{agent.name}</h3>
            {agent.tokenSymbol && (
              <span className="text-[10px] px-1.5 py-0.5 border border-white/10 text-white/30 font-mono uppercase">
                ${agent.tokenSymbol}
              </span>
            )}
          </div>
          <p className="text-xs text-white/40 line-clamp-2 mb-3 leading-relaxed">
            {agent.description}
          </p>

          <div className="flex flex-wrap gap-1.5 mb-3">
            <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest border border-white/10 text-white/40">
              {CATEGORY_LABELS[agent.category]}
            </span>
            {agent.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-[10px] font-mono text-white/20"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-4 text-[10px] text-white/20 font-mono">
            {agent.metrics.users > 0 && (
              <span>{formatNumber(agent.metrics.users)} users</span>
            )}
            {agent.metrics.rating && (
              <span>{agent.metrics.rating.toFixed(1)} rating</span>
            )}
            {agent.chain && (
              <span className="uppercase">{agent.chain}</span>
            )}
          </div>
        </div>

        <span
          className={clsx(
            'px-2 py-1 text-[10px] font-mono uppercase tracking-widest shrink-0 border',
            {
              'border-green-500/20 text-green-400': agent.status === 'live',
              'border-yellow-500/20 text-yellow-400': agent.status === 'beta',
              'border-white/10 text-white/30': agent.status === 'coming-soon',
            }
          )}
        >
          {agent.status === 'live' ? 'live' : agent.status === 'beta' ? 'beta' : 'soon'}
        </span>
      </div>
    </div>
  );
}

function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}
