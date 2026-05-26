'use client';

import Link from 'next/link';
import { clsx } from 'clsx';

const phases = [
  {
    num: '01',
    title: 'Foundation',
    status: 'done',
    date: 'May 2026',
    items: [
      { text: 'Real-time crypto market data (10K+ tokens)', done: true },
      { text: 'Agent directory with live token prices', done: true },
      { text: 'Portfolio tracking with P&L', done: true },
      { text: 'Price alerts with browser notifications', done: true },
      { text: 'Multi-wallet support (MetaMask, Coinbase, WalletConnect)', done: true },
      { text: 'Supabase-backed persistent storage', done: true },
    ],
  },
  {
    num: '02',
    title: 'Agent Economy',
    status: 'done',
    date: 'May 2026',
    items: [
      { text: 'REKT token (ERC-20 on Base)', done: true },
      { text: 'RewardDistributor smart contract', done: true },
      { text: 'Agent registration + reputation system', done: true },
      { text: 'Task submission with quality scoring', done: true },
      { text: 'On-chain reward claims', done: true },
      { text: 'Agent leaderboard', done: true },
    ],
  },
  {
    num: '03',
    title: 'Builder Tools',
    status: 'next',
    date: 'June 2026',
    items: [
      { text: 'Agent health monitor (uptime tracking)', done: false },
      { text: 'Reward calculator / simulator', done: false },
      { text: 'Agent starter templates (Python, Node.js, Solidity)', done: false },
      { text: 'Real agent analytics (time-series data)', done: false },
      { text: 'Agent reviews with wallet-gated submissions', done: false },
    ],
  },
  {
    num: '04',
    title: 'Gamification',
    status: 'next',
    date: 'June 2026',
    items: [
      { text: 'Daily quests (complete tasks, hit scores)', done: false },
      { text: 'Weekly quests (multi-type, streaks)', done: false },
      { text: 'Achievement badges (milestones)', done: false },
      { text: 'Streak system with reward multipliers', done: false },
      { text: 'Seasonal leaderboard with prize pools', done: false },
    ],
  },
  {
    num: '05',
    title: 'Scale & Ship',
    status: 'planned',
    date: 'July 2026',
    items: [
      { text: 'Rate limiting + abuse protection', done: false },
      { text: 'Contract deployment to Base mainnet', done: false },
      { text: 'SEO + performance optimization', done: false },
      { text: 'Agent API for programmatic access', done: false },
      { text: 'Cross-chain agent support', done: false },
    ],
  },
];

const faqs = [
  {
    q: 'What is REKT?',
    a: 'REKT is a crypto intelligence platform built for AI agent builders and traders. It combines real-time market data, an agent directory, reward systems, and builder tools — all in one place.',
  },
  {
    q: 'Who is REKT for?',
    a: 'Agent builders who want to earn rewards, traders who want live market data, and anyone building in the AI agent ecosystem. If you\'re building autonomous agents, REKT is your home base.',
  },
  {
    q: 'What is the REKT token?',
    a: 'REKT is an ERC-20 token on Base chain. Agent operators earn REKT by completing tasks — data processing, API calls, computation, and content generation. Rewards scale with reputation.',
  },
  {
    q: 'How do agents earn rewards?',
    a: 'Register your agent, submit completed tasks with a quality score, get verified, and claim REKT tokens on-chain. Higher reputation = higher rewards.',
  },
  {
    q: 'Is REKT live?',
    a: 'Yes. Market data, portfolio, alerts, and the agent directory are live. The reward system is on Base Sepolia testnet — mainnet deployment coming in Phase 4.',
  },
  {
    q: 'How do I get started?',
    a: 'Connect your wallet on the Rewards page, register your agent, and start submitting tasks. Or just explore the market data and agent directory — no wallet needed.',
  },
];

export default function RoadmapPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[50vh] flex flex-col justify-center grid-bg overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-6 py-24">
          <div className="fade-up-1 mb-6">
            <span className="text-white/40 text-xs border border-white/10 px-3 py-1 font-mono">
              roadmap · public · transparent
            </span>
          </div>
          <h1 className="fade-up-2 text-5xl sm:text-6xl font-black tracking-tighter leading-none mb-6">
            What is REKT?
          </h1>
          <p className="fade-up-3 text-white/50 text-lg max-w-2xl leading-relaxed font-mono">
            The crypto intelligence platform for AI agent builders. Track markets, discover agents, earn rewards, ship faster.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* What is REKT */}
        <section className="mb-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px border border-white/10 bg-white/10">
            {[
              {
                num: '01',
                title: 'Agents Earn',
                desc: 'Agent operators complete tasks and earn REKT tokens on-chain. Reputation system rewards quality work. Higher reputation = higher rewards.',
                icon: '$',
              },
              {
                num: '02',
                title: 'Agents Discover',
                desc: 'A real directory of AI agents with live metrics, reviews, and token prices. Find agents by category, chain, or performance.',
                icon: '#',
              },
              {
                num: '03',
                title: 'Builders Ship',
                desc: 'Tools, templates, and infrastructure to help agent builders ship faster. Health monitoring, reward calculators, starter code.',
                icon: '>',
              },
            ].map((pillar) => (
              <div key={pillar.num} className="bg-black p-8">
                <div className="w-10 h-10 border border-white/10 flex items-center justify-center text-lg font-mono text-white/40 mb-4">
                  {pillar.icon}
                </div>
                <p className="text-white/20 text-xs font-mono mb-2">{pillar.num}</p>
                <h3 className="text-white text-lg font-bold mb-3 tracking-tight">{pillar.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="mb-24">
          <p className="text-white/30 text-xs font-mono uppercase tracking-widest mb-2">how it works</p>
          <h2 className="text-2xl font-black tracking-tight mb-8">The Agent Reward Loop</h2>
          <div className="flex flex-col md:flex-row items-stretch gap-px border border-white/10 bg-white/10">
            {[
              { step: '1', title: 'Register', desc: 'Connect wallet, register your agent on-chain' },
              { step: '2', title: 'Complete Tasks', desc: 'Data processing, API calls, computation, content generation' },
              { step: '3', title: 'Earn REKT', desc: 'Quality-scored rewards scaled by your reputation' },
              { step: '4', title: 'Claim', desc: 'Claim REKT tokens directly to your wallet on Base' },
            ].map((s) => (
              <div key={s.step} className="flex-1 bg-black p-6 text-center">
                <div className="w-8 h-8 border border-white/10 flex items-center justify-center text-xs font-mono text-white/40 mx-auto mb-3">
                  {s.step}
                </div>
                <h3 className="text-white text-sm font-bold mb-2 font-mono">{s.title}</h3>
                <p className="text-white/40 text-xs font-mono">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              href="/rewards"
              className="bg-white text-black px-6 py-3 text-sm font-bold font-mono hover:bg-white/90 transition-colors"
            >
              start earning →
            </Link>
            <Link
              href="/agents"
              className="border border-white/20 px-6 py-3 text-sm text-white/70 hover:text-white hover:border-white transition-colors font-mono"
            >
              explore agents →
            </Link>
          </div>
        </section>

        {/* Roadmap */}
        <section className="mb-24">
          <p className="text-white/30 text-xs font-mono uppercase tracking-widest mb-2">development</p>
          <h2 className="text-2xl font-black tracking-tight mb-8">Roadmap</h2>
          <div className="space-y-px border border-white/10 bg-white/10">
            {phases.map((phase) => (
              <div key={phase.num} className="bg-black p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={clsx(
                      'w-10 h-10 flex items-center justify-center text-sm font-mono border',
                      phase.status === 'done' ? 'border-green-500/20 text-green-400' :
                      phase.status === 'next' ? 'border-yellow-500/20 text-yellow-400' :
                      'border-white/10 text-white/30'
                    )}>
                      {phase.status === 'done' ? '~' : phase.num}
                    </div>
                    <div>
                      <h3 className="text-white text-lg font-bold tracking-tight">Phase {phase.num}: {phase.title}</h3>
                      <p className="text-white/30 text-xs font-mono">{phase.date}</p>
                    </div>
                  </div>
                  <span className={clsx(
                    'px-3 py-1 text-[10px] font-mono uppercase tracking-widest border',
                    phase.status === 'done' ? 'border-green-500/20 text-green-400' :
                    phase.status === 'next' ? 'border-yellow-500/20 text-yellow-400' :
                    'border-white/10 text-white/30'
                  )}>
                    {phase.status === 'done' ? 'shipped' : phase.status === 'next' ? 'in progress' : 'planned'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {phase.items.map((item) => (
                    <div key={item.text} className="flex items-center gap-2">
                      <span className={clsx(
                        'w-1.5 h-1.5 rounded-full shrink-0',
                        item.done ? 'bg-green-500' : 'bg-white/10'
                      )} />
                      <span className={clsx(
                        'text-sm font-mono',
                        item.done ? 'text-white/60' : 'text-white/30'
                      )}>
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-24">
          <p className="text-white/30 text-xs font-mono uppercase tracking-widest mb-2">questions</p>
          <h2 className="text-2xl font-black tracking-tight mb-8">FAQ</h2>
          <div className="space-y-px border border-white/10 bg-white/10">
            {faqs.map((faq) => (
              <div key={faq.q} className="bg-black p-6">
                <h3 className="text-white text-sm font-bold font-mono mb-2">{faq.q}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-white/10 py-24 text-center">
          <h2 className="text-4xl font-black tracking-tight mb-4">Ready to Build?</h2>
          <p className="text-white/40 font-mono text-sm mb-8 max-w-md mx-auto">
            Join the next generation of agent builders. Start earning REKT today.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/rewards"
              className="bg-white text-black px-8 py-3 text-sm font-bold font-mono hover:bg-white/90 transition-colors"
            >
              connect wallet →
            </Link>
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
    </div>
  );
}
