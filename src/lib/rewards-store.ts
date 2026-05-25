import type { AgentTask, RewardRecord, AgentRegistration, TaskType } from '@/types/rewards';

// In-memory store (replace with database in production)
const tasks: Map<string, AgentTask> = new Map();
const rewards: Map<string, RewardRecord> = new Map();
const registrations: Map<string, AgentRegistration> = new Map();

let taskCounter = 0;
let rewardCounter = 0;

function generateId(prefix: string, counter: number): string {
  return `${prefix}_${counter.toString().padStart(6, '0')}`;
}

// Agent registration
export function registerAgent(agentId: string, wallet: string): AgentRegistration {
  if (registrations.has(wallet)) {
    throw new Error('Wallet already registered');
  }

  const reg: AgentRegistration = {
    agentId,
    wallet: wallet.toLowerCase(),
    reputation: 50,
    totalEarned: 0,
    pendingReward: 0,
    tasksCompleted: 0,
    registeredAt: new Date().toISOString(),
  };

  registrations.set(wallet.toLowerCase(), reg);
  return reg;
}

// Submit a task
export function submitTask(
  agentId: string,
  wallet: string,
  type: TaskType,
  score: number,
  proof: string
): AgentTask {
  const w = wallet.toLowerCase();
  const reg = registrations.get(w);
  if (!reg) throw new Error('Agent not registered');

  const rewardAmount = calculateReward(type, score, reg.reputation);

  const task: AgentTask = {
    id: generateId('task', ++taskCounter),
    agentId,
    wallet: w,
    type,
    score: Math.min(100, Math.max(0, score)),
    rewardAmount,
    status: 'submitted',
    proof,
    createdAt: new Date().toISOString(),
  };

  tasks.set(task.id, task);
  return task;
}

// Verify a task
export function verifyTask(taskId: string): AgentTask {
  const task = tasks.get(taskId);
  if (!task) throw new Error('Task not found');
  if (task.status !== 'submitted') throw new Error('Task already processed');

  task.status = 'verified';
  task.verifiedAt = new Date().toISOString();

  // Create reward record
  const reward: RewardRecord = {
    id: generateId('rwd', ++rewardCounter),
    agentId: task.agentId,
    wallet: task.wallet,
    amount: task.rewardAmount,
    taskType: task.type,
    score: task.score,
    claimed: false,
    createdAt: new Date().toISOString(),
  };
  rewards.set(reward.id, reward);

  // Update registration
  const reg = registrations.get(task.wallet);
  if (reg) {
    reg.pendingReward += task.rewardAmount;
    reg.tasksCompleted += 1;
    // Update reputation (moving average)
    reg.reputation = Math.round((reg.reputation * 9 + task.score) / 10);
  }

  return task;
}

// Get pending rewards for a wallet
export function getPendingRewards(wallet: string): {
  total: number;
  rewards: RewardRecord[];
} {
  const w = wallet.toLowerCase();
  const pending = Array.from(rewards.values()).filter(
    (r) => r.wallet === w && !r.claimed
  );
  return {
    total: pending.reduce((sum, r) => sum + r.amount, 0),
    rewards: pending,
  };
}

// Mark rewards as claimed
export function markClaimed(wallet: string): RewardRecord[] {
  const w = wallet.toLowerCase();
  const claimed: RewardRecord[] = [];

  for (const reward of rewards.values()) {
    if (reward.wallet === w && !reward.claimed) {
      reward.claimed = true;
      reward.claimedAt = new Date().toISOString();
      claimed.push(reward);
    }
  }

  // Update registration
  const reg = registrations.get(w);
  if (reg) {
    reg.totalEarned += reg.pendingReward;
    reg.pendingReward = 0;
  }

  return claimed;
}

// Get leaderboard
export function getLeaderboard(limit = 20): AgentRegistration[] {
  return Array.from(registrations.values())
    .sort((a, b) => b.totalEarned - a.totalEarned)
    .slice(0, limit);
}

// Get agent registration
export function getRegistration(wallet: string): AgentRegistration | null {
  return registrations.get(wallet.toLowerCase()) || null;
}

// Get all tasks for a wallet
export function getTasksByWallet(wallet: string): AgentTask[] {
  const w = wallet.toLowerCase();
  return Array.from(tasks.values())
    .filter((t) => t.wallet === w)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// Calculate reward based on task type, score, and reputation
function calculateReward(type: TaskType, score: number, reputation: number): number {
  const baseRewards: Record<TaskType, number> = {
    data_processing: 10,
    api_call: 5,
    computation: 15,
    content_generation: 12,
  };

  const base = baseRewards[type];
  // Scale by score (0-100) and reputation (0-100)
  const scoreMultiplier = score / 100;
  const repMultiplier = reputation / 100;

  return Math.round(base * scoreMultiplier * repMultiplier * 100) / 100;
}
