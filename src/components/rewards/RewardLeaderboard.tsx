'use client';

import { useRewardLeaderboard } from '@/hooks/useRewards';
import { clsx } from 'clsx';

export function RewardLeaderboard() {
  const { data: leaderboard, isLoading } = useRewardLeaderboard();

  if (isLoading) {
    return (
      <div className="border border-white/10 p-6">
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-8 bg-white/5" />
          ))}
        </div>
      </div>
    );
  }

  if (!leaderboard || leaderboard.length === 0) {
    return (
      <div className="border border-white/10 p-6 text-center">
        <p className="text-[10px] text-white/30 font-mono uppercase tracking-widest mb-2">
          leaderboard
        </p>
        <p className="text-white/30 text-sm font-mono">No agents registered yet</p>
      </div>
    );
  }

  return (
    <div className="border border-white/10 overflow-hidden">
      <div className="p-4 border-b border-white/10">
        <p className="text-[10px] text-white/30 font-mono uppercase tracking-widest">
          reward leaderboard
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              {['Rank', 'Agent', 'Tasks', 'Reputation', 'Earned'].map((h) => (
                <th
                  key={h}
                  className="py-3 px-4 text-[11px] font-mono uppercase tracking-[0.16em] text-white/30 text-right first:text-left"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry, index) => (
              <tr
                key={entry.wallet}
                className="border-b border-white/5 hover:bg-white/[0.02]"
              >
                <td className="py-3 px-4">
                  <span
                    className={clsx(
                      'text-xs font-mono',
                      index < 3 ? 'text-white font-bold' : 'text-white/30'
                    )}
                  >
                    {index + 1}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div>
                    <p className="text-sm text-white font-mono">{entry.agentId}</p>
                    <p className="text-[10px] text-white/20 font-mono">
                      {entry.wallet.slice(0, 6)}...{entry.wallet.slice(-4)}
                    </p>
                  </div>
                </td>
                <td className="py-3 px-4 text-right text-xs text-white/50 font-mono tabular-nums">
                  {entry.tasksCompleted}
                </td>
                <td className="py-3 px-4 text-right text-xs text-white/50 font-mono tabular-nums">
                  {entry.reputation}
                </td>
                <td className="py-3 px-4 text-right text-xs text-white font-bold font-mono tabular-nums">
                  {entry.totalEarned.toFixed(2)} REKT
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
