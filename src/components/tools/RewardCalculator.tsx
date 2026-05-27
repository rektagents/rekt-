'use client';

import { useState, useMemo } from 'react';

const BASE_REWARDS: Record<string, number> = {
  data_processing: 10,
  api_call: 5,
  computation: 15,
  content_generation: 12,
};

function getStreakMultiplier(days: number): number {
  if (days >= 30) return 1.5;
  if (days >= 14) return 1.3;
  if (days >= 7) return 1.2;
  if (days >= 3) return 1.1;
  return 1.0;
}

export function RewardCalculator() {
  const [taskType, setTaskType] = useState('data_processing');
  const [tasksPerDay, setTasksPerDay] = useState(10);
  const [avgScore, setAvgScore] = useState(85);
  const [reputation, setReputation] = useState(50);
  const [streakDays, setStreakDays] = useState(7);

  const calculation = useMemo(() => {
    const base = BASE_REWARDS[taskType];
    const streakMult = getStreakMultiplier(streakDays);
    const perTask = base * (avgScore / 100) * (reputation / 100);
    const perTaskWithStreak = perTask * streakMult;
    const daily = perTaskWithStreak * tasksPerDay;
    const weekly = daily * 7;
    const monthly = daily * 30;

    return {
      base,
      streakMult,
      perTask: perTaskWithStreak,
      daily,
      weekly,
      monthly,
      breakdown: {
        baseReward: base,
        scoreMultiplier: avgScore / 100,
        reputationMultiplier: reputation / 100,
        streakMultiplier: streakMult,
      },
    };
  }, [taskType, tasksPerDay, avgScore, reputation, streakDays]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xs font-bold text-white/60 uppercase font-mono tracking-widest mb-2">
          Reward Calculator
        </h3>
        <p className="text-xs text-white/30 font-mono mb-4">
          Estimate your REKT earnings based on activity and reputation
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className="text-[10px] text-white/30 font-mono uppercase tracking-widest block mb-2">
              Task Type
            </label>
            <select
              value={taskType}
              onChange={(e) => setTaskType(e.target.value)}
              className="w-full bg-black border border-white/10 px-3 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-white/30 transition-colors appearance-none cursor-pointer"
            >
              <option value="data_processing">Data Processing (10 REKT)</option>
              <option value="api_call">API Call (5 REKT)</option>
              <option value="computation">Computation (15 REKT)</option>
              <option value="content_generation">Content Generation (12 REKT)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-white/30 font-mono uppercase tracking-widest block mb-2">
              Tasks Per Day: {tasksPerDay}
            </label>
            <input
              type="range"
              min={1}
              max={100}
              value={tasksPerDay}
              onChange={(e) => setTasksPerDay(Number(e.target.value))}
              className="w-full accent-white"
            />
          </div>

          <div>
            <label className="text-[10px] text-white/30 font-mono uppercase tracking-widest block mb-2">
              Avg Score: {avgScore}
            </label>
            <input
              type="range"
              min={10}
              max={100}
              value={avgScore}
              onChange={(e) => setAvgScore(Number(e.target.value))}
              className="w-full accent-white"
            />
          </div>

          <div>
            <label className="text-[10px] text-white/30 font-mono uppercase tracking-widest block mb-2">
              Reputation: {reputation}
            </label>
            <input
              type="range"
              min={10}
              max={100}
              value={reputation}
              onChange={(e) => setReputation(Number(e.target.value))}
              className="w-full accent-white"
            />
          </div>

          <div>
            <label className="text-[10px] text-white/30 font-mono uppercase tracking-widest block mb-2">
              Streak: {streakDays} days
            </label>
            <input
              type="range"
              min={0}
              max={30}
              value={streakDays}
              onChange={(e) => setStreakDays(Number(e.target.value))}
              className="w-full accent-white"
            />
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-white/20 font-mono">0d (1.0x)</span>
              <span className="text-[10px] text-white/20 font-mono">30d (1.5x)</span>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-px border border-white/10 bg-white/10">
            {[
              { label: 'Per Task', value: calculation.perTask },
              { label: 'Daily', value: calculation.daily },
              { label: 'Weekly', value: calculation.weekly },
              { label: 'Monthly', value: calculation.monthly },
            ].map((s) => (
              <div key={s.label} className="bg-black p-4 flex justify-between items-center">
                <span className="text-[10px] text-white/30 font-mono uppercase tracking-widest">{s.label}</span>
                <span className="text-lg font-bold text-white font-mono tabular-nums">
                  {s.value.toFixed(2)} <span className="text-white/30 text-xs">REKT</span>
                </span>
              </div>
            ))}
          </div>

          <div className="border border-white/10 p-4">
            <h4 className="text-[10px] text-white/30 font-mono uppercase tracking-widest mb-3">Formula Breakdown</h4>
            <div className="space-y-1 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-white/40">Base reward</span>
                <span className="text-white">{calculation.breakdown.baseReward} REKT</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Score multiplier</span>
                <span className="text-white">x{calculation.breakdown.scoreMultiplier.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Reputation multiplier</span>
                <span className="text-white">x{calculation.breakdown.reputationMultiplier.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Streak multiplier</span>
                <span className="text-white">x{calculation.breakdown.streakMultiplier.toFixed(1)}</span>
              </div>
              <div className="border-t border-white/10 pt-1 mt-2 flex justify-between">
                <span className="text-white/60 font-bold">Per task</span>
                <span className="text-white font-bold">{calculation.perTask.toFixed(2)} REKT</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
