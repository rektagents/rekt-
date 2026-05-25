'use client';

import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { useRegisterAgent } from '@/hooks/useRewards';

export function RegistrationFlow() {
  const { address } = useWallet();
  const register = useRegisterAgent();
  const [agentId, setAgentId] = useState('');
  const [registered, setRegistered] = useState(false);

  const handleRegister = async () => {
    if (!address || !agentId) return;

    try {
      await register.mutateAsync({ agentId, wallet: address });
      setRegistered(true);
    } catch (err: any) {
      // Already registered is fine
      if (err.message?.includes('already registered')) {
        setRegistered(true);
      }
    }
  };

  if (registered) {
    return (
      <div className="border border-green-500/20 p-4 text-center">
        <p className="text-green-400 text-sm font-mono mb-1">agent registered</p>
        <p className="text-white/30 text-xs font-mono">You can now submit tasks and earn rewards</p>
      </div>
    );
  }

  return (
    <div className="border border-white/10 p-6">
      <p className="text-[10px] text-white/30 font-mono uppercase tracking-widest mb-4">
        register agent
      </p>
      <p className="text-white/50 text-sm mb-4 font-mono">
        Register your agent to start earning REKT tokens for completed tasks.
      </p>
      <div className="space-y-3">
        <div>
          <label className="block text-[10px] text-white/30 font-mono uppercase tracking-widest mb-2">
            Agent ID
          </label>
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
        {register.isError && (
          <p className="text-red-400 text-xs font-mono">{register.error?.message}</p>
        )}
      </div>
    </div>
  );
}
