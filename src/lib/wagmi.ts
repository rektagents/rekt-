'use client';

import { http, createConfig } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { injected, metaMask, coinbaseWallet, walletConnect } from 'wagmi/connectors';

// WalletConnect needs a project ID - get one free at https://cloud.walletconnect.com
const WALLETCONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID';

export const config = createConfig({
  chains: [baseSepolia, base],
  connectors: [
    metaMask(),
    coinbaseWallet({ appName: 'REKT' }),
    walletConnect({ projectId: WALLETCONNECT_PROJECT_ID }),
    injected(),
  ],
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
