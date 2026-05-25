export type ChainId =
  | 'ethereum'
  | 'solana'
  | 'binance-smart-chain'
  | 'polygon-pos'
  | 'avalanche'
  | 'arbitrum-one'
  | 'optimistic-ethereum'
  | 'base'
  | 'bitcoin';

export interface Chain {
  id: ChainId;
  name: string;
  shortName: string;
  symbol: string;
  color: string;
  icon: string;
  explorerUrl: string;
  contractPattern: RegExp;
}

export const CHAINS: Chain[] = [
  {
    id: 'ethereum',
    name: 'Ethereum',
    shortName: 'ETH',
    symbol: 'ETH',
    color: '#627EEA',
    icon: '⟠',
    explorerUrl: 'https://etherscan.io',
    contractPattern: /^0x[a-fA-F0-9]{40}$/,
  },
  {
    id: 'solana',
    name: 'Solana',
    shortName: 'SOL',
    symbol: 'SOL',
    color: '#9945FF',
    icon: '◎',
    explorerUrl: 'https://solscan.io',
    contractPattern: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
  },
  {
    id: 'binance-smart-chain',
    name: 'BNB Chain',
    shortName: 'BSC',
    symbol: 'BNB',
    color: '#F0B90B',
    icon: '◆',
    explorerUrl: 'https://bscscan.com',
    contractPattern: /^0x[a-fA-F0-9]{40}$/,
  },
  {
    id: 'polygon-pos',
    name: 'Polygon',
    shortName: 'MATIC',
    symbol: 'MATIC',
    color: '#8247E5',
    icon: '⬡',
    explorerUrl: 'https://polygonscan.com',
    contractPattern: /^0x[a-fA-F0-9]{40}$/,
  },
  {
    id: 'avalanche',
    name: 'Avalanche',
    shortName: 'AVAX',
    symbol: 'AVAX',
    color: '#E84142',
    icon: '▲',
    explorerUrl: 'https://snowtrace.io',
    contractPattern: /^0x[a-fA-F0-9]{40}$/,
  },
  {
    id: 'arbitrum-one',
    name: 'Arbitrum',
    shortName: 'ARB',
    symbol: 'ETH',
    color: '#28A0F0',
    icon: '🔵',
    explorerUrl: 'https://arbiscan.io',
    contractPattern: /^0x[a-fA-F0-9]{40}$/,
  },
  {
    id: 'optimistic-ethereum',
    name: 'Optimism',
    shortName: 'OP',
    symbol: 'ETH',
    color: '#FF0420',
    icon: '🔴',
    explorerUrl: 'https://optimistic.etherscan.io',
    contractPattern: /^0x[a-fA-F0-9]{40}$/,
  },
  {
    id: 'base',
    name: 'Base',
    shortName: 'BASE',
    symbol: 'ETH',
    color: '#0052FF',
    icon: '🔵',
    explorerUrl: 'https://basescan.org',
    contractPattern: /^0x[a-fA-F0-9]{40}$/,
  },
];

export function detectChain(address: string): Chain | null {
  // Solana addresses don't start with 0x
  if (!address.startsWith('0x') && /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
    return CHAINS.find((c) => c.id === 'solana') || null;
  }

  // EVM addresses - default to Ethereum, user can select chain
  if (/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return CHAINS.find((c) => c.id === 'ethereum') || null;
  }

  return null;
}

export function getChainById(id: ChainId): Chain | undefined {
  return CHAINS.find((c) => c.id === id);
}
