#!/bin/bash
# Seed marketplace tasks and governance proposals via API calls
# Run from the project root: bash scripts/seed-data.sh

BASE_URL="http://localhost:3000"

echo "Seeding marketplace tasks..."

# Task 1: Data feed agent
curl -s -X POST "$BASE_URL/api/marketplace/tasks" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Build a real-time ETH/USD price feed agent",
    "description": "Need an agent that monitors ETH/USD across 3 DEXes and posts price updates every 30 seconds to a Supabase table. Must handle chain reorgs and include confidence intervals.",
    "task_type": "computation",
    "reward_amount": "5000",
    "reward_token": "REKT",
    "deadline": "2026-06-15T00:00:00Z",
    "poster_address": "0x1234567890abcdef1234567890abcdef12345678"
  }' && echo " ✓ Task 1"

# Task 2: Research agent
curl -s -X POST "$BASE_URL/api/marketplace/tasks" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Analyze top 50 Base tokens for whale accumulation patterns",
    "description": "Research agent needed to scan Base chain for top 50 tokens by volume. Track wallets holding >1% supply, identify accumulation patterns over 7-day windows, generate daily report.",
    "task_type": "research",
    "reward_amount": "3000",
    "reward_token": "REKT",
    "deadline": "2026-06-10T00:00:00Z",
    "poster_address": "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd"
  }' && echo " ✓ Task 2"

# Task 3: Trading agent
curl -s -X POST "$BASE_URL/api/marketplace/tasks" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "DCA trading bot for Base tokens",
    "description": "Build a dollar-cost averaging agent that executes buys on Uniswap V3 on Base. Configurable tokens, amounts, and intervals. Must include slippage protection and gas optimization.",
    "task_type": "trading",
    "reward_amount": "8000",
    "reward_token": "REKT",
    "deadline": "2026-06-20T00:00:00Z",
    "poster_address": "0x1234567890abcdef1234567890abcdef12345678"
  }' && echo " ✓ Task 3"

# Task 4: Content agent
curl -s -X POST "$BASE_URL/api/marketplace/tasks" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Generate daily market summary tweets",
    "description": "Content agent that pulls top gainers/losers, market cap changes, and trending tokens from DexScreener API. Formats into engaging tweet threads with charts. Posts via X API.",
    "task_type": "content",
    "reward_amount": "2000",
    "reward_token": "REKT",
    "deadline": "2026-06-08T00:00:00Z",
    "poster_address": "0x9876543210fedcba9876543210fedcba98765432"
  }' && echo " ✓ Task 4"

# Task 5: Custom - already claimed
curl -s -X POST "$BASE_URL/api/marketplace/tasks" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Smart contract audit for AgentRegistry",
    "description": "Audit the AgentRegistry.sol contract for security vulnerabilities. Focus on reentrancy, access control, and economic attack vectors. Deliver a formal report.",
    "task_type": "custom",
    "reward_amount": "10000",
    "reward_token": "REKT",
    "deadline": "2026-06-25T00:00:00Z",
    "poster_address": "0x1234567890abcdef1234567890abcdef12345678"
  }' && echo " ✓ Task 5"

# Task 6: Computation - submitted
curl -s -X POST "$BASE_URL/api/marketplace/tasks" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "On-chain sentiment analysis from social feeds",
    "description": "Agent that monitors Twitter/X, Telegram, and Discord for mentions of Base tokens. Scores sentiment using NLP, stores results in Supabase, triggers alerts on sentiment spikes.",
    "task_type": "computation",
    "reward_amount": "6000",
    "reward_token": "REKT",
    "deadline": "2026-06-12T00:00:00Z",
    "poster_address": "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd"
  }' && echo " ✓ Task 6"

echo ""
echo "Seeding governance proposals..."

# Proposal 1
curl -s -X POST "$BASE_URL/api/governance/proposals" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Increase staking rewards by 25%",
    "description": "Proposal to increase REKT staking rewards from 10% to 12.5% APY to incentivize more long-term holders and reduce circulating supply. Funded from treasury reserves.",
    "proposer_address": "0x1234567890abcdef1234567890abcdef12345678"
  }' && echo " ✓ Proposal 1"

# Proposal 2
curl -s -X POST "$BASE_URL/api/governance/proposals" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Add Solana support to marketplace",
    "description": "Expand the agent marketplace to support Solana-based agents alongside Base. This requires updating the AgentRegistry to handle cross-chain identity and adding Solana RPC integration.",
    "proposer_address": "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd"
  }' && echo " ✓ Proposal 2"

# Proposal 3
curl -s -X POST "$BASE_URL/api/governance/proposals" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Reduce marketplace fee from 5% to 2.5%",
    "description": "Lower the platform fee on marketplace transactions to attract more task posters and increase volume. The reduced fee will be offset by higher transaction count.",
    "proposer_address": "0x9876543210fedcba9876543210fedcba98765432"
  }' && echo " ✓ Proposal 3"

echo ""
echo "Done! Seed data created."
