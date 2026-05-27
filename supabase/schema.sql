-- REKT Platform Schema
-- Run this in Supabase SQL Editor

-- Agents registry
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('defi','trading','research','social','coding','gaming','data','other')),
  status TEXT NOT NULL DEFAULT 'beta' CHECK (status IN ('live','beta','coming-soon')),
  creator_wallet TEXT NOT NULL,
  avatar_url TEXT,
  website TEXT,
  twitter TEXT,
  discord TEXT,
  github TEXT,
  token_symbol TEXT,
  token_address TEXT,
  chain TEXT DEFAULT 'multi',
  tags TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT false,
  metrics_users INTEGER DEFAULT 0,
  metrics_transactions BIGINT DEFAULT 0,
  metrics_volume NUMERIC DEFAULT 0,
  metrics_uptime NUMERIC DEFAULT 99.9,
  metrics_rating NUMERIC DEFAULT 0,
  metrics_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agents_category ON agents(category);
CREATE INDEX IF NOT EXISTS idx_agents_featured ON agents(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_agents_creator ON agents(creator_wallet);

-- Agent registrations for reward system
CREATE TABLE IF NOT EXISTS agent_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id TEXT NOT NULL UNIQUE,
  wallet TEXT NOT NULL UNIQUE,
  reputation INTEGER DEFAULT 50 CHECK (reputation BETWEEN 0 AND 100),
  total_earned NUMERIC DEFAULT 0,
  pending_reward NUMERIC DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  registered_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_registrations_wallet ON agent_registrations(wallet);

-- Tasks
CREATE TABLE IF NOT EXISTS reward_tasks (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  wallet TEXT NOT NULL,
  task_type TEXT NOT NULL CHECK (task_type IN ('data_processing','api_call','computation','content_generation')),
  score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
  reward_amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted','verified','rejected')),
  proof TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  verified_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_tasks_wallet ON reward_tasks(wallet);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON reward_tasks(status);

-- Reward records
CREATE TABLE IF NOT EXISTS reward_records (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  wallet TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  task_type TEXT NOT NULL,
  score INTEGER NOT NULL,
  claimed BOOLEAN DEFAULT false,
  tx_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  claimed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_rewards_wallet ON reward_records(wallet);
CREATE INDEX IF NOT EXISTS idx_rewards_unclaimed ON reward_records(wallet) WHERE claimed = false;

-- Agent reviews
CREATE TABLE IF NOT EXISTS agent_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  reviewer_wallet TEXT NOT NULL,
  reviewer_name TEXT,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reviews_agent ON agent_reviews(agent_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER agents_updated_at
  BEFORE UPDATE ON agents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- AEP (Agent Economy Protocol) Extensions
-- ============================================================

-- Extend agents with on-chain protocol fields
ALTER TABLE agents ADD COLUMN IF NOT EXISTS onchain_address TEXT UNIQUE;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS metadata_uri TEXT;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS staked_amount NUMERIC DEFAULT 0;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS reputation_onchain NUMERIC DEFAULT 5000;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS agent_type TEXT DEFAULT 'autonomous' CHECK (agent_type IN ('autonomous', 'human-assisted', 'hybrid'));
ALTER TABLE agents ADD COLUMN IF NOT EXISTS capabilities TEXT[] DEFAULT '{}';
ALTER TABLE agents ADD COLUMN IF NOT EXISTS integrations JSONB DEFAULT '{}';
ALTER TABLE agents ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'Silver' CHECK (tier IN ('Bronze', 'Silver', 'Gold', 'Platinum'));

CREATE INDEX IF NOT EXISTS idx_agents_onchain ON agents(onchain_address) WHERE onchain_address IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_agents_type ON agents(agent_type);
CREATE INDEX IF NOT EXISTS idx_agents_tier ON agents(tier);

-- Marketplace tasks (agent-to-agent task posting)
CREATE TABLE IF NOT EXISTS marketplace_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    onchain_task_id BIGINT,
    poster_address TEXT NOT NULL,
    worker_address TEXT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    task_type TEXT NOT NULL CHECK (task_type IN ('computation', 'research', 'trading', 'content', 'custom')),
    reward_amount NUMERIC NOT NULL,
    reward_token TEXT DEFAULT 'REKT',
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'claimed', 'submitted', 'verified', 'disputed', 'cancelled', 'expired')),
    deadline TIMESTAMPTZ,
    proof_url TEXT,
    condition_hash TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_mkt_tasks_status ON marketplace_tasks(status);
CREATE INDEX IF NOT EXISTS idx_mkt_tasks_poster ON marketplace_tasks(poster_address);
CREATE INDEX IF NOT EXISTS idx_mkt_tasks_worker ON marketplace_tasks(worker_address);
CREATE INDEX IF NOT EXISTS idx_mkt_tasks_type ON marketplace_tasks(task_type);

-- Task applications
CREATE TABLE IF NOT EXISTS task_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES marketplace_tasks(id) ON DELETE CASCADE,
    applicant_address TEXT NOT NULL,
    proposal TEXT NOT NULL,
    proposed_reward NUMERIC,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_task_apps_task ON task_applications(task_id);
CREATE INDEX IF NOT EXISTS idx_task_apps_applicant ON task_applications(applicant_address);

-- Escrow records (agent-to-agent direct payments)
CREATE TABLE IF NOT EXISTS escrow_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    onchain_escrow_id BIGINT,
    payer_address TEXT NOT NULL,
    payee_address TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    token TEXT DEFAULT 'REKT',
    condition_hash TEXT,
    status TEXT DEFAULT 'created' CHECK (status IN ('created', 'released', 'refunded', 'disputed')),
    memo TEXT,
    timeout TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_escrow_payer ON escrow_records(payer_address);
CREATE INDEX IF NOT EXISTS idx_escrow_payee ON escrow_records(payee_address);
CREATE INDEX IF NOT EXISTS idx_escrow_status ON escrow_records(status);

-- Reputation history (track changes over time)
CREATE TABLE IF NOT EXISTS reputation_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_address TEXT NOT NULL,
    overall_score NUMERIC NOT NULL,
    task_completion NUMERIC,
    quality_score NUMERIC,
    reliability NUMERIC,
    economic_weight NUMERIC,
    trigger_type TEXT NOT NULL CHECK (trigger_type IN ('task_completion', 'peer_rating', 'slash', 'stake_bonus', 'initial')),
    recorded_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rep_hist_agent ON reputation_history(agent_address);

-- Agent analytics (daily snapshots)
CREATE TABLE IF NOT EXISTS agent_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_address TEXT NOT NULL,
    date DATE NOT NULL,
    tasks_completed INTEGER DEFAULT 0,
    earnings NUMERIC DEFAULT 0,
    reputation_score NUMERIC,
    staked_amount NUMERIC,
    UNIQUE(agent_address, date)
);

CREATE INDEX IF NOT EXISTS idx_analytics_agent ON agent_analytics(agent_address, date);
