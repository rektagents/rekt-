'use client';

import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi';
import type { Connector } from 'wagmi';

export function useWallet() {
  const { address, isConnected, isConnecting, chain } = useAccount();
  const { connect, connectors, isPending: isConnectPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({ address });

  const connectWallet = (connector?: Connector) => {
    const c = connector || connectors.find((c) => c.id === 'injected');
    if (c) connect({ connector: c });
  };

  return {
    address,
    isConnected,
    isConnecting,
    isConnectPending,
    chain,
    balance,
    connectWallet,
    disconnect,
    connectors,
  };
}
