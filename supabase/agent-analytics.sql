-- Agent analytics table for time-series metric tracking
CREATE TABLE IF NOT EXISTS agent_analytics (
  id BIGSERIAL PRIMARY KEY,
  agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('users', 'transactions', 'volume', 'uptime')),
  value NUMERIC NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_agent_metric ON agent_analytics (agent_id, metric_type, recorded_at);

ALTER TABLE agent_analytics DISABLE ROW LEVEL SECURITY;

-- Seed some sample data for existing agents
INSERT INTO agent_analytics (agent_id, metric_type, value, recorded_at)
SELECT
  a.id,
  m.metric_type,
  CASE m.metric_type
    WHEN 'users' THEN (random() * 5000 + 1000)::int
    WHEN 'transactions' THEN (random() * 20000 + 5000)::int
    WHEN 'volume' THEN (random() * 500000 + 100000)::int
    WHEN 'uptime' THEN 95 + random() * 5
  END,
  NOW() - (d.day || ' days')::interval
FROM agents a
CROSS JOIN generate_series(0, 29) AS d(day)
CROSS JOIN (VALUES ('users'), ('transactions'), ('volume'), ('uptime')) AS m(metric_type);
