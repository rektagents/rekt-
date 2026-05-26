export type QuestType = 'daily' | 'weekly' | 'achievement';
export type QuestStatus = 'active' | 'completed' | 'claimed';

// Display definition for a quest (used in UI constants)
export interface QuestDef {
  id: string;
  title: string;
  description: string;
  type: QuestType;
  requirement: number;
  reward: number;
  icon: string;
}

// DB row from quest_progress table
export interface QuestProgress {
  id: string;
  wallet: string;
  quest_id: string;
  quest_type: QuestType;
  requirement: number;
  current: number;
  reward: number;
  status: QuestStatus;
  period_start: string | null;
  completed_at: string | null;
  claimed_at: string | null;
}

export interface Streak {
  wallet: string;
  current_streak: number;
  longest_streak: number;
  last_active_date: string;
  multiplier: number;
}

export const DAILY_QUESTS: QuestDef[] = [
  { id: 'daily_1_task', title: 'Daily Grind', description: 'Complete 1 task today', type: 'daily', requirement: 1, reward: 3, icon: '$' },
  { id: 'daily_3_tasks', title: 'Triple Threat', description: 'Complete 3 tasks today', type: 'daily', requirement: 3, reward: 10, icon: '#' },
  { id: 'daily_high_score', title: 'Perfectionist', description: 'Score 90+ on any task', type: 'daily', requirement: 1, reward: 5, icon: '*' },
];

export const WEEKLY_QUESTS: QuestDef[] = [
  { id: 'weekly_10_tasks', title: 'Weekly Warrior', description: 'Complete 10 tasks this week', type: 'weekly', requirement: 10, reward: 25, icon: '>' },
  { id: 'weekly_all_types', title: 'Jack of All Trades', description: 'Submit all 4 task types', type: 'weekly', requirement: 4, reward: 20, icon: '~' },
  { id: 'weekly_streak_5', title: 'Consistency King', description: 'Maintain a 5-day streak', type: 'weekly', requirement: 5, reward: 15, icon: '!' },
];

export const ACHIEVEMENTS: QuestDef[] = [
  { id: 'ach_first_task', title: 'First Blood', description: 'Complete your first task', type: 'achievement', requirement: 1, reward: 10, icon: '1' },
  { id: 'ach_10_tasks', title: 'Getting Started', description: 'Complete 10 tasks', type: 'achievement', requirement: 10, reward: 25, icon: '2' },
  { id: 'ach_100_tasks', title: 'Centurion', description: 'Complete 100 tasks', type: 'achievement', requirement: 100, reward: 100, icon: '3' },
  { id: 'ach_rep_90', title: 'Elite Agent', description: 'Reach 90 reputation', type: 'achievement', requirement: 90, reward: 50, icon: '4' },
  { id: 'ach_streak_7', title: 'Week Warrior', description: '7-day streak', type: 'achievement', requirement: 7, reward: 30, icon: '5' },
  { id: 'ach_streak_30', title: 'Unstoppable', description: '30-day streak', type: 'achievement', requirement: 30, reward: 200, icon: '6' },
];

export const STREAK_MULTIPLIERS: Record<number, number> = {
  0: 1.0,
  3: 1.1,   // 3+ days = 10% bonus
  7: 1.2,   // 7+ days = 20% bonus
  14: 1.3,  // 14+ days = 30% bonus
  30: 1.5,  // 30+ days = 50% bonus
};
