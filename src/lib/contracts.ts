import rektTokenAbi from "./abis/REKTToken.json";
import rewardDistributorAbi from "./abis/RewardDistributor.json";
import agentNftAbi from "./abis/AgentNFT.json";
import agentRegistryAbi from "./abis/AgentRegistry.json";
import agentStakingAbi from "./abis/AgentStaking.json";
import agentGovernanceAbi from "./abis/AgentGovernance.json";
import taskMarketplaceAbi from "./abis/TaskMarketplace.json";
import agentEscrowAbi from "./abis/AgentEscrow.json";
import reputationOracleAbi from "./abis/ReputationOracle.json";

// Contract addresses from env vars (set after deployment)
export const REKT_TOKEN_ADDRESS =
  process.env.NEXT_PUBLIC_REKT_TOKEN_ADDRESS || "";
export const REWARD_DISTRIBUTOR_ADDRESS =
  process.env.NEXT_PUBLIC_REWARD_DISTRIBUTOR_ADDRESS || "";
export const AGENT_NFT_ADDRESS =
  process.env.NEXT_PUBLIC_AGENT_NFT_ADDRESS || "";
export const AGENT_REGISTRY_ADDRESS =
  process.env.NEXT_PUBLIC_AGENT_REGISTRY_ADDRESS || "";
export const AGENT_STAKING_ADDRESS =
  process.env.NEXT_PUBLIC_AGENT_STAKING_ADDRESS || "";
export const REPUTATION_ORACLE_ADDRESS =
  process.env.NEXT_PUBLIC_REPUTATION_ORACLE_ADDRESS || "";
export const TASK_MARKETPLACE_ADDRESS =
  process.env.NEXT_PUBLIC_TASK_MARKETPLACE_ADDRESS || "";
export const AGENT_ESCROW_ADDRESS =
  process.env.NEXT_PUBLIC_AGENT_ESCROW_ADDRESS || "";
export const AGENT_GOVERNANCE_ADDRESS =
  process.env.NEXT_PUBLIC_AGENT_GOVERNANCE_ADDRESS || "";

export const isOnChainEnabled =
  !!REWARD_DISTRIBUTOR_ADDRESS && !!REKT_TOKEN_ADDRESS;

// ABIs
export { rektTokenAbi, rewardDistributorAbi };
export { agentNftAbi, agentRegistryAbi, agentStakingAbi };
export { agentGovernanceAbi, taskMarketplaceAbi, agentEscrowAbi };
export { reputationOracleAbi };
