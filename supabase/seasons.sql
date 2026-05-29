-- Seasons table for leaderboard periods
CREATE TABLE IF NOT EXISTS seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  prize_pool NUMERIC DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_seasons_active ON seasons(active) WHERE active = true;

-- Seed Season 1
INSERT INTO seasons (name, start_date, end_date, prize_pool, active) VALUES
('Season 1', '2026-05-01T00:00:00Z', '2026-06-30T23:59:59Z', 100000, true);

-- Disable RLS
ALTER TABLE seasons DISABLE ROW LEVEL SECURITY;
