'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useAgents } from '@/hooks/useAgents';
import { AgentAnalytics } from '@/components/agents/AgentAnalytics';
import { AgentReviews } from '@/components/agents/AgentReviews';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/types/agent';
import { clsx } from 'clsx';

export default function AgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: agents, isLoading } = useAgents();
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'reviews'>('overview');

  const agent = agents?.find((a) => a.id === id);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-gray-800 rounded" />
          <div className="h-32 bg-gray-800 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 text-center">
        <p className="text-red-400 mb-4">Agent not found</p>
        <Link href="/agents" className="text-blue-400 hover:underline">
          Back to Agents
        </Link>
      </div>
    );
  }

  const categoryColor = CATEGORY_COLORS[agent.category];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <Link
        href="/agents"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Agents
      </Link>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 border border-gray-700/50 p-6 md:p-8 mb-8">
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"
          style={{ backgroundColor: `${categoryColor}10` }}
        />

        <div className="relative z-10">
          <div className="flex items-start gap-4 mb-6">
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl shrink-0"
              style={{ backgroundColor: `${categoryColor}20` }}
            >
              {agent.avatar || agent.name.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white">{agent.name}</h1>
                {agent.tokenSymbol && (
                  <span className="px-2 py-1 rounded-lg bg-gray-800 text-gray-400 text-sm">
                    ${agent.tokenSymbol}
                  </span>
                )}
                <span
                  className={clsx(
                    'px-2 py-1 rounded-full text-xs font-medium',
                    agent.status === 'live'
                      ? 'bg-green-900/30 text-green-400'
                      : agent.status === 'beta'
                      ? 'bg-yellow-900/30 text-yellow-400'
                      : 'bg-gray-800 text-gray-500'
                  )}
                >
                  {agent.status === 'live' ? 'Live' : agent.status === 'beta' ? 'Beta' : 'Soon'}
                </span>
              </div>
              <p className="text-gray-300 max-w-2xl mb-4">{agent.description}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                <span
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: `${categoryColor}20`,
                    color: categoryColor,
                  }}
                >
                  {CATEGORY_LABELS[agent.category]}
                </span>
                {agent.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-sm bg-gray-800 text-gray-400"
                  >
                    {tag}
                  </span>
                ))}
                {agent.chain && (
                  <span className="px-3 py-1 rounded-full text-sm bg-gray-800 text-gray-400 uppercase">
                    {agent.chain}
                  </span>
                )}
              </div>

              {/* Links */}
              <div className="flex flex-wrap gap-3">
                {agent.website && (
                  <a
                    href={agent.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 text-gray-400 hover:text-white rounded-lg text-sm transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    Website
                  </a>
                )}
                {agent.twitter && (
                  <a
                    href={`https://twitter.com/${agent.twitter.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 text-gray-400 hover:text-white rounded-lg text-sm transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    Twitter
                  </a>
                )}
                {/* Discord link would go here if available */}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-800/50 rounded-xl p-4">
              <div className="text-sm text-gray-400">Users</div>
              <div className="text-xl font-bold text-white">{formatNumber(agent.metrics.users)}</div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4">
              <div className="text-sm text-gray-400">Transactions</div>
              <div className="text-xl font-bold text-white">{formatNumber(agent.metrics.transactions)}</div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4">
              <div className="text-sm text-gray-400">Rating</div>
              <div className="text-xl font-bold text-white flex items-center gap-1">
                <span className="text-yellow-500">★</span> {agent.metrics.rating?.toFixed(1) || '—'}
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4">
              <div className="text-sm text-gray-400">Volume</div>
              <div className="text-xl font-bold text-white">
                {agent.metrics.volume ? `$${formatNumber(agent.metrics.volume)}` : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-gray-800">
        {(['overview', 'analytics', 'reviews'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              'px-4 py-3 text-sm font-medium transition-colors relative',
              activeTab === tab
                ? 'text-white'
                : 'text-gray-400 hover:text-white'
            )}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="glass rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">About {agent.name}</h2>
          <p className="text-gray-300 mb-6">{agent.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Details</h3>
              <dl className="space-y-2">
                <div className="flex justify-between py-2 border-b border-gray-800">
                  <dt className="text-gray-400">Category</dt>
                  <dd className="text-white">{CATEGORY_LABELS[agent.category]}</dd>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-800">
                  <dt className="text-gray-400">Chain</dt>
                  <dd className="text-white uppercase">{agent.chain || 'Multi'}</dd>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-800">
                  <dt className="text-gray-400">Status</dt>
                  <dd className="text-white capitalize">{agent.status}</dd>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-800">
                  <dt className="text-gray-400">Created</dt>
                  <dd className="text-white">{agent.createdAt}</dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {agent.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 rounded-lg bg-gray-800 text-gray-400 text-sm"
                  >
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
  );
}

function formatNumber(num: number): string {
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toLocaleString();
}
