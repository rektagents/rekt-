'use client';

import { BuilderTool } from '@/types/agent';

const TOOLS: BuilderTool[] = [
  {
    id: 'agent-sdk',
    name: 'Agent SDK',
    description: 'Build autonomous AI agents with built-in wallet, trading, and DeFi capabilities',
    category: 'sdk',
    documentation: '#',
    github: 'https://github.com',
    icon: '🛠️',
  },
  {
    id: 'defi-api',
    name: 'DeFi API',
    description: 'Access DEX data, swap tokens, and interact with DeFi protocols programmatically',
    category: 'api',
    documentation: '#',
    icon: '📡',
  },
  {
    id: 'agent-framework',
    name: 'Agent Framework',
    description: 'Open-source framework for creating, deploying, and managing AI agents on-chain',
    category: 'framework',
    documentation: '#',
    github: 'https://github.com',
    icon: '🏗️',
  },
  {
    id: 'token-deployer',
    name: 'Token Deployer',
    description: 'Deploy your agent token with one click. Built-in liquidity and governance',
    category: 'tool',
    documentation: '#',
    icon: '🚀',
  },
  {
    id: 'agent-monitor',
    name: 'Agent Monitor',
    description: 'Track your agent performance, uptime, and user metrics in real-time',
    category: 'tool',
    documentation: '#',
    icon: '📊',
  },
  {
    id: 'social-api',
    name: 'Social API',
    description: 'Let your agent post, reply, and engage across Twitter, Discord, and Telegram',
    category: 'api',
    documentation: '#',
    icon: '💬',
  },
];

export function BuilderTools() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {TOOLS.map((tool) => (
        <div
          key={tool.id}
          className="glass rounded-xl p-5 hover:border-gray-600 transition-all cursor-pointer group"
        >
          <div className="text-3xl mb-3">{tool.icon}</div>
          <h3 className="font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
            {tool.name}
          </h3>
          <p className="text-sm text-gray-400 mb-4">{tool.description}</p>
          <div className="flex items-center gap-3">
            <span className="text-xs px-2 py-1 rounded-full bg-gray-800 text-gray-400 capitalize">
              {tool.category}
            </span>
            {tool.github && (
              <a
                href={tool.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-500 hover:text-white transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                GitHub →
              </a>
            )}
            <a
              href={tool.documentation}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors ml-auto"
            >
              Docs →
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
