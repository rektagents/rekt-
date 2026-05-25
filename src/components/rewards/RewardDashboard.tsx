'use client';

import { useWallet } from '@/hooks/useWallet';
import { WalletConnect } from './WalletConnect';
import { RegistrationFlow } from './RegistrationFlow';
import { PendingRewards } from './PendingRewards';
import { TaskSubmission } from './TaskSubmission';
import { RewardHistory } from './RewardHistory';
import { RewardLeaderboard } from './RewardLeaderboard';
import { usePendingRewards } from '@/hooks/useRewards';

export function RewardDashboard() {
  const { address, isConnected } = useWallet();
  const { data } = usePendingRewards(address);
  const isRegistered = !!data?.registration;

  return (
    <div className="space-y-8">
      {/* Wallet + Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-px border border-white/10 bg-white/10">
        <div className="bg-black">
          <WalletConnect />
        </div>
        <div className="bg-black lg:col-span-2">
          {isConnected && !isRegistered && <RegistrationFlow />}
          {isConnected && isRegistered && <PendingRewards />}
          {!isConnected && (
            <div className="p-6 flex items-center justify-center h-full">
              <p className="text-white/20 text-sm font-mono">Connect wallet to view rewards</p>
            </div>
          )}
        </div>
      </div>

      {/* Task Submission + Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-px border border-white/10 bg-white/10">
        <div className="bg-black">
          <TaskSubmission />
        </div>
        <div className="bg-black">
          <RewardLeaderboard />
        </div>
      </div>

      {/* Reward History */}
      <RewardHistory />
    </div>
  );
}
