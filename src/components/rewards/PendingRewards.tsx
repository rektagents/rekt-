'use client';

import { useWallet } from '@/hooks/useWallet';
import { usePendingRewards } from '@/hooks/useRewards';
import { ClaimButton } from './ClaimButton';

export function PendingRewards() {
  const { address } = useWallet();
  const { data, isLoading } = usePendingRewards(address);

  if (!address) return null;

  if (isLoading) {
    return (
      <div className="border border-white/10 p-6 animate-pulse">
        <div className="h-4 w-24 bg-white/5 mb-3" />
        <div className="h-8 w-48 bg-white/5" />
      </div>
    );
  }

  const reg = data?.registration;
  const pending = data?.pending;

  if (!reg) return null;

  return (
    <div className="border border-white/10">
      <div className="border-b border-white/10 p-6">
        <p className="text-[10px] text-white/30 font-mono uppercase tracking-widest mb-2">
          pending rewards
        </p>
        <p className="text-3xl font-black text-white font-mono tabular-nums tracking-tight">
          {pending?.total?.toFixed(2) || '0.00'} <span className="text-white/30 text-lg">REKT</span>
        </p>
      </div>
      <div className="grid grid-cols-3 gap-px bg-white/10">
        <div className="bg-black p-4 text-center">
          <p className="text-lg font-bold text-white font-mono tabular-nums">{reg.tasksCompleted}</p>
          <p className="text-[10px] text-white/30 font-mono uppercase tracking-widest">tasks</p>
        </div>
        <div className="bg-black p-4 text-center">
          <p className="text-lg font-bold text-white font-mono tabular-nums">{reg.reputation}</p>
          <p className="text-[10px] text-white/30 font-mono uppercase tracking-widest">reputation</p>
        </div>
        <div className="bg-black p-4 text-center">
          <p className="text-lg font-bold text-white font-mono tabular-nums">{reg.totalEarned.toFixed(2)}</p>
          <p className="text-[10px] text-white/30 font-mono uppercase tracking-widest">earned</p>
        </div>
      </div>
      <div className="p-4">
        <ClaimButton />
      </div>
    </div>
  );
}
