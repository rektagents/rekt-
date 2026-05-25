'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAgents, useFeaturedAgents } from '@/hooks/useAgents';
import { AgentCard } from '@/components/agents/AgentCard';
import { AgentTokens } from '@/components/agents/AgentTokens';
import { AgentLeaderboard } from '@/components/agents/AgentLeaderboard';
import { BuilderTools } from '@/components/agents/BuilderTools';
import { SubmitAgentModal } from '@/components/agents/SubmitAgentModal';
import { CATEGORY_LABELS } from '@/types/agent';
import type { AgentCategory } from '@/types/agent';

const categories: (AgentCategory | 'all')[] = [
  'all',
  'defi',
  'trading',
  'research',
  'social',
  'coding',
  'gaming',
  'data',
];

export default function AgentsPage() {
  const { data: agents, isLoading } = useAgents();
  const { data: featured } = useFeaturedAgents();
  const [selectedCategory, setSelectedCategory] = useState<AgentCategory | 'all'>('all');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [leaderboardSort, setLeaderboardSort] = useState<'users' | 'rating' | 'volume' | 'transactions'>('users');

  const filteredAgents = agents?.filter(
    (a) => selectedCategory === 'all' || a.category === selectedCategory
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900/50 via-gray-900 to-blue-900/50 border border-gray-700/50 p-8 mb-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <div className="text-sm text-purple-400 mb-2">For Agent Builders</div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Build. Deploy. Get <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">REKT</span>.
          </h1>
          <p className="text-gray-300 max-w-2xl mb-6">
            The ultimate platform for AI agent builders. Track agent tokens, discover new agents,
            and access the tools you need to build the future of autonomous agents.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Submit Your Agent
            </button>
            <a
              href="#leaderboard"
              className="px-5 py-2.5 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors backdrop-blur-sm"
            >
              Leaderboard
            </a>
            <a
              href="#tokens"
              className="px-5 py-2.5 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors backdrop-blur-sm"
            >
              Agent Tokens
            </a>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <section id="leaderboard" className="mb-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Agent Leaderboard</h2>
            <p className="text-gray-400 text-sm mt-1">Top agents ranked by performance</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Sort by:</span>
            {(['users', 'rating', 'volume', 'transactions'] as const).map((sort) => (
              <button
                key={sort}
                onClick={() => setLeaderboardSort(sort)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  leaderboardSort === sort
                    ? 'bg-white text-gray-900'
                    : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                {sort.charAt(0).toUpperCase() + sort.slice(1)}
              </button>
            ))}
          </div>
        </div>
        {agents && <AgentLeaderboard agents={agents} sortBy={leaderboardSort} />}
      </section>

      {/* Featured Agents */}
      {featured && featured.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-bold text-white mb-4">Featured Agents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map((agent) => (
              <Link key={agent.id} href={`/agents/${agent.id}`}>
                <AgentCard agent={agent} />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Agent Tokens */}
      <section id="tokens" className="mb-12">
        <h2 className="text-xl font-bold text-white mb-4">Agent Tokens</h2>
        <p className="text-gray-400 mb-6">
          Track AI agent tokens with live prices and market data
        </p>
        <AgentTokens />
      </section>

      {/* All Agents */}
      <section className="mb-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-white">All Agents</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-white text-gray-900'
                    : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                {cat === 'all' ? 'All' : CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading agents...</div>
        ) : filteredAgents && filteredAgents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAgents.map((agent) => (
              <Link key={agent.id} href={`/agents/${agent.id}`}>
                <AgentCard agent={agent} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            No agents found in this category
          </div>
        )}
      </section>

      {/* Builder Tools */}
      <section id="tools" className="mb-12">
        <h2 className="text-xl font-bold text-white mb-4">Builder Tools</h2>
        <p className="text-gray-400 mb-6">
          Everything you need to build, deploy, and scale your AI agents
        </p>
        <BuilderTools />
      </section>

      {/* CTA */}
      <section className="text-center py-12">
        <h2 className="text-2xl font-bold text-white mb-4">Ready to Build?</h2>
        <p className="text-gray-400 mb-6 max-w-md mx-auto">
          Join the next generation of agent builders. Start building autonomous agents today.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Submit Your Agent
          </button>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
          >
            GitHub
          </a>
        </div>
      </section>

      {/* Submit Agent Modal */}
      <SubmitAgentModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        onSubmit={(agent) => {
          console.log('Agent submitted:', agent);
          // In production, send to API
        }}
      />
    </div>
  );
}
