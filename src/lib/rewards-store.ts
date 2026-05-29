import { supabaseServer } from './supabase-server';
import type { TaskType } from '@/types/rewards';

// Calculate reward based on task type, score, and reputation
function calculateReward(type: TaskType, score: number, reputation: number): number {
  const baseRewards: Record<TaskType, number> = {
    data_processing: 10,
    api_call: 5,
    computation: 15,
    content_generation: 12,
  };
  const base = baseRewards[type];
  return Math.round(base * (score / 100) * (reputation / 100) * 100) / 100;
}

// Agent registration
export async function registerAgent(agentId: string, wallet: string) {
  const w = wallet.toLowerCase();

  // Check if already registered
  const { data: existing } = await supabaseServer
    .from('agent_registrations')
    .select('*')
    .eq('wallet', w)
    .single();

  if (existing) throw new Error('Wallet already registered');

  const { data, error } = await supabaseServer
    .from('agent_registrations')
    .insert({
      agent_id: agentId,
      wallet: w,
      reputation: 50,
      total_earned: 0,
      pending_reward: 0,
      tasks_completed: 0,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// Submit a task
export async function submitTask(
  agentId: string,
  wallet: string,
  type: TaskType,
  score: number,
  proof: string
) {
  const w = wallet.toLowerCase();

  // Get registration
  const { data: reg } = await supabaseServer
    .from('agent_registrations')
    .select('*')
    .eq('wallet', w)
    .single();

  if (!reg) throw new Error('Agent not registered');

  const clampedScore = Math.min(100, Math.max(0, score));
  const rewardAmount = calculateReward(type, clampedScore, reg.reputation);

  // Generate task ID
  const { count } = await supabaseServer
    .from('reward_tasks')
    .select('*', { count: 'exact', head: true });

  const taskId = `task_${((count || 0) + 1).toString().padStart(6, '0')}`;

  const { data, error } = await supabaseServer
    .from('reward_tasks')
    .insert({
      id: taskId,
      agent_id: agentId,
      wallet: w,
      task_type: type,
      score: clampedScore,
      reward_amount: rewardAmount,
      status: 'submitted',
      proof,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// Verify a task
export async function verifyTask(taskId: string) {
  // Get task
  const { data: task } = await supabaseServer
    .from('reward_tasks')
    .select('*')
    .eq('id', taskId)
    .single();

  if (!task) throw new Error('Task not found');
  if (task.status !== 'submitted') throw new Error('Task already processed');

  // Get registration
  const { data: reg } = await supabaseServer
    .from('agent_registrations')
    .select('*')
    .eq('wallet', task.wallet)
    .single();

  if (!reg) throw new Error('Agent not registered');

  // Update task status
  await supabaseServer
    .from('reward_tasks')
    .update({ status: 'verified', verified_at: new Date().toISOString() })
    .eq('id', taskId);

  // Generate reward ID
  const { count } = await supabaseServer
    .from('reward_records')
    .select('*', { count: 'exact', head: true });

  const rewardId = `rwd_${((count || 0) + 1).toString().padStart(6, '0')}`;

  // Create reward record
  await supabaseServer
    .from('reward_records')
    .insert({
      id: rewardId,
      agent_id: task.agent_id,
      wallet: task.wallet,
      amount: task.reward_amount,
      task_type: task.task_type,
      score: task.score,
      claimed: false,
    });

  // Update registration
  const newRep = Math.round((reg.reputation * 9 + task.score) / 10);
  await supabaseServer
    .from('agent_registrations')
    .update({
      pending_reward: reg.pending_reward + task.reward_amount,
      tasks_completed: reg.tasks_completed + 1,
      reputation: newRep,
    })
    .eq('wallet', task.wallet);

  return { ...task, status: 'verified', verified_at: new Date().toISOString() };
}

// Get pending rewards for a wallet
export async function getPendingRewards(wallet: string) {
  const w = wallet.toLowerCase();

  const { data: rewards } = await supabaseServer
    .from('reward_records')
    .select('*')
    .eq('wallet', w)
    .eq('claimed', false);

  const pending = rewards || [];
  return {
    total: pending.reduce((sum: number, r: any) => sum + r.amount, 0),
    rewards: pending,
  };
}

// Mark rewards as claimed
export async function markClaimed(wallet: string) {
  const w = wallet.toLowerCase();

  // Get unclaimed rewards
  const { data: pendingRewards } = await supabaseServer
    .from('reward_records')
    .select('*')
    .eq('wallet', w)
    .eq('claimed', false);

  if (!pendingRewards || pendingRewards.length === 0) {
    throw new Error('No pending rewards');
  }

  const totalClaimed = pendingRewards.reduce((sum: number, r: any) => sum + r.amount, 0);

  // Mark all as claimed
  await supabaseServer
    .from('reward_records')
    .update({ claimed: true, claimed_at: new Date().toISOString() })
    .eq('wallet', w)
    .eq('claimed', false);

  // Update registration
  const { data: reg } = await supabaseServer
    .from('agent_registrations')
    .select('*')
    .eq('wallet', w)
    .single();

  if (reg) {
    await supabaseServer
      .from('agent_registrations')
      .update({
        total_earned: reg.total_earned + totalClaimed,
        pending_reward: 0,
      })
      .eq('wallet', w);
  }

  return pendingRewards.map((r: any) => ({
    ...r,
    claimed: true,
    claimed_at: new Date().toISOString(),
  }));
}

// Get leaderboard (all time)
export async function getLeaderboard(limit = 20) {
  const { data } = await supabaseServer
    .from('agent_registrations')
    .select('*')
    .order('total_earned', { ascending: false })
    .limit(limit);

  return data || [];
}

// Get season leaderboard (filtered by date range from reward_tasks)
export async function getSeasonLeaderboard(startDate: string, endDate: string, limit = 20) {
  const { data } = await supabaseServer
    .from('reward_tasks')
    .select('wallet, agent_id, reward_amount, status')
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .eq('status', 'verified');

  if (!data || data.length === 0) return [];

  // Aggregate by wallet
  const byWallet = new Map<string, { wallet: string; agent_id: string; totalEarned: number; tasksCompleted: number }>();
  for (const row of data) {
    const key = row.wallet;
    const existing = byWallet.get(key);
    if (existing) {
      existing.totalEarned += row.reward_amount || 0;
      existing.tasksCompleted += 1;
    } else {
      byWallet.set(key, {
        wallet: row.wallet,
        agent_id: row.agent_id,
        totalEarned: row.reward_amount || 0,
        tasksCompleted: 1,
      });
    }
  }

  return Array.from(byWallet.values())
    .sort((a, b) => b.totalEarned - a.totalEarned)
    .slice(0, limit);
}

// Get agent registration
export async function getRegistration(wallet: string) {
  const { data } = await supabaseServer
    .from('agent_registrations')
    .select('*')
    .eq('wallet', wallet.toLowerCase())
    .single();

  return data || null;
}

// Get all tasks for a wallet
export async function getTasksByWallet(wallet: string) {
  const { data } = await supabaseServer
    .from('reward_tasks')
    .select('*')
    .eq('wallet', wallet.toLowerCase())
    .order('created_at', { ascending: false });

  return data || [];
}
