'use client';

import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi';

export function useWallet() {
  const { address, isConnected, isConnecting, chain } = useAccount();
  const { connect, connectors, isPending: isConnectPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({ address });

  const connectWallet = () => {
    const injected = connectors.find((c) => c.id === 'injected');
    if (injected) {
      connect({ connector: injected });
    }
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
