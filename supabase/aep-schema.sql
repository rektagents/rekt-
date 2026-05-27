-- Agent Economy Protocol Schema Extensions
-- Run in Supabase SQL Editor AFTER schema.sql

-- ============================================
-- 1. Extend agents table with on-chain fields
-- ============================================
ALTER TABLE agents ADD COLUMN IF NOT EXISTS onchain_token_id BIGINT;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS onchain_address TEXT UNIQUE;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS metadata_uri TEXT;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS staked_amount NUMERIC DEFAULT 0;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS agent_type TEXT DEFAULT 'autonomous'
  CHECK (agent_type IN ('autonomous', 'human-assisted', 'hybrid'));
ALTER TABLE agents ADD COLUMN IF NOT EXISTS capabilities TEXT[] DEFAULT '{}';
ALTER TABLE agents ADD COLUMN IF NOT EXISTS integrations JSONB DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_agents_onchain ON agents(onchain_address) WHERE onchain_address IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_agents_token_id ON agents(onchain_token_id) WHERE onchain_token_id IS NOT NULL;

-- ============================================
-- 2. Marketplace tasks
-- ============================================
CREATE TABLE IF NOT EXISTS marketplace_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  onchain_task_id BIGINT,
  poster_address TEXT NOT NULL,
  worker_address TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('computation','research','trading','content','coding','data','custom')),
  reward_amount NUMERIC NOT NULL,
  reward_token TEXT DEFAULT 'REKT',
  stake_required NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'open' CHECK (status IN ('open','claimed','submitted','verified','disputed','cancelled','expired')),
  deadline TIMESTAMPTZ,
  proof_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_mkt_tasks_status ON marketplace_tasks(status);
CREATE INDEX IF NOT EXISTS idx_mkt_tasks_poster ON marketplace_tasks(poster_address);
CREATE INDEX IF NOT EXISTS idx_mkt_tasks_worker ON marketplace_tasks(worker_address);
CREATE INDEX IF NOT EXISTS idx_mkt_tasks_category ON marketplace_tasks(category);

-- ============================================
-- 3. Task applications / bids
-- ============================================
CREATE TABLE IF NOT EXISTS task_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES marketplace_tasks(id) ON DELETE CASCADE,
  agent_address TEXT NOT NULL,
  proposal TEXT NOT NULL,
  proposed_reward NUMERIC,
  estimated_time TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected','withdrawn')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(task_id, agent_address)
);

CREATE INDEX IF NOT EXISTS idx_apps_task ON task_applications(task_id);
CREATE INDEX IF NOT EXISTS idx_apps_agent ON task_applications(agent_address);

-- ============================================
-- 4. Agent capabilities (fine-grained skills)
-- ============================================
CREATE TABLE IF NOT EXISTS agent_capabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  agent_address TEXT NOT NULL,
  skill TEXT NOT NULL,
  proficiency INTEGER DEFAULT 50 CHECK (proficiency BETWEEN 0 AND 100),
  verified BOOLEAN DEFAULT false,
  endorsements INTEGER DEFAULT 0,
  tasks_completed_in_skill INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_caps_agent ON agent_capabilities(agent_id);
CREATE INDEX IF NOT EXISTS idx_caps_skill ON agent_capabilities(skill);
CREATE INDEX IF NOT EXISTS idx_caps_address ON agent_capabilities(agent_address);

-- ============================================
-- 5. Staking records
-- ============================================
CREATE TABLE IF NOT EXISTS staking_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_address TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('stake','unstake_initiated','unstaked','slashed')),
  amount NUMERIC NOT NULL,
  tx_hash TEXT,
  cooldown_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_staking_agent ON staking_records(agent_address);

-- ============================================
-- 6. Governance proposals
-- ============================================
CREATE TABLE IF NOT EXISTS governance_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  onchain_proposal_id BIGINT,
  proposer_address TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata_uri TEXT,
  target_contract TEXT,
  call_data TEXT,
  for_votes NUMERIC DEFAULT 0,
  against_votes NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','active','succeeded','defeated','executed','cancelled')),
  start_block BIGINT,
  end_block BIGINT,
  created_at TIMESTAMPTZ DEFAULT now(),
  executed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_gov_status ON governance_proposals(status);
CREATE INDEX IF NOT EXISTS idx_gov_proposer ON governance_proposals(proposer_address);

-- ============================================
-- 7. Governance votes
-- ============================================
CREATE TABLE IF NOT EXISTS governance_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID REFERENCES governance_proposals(id) ON DELETE CASCADE,
  voter_address TEXT NOT NULL,
  support BOOLEAN NOT NULL,
  weight NUMERIC NOT NULL,
  tx_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(proposal_id, voter_address)
);

CREATE INDEX IF NOT EXISTS idx_votes_proposal ON governance_votes(proposal_id);

-- ============================================
-- 8. Agent transactions log (on-chain events)
-- ============================================
CREATE TABLE IF NOT EXISTS agent_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_address TEXT NOT NULL,
  tx_type TEXT NOT NULL CHECK (tx_type IN ('register','task_complete','reward_claim','stake','unstake','slash','task_post','task_claim','governance_vote')),
  amount NUMERIC,
  counterparty_address TEXT,
  tx_hash TEXT,
  block_number BIGINT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tx_agent ON agent_transactions(agent_address);
CREATE INDEX IF NOT EXISTS idx_tx_type ON agent_transactions(tx_type);
CREATE INDEX IF NOT EXISTS idx_tx_hash ON agent_transactions(tx_hash);

-- ============================================
-- 9. Auto-update triggers for new tables
-- ============================================
CREATE TRIGGER capabilities_updated_at
  BEFORE UPDATE ON agent_capabilities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 10. RLS policies (service role only for now)
-- ============================================
ALTER TABLE marketplace_tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE task_applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE agent_capabilities DISABLE ROW LEVEL SECURITY;
ALTER TABLE staking_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE governance_proposals DISABLE ROW LEVEL SECURITY;
ALTER TABLE governance_votes DISABLE ROW LEVEL SECURITY;
ALTER TABLE agent_transactions DISABLE ROW LEVEL SECURITY;
