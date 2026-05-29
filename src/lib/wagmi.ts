'use client';

import { http, createConfig } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { injected, metaMask, coinbaseWallet, walletConnect } from 'wagmi/connectors';

const WALLETCONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

const connectors = [
  metaMask(),
  coinbaseWallet({ appName: 'REKT' }),
  injected(),
];

// Only add WalletConnect if project ID is configured
if (WALLETCONNECT_PROJECT_ID) {
  connectors.push(walletConnect({ projectId: WALLETCONNECT_PROJECT_ID }));
}

export const config = createConfig({
  chains: [baseSepolia, base],
  connectors,
  transports: {
    [baseSepolia.id]: http('https://sepolia.base.org'),
    [base.id]: http('https://mainnet.base.org'),
  },
});

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}
