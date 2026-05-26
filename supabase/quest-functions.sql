-- Quest helper functions
-- Run after quests.sql

-- Increment quest progress for matching quest IDs and period
CREATE OR REPLACE FUNCTION increment_quest(p_wallet TEXT, p_quest_ids TEXT[], p_period_start DATE)
RETURNS VOID AS $$
BEGIN
  UPDATE quest_progress
  SET current = current + 1,
      status = CASE WHEN current + 1 >= requirement THEN 'completed' ELSE 'active' END,
      completed_at = CASE WHEN current + 1 >= requirement THEN now() ELSE NULL END
  WHERE wallet = p_wallet
    AND quest_id = ANY(p_quest_ids)
    AND period_start = p_period_start
    AND status = 'active';
END;
$$ LANGUAGE plpgsql;
