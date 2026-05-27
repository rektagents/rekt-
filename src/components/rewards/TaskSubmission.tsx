'use client';

import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { usePendingRewards, useSubmitTask, useVerifyTask } from '@/hooks/useRewards';
import { TASK_TYPE_LABELS } from '@/types/rewards';
import type { TaskType } from '@/types/rewards';

const taskTypes: TaskType[] = ['data_processing', 'api_call', 'computation', 'content_generation'];

export function TaskSubmission() {
  const { address } = useWallet();
  const { data } = usePendingRewards(address);
  const submitTask = useSubmitTask();
  const verifyTask = useVerifyTask();

  const [taskType, setTaskType] = useState<TaskType>('data_processing');
  const [score, setScore] = useState(80);
  const [proof, setProof] = useState('');
  const [lastTaskId, setLastTaskId] = useState<string | null>(null);

  const agentId = data?.registration?.agentId;
  const isRegistered = !!data?.registration;

  const handleSubmit = async () => {
    if (!address || !agentId) return;

    const result = await submitTask.mutateAsync({
      agentId,
      wallet: address,
      type: taskType,
      score,
      proof: proof || '',
    });

    setLastTaskId(result.id);
  };

  const handleVerify = async () => {
    if (!lastTaskId) return;
    await verifyTask.mutateAsync({ taskId: lastTaskId });
    setLastTaskId(null);
  };

  if (!isRegistered) {
    return (
      <div className="border border-white/10 p-6">
        <p className="text-white/30 text-sm font-mono text-center">
          Register as an agent first to submit tasks
        </p>
      </div>
    );
  }

  return (
    <div className="border border-white/10 p-6">
      <p className="text-[10px] text-white/30 font-mono uppercase tracking-widest mb-4">
        submit task
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-[10px] text-white/30 font-mono uppercase tracking-widest mb-2">
            Task Type
          </label>
          <div className="grid grid-cols-2 gap-1">
            {taskTypes.map((t) => (
              <button
                key={t}
                onClick={() => setTaskType(t)}
                className={`py-2 px-3 text-xs font-mono transition-colors border ${
                  taskType === t
                    ? 'border-white/20 text-white bg-white/[0.03]'
                    : 'border-white/10 text-white/30 hover:text-white hover:border-white/20'
                }`}
              >
                {TASK_TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[10px] text-white/30 font-mono uppercase tracking-widest mb-2">
            Quality Score: {score}
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={score}
            onChange={(e) => setScore(parseInt(e.target.value))}
            className="w-full accent-white"
          />
          <div className="flex justify-between text-[10px] text-white/20 font-mono">
            <span>0</span>
            <span>100</span>
          </div>
        </div>

        <div>
          <label className="block text-[10px] text-white/30 font-mono uppercase tracking-widest mb-2">
            Proof (optional)
          </label>
          <input
            type="text"
            value={proof}
            onChange={(e) => setProof(e.target.value)}
            placeholder="Task completion proof..."
            className="w-full bg-transparent text-white text-sm font-mono px-4 py-2.5 border border-white/10 focus:outline-none focus:border-white/30 placeholder-white/20"
          />
        </div>

        {!lastTaskId ? (
          <button
            onClick={handleSubmit}
            disabled={submitTask.isPending}
            className="w-full py-2.5 bg-white text-black text-xs font-bold font-mono uppercase tracking-widest hover:bg-white/90 transition-colors disabled:opacity-30"
          >
            {submitTask.isPending ? 'submitting...' : 'submit task'}
          </button>
        ) : (
          <button
            onClick={handleVerify}
            disabled={verifyTask.isPending}
            className="w-full py-2.5 border border-green-500/30 text-green-400 text-xs font-bold font-mono uppercase tracking-widest hover:bg-green-500/5 transition-colors disabled:opacity-30"
          >
            {verifyTask.isPending ? 'verifying...' : 'verify & earn reward'}
          </button>
        )}

        {submitTask.isError && (
          <p className="text-red-400 text-xs font-mono">{submitTask.error?.message}</p>
        )}
        {verifyTask.isSuccess && (
          <p className="text-green-400 text-xs font-mono">Task verified! Reward added to pending balance.</p>
        )}
      </div>
    </div>
  );
}
