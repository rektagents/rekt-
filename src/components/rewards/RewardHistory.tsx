'use client';

import { useWallet } from '@/hooks/useWallet';
import { usePendingRewards } from '@/hooks/useRewards';
import { TASK_TYPE_LABELS, type TaskType } from '@/types/rewards';

export function RewardHistory() {
  const { address } = useWallet();
  const { data } = usePendingRewards(address);

  const tasks = data?.tasks || [];

  if (tasks.length === 0) {
    return (
      <div className="border border-white/10 p-6 text-center">
        <p className="text-white/30 text-sm font-mono">No task history yet</p>
      </div>
    );
  }

  return (
    <div className="border border-white/10 overflow-hidden">
      <div className="p-4 border-b border-white/10">
        <p className="text-[10px] text-white/30 font-mono uppercase tracking-widest">
          task history
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              {['Type', 'Score', 'Reward', 'Status', 'Date'].map((h) => (
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
            {tasks.map((task: any) => (
              <tr key={task.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="py-3 px-4 text-xs text-white font-mono">
                  {TASK_TYPE_LABELS[task.type as TaskType] || task.type}
                </td>
                <td className="py-3 px-4 text-right text-xs text-white/50 font-mono tabular-nums">
                  {task.score}
                </td>
                <td className="py-3 px-4 text-right text-xs text-white font-mono tabular-nums">
                  {task.rewardAmount?.toFixed(2)} REKT
                </td>
                <td className="py-3 px-4 text-right">
                  <span
                    className={`text-[10px] font-mono uppercase tracking-widest ${
                      task.status === 'verified'
                        ? 'text-green-400'
                        : task.status === 'rejected'
                        ? 'text-red-400'
                        : 'text-yellow-400'
                    }`}
                  >
                    {task.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-right text-[10px] text-white/20 font-mono">
                  {new Date(task.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
