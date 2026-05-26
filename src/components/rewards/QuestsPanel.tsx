'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import { useWallet } from '@/hooks/useWallet';
import { useQuests, useClaimQuest } from '@/hooks/useQuests';
import { DAILY_QUESTS, WEEKLY_QUESTS, ACHIEVEMENTS } from '@/types/quests';
import type { QuestDef } from '@/types/quests';

const QUEST_DEFS: Record<string, { title: string; description: string; icon: string }> = {};
[...DAILY_QUESTS, ...WEEKLY_QUESTS, ...ACHIEVEMENTS].forEach(q => {
  QUEST_DEFS[q.id] = { title: q.title, description: q.description, icon: q.icon };
});

export function QuestsPanel() {
  const { address } = useWallet();
  const { data, isLoading } = useQuests(address);
  const claimQuest = useClaimQuest();
  const [tab, setTab] = useState<'daily' | 'weekly' | 'achievements'>('daily');

  if (!address) return null;
  if (isLoading) {
    return (
      <div className="border border-white/10 p-6 animate-pulse">
        <div className="h-4 w-32 bg-white/5 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-16 bg-white/5" />)}
        </div>
      </div>
    );
  }

  const quests = data?.quests || [];
  const streak = data?.streak;
  const filtered = quests.filter((q: any) => q.quest_type === tab);

  const handleClaim = (questId: string) => {
    if (!address) return;
    claimQuest.mutate({ wallet: address, questId });
  };

  return (
    <div className="border border-white/10">
      {/* Streak header */}
      <div className="border-b border-white/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] text-white/30 font-mono uppercase tracking-widest">streak</p>
          <span className="text-[10px] text-green-400/60 font-mono">
            {Number(streak?.multiplier || 1).toFixed(1)}x multiplier
          </span>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-3xl font-black text-white font-mono tabular-nums">
              {streak?.current_streak || 0}
            </p>
            <p className="text-[10px] text-white/30 font-mono uppercase tracking-widest">current</p>
          </div>
          <div className="flex-1 flex items-center gap-1">
            {Array.from({ length: 7 }, (_, i) => (
              <div
                key={i}
                className={clsx(
                  'h-2 flex-1',
                  i < (streak?.current_streak || 0) % 7
                    ? 'bg-green-500'
                    : 'bg-white/5'
                )}
              />
            ))}
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-white/50 font-mono tabular-nums">
              {streak?.longest_streak || 0}
            </p>
            <p className="text-[10px] text-white/30 font-mono uppercase tracking-widest">best</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-white/10 px-4 pt-2">
        {(['daily', 'weekly', 'achievements'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={clsx(
              'px-4 py-2.5 text-xs font-mono uppercase tracking-widest transition-colors relative',
              tab === t ? 'text-white' : 'text-white/30 hover:text-white/60'
            )}
          >
            {t}
            {tab === t && <div className="absolute bottom-0 left-0 right-0 h-px bg-white" />}
          </button>
        ))}
      </div>

      {/* Quest list */}
      <div className="p-4 space-y-2">
        {filtered.length === 0 ? (
          <p className="text-white/20 text-xs font-mono text-center py-4">No quests available</p>
        ) : (
          filtered.map((quest: any) => {
            const def = QUEST_DEFS[quest.quest_id] || { title: quest.quest_id, description: '', icon: '?' };
            const progress = Math.min(quest.current, quest.requirement);
            const pct = Math.round((progress / quest.requirement) * 100);

            return (
              <div key={quest.quest_id} className="border border-white/10 p-4">
                <div className="flex items-start gap-3">
                  <div className={clsx(
                    'w-8 h-8 border flex items-center justify-center text-xs font-mono shrink-0',
                    quest.status === 'claimed' ? 'border-green-500/20 text-green-400' :
                    quest.status === 'completed' ? 'border-yellow-500/20 text-yellow-400' :
                    'border-white/10 text-white/30'
                  )}>
                    {def.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm text-white font-mono truncate">{def.title}</p>
                      <span className="text-xs text-white/30 font-mono shrink-0 ml-2">
                        +{quest.reward} REKT
                      </span>
                    </div>
                    <p className="text-[10px] text-white/30 font-mono mb-2">{def.description}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 bg-white/5 overflow-hidden">
                        <div
                          className={clsx(
                            'h-full transition-all',
                            quest.status === 'completed' || quest.status === 'claimed'
                              ? 'bg-green-500' : 'bg-white/30'
                          )}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-white/20 font-mono shrink-0">
                        {progress}/{quest.requirement}
                      </span>
                    </div>
                  </div>
                  {quest.status === 'completed' && (
                    <button
                      onClick={() => handleClaim(quest.quest_id)}
                      disabled={claimQuest.isPending}
                      className="px-3 py-1.5 bg-white text-black text-[10px] font-bold font-mono uppercase tracking-widest hover:bg-white/90 transition-colors disabled:opacity-30 shrink-0"
                    >
                      claim
                    </button>
                  )}
                  {quest.status === 'claimed' && (
                    <span className="text-green-400 text-[10px] font-mono uppercase tracking-widest shrink-0">
                      ~done
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
