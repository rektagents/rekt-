'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { formatEther } from 'viem';
import {
  useCreateProposal,
  useCastVote,
  useExecuteProposal,
  useProposal,
  useProposalState,
} from '@/hooks/useProtocol';
import { AGENT_GOVERNANCE_ADDRESS, AGENT_STAKING_ADDRESS } from '@/lib/contracts';

const STATUS_STYLES: Record<string, string> = {
  Pending: 'text-yellow-400 border-yellow-400/30',
  Active: 'text-green-400 border-green-400/30',
  Succeeded: 'text-purple-400 border-purple-400/30',
  Executed: 'text-blue-400 border-blue-400/30',
  Defeated: 'text-red-400 border-red-400/30',
  Cancelled: 'text-white/30 border-white/10',
};

export default function GovernancePage() {
  const { address, isConnected } = useAccount();
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    async function fetchProposals() {
      try {
        const res = await fetch('/api/governance/proposals');
        const data = await res.json();
        setProposals(data.proposals || []);
      } catch (err) {
        console.error('Failed to fetch proposals:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProposals();
  }, []);

  const isOnChain = !!AGENT_GOVERNANCE_ADDRESS;

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[40vh] flex flex-col justify-center grid-bg overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-6 py-20">
          <div className="fade-up-1 mb-6">
            <span className="text-white/40 text-xs border border-white/10 px-3 py-1 font-mono">
              on-chain voting · staked REKT · protocol governance
            </span>
          </div>
          <h1 className="fade-up-2 text-5xl sm:text-6xl font-black tracking-tighter leading-none mb-6">
            Governance
          </h1>
          <p className="fade-up-3 text-white/50 text-lg max-w-2xl mb-8 leading-relaxed font-mono">
            Vote on protocol parameters. Voting power = staked REKT. Proposals need 10% quorum to pass.
          </p>
          {isConnected && isOnChain && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="fade-up-4 px-6 py-3 bg-white text-black font-mono text-sm font-bold hover:bg-white/90 transition-colors"
            >
              + Create Proposal
            </button>
          )}
          {!isOnChain && (
            <p className="mt-4 text-yellow-400/60 text-xs font-mono">
              Governance contracts not deployed yet.
            </p>
          )}
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Proposals', value: proposals.length.toString() },
            { label: 'Active', value: proposals.filter(p => p.status === 'active').length.toString() },
            { label: 'Passed', value: proposals.filter(p => p.status === 'succeeded' || p.status === 'executed').length.toString() },
            { label: 'Voting Period', value: '~1 week' },
          ].map((stat) => (
            <div key={stat.label} className="border border-white/10 p-4">
              <p className="text-white/40 text-xs font-mono mb-1">{stat.label}</p>
              <p className="text-white font-mono text-xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Proposals */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <h2 className="text-white font-mono text-sm font-bold mb-6 uppercase tracking-wider">Proposals</h2>
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        ) : proposals.length === 0 ? (
          <div className="text-center py-20 border border-white/10">
            <p className="text-white/40 font-mono text-sm">No proposals yet</p>
            <p className="text-white/20 font-mono text-xs mt-2">Stake REKT to create or vote on proposals</p>
          </div>
        ) : (
          <div className="space-y-3">
            {proposals.map((proposal) => (
              <ProposalCard key={proposal.id} proposal={proposal} />
            ))}
          </div>
        )}
      </section>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateProposalModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}

function ProposalCard({ proposal }: { proposal: any }) {
  const { address } = useAccount();
  const statusStyle = STATUS_STYLES[proposal.status] || 'text-white/40 border-white/10';
  const totalVotes = parseFloat(proposal.for_votes || 0) + parseFloat(proposal.against_votes || 0);
  const forPercent = totalVotes > 0 ? (parseFloat(proposal.for_votes || 0) / totalVotes) * 100 : 50;
  const [voting, setVoting] = useState(false);

  const handleVote = async (support: boolean) => {
    if (!address) return;
    setVoting(true);
    try {
      await fetch(`/api/governance/proposals?id=${proposal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          support,
          voter_address: address,
        }),
      });
      // Refresh the page to show updated votes
      window.location.reload();
    } catch (err) {
      console.error('Failed to vote:', err);
    } finally {
      setVoting(false);
    }
  };

  return (
    <div className="border border-white/10 hover:border-white/20 transition-all p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-white/30 font-mono text-xs">#{proposal.onchain_proposal_id || '?'}</span>
          <span className={`text-[10px] font-mono px-2 py-0.5 border ${statusStyle}`}>
            {proposal.status?.toUpperCase()}
          </span>
        </div>
        <span className="text-white/30 text-[10px] font-mono">
          {new Date(proposal.created_at).toLocaleDateString()}
        </span>
      </div>
      <h3 className="text-white font-bold text-sm mb-2">{proposal.title}</h3>
      <p className="text-white/40 text-xs font-mono mb-4 line-clamp-2">{proposal.description}</p>

      {/* Vote bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-[10px] font-mono text-white/40 mb-1">
          <span>For: {parseFloat(proposal.for_votes || 0).toLocaleString()} REKT</span>
          <span>Against: {parseFloat(proposal.against_votes || 0).toLocaleString()} REKT</span>
        </div>
        <div className="h-1.5 bg-white/5 w-full">
          <div
            className="h-full bg-green-400 transition-all"
            style={{ width: `${forPercent}%` }}
          />
        </div>
      </div>

      {/* Vote buttons */}
      {address && proposal.status === 'active' && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-white/5">
          <button
            onClick={() => handleVote(true)}
            disabled={voting}
            className="flex-1 px-4 py-2 border border-green-500/30 text-green-400 text-xs font-mono font-bold hover:bg-green-500/10 transition-colors disabled:opacity-50"
          >
            {voting ? '...' : 'Vote For'}
          </button>
          <button
            onClick={() => handleVote(false)}
            disabled={voting}
            className="flex-1 px-4 py-2 border border-red-500/30 text-red-400 text-xs font-mono font-bold hover:bg-red-500/10 transition-colors disabled:opacity-50"
          >
            {voting ? '...' : 'Vote Against'}
          </button>
        </div>
      )}
    </div>
  );
}

function CreateProposalModal({ onClose }: { onClose: () => void }) {
  const { address, isConnected } = useAccount();
  const { propose, isPending, isSuccess } = useCreateProposal();
  const [form, setForm] = useState({
    title: '',
    description: '',
    targetContract: '',
    callData: '',
  });

  useEffect(() => {
    if (isSuccess) onClose();
  }, [isSuccess, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) return;

    // Save to Supabase
    try {
      await fetch('/api/governance/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          proposer_address: address,
          target_contract: form.targetContract || null,
          call_data: form.callData || null,
        }),
      });

      // Post on-chain
      propose(
        form.title,
        form.description,
        (form.targetContract || '0x' + '0'.repeat(40)) as `0x${string}`,
        (form.callData || '0x') as `0x${string}`
      );
    } catch (err) {
      console.error('Failed to create proposal:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-black border border-white/20 p-8 max-w-lg w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-bold text-lg font-mono">Create Proposal</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white/40 text-xs font-mono mb-1">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 font-mono text-sm focus:outline-none focus:border-white/30"
              placeholder="Increase platform fee to 5%"
              required
            />
          </div>

          <div>
            <label className="block text-white/40 text-xs font-mono mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 font-mono text-sm focus:outline-none focus:border-white/30 h-24 resize-none"
              placeholder="Explain the rationale..."
              required
            />
          </div>

          <div>
            <label className="block text-white/40 text-xs font-mono mb-1">Target Contract (optional)</label>
            <input
              type="text"
              value={form.targetContract}
              onChange={(e) => setForm({ ...form, targetContract: e.target.value })}
              className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 font-mono text-sm focus:outline-none focus:border-white/30"
              placeholder="0x..."
            />
          </div>

          <button
            type="submit"
            disabled={isPending || !isConnected}
            className="w-full px-6 py-3 bg-white text-black font-mono text-sm font-bold hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Creating...' : 'Submit Proposal'}
          </button>
        </form>
      </div>
    </div>
  );
}
