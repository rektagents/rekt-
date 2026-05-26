import { supabaseServer } from './supabase-server';
import { DAILY_QUESTS, WEEKLY_QUESTS, ACHIEVEMENTS, STREAK_MULTIPLIERS } from '@/types/quests';
import type { QuestType } from '@/types/quests';

// Get today's date as YYYY-MM-DD
function today(): string {
  return new Date().toISOString().split('T')[0];
}

// Get start of current week (Monday)
function weekStart(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff)).toISOString().split('T')[0];
}

// Get multiplier for a streak count
function getMultiplier(streak: number): number {
  const thresholds = Object.keys(STREAK_MULTIPLIERS).map(Number).sort((a, b) => b - a);
  for (const t of thresholds) {
    if (streak >= t) return STREAK_MULTIPLIERS[t];
  }
  return 1.0;
}

// Update streak on task completion
export async function updateStreak(wallet: string) {
  const w = wallet.toLowerCase();
  const todayStr = today();

  const { data: streak } = await supabaseServer
    .from('streaks')
    .select('*')
    .eq('wallet', w)
    .single();

  if (!streak) {
    // First time
    await supabaseServer.from('streaks').insert({
      wallet: w,
      current_streak: 1,
      longest_streak: 1,
      last_active_date: todayStr,
      multiplier: 1.0,
    });
    return { current_streak: 1, longest_streak: 1, multiplier: 1.0 };
  }

  const lastActive = streak.last_active_date;
  if (lastActive === todayStr) {
    // Already active today, no change
    return { current_streak: streak.current_streak, longest_streak: streak.longest_streak, multiplier: streak.multiplier };
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let newStreak: number;
  if (lastActive === yesterdayStr) {
    // Consecutive day
    newStreak = streak.current_streak + 1;
  } else {
    // Streak broken
    newStreak = 1;
  }

  const newLongest = Math.max(newStreak, streak.longest_streak);
  const newMultiplier = getMultiplier(newStreak);

  await supabaseServer
    .from('streaks')
    .update({
      current_streak: newStreak,
      longest_streak: newLongest,
      last_active_date: todayStr,
      multiplier: newMultiplier,
    })
    .eq('wallet', w);

  return { current_streak: newStreak, longest_streak: newLongest, multiplier: newMultiplier };
}

// Get streak for a wallet
export async function getStreak(wallet: string) {
  const { data } = await supabaseServer
    .from('streaks')
    .select('*')
    .eq('wallet', wallet.toLowerCase())
    .single();

  return data || { wallet: wallet.toLowerCase(), current_streak: 0, longest_streak: 0, multiplier: 1.0 };
}

// Initialize quests for a wallet (daily + weekly)
export async function initQuests(wallet: string) {
  const w = wallet.toLowerCase();
  const todayStr = today();
  const weekStr = weekStart();

  // Check if daily quests exist for today
  const { data: existingDaily } = await supabaseServer
    .from('quest_progress')
    .select('quest_id')
    .eq('wallet', w)
    .eq('quest_type', 'daily')
    .eq('period_start', todayStr)
    .limit(1);

  if (!existingDaily || existingDaily.length === 0) {
    const dailyInserts = DAILY_QUESTS.map(q => ({
      wallet: w,
      quest_id: q.id,
      quest_type: 'daily' as QuestType,
      current: 0,
      requirement: q.requirement,
      reward: q.reward,
      status: 'active',
      period_start: todayStr,
    }));
    await supabaseServer.from('quest_progress').insert(dailyInserts);
  }

  // Check if weekly quests exist for this week
  const { data: existingWeekly } = await supabaseServer
    .from('quest_progress')
    .select('quest_id')
    .eq('wallet', w)
    .eq('quest_type', 'weekly')
    .eq('period_start', weekStr)
    .limit(1);

  if (!existingWeekly || existingWeekly.length === 0) {
    const weeklyInserts = WEEKLY_QUESTS.map(q => ({
      wallet: w,
      quest_id: q.id,
      quest_type: 'weekly' as QuestType,
      current: 0,
      requirement: q.requirement,
      reward: q.reward,
      status: 'active',
      period_start: weekStr,
    }));
    await supabaseServer.from('quest_progress').insert(weeklyInserts);
  }

  // Init achievements (one-time, check if any exist)
  const { data: existingAch } = await supabaseServer
    .from('quest_progress')
    .select('quest_id')
    .eq('wallet', w)
    .eq('quest_type', 'achievement')
    .limit(1);

  if (!existingAch || existingAch.length === 0) {
    const achInserts = ACHIEVEMENTS.map(q => ({
      wallet: w,
      quest_id: q.id,
      quest_type: 'achievement' as QuestType,
      current: 0,
      requirement: q.requirement,
      reward: q.reward,
      status: 'active',
      period_start: null,
    }));
    await supabaseServer.from('quest_progress').insert(achInserts);
  }
}

// Progress quests after a task is completed
export async function progressQuests(wallet: string, taskType: string, score: number) {
  const w = wallet.toLowerCase();
  const todayStr = today();
  const weekStr = weekStart();

  // Update daily quests
  // daily_1_task and daily_3_tasks: increment on any task
  await supabaseServer.rpc('increment_quest', {
    p_wallet: w,
    p_quest_ids: ['daily_1_task', 'daily_3_tasks'],
    p_period_start: todayStr,
  });

  // daily_high_score: increment if score >= 90
  if (score >= 90) {
    await supabaseServer.rpc('increment_quest', {
      p_wallet: w,
      p_quest_ids: ['daily_high_score'],
      p_period_start: todayStr,
    });
  }

  // Update weekly quests
  // weekly_10_tasks: increment on any task
  await supabaseServer.rpc('increment_quest', {
    p_wallet: w,
    p_quest_ids: ['weekly_10_tasks'],
    p_period_start: weekStr,
  });

  // weekly_all_types: track unique types (simplified: increment if not already at 4)
  await supabaseServer.rpc('increment_quest', {
    p_wallet: w,
    p_quest_ids: ['weekly_all_types'],
    p_period_start: weekStr,
  });

  // weekly_streak_5: check streak
  const streak = await getStreak(w);
  if (streak.current_streak >= 5) {
    await supabaseServer
      .from('quest_progress')
      .update({ current: streak.current_streak, status: streak.current_streak >= 5 ? 'completed' : 'active' })
      .eq('wallet', w)
      .eq('quest_id', 'weekly_streak_5')
      .eq('period_start', weekStr)
      .eq('status', 'active');
  }

  // Update achievements
  // ach_first_task, ach_10_tasks, ach_10_tasks, ach_100_tasks: based on total tasks
  const { data: reg } = await supabaseServer
    .from('agent_registrations')
    .select('tasks_completed, reputation')
    .eq('wallet', w)
    .single();

  if (reg) {
    const tasks = reg.tasks_completed;
    const achUpdates = [
      { id: 'ach_first_task', current: Math.min(tasks, 1) },
      { id: 'ach_10_tasks', current: Math.min(tasks, 10) },
      { id: 'ach_100_tasks', current: Math.min(tasks, 100) },
      { id: 'ach_rep_90', current: Math.min(reg.reputation, 90) },
    ];

    for (const a of achUpdates) {
      await supabaseServer
        .from('quest_progress')
        .update({ current: a.current, status: a.current >= (ACHIEVEMENTS.find(q => q.id === a.id)?.requirement || 999) ? 'completed' : 'active' })
        .eq('wallet', w)
        .eq('quest_id', a.id)
        .eq('status', 'active');
    }
  }

  // ach_streak_7, ach_streak_30
  const streakData = await getStreak(w);
  const streakAchs = [
    { id: 'ach_streak_7', current: Math.min(streakData.current_streak, 7), req: 7 },
    { id: 'ach_streak_30', current: Math.min(streakData.current_streak, 30), req: 30 },
  ];
  for (const s of streakAchs) {
    await supabaseServer
      .from('quest_progress')
      .update({ current: s.current, status: s.current >= s.req ? 'completed' : 'active' })
      .eq('wallet', w)
      .eq('quest_id', s.id)
      .eq('status', 'active');
  }
}

// Claim a quest reward
export async function claimQuest(wallet: string, questId: string) {
  const w = wallet.toLowerCase();

  const { data: quest } = await supabaseServer
    .from('quest_progress')
    .select('*')
    .eq('wallet', w)
    .eq('quest_id', questId)
    .eq('status', 'completed')
    .single();

  if (!quest) throw new Error('Quest not completed or already claimed');

  await supabaseServer
    .from('quest_progress')
    .update({ status: 'claimed', claimed_at: new Date().toISOString() })
    .eq('id', quest.id);

  return { questId, reward: quest.reward };
}

// Get all quests for a wallet
export async function getQuests(wallet: string) {
  const w = wallet.toLowerCase();
  const todayStr = today();
  const weekStr = weekStart();

  // Clean up old daily/weekly quests
  await supabaseServer
    .from('quest_progress')
    .delete()
    .eq('wallet', w)
    .eq('quest_type', 'daily')
    .neq('period_start', todayStr);

  await supabaseServer
    .from('quest_progress')
    .delete()
    .eq('wallet', w)
    .eq('quest_type', 'weekly')
    .neq('period_start', weekStr);

  // Initialize if needed
  await initQuests(w);

  const { data: quests } = await supabaseServer
    .from('quest_progress')
    .select('*')
    .eq('wallet', w)
    .order('quest_type', { ascending: true })
    .order('quest_id', { ascending: true });

  const streak = await getStreak(w);

  return { quests: quests || [], streak };
}
