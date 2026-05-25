'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useAgents } from '@/hooks/useAgents';
import { AgentAnalytics } from '@/components/agents/AgentAnalytics';
import { AgentReviews } from '@/components/agents/AgentReviews';
import { CATEGORY_LABELS } from '@/types/agent';
import { clsx } from 'clsx';

export default function AgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: agents, isLoading } = useAgents();
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'reviews'>('overview');

  const agent = agents?.find((a) => a.id === id);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="animate-pulse space-y-6">
          <div className="h-6 w-48 bg-white/5" />
          <div className="h-48 bg-white/5" />
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-16 text-center">
        <p className="text-red-400 font-mono text-sm mb-4">Agent not found</p>
        <Link href="/agents" className="text-white/40 hover:text-white text-xs font-mono transition-colors">
          ← back to agents
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      {/* Back */}
      <Link
        href="/agents"
        className="inline-flex items-center gap-2 text-white/30 hover:text-white text-xs font-mono transition-colors mb-8"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        back to agents
      </Link>

      {/* Hero */}
      <div className="border border-white/10 mb-8">
        <div className="border-b border-white/10 p-6 md:p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-14 h-14 border border-white/10 flex items-center justify-center text-2xl shrink-0 bg-white/[0.03]">
              {agent.avatar || agent.name.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-black text-white tracking-tight">{agent.name}</h1>
                {agent.tokenSymbol && (
                  <span className="text-[10px] px-2 py-0.5 border border-white/10 text-white/30 font-mono uppercase">
                    ${agent.tokenSymbol}
                  </span>
                )}
                <span
                  className={clsx(
                    'px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest border',
                    agent.status === 'live'
                      ? 'border-green-500/20 text-green-400'
                      : agent.status === 'beta'
                      ? 'border-yellow-500/20 text-yellow-400'
                      : 'border-white/10 text-white/30'
                  )}
                >
                  {agent.status === 'live' ? 'live' : agent.status === 'beta' ? 'beta' : 'soon'}
                </span>
              </div>
              <p className="text-white/40 text-sm max-w-2xl mb-4 leading-relaxed">{agent.description}</p>

              <div className="flex flex-wrap gap-1.5 mb-4">
                <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest border border-white/10 text-white/40">
                  {CATEGORY_LABELS[agent.category]}
                </span>
                {agent.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 text-[10px] font-mono text-white/20">
                    {tag}
                  </span>
                ))}
                {agent.chain && (
                  <span className="px-2 py-0.5 text-[10px] font-mono uppercase text-white/20">
                    {agent.chain}
                  </span>
                )}
              </div>

              {/* Links */}
              <div className="flex flex-wrap gap-2">
                {agent.website && (
                  <a href={agent.website} target="_blank" rel="noopener noreferrer"
                    className="px-3 py-1.5 border border-white/10 text-white/40 hover:text-white text-xs font-mono transition-colors">
                    website →
                  </a>
                )}
                {agent.twitter && (
                  <a href={`https://twitter.com/${agent.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
                    className="px-3 py-1.5 border border-white/10 text-white/40 hover:text-white text-xs font-mono transition-colors">
                    twitter →
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px border border-white/10 bg-white/10">
            {[
              { label: 'Users', value: formatNumber(agent.metrics.users) },
              { label: 'Transactions', value: formatNumber(agent.metrics.transactions) },
              { label: 'Rating', value: agent.metrics.rating?.toFixed(1) || '—' },
              { label: 'Volume', value: agent.metrics.volume ? `$${formatNumber(agent.metrics.volume)}` : 'N/A' },
            ].map((s) => (
              <div key={s.label} className="bg-black p-4">
                <p className="text-[10px] text-white/30 font-mono uppercase tracking-widest mb-1">{s.label}</p>
                <p className="text-lg font-bold text-white font-mono tabular-nums">{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-white/10 px-6">
          {(['overview', 'analytics', 'reviews'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={clsx(
                'px-4 py-3 text-xs font-mono uppercase tracking-widest transition-colors relative',
                activeTab === tab
                  ? 'text-white'
                  : 'text-white/30 hover:text-white'
              )}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-px bg-white" />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-xs font-bold text-white/60 uppercase font-mono tracking-widest mb-4">
                About {agent.name}
              </h2>
              <p className="text-white/40 text-sm mb-6 leading-relaxed">{agent.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xs font-bold text-white/60 uppercase font-mono tracking-widest mb-3">Details</h3>
                  <dl className="space-y-0">
                    {[
                      ['Category', CATEGORY_LABELS[agent.category]],
                      ['Chain', (agent.chain || 'Multi').toUpperCase()],
                      ['Status', agent.status],
                      ['Created', agent.createdAt],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between py-2 border-b border-white/5">
                        <dt className="text-white/30 text-xs font-mono">{k}</dt>
                        <dd className="text-white text-xs font-mono">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-white/60 uppercase font-mono tracking-widest mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {agent.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 text-[10px] font-mono border border-white/10 text-white/30">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && <AgentAnalytics agent={agent} />}
          {activeTab === 'reviews' && <AgentReviews agentId={agent.id} />}
        </div>
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
