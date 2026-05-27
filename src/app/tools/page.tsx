'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import { HealthMonitor } from '@/components/tools/HealthMonitor';
import { RewardCalculator } from '@/components/tools/RewardCalculator';
import { AgentTemplates } from '@/components/tools/AgentTemplates';
import { BuilderTools } from '@/components/agents/BuilderTools';

const tabs = [
  { id: 'monitor', label: 'Health Monitor' },
  { id: 'calculator', label: 'Reward Calculator' },
  { id: 'templates', label: 'Templates' },
  { id: 'resources', label: 'Resources' },
] as const;

type TabId = (typeof tabs)[number]['id'];

export default function ToolsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('monitor');

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[30vh] flex flex-col justify-center grid-bg overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-6 py-20">
          <div className="fade-up-1 mb-6">
            <span className="text-white/40 text-xs border border-white/10 px-3 py-1 font-mono">
              tools · builders · ship faster
            </span>
          </div>
          <h1 className="fade-up-2 text-4xl sm:text-5xl font-black tracking-tighter leading-none mb-4">
            Builder Tools
          </h1>
          <p className="fade-up-3 text-white/50 text-sm max-w-xl leading-relaxed font-mono">
            Everything you need to build, monitor, and optimize your REKT agents.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Tabs */}
        <div className="flex gap-px border border-white/10 bg-white/10 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'flex-1 px-4 py-3 text-xs font-mono uppercase tracking-widest transition-colors',
                activeTab === tab.id
                  ? 'bg-black text-white'
                  : 'bg-black/50 text-white/30 hover:text-white/60'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="border border-white/10 p-6 md:p-8">
          {activeTab === 'monitor' && <HealthMonitor />}
          {activeTab === 'calculator' && <RewardCalculator />}
          {activeTab === 'templates' && <AgentTemplates />}
          {activeTab === 'resources' && <BuilderTools />}
        </div>
      </div>
    </div>
  );
}
