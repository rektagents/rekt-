'use client';

import type { BuilderTool } from '@/types/agent';

const TOOLS: BuilderTool[] = [
  {
    id: 'dexscreener-api',
    name: 'DexScreener API',
    description: 'Real-time DEX pair data, price feeds, and token profiles across all chains. Free, no API key.',
    category: 'api',
    documentation: 'https://docs.dexscreener.com/api/reference',
    icon: '01',
  },
  {
    id: 'defillama-api',
    name: 'DeFiLlama API',
    description: 'TVL, yields, protocol data, and chain stats. The standard for DeFi analytics.',
    category: 'api',
    documentation: 'https://defillama.com/docs/api',
    github: 'https://github.com/DefiLlama/defillama-server',
    icon: '02',
  },
  {
    id: 'viem',
    name: 'viem',
    description: 'TypeScript interface for Ethereum. Lightweight, composable, and type-safe. Used by wagmi.',
    category: 'sdk',
    documentation: 'https://viem.sh/docs/getting-started',
    github: 'https://github.com/wevm/viem',
    icon: '03',
  },
  {
    id: 'wagmi',
    name: 'wagmi',
    description: 'React hooks for Ethereum. Wallet connect, contract reads/writes, and chain management.',
    category: 'sdk',
    documentation: 'https://wagmi.sh/react/getting-started',
    github: 'https://github.com/wevm/wagmi',
    icon: '04',
  },
  {
    id: 'base-chain',
    name: 'Base Docs',
    description: 'Build on Base — L2 contracts, bridging, gas sponsorship, and onchainKit.',
    category: 'framework',
    documentation: 'https://docs.base.org',
    github: 'https://github.com/base',
    icon: '05',
  },
  {
    id: 'openzeppelin',
    name: 'OpenZeppelin',
    description: 'Battle-tested Solidity contracts — ERC20, ERC721, access control, and governance.',
    category: 'framework',
    documentation: 'https://docs.openzeppelin.com/contracts',
    github: 'https://github.com/OpenZeppelin/openzeppelin-contracts',
    icon: '06',
  },
  {
    id: 'hardhat',
    name: 'Hardhat',
    description: 'Ethereum development environment. Compile, test, deploy, and verify smart contracts.',
    category: 'tool',
    documentation: 'https://hardhat.org/docs',
    github: 'https://github.com/NomicFoundation/hardhat',
    icon: '07',
  },
  {
    id: 'supabase',
    name: 'Supabase',
    description: 'Open-source Firebase alternative. Postgres, auth, edge functions, and realtime subscriptions.',
    category: 'tool',
    documentation: 'https://supabase.com/docs',
    github: 'https://github.com/supabase/supabase',
    icon: '08',
  },
  {
    id: 'base-scan',
    name: 'BaseScan',
    description: 'Block explorer for Base. Verify contracts, read source code, and trace transactions.',
    category: 'tool',
    documentation: 'https://basescan.org',
    icon: '09',
  },
];

export function BuilderTools() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px border border-white/10 bg-white/10">
      {TOOLS.map((tool) => (
        <a
          key={tool.id}
          href={tool.documentation}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-black p-6 hover:bg-white/[0.03] transition-colors group block"
        >
          <p className="text-white/20 text-xs font-mono mb-3">{tool.icon}</p>
          <h3 className="text-sm font-bold text-white mb-2 tracking-tight group-hover:text-white/90">
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
                github
              </a>
            )}
            <span className="text-[10px] text-white/40 group-hover:text-white transition-colors font-mono ml-auto">
              docs →
            </span>
          </div>
        </a>
      ))}
    </div>
  );
}
