'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAgents, useFeaturedAgents, useSubmitAgent, useDiscoverAgents } from '@/hooks/useAgents';
import { useWallet } from '@/hooks/useWallet';
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

const PAGE_SIZE = 12;

export default function AgentsPage() {
  const [selectedCategory, setSelectedCategory] = useState<AgentCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'users' | 'rating'>('name');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [leaderboardSort, setLeaderboardSort] = useState<'users' | 'rating' | 'volume' | 'transactions'>('users');
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'directory' | 'leaderboard' | 'tokens'>('directory');
  const [dataSource, setDataSource] = useState<'all' | 'local' | 'virtuals'>('all');

  const { data: agentsData, isLoading } = useAgents();
  const { data: featuredData } = useFeaturedAgents();
  const { data: discoverData, isLoading: isDiscovering } = useDiscoverAgents({
    category: selectedCategory !== 'all' ? selectedCategory : undefined,
    sort: sortBy === 'users' ? 'users' : sortBy === 'rating' ? 'volume' : 'name',
    page,
    pageSize: 50,
    query: searchQuery || undefined,
  });
  const submitAgent = useSubmitAgent();
  const { address } = useWallet();
  const localAgents = agentsData?.agents || [];
  const virtualsAgents = discoverData?.agents || [];
  const featured = featuredData?.agents || [];

  // Merge local + virtuals agents, dedup by name
  const agents = useMemo(() => {
    if (dataSource === 'local') return localAgents;
    if (dataSource === 'virtuals') return virtualsAgents;

    // Merge: local agents first, then virtuals (dedup by name)
    const seen = new Set(localAgents.map((a: any) => a.name?.toLowerCase()));
    const merged = [...localAgents];
    for (const va of virtualsAgents) {
      if (!seen.has(va.name?.toLowerCase())) {
        merged.push(va);
        seen.add(va.name?.toLowerCase());
      }
    }
    return merged;
  }, [localAgents, virtualsAgents, dataSource]);

  const filteredAgents = useMemo(() => {
    let result = agents.filter((a: any) => {
      const matchesCategory = selectedCategory === 'all' || a.category === selectedCategory;
      const matchesSearch = !searchQuery ||
        a.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    result.sort((a: any, b: any) => {
      if (sortBy === 'users') return (b.metrics?.users || b.users_count || 0) - (a.metrics?.users || a.users_count || 0);
      if (sortBy === 'rating') return (b.metrics?.rating || b.rating || 0) - (a.metrics?.rating || a.rating || 0);
      return (a.name || '').localeCompare(b.name || '');
    });

    return result;
  }, [agents, selectedCategory, searchQuery, sortBy]);

  const totalPages = Math.ceil(filteredAgents.length / PAGE_SIZE);
  const paginatedAgents = filteredAgents.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[40vh] flex flex-col justify-center grid-bg overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-6 py-20">
          <div className="fade-up-1 mb-6">
            <span className="text-white/40 text-xs border border-white/10 px-3 py-1 font-mono">
              discover · build · deploy
            </span>
          </div>
          <h1 className="fade-up-2 text-4xl sm:text-6xl font-black tracking-tighter leading-none mb-4">
            Build agents.<br />
            <span className="text-white/20">Get REKT.</span>
          </h1>
          <p className="fade-up-3 text-white/50 text-sm font-mono max-w-xl mb-8">
            The agent directory on Base. Discover, track, and deploy autonomous agents.
          </p>
          <div className="fade-up-4 flex flex-wrap gap-3">
            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-5 py-2.5 bg-white text-black text-xs font-mono font-bold hover:bg-white/90 transition-colors"
            >
              Submit your agent
            </button>
            <Link
              href="/leaderboard"
              className="px-5 py-2.5 border border-white/20 text-white/70 text-xs font-mono hover:text-white hover:border-white transition-colors"
            >
              Leaderboard
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Featured agents */}
        {featured.length > 0 && (
          <section className="mb-16">
            <h2 className="text-xs font-bold text-white/60 uppercase font-mono tracking-widest mb-6">
              Featured Agents
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px border border-white/10 bg-white/10">
              {featured.map((agent: any) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          </section>
        )}

        {/* Tab navigation */}
        <div className="flex gap-1 mb-8 border-b border-white/10">
          {[
            { id: 'directory' as const, label: 'Directory', count: filteredAgents.length },
            { id: 'leaderboard' as const, label: 'Leaderboard' },
            { id: 'tokens' as const, label: 'Tokens' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-xs font-mono transition-colors border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'border-white text-white'
                  : 'border-transparent text-white/30 hover:text-white/60'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-2 text-white/20">{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Directory tab */}
        {activeTab === 'directory' && (
          <section>
            {/* Source toggle */}
            <div className="flex gap-1 mb-4">
              {[
                { id: 'all' as const, label: 'All Sources' },
                { id: 'virtuals' as const, label: 'Virtuals Protocol' },
                { id: 'local' as const, label: 'REKT Directory' },
              ].map((src) => (
                <button
                  key={src.id}
                  onClick={() => { setDataSource(src.id); setPage(1); }}
                  className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest transition-colors border ${
                    dataSource === src.id
                      ? 'border-white/30 text-white bg-white/5'
                      : 'border-white/10 text-white/30 hover:text-white hover:border-white/20'
                  }`}
                >
                  {src.label}
                </button>
              ))}
              {discoverData?.source && (
                <span className="ml-auto text-[10px] text-white/20 font-mono">
                  {discoverData.total || 0} agents discovered
                </span>
              )}
            </div>

            {/* Search + filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="flex-1 relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                  placeholder="Search 43,000+ agents..."
                  className="w-full bg-white/5 border border-white/10 text-white pl-10 pr-4 py-2.5 font-mono text-sm focus:outline-none focus:border-white/30 placeholder-white/20"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="bg-white/5 border border-white/10 text-white/50 px-3 py-2.5 font-mono text-xs focus:outline-none focus:border-white/30"
              >
                <option value="name">Sort: Name</option>
                <option value="users">Sort: Users</option>
                <option value="rating">Sort: Rating</option>
              </select>
            </div>

            {/* Category pills */}
            <div className="flex flex-wrap gap-1.5 mb-6">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setSelectedCategory(cat); setPage(1); }}
                  className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest transition-colors border ${
                    selectedCategory === cat
                      ? 'border-white/30 text-white bg-white/5'
                      : 'border-white/10 text-white/30 hover:text-white hover:border-white/20'
                  }`}
                >
                  {cat === 'all' ? 'All' : CATEGORY_LABELS[cat] || cat}
                </button>
              ))}
            </div>

            {/* Agent grid */}
            {isLoading || isDiscovering ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px border border-white/10 bg-white/10">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-black p-5 animate-pulse">
                    <div className="h-4 bg-white/5 w-3/4 mb-3" />
                    <div className="h-3 bg-white/5 w-1/2 mb-2" />
                    <div className="h-3 bg-white/5 w-full" />
                  </div>
                ))}
              </div>
            ) : paginatedAgents.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px border border-white/10 bg-white/10">
                  {paginatedAgents.map((agent: any) => (
                    <AgentCard key={agent.id} agent={agent} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <p className="text-white/30 text-xs font-mono">
                      Showing {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, filteredAgents.length)} of {filteredAgents.length}
                    </p>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3 py-1.5 border border-white/10 text-white/40 text-xs font-mono hover:text-white disabled:opacity-30 transition-colors"
                      >
                        Prev
                      </button>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                        if (pageNum > totalPages) return null;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`px-3 py-1.5 border text-xs font-mono transition-colors ${
                              page === pageNum
                                ? 'border-white/30 text-white bg-white/5'
                                : 'border-white/10 text-white/30 hover:text-white'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-3 py-1.5 border border-white/10 text-white/40 text-xs font-mono hover:text-white disabled:opacity-30 transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16 border border-white/10">
                <p className="text-white/30 font-mono text-sm mb-2">No agents found</p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-white/40 text-xs font-mono hover:text-white transition-colors"
                  >
                    Clear search
                  </button>
                )}
              </div>
            )}
          </section>
        )}

        {/* Leaderboard tab */}
        {activeTab === 'leaderboard' && (
          <section>
            <div className="flex gap-1 mb-6">
              {(['users', 'rating', 'volume', 'transactions'] as const).map((sort) => (
                <button
                  key={sort}
                  onClick={() => setLeaderboardSort(sort)}
                  className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest transition-colors border ${
                    leaderboardSort === sort
                      ? 'border-white/30 text-white bg-white/5'
                      : 'border-white/10 text-white/30 hover:text-white'
                  }`}
                >
                  {sort}
                </button>
              ))}
            </div>
            <AgentLeaderboard agents={agents} sortBy={leaderboardSort} />
          </section>
        )}

        {/* Tokens tab */}
        {activeTab === 'tokens' && (
          <section>
            <AgentTokens />
          </section>
        )}

        {/* Builder tools */}
        <section className="mt-16">
          <h2 className="text-xs font-bold text-white/60 uppercase font-mono tracking-widest mb-6">
            Builder Tools
          </h2>
          <BuilderTools />
        </section>

        {/* CTA */}
        <section className="mt-16 border border-white/10 p-8 text-center">
          <h2 className="text-xl font-black tracking-tight mb-3">Build on REKT</h2>
          <p className="text-white/40 text-sm font-mono mb-6 max-w-md mx-auto">
            Submit your agent to the directory. Get discovered by builders and traders on Base.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-6 py-3 bg-white text-black text-xs font-mono font-bold hover:bg-white/90 transition-colors"
            >
              Submit your agent
            </button>
            <a
              href="https://github.com/kenabestilla/rekt-"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 border border-white/20 text-white/70 text-xs font-mono hover:text-white hover:border-white transition-colors"
            >
              GitHub
            </a>
          </div>
        </section>
      </div>

      {/* Submit modal */}
      {showSubmitModal && (
        <SubmitAgentModal
          isOpen={showSubmitModal}
          onClose={() => setShowSubmitModal(false)}
          onSubmit={(data) => {
            submitAgent.mutate({ ...data, creator_wallet: address || '' });
            setShowSubmitModal(false);
          }}
        />
      )}
    </div>
  );
}
