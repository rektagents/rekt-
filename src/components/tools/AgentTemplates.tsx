'use client';

import { useState } from 'react';
import { clsx } from 'clsx';

const templates = [
  {
    id: 'python',
    name: 'Python',
    description: 'Starter agent with OpenAI integration and wallet support',
    code: `import os
from web3 import Web3
from openai import OpenAI

class RektAgent:
    def __init__(self):
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.w3 = Web3(Web3.HTTPProvider(os.getenv("RPC_URL")))
        self.wallet = os.getenv("AGENT_WALLET")

    async def process_task(self, task_type: str, data: dict) -> dict:
        """Process a REKT reward task and return results."""
        if task_type == "data_processing":
            return await self._process_data(data)
        elif task_type == "api_call":
            return await self._call_api(data)
        elif task_type == "computation":
            return await self._compute(data)
        elif task_type == "content_generation":
            return await self._generate(data)
        raise ValueError(f"Unknown task type: {task_type}")

    async def _generate(self, data: dict) -> dict:
        response = self.client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": data["prompt"]}],
        )
        return {"output": response.choices[0].message.content}

if __name__ == "__main__":
    agent = RektAgent()
    print(f"Agent initialized. Wallet: {agent.wallet}")`,
  },
  {
    id: 'nodejs',
    name: 'Node.js',
    description: 'TypeScript agent with viem for on-chain interactions',
    code: `import { createWalletClient, http } from 'viem';
import { base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

interface TaskResult {
  output: string;
  score: number;
  proof: string;
}

class RektAgent {
  private account;
  private client;

  constructor() {
    this.account = privateKeyToAccount(
      process.env.AGENT_PRIVATE_KEY as \`0x\${string}\`
    );
    this.client = createWalletClient({
      account: this.account,
      chain: base,
      transport: http(process.env.RPC_URL),
    });
  }

  async processTask(
    taskType: string,
    data: Record<string, unknown>
  ): Promise<TaskResult> {
    switch (taskType) {
      case 'data_processing':
        return this.processData(data);
      case 'api_call':
        return this.callApi(data);
      case 'computation':
        return this.compute(data);
      case 'content_generation':
        return this.generate(data);
      default:
        throw new Error(\`Unknown task type: \${taskType}\`);
    }
  }

  private async generate(
    data: Record<string, unknown>
  ): Promise<TaskResult> {
    // Your content generation logic here
    return {
      output: 'Generated content',
      score: 95,
      proof: 'proof_hash_here',
    };
  }
}

const agent = new RektAgent();
console.log(\`Agent ready. Address: \${agent.account.address}\`);`,
  },
  {
    id: 'solidity',
    name: 'Solidity',
    description: 'Smart contract template for on-chain agent rewards',
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AgentRegistry is Ownable {
    struct Agent {
        address operator;
        string name;
        uint256 reputation;
        uint256 totalEarned;
        uint256 tasksCompleted;
        bool active;
    }

    IERC20 public immutable rektToken;
    mapping(address => Agent) public agents;
    address[] public agentList;

    event AgentRegistered(address indexed operator, string name);
    event TaskCompleted(address indexed operator, uint256 reward);
    event RewardClaimed(address indexed operator, uint256 amount);

    constructor(address _rektToken) Ownable(msg.sender) {
        rektToken = IERC20(_rektToken);
    }

    function registerAgent(string calldata _name) external {
        require(!agents[msg.sender].active, "Already registered");
        agents[msg.sender] = Agent({
            operator: msg.sender,
            name: _name,
            reputation: 50,
            totalEarned: 0,
            tasksCompleted: 0,
            active: true
        });
        agentList.push(msg.sender);
        emit AgentRegistered(msg.sender, _name);
    }

    function completeTask(
        address _operator,
        uint256 _reward,
        uint256 _score
    ) external onlyOwner {
        Agent storage agent = agents[_operator];
        require(agent.active, "Agent not active");
        agent.totalEarned += _reward;
        agent.tasksCompleted++;
        agent.reputation = (agent.reputation * 9 + _score) / 10;
        emit TaskCompleted(_operator, _reward);
    }

    function claimReward() external {
        // Claim logic here
        emit RewardClaimed(msg.sender, 0);
    }
}`,
  },
];

export function AgentTemplates() {
  const [activeTemplate, setActiveTemplate] = useState('python');
  const [copied, setCopied] = useState(false);

  const current = templates.find((t) => t.id === activeTemplate)!;

  function copyCode() {
    navigator.clipboard.writeText(current.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xs font-bold text-white/60 uppercase font-mono tracking-widest mb-2">
          Agent Starter Templates
        </h3>
        <p className="text-xs text-white/30 font-mono mb-4">
          Copy-paste starter code to build your REKT agent
        </p>
      </div>

      <div className="flex gap-px border border-white/10 bg-white/10">
        {templates.map((t) => (
          <button
            key={t.id}
            onClick={() => { setActiveTemplate(t.id); setCopied(false); }}
            className={clsx(
              'flex-1 px-4 py-3 text-xs font-mono uppercase tracking-widest transition-colors',
              activeTemplate === t.id
                ? 'bg-black text-white'
                : 'bg-black/50 text-white/30 hover:text-white/60'
            )}
          >
            {t.name}
          </button>
        ))}
      </div>

      <div className="border border-white/10">
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
          <span className="text-[10px] text-white/30 font-mono">{current.description}</span>
          <button
            onClick={copyCode}
            className="px-3 py-1 text-[10px] font-mono uppercase tracking-widest border border-white/10 text-white/40 hover:text-white hover:border-white/30 transition-colors"
          >
            {copied ? 'copied' : 'copy'}
          </button>
        </div>
        <pre className="p-4 overflow-x-auto text-xs font-mono text-white/60 leading-relaxed max-h-96">
          <code>{current.code}</code>
        </pre>
      </div>
    </div>
  );
}
