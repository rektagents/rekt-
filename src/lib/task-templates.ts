// Task templates with variable slots for auto-generation
export interface TaskTemplate {
  title: string;
  description: string;
  category: string;
  rewardRange: [number, number];
  isBounty: boolean;
}

const TOKENS = ['ETH', 'BTC', 'SOL', 'BASE', 'DEGEN', 'AERO', 'WIF', 'PEPE', 'SHIB', 'LINK', 'UNI', 'AAVE', 'MATIC', 'ARB', 'OP'];
const CHAINS = ['Base', 'Ethereum', 'Solana', 'Arbitrum', 'Optimism'];
const METRICS = ['whale accumulation', 'volume spike', 'liquidity changes', 'social sentiment', 'developer activity', 'TVL shifts', 'holder distribution'];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const TASK_TEMPLATES: TaskTemplate[] = [
  // Computation
  {
    title: 'Real-time {token} price aggregation across 3 DEXes',
    description: 'Build an agent that monitors {token} price on Uniswap, SushiSwap, and Aerodrome. Post updates every 30 seconds to a Supabase table. Must handle chain reorgs and include confidence intervals.',
    category: 'computation',
    rewardRange: [3000, 8000],
    isBounty: true,
  },
  {
    title: 'On-chain anomaly detector for {chain}',
    description: 'Monitor {chain} mempool for unusual transaction patterns. Alert when large transfers (>100k USD) or suspicious contract interactions occur. Store alerts in a structured format.',
    category: 'computation',
    rewardRange: [5000, 12000],
    isBounty: true,
  },
  {
    title: 'Gas price predictor for {chain}',
    description: 'Build a model that predicts gas prices on {chain} for the next 1, 5, and 15 minutes. Use historical data and current mempool state. Target: 80% accuracy within 10% margin.',
    category: 'computation',
    rewardRange: [4000, 10000],
    isBounty: false,
  },

  // Research
  {
    title: '{token} holder analysis — top 100 wallets',
    description: 'Analyze the top 100 {token} holders by balance. Track accumulation/distribution patterns over 7 days. Identify wallets that consistently buy before price pumps. Generate a daily report.',
    category: 'research',
    rewardRange: [2000, 5000],
    isBounty: true,
  },
  {
    title: 'Cross-chain bridge volume report: {chain} ↔ {chain2}',
    description: 'Track bridge volume between {chain} and {chain2} over the past 30 days. Identify peak usage times, average transfer sizes, and most-used bridge protocols. Deliver as structured JSON + summary.',
    category: 'research',
    rewardRange: [3000, 7000],
    isBounty: false,
  },
  {
    title: 'DeFi yield comparison across {chain} protocols',
    description: 'Compare yields across top 5 lending/DEX protocols on {chain}. Track APY changes daily, identify yield farming opportunities, and flag impermanent loss risks. Deliver weekly report.',
    category: 'research',
    rewardRange: [4000, 8000],
    isBounty: false,
  },

  // Trading
  {
    title: 'DCA bot for {token} on {chain}',
    description: 'Build a dollar-cost averaging agent that buys {token} on Uniswap V3 ({chain}). Configurable amounts and intervals. Must include slippage protection, gas optimization, and stop-loss.',
    category: 'trading',
    rewardRange: [6000, 15000],
    isBounty: false,
  },
  {
    title: 'Arbitrage scanner: {token} across DEXes',
    description: 'Monitor {token} price across 5+ DEXes on {chain}. Identify arbitrage opportunities >0.5%. Calculate profit after gas. Alert via webhook. Do NOT execute trades — detection only.',
    category: 'trading',
    rewardRange: [5000, 12000],
    isBounty: true,
  },

  // Content
  {
    title: 'Daily {chain} market summary tweets',
    description: 'Pull top gainers/losers, market cap changes, and trending tokens on {chain}. Format into engaging tweet threads with key stats. Post via X API. Must include charts or data visuals.',
    category: 'content',
    rewardRange: [1500, 4000],
    isBounty: false,
  },
  {
    title: '{token} weekly newsletter generator',
    description: 'Compile {token} news, on-chain metrics, price action, and community sentiment into a weekly newsletter. Format as markdown. Include charts and links to sources.',
    category: 'content',
    rewardRange: [2000, 5000],
    isBounty: false,
  },

  // Coding
  {
    title: 'Smart contract audit: {token} token contract',
    description: 'Audit the {token} ERC-20 contract for security vulnerabilities. Focus on reentrancy, access control, and economic attack vectors. Deliver a formal report with severity ratings.',
    category: 'coding',
    rewardRange: [8000, 20000],
    isBounty: false,
  },
  {
    title: 'Build a subgraph for {chain} DEX activity',
    description: 'Create a subgraph that indexes swaps, liquidity adds/removes, and fee collections on a {chain} DEX. Must support filtering by token pair, time range, and minimum volume.',
    category: 'coding',
    rewardRange: [5000, 10000],
    isBounty: false,
  },
];

function fillTemplate(template: TaskTemplate): { title: string; description: string } {
  const chain2 = pick(CHAINS.filter(c => c !== 'Base'));
  let title = template.title
    .replace(/\{token\}/g, pick(TOKENS))
    .replace(/\{chain\}/g, pick(CHAINS))
    .replace(/\{chain2\}/g, chain2);
  let description = template.description
    .replace(/\{token\}/g, pick(TOKENS))
    .replace(/\{chain\}/g, pick(CHAINS))
    .replace(/\{chain2\}/g, chain2);
  return { title, description };
}

export function generateTasks(count: number): Array<{
  title: string;
  description: string;
  category: string;
  reward_amount: number;
  poster_address: string;
  metadata: { bounty: boolean; generated: boolean };
}> {
  const tasks = [];
  for (let i = 0; i < count; i++) {
    const template = pick(TASK_TEMPLATES);
    const { title, description } = fillTemplate(template);
    tasks.push({
      title,
      description,
      category: template.category,
      reward_amount: rand(template.rewardRange[0], template.rewardRange[1]),
      poster_address: '0x0000000000000000000000000000000000000000',
      metadata: { bounty: template.isBounty, generated: true },
    });
  }
  return tasks;
}
