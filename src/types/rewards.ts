export type TaskType = 'data_processing' | 'api_call' | 'computation' | 'content_generation';

export type TaskStatus = 'submitted' | 'verified' | 'rejected';

export interface AgentTask {
  id: string;
  agentId: string;
  wallet: string;
  type: TaskType;
  score: number;        // 0-100
  rewardAmount: number; // in REKT wei
  status: TaskStatus;
  proof: string;        // task completion proof/data
  createdAt: string;
  verifiedAt?: string;
}

export interface RewardRecord {
  id: string;
  agentId: string;
  wallet: string;
  amount: number;
  taskType: TaskType;
  score: number;
  claimed: boolean;
  claimedAt?: string;
  createdAt: string;
}

export interface AgentRegistration {
  agentId: string;
  wallet: string;
  reputation: number;
  totalEarned: number;
  pendingReward: number;
  tasksCompleted: number;
  registeredAt: string;
}

export interface RewardLeaderboardEntry {
  rank: number;
  wallet: string;
  agentId: string;
  totalEarned: number;
  tasksCompleted: number;
  reputation: number;
}

export interface ClaimData {
  to: string;
  data: string;
  value: string;
}

export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  data_processing: 'Data Processing',
  api_call: 'API Call',
  computation: 'Computation',
  content_generation: 'Content Gen',
};

export const TASK_TYPE_REWARDS: Record<TaskType, number> = {
  data_processing: 10,
  api_call: 5,
  computation: 15,
  content_generation: 12,
};
