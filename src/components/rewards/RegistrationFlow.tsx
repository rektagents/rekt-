'use client';

import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { useRegisterAgent } from '@/hooks/useRewards';
import { useRegisterOnChain, useAgentOnChain } from '@/hooks/useOnChainRewards';
import { TransactionStatus } from './TransactionStatus';
import { isOnChainEnabled } from '@/lib/contracts';

export function RegistrationFlow() {
  const { address } = useWallet();
  const register = useRegisterAgent();
  const { data: onChainAgent } = useAgentOnChain(address);
  const onChainRegister = useRegisterOnChain();
  const [agentId, setAgentId] = useState('');
  const [registered, setRegistered] = useState(false);

  const isRegisteredOnChain = onChainAgent && (onChainAgent as any).registered;

  const handleRegister = async () => {
    if (!address || !agentId) return;
    try {
      await register.mutateAsync({ agentId, wallet: address });
      setRegistered(true);
    } catch (err: any) {
      if (err.message?.includes('already registered')) setRegistered(true);
    }
  };

  if (registered) {
    return (
      <div className="border border-white/10">
        <div className="border-b border-white/10 p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            <p className="text-green-400 text-sm font-mono">Agent registered</p>
          </div>
          <p className="text-white/30 text-xs font-mono">You can now submit tasks and earn rewards</p>
        </div>
        {isOnChainEnabled && !isRegisteredOnChain && (
          <div className="p-4">
            <p className="text-white/30 text-[10px] font-mono uppercase tracking-widest mb-2">on-chain registration</p>
            <p className="text-white/40 text-xs font-mono mb-3">
              Register on-chain to claim REKT tokens directly to your wallet.
            </p>
            <button
              onClick={() => onChainRegister.register()}
              disabled={onChainRegister.isPending || onChainRegister.isConfirming}
              className="w-full py-2.5 bg-white text-black text-xs font-bold font-mono uppercase tracking-widest hover:bg-white/90 transition-colors disabled:opacity-30"
            >
              {onChainRegister.isPending ? 'confirm in wallet...' : onChainRegister.isConfirming ? 'confirming...' : 'register on-chain'}
            </button>
            <TransactionStatus
              hash={onChainRegister.hash}
              isPending={onChainRegister.isPending}
              isConfirming={onChainRegister.isConfirming}
              isSuccess={onChainRegister.isSuccess}
              error={onChainRegister.error}
              label="Registration"
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="border border-white/10 p-6">
      <p className="text-[10px] text-white/30 font-mono uppercase tracking-widest mb-4">register agent</p>
      <p className="text-white/50 text-sm mb-4 font-mono">
        Register your agent to start earning REKT tokens for completed tasks.
      </p>
      <div className="space-y-3">
        <div>
          <label className="block text-[10px] text-white/30 font-mono uppercase tracking-widest mb-2">Agent ID</label>
          <input
            type="text"
            value={agentId}
            onChange={(e) => setAgentId(e.target.value)}
            placeholder="my-agent-001"
            className="w-full bg-transparent text-white text-sm font-mono px-4 py-2.5 border border-white/10 focus:outline-none focus:border-white/30 placeholder-white/20"
          />
        </div>
        <button
          onClick={handleRegister}
          disabled={!agentId || !address || register.isPending}
          className="w-full py-2.5 bg-white text-black text-xs font-bold font-mono uppercase tracking-widest hover:bg-white/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {register.isPending ? 'registering...' : 'register'}
        </button>
        {register.isError && <p className="text-red-400 text-xs font-mono">{register.error?.message}</p>}
      </div>
    </div>
  );
}
