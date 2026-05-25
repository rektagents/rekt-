'use client';

import { WagmiProvider } from 'wagmi';
import { config } from '@/lib/wagmi';
import type { ReactNode } from 'react';

export function WalletProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      {children}
    </WagmiProvider>
  );
}
