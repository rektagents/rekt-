-- Portfolio holdings table
CREATE TABLE IF NOT EXISTS portfolio_holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,           -- wallet address (lowercase)
  coin_id TEXT NOT NULL,           -- "chainId:address" format
  coin_name TEXT NOT NULL,
  coin_symbol TEXT NOT NULL,
  coin_image TEXT NOT NULL DEFAULT '',
  quantity NUMERIC NOT NULL,
  buy_price NUMERIC NOT NULL,
  buy_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast user lookups
CREATE INDEX IF NOT EXISTS idx_portfolio_user ON portfolio_holdings(user_id);

-- Price alerts table
CREATE TABLE IF NOT EXISTS price_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,           -- wallet address (lowercase)
  coin_id TEXT NOT NULL,           -- "chainId:address" format
  coin_name TEXT NOT NULL,
  coin_symbol TEXT NOT NULL,
  coin_image TEXT NOT NULL DEFAULT '',
  condition TEXT NOT NULL CHECK (condition IN ('above', 'below')),
  target_price NUMERIC NOT NULL,
  current_price NUMERIC DEFAULT 0,
  triggered BOOLEAN DEFAULT false,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  triggered_at TIMESTAMPTZ
);

-- Index for fast user lookups
CREATE INDEX IF NOT EXISTS idx_alerts_user ON price_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_active ON price_alerts(user_id, enabled) WHERE triggered = false;

-- Season leaderboard view (aggregates from reward_tasks by time period)
CREATE OR REPLACE VIEW season_leaderboard AS
SELECT
  wallet,
  COUNT(*) FILTER (WHERE status = 'verified') as tasks_completed,
  COALESCE(SUM(reward_amount) FILTER (WHERE status = 'verified' AND claimed = true), 0) as total_earned,
  COALESCE(SUM(reward_amount) FILTER (WHERE status = 'verified' AND claimed = false), 0) as pending_earnings,
  MIN(created_at) as first_active,
  MAX(updated_at) as last_active
FROM reward_tasks
GROUP BY wallet;
