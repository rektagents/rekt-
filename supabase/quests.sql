-- Quests + Streaks Tables
-- Run in Supabase SQL Editor

-- Streak tracking per wallet
CREATE TABLE IF NOT EXISTS streaks (
  wallet TEXT PRIMARY KEY,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_active_date DATE,
  multiplier NUMERIC DEFAULT 1.0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Quest progress per wallet
CREATE TABLE IF NOT EXISTS quest_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet TEXT NOT NULL,
  quest_id TEXT NOT NULL,
  quest_type TEXT NOT NULL CHECK (quest_type IN ('daily', 'weekly', 'achievement')),
  current INTEGER DEFAULT 0,
  requirement INTEGER NOT NULL,
  reward NUMERIC NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'claimed')),
  period_start DATE, -- for daily/weekly resets
  completed_at TIMESTAMPTZ,
  claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(wallet, quest_id, period_start)
);

CREATE INDEX IF NOT EXISTS idx_quest_wallet ON quest_progress(wallet);
CREATE INDEX IF NOT EXISTS idx_quest_status ON quest_progress(wallet, status);

-- Auto-update updated_at on streaks
CREATE TRIGGER streaks_updated_at
  BEFORE UPDATE ON streaks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
