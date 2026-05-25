'use client';

import type { BuilderTool } from '@/types/agent';

const TOOLS: BuilderTool[] = [
  {
    id: 'agent-sdk',
    name: 'Agent SDK',
    description: 'Build autonomous AI agents with built-in wallet, trading, and DeFi capabilities',
    category: 'sdk',
    documentation: '#',
    github: 'https://github.com',
    icon: '01',
  },
  {
    id: 'defi-api',
    name: 'DeFi API',
    description: 'Access DEX data, swap tokens, and interact with DeFi protocols programmatically',
    category: 'api',
    documentation: '#',
    icon: '02',
  },
  {
    id: 'agent-framework',
    name: 'Agent Framework',
    description: 'Open-source framework for creating, deploying, and managing AI agents on-chain',
    category: 'framework',
    documentation: '#',
    github: 'https://github.com',
    icon: '03',
  },
  {
    id: 'token-deployer',
    name: 'Token Deployer',
    description: 'Deploy your agent token with one click. Built-in liquidity and governance',
    category: 'tool',
    documentation: '#',
    icon: '04',
  },
  {
    id: 'agent-monitor',
    name: 'Agent Monitor',
    description: 'Track your agent performance, uptime, and user metrics in real-time',
    category: 'tool',
    documentation: '#',
    icon: '05',
  },
  {
    id: 'social-api',
    name: 'Social API',
    description: 'Let your agent post, reply, and engage across Twitter, Discord, and Telegram',
    category: 'api',
    documentation: '#',
    icon: '06',
  },
];

export function BuilderTools() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px border border-white/10 bg-white/10">
      {TOOLS.map((tool) => (
        <div
          key={tool.id}
          className="bg-black p-6 hover:bg-white/[0.03] transition-colors cursor-pointer group"
        >
          <p className="text-white/20 text-xs font-mono mb-3">{tool.icon}</p>
          <h3 className="text-sm font-bold text-white mb-2 tracking-tight">
            {tool.name}
          </h3>
          <p className="text-xs text-white/40 mb-4 leading-relaxed">{tool.description}</p>
          <div className="flex items-center gap-3">
            <span className="text-[10px] px-2 py-0.5 border border-white/10 text-white/30 font-mono uppercase tracking-widest">
              {tool.category}
            </span>
            {tool.github && (
              <a
                href={tool.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-white/20 hover:text-white/50 transition-colors font-mono"
                onClick={(e) => e.stopPropagation()}
              >
                github →
              </a>
            )}
            <a
              href={tool.documentation}
              className="text-[10px] text-white/40 hover:text-white transition-colors font-mono ml-auto"
            >
              docs →
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
