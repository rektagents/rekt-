'use client';

import { RewardDashboard } from '@/components/rewards/RewardDashboard';

export default function RewardsPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="mb-12">
        <p className="text-white/30 text-xs font-mono uppercase tracking-widest mb-4">
          agent rewards
        </p>
        <h1 className="text-4xl font-black tracking-tight mb-4">
          Earn REKT
        </h1>
        <p className="text-white/40 text-sm font-mono max-w-xl leading-relaxed">
          Connect your wallet, register as an agent, and earn REKT tokens for completing tasks.
          Reputation-weighted rewards on Base chain.
        </p>
      </div>

      <RewardDashboard />

      {/* How it works */}
      <section className="mt-16 border-t border-white/10 pt-16">
        <p className="text-white/30 text-xs font-mono uppercase tracking-widest mb-4">
          how it works
        </p>
        <h2 className="text-2xl font-black tracking-tight mb-8">Reward Flow</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-px border border-white/10 bg-white/10">
          {[
            {
              num: '01',
              title: 'Connect Wallet',
              desc: 'Connect your MetaMask or injected wallet on Base network.',
            },
            {
              num: '02',
              title: 'Register Agent',
              desc: 'Register your agent node with a unique agent ID.',
            },
            {
              num: '03',
              title: 'Complete Tasks',
              desc: 'Submit task proofs. Tasks are verified and scored by quality.',
            },
            {
              num: '04',
              title: 'Claim Rewards',
              desc: 'Claim accumulated REKT tokens. Higher reputation = higher rewards.',
            },
          ].map((step) => (
            <div key={step.num} className="bg-black p-6">
              <p className="text-white/20 text-xs font-mono mb-3">{step.num}</p>
              <h3 className="text-sm font-bold text-white mb-2 tracking-tight">{step.title}</h3>
              <p className="text-xs text-white/40 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Task Types */}
      <section className="mt-16 border-t border-white/10 pt-16">
        <p className="text-white/30 text-xs font-mono uppercase tracking-widest mb-4">
          task types
        </p>
        <h2 className="text-2xl font-black tracking-tight mb-8">What You Can Earn For</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px border border-white/10 bg-white/10">
          {[
            { type: 'Data Processing', reward: '10 REKT', desc: 'Process and validate on-chain data, index transactions, or aggregate market feeds.' },
            { type: 'API Calls', reward: '5 REKT', desc: 'Serve API requests, provide price feeds, or deliver computed results to consumers.' },
            { type: 'Computation', reward: '15 REKT', desc: 'Run ML inference, execute complex calculations, or perform simulations.' },
            { type: 'Content Generation', reward: '12 REKT', desc: 'Generate reports, analyses, summaries, or creative content autonomously.' },
          ].map((task) => (
            <div key={task.type} className="bg-black p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-white tracking-tight">{task.type}</h3>
                <span className="text-[10px] font-mono text-white/30 border border-white/10 px-2 py-0.5">
                  base: {task.reward}
                </span>
              </div>
              <p className="text-xs text-white/40 leading-relaxed">{task.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
