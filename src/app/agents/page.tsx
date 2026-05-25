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
    <div>
      {/* Hero */}
      <section className="relative min-h-[50vh] flex flex-col justify-center grid-bg overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-6 py-24">
          <div className="fade-up-1 mb-6">
            <span className="text-white/40 text-xs border border-white/10 px-3 py-1 font-mono">
              for agent builders · autonomous · on-chain
            </span>
          </div>
          <h1 className="fade-up-2 text-5xl sm:text-6xl font-black tracking-tighter leading-none mb-6">
            Build agents.
            <br />
            <span className="text-white/20">Get REKT.</span>
          </h1>
          <p className="fade-up-3 text-white/50 text-lg max-w-2xl mb-8 leading-relaxed font-mono">
            The ultimate platform for AI agent builders. Track agent tokens, discover new agents,
            and access the tools to build autonomous agents.
          </p>
          <div className="fade-up-4 flex flex-wrap gap-4">
            <button
              onClick={() => setShowSubmitModal(true)}
              className="bg-white text-black px-6 py-3 text-sm font-bold font-mono hover:bg-white/90 transition-colors"
            >
              submit your agent →
            </button>
            <a
              href="#leaderboard"
              className="border border-white/20 px-6 py-3 text-sm text-white/70 hover:text-white hover:border-white transition-colors font-mono"
            >
              leaderboard →
            </a>
            <a
              href="#tokens"
              className="border border-white/10 bg-white/[0.03] px-6 py-3 text-sm text-white/55 hover:text-white hover:border-white/30 transition-colors font-mono"
            >
              agent tokens →
            </a>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Leaderboard */}
        <section id="leaderboard" className="mb-16">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <p className="text-white/30 text-xs font-mono uppercase tracking-widest mb-2">
                performance
              </p>
              <h2 className="text-2xl font-black tracking-tight">Agent Leaderboard</h2>
            </div>
            <div className="flex items-center gap-1">
              {(['users', 'rating', 'volume', 'transactions'] as const).map((sort) => (
                <button
                  key={sort}
                  onClick={() => setLeaderboardSort(sort)}
                  className={`px-3 py-1.5 text-xs font-mono transition-colors border ${
                    leaderboardSort === sort
                      ? 'border-white/20 text-white bg-white/[0.03]'
                      : 'border-transparent text-white/30 hover:text-white'
                  }`}
                >
                  {sort}
                </button>
              ))}
            </div>
          </div>
          {agents && <AgentLeaderboard agents={agents} sortBy={leaderboardSort} />}
        </section>

        {/* Featured Agents */}
        {featured && featured.length > 0 && (
          <section className="mb-16">
            <p className="text-white/30 text-xs font-mono uppercase tracking-widest mb-2">
              curated
            </p>
            <h2 className="text-2xl font-black tracking-tight mb-8">Featured Agents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px border border-white/10 bg-white/10">
              {featured.map((agent) => (
                <div key={agent.id} className="bg-black">
                  <Link href={`/agents/${agent.id}`} className="block hover:bg-white/[0.02] transition-colors">
                    <AgentCard agent={agent} />
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Agent Tokens */}
        <section id="tokens" className="mb-16">
          <p className="text-white/30 text-xs font-mono uppercase tracking-widest mb-2">
            live prices
          </p>
          <h2 className="text-2xl font-black tracking-tight mb-2">Agent Tokens</h2>
          <p className="text-white/40 text-sm font-mono mb-8">
            AI agent tokens with live prices and market data
          </p>
          <AgentTokens />
        </section>

        {/* All Agents */}
        <section className="mb-16">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <p className="text-white/30 text-xs font-mono uppercase tracking-widest mb-2">
                directory
              </p>
              <h2 className="text-2xl font-black tracking-tight">All Agents</h2>
            </div>
            <div className="flex flex-wrap gap-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-mono transition-colors border ${
                    selectedCategory === cat
                      ? 'border-white/20 text-white bg-white/[0.03]'
                      : 'border-transparent text-white/30 hover:text-white'
                  }`}
                >
                  {cat === 'all' ? 'all' : CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-white/30 font-mono text-sm">Loading agents...</div>
          ) : filteredAgents && filteredAgents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px border border-white/10 bg-white/10">
              {filteredAgents.map((agent) => (
                <div key={agent.id} className="bg-black">
                  <Link href={`/agents/${agent.id}`} className="block hover:bg-white/[0.02] transition-colors">
                    <AgentCard agent={agent} />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-white/30 font-mono text-sm">
              No agents found in this category
            </div>
          )}
        </section>

        {/* Builder Tools */}
        <section id="tools" className="mb-16">
          <p className="text-white/30 text-xs font-mono uppercase tracking-widest mb-2">
            infrastructure
          </p>
          <h2 className="text-2xl font-black tracking-tight mb-2">Builder Tools</h2>
          <p className="text-white/40 text-sm font-mono mb-8">
            Everything you need to build, deploy, and scale autonomous agents
          </p>
          <BuilderTools />
        </section>

        {/* CTA */}
        <section className="border-t border-white/10 py-24 text-center">
          <h2 className="text-5xl font-black tracking-tight mb-4">Ready to Build?</h2>
          <p className="text-white/40 font-mono text-sm mb-8 max-w-md mx-auto">
            Join the next generation of agent builders. Start building autonomous agents today.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => setShowSubmitModal(true)}
              className="bg-white text-black px-8 py-3 text-sm font-bold font-mono hover:bg-white/90 transition-colors"
            >
              submit your agent →
            </button>
            <a
              href="https://github.com/kenabestilla/rekt-"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-white/20 px-8 py-3 text-sm text-white/70 hover:text-white hover:border-white transition-colors font-mono"
            >
              github →
            </a>
          </div>
        </section>
      </div>

      <SubmitAgentModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        onSubmit={(agent) => {
          console.log('Agent submitted:', agent);
        }}
      />
    </div>
  );
}
