import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, formatEther } from "viem";
import {
  AGENT_NFT_ADDRESS,
  AGENT_REGISTRY_ADDRESS,
  AGENT_STAKING_ADDRESS,
  TASK_MARKETPLACE_ADDRESS,
  AGENT_ESCROW_ADDRESS,
  AGENT_GOVERNANCE_ADDRESS,
  REPUTATION_ORACLE_ADDRESS,
  agentNftAbi,
  agentRegistryAbi,
  agentStakingAbi,
  taskMarketplaceAbi,
  agentEscrowAbi,
  agentGovernanceAbi,
  reputationOracleAbi,
} from "@/lib/contracts";

// ============ Agent NFT ============

export function useRegisterAgent() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const register = (name: string, category: string, metadataURI: string) => {
    writeContract({
      address: AGENT_NFT_ADDRESS as `0x${string}`,
      abi: agentNftAbi.abi,
      functionName: "registerAgent",
      args: [name, category, metadataURI],
    });
  };

  return { register, hash, isPending, isConfirming, isSuccess, error };
}

export function useIsRegistered(address?: `0x${string}`) {
  return useReadContract({
    address: AGENT_NFT_ADDRESS as `0x${string}`,
    abi: agentNftAbi.abi,
    functionName: "isRegistered",
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!AGENT_NFT_ADDRESS },
  });
}

export function useAgentInfo(tokenId?: bigint) {
  return useReadContract({
    address: AGENT_NFT_ADDRESS as `0x${string}`,
    abi: agentNftAbi.abi,
    functionName: "agentInfo",
    args: tokenId !== undefined ? [tokenId] : undefined,
    query: { enabled: tokenId !== undefined && !!AGENT_NFT_ADDRESS },
  });
}

export function useTokenByWallet(address?: `0x${string}`) {
  return useReadContract({
    address: AGENT_NFT_ADDRESS as `0x${string}`,
    abi: agentNftAbi.abi,
    functionName: "getTokenByWallet",
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!AGENT_NFT_ADDRESS },
  });
}

// ============ Agent Staking ============

export function useStake() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const stake = (amount: string) => {
    writeContract({
      address: AGENT_STAKING_ADDRESS as `0x${string}`,
      abi: agentStakingAbi.abi,
      functionName: "stake",
      args: [parseEther(amount)],
    });
  };

  return { stake, hash, isPending, isConfirming, isSuccess, error };
}

export function useStakeInfo(address?: `0x${string}`) {
  return useReadContract({
    address: AGENT_STAKING_ADDRESS as `0x${string}`,
    abi: agentStakingAbi.abi,
    functionName: "stakes",
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!AGENT_STAKING_ADDRESS },
  });
}

export function useStakeMultiplier(address?: `0x${string}`) {
  return useReadContract({
    address: AGENT_STAKING_ADDRESS as `0x${string}`,
    abi: agentStakingAbi.abi,
    functionName: "getStakeMultiplier",
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!AGENT_STAKING_ADDRESS },
  });
}

export function useInitiateUnstake() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const initiate = () => {
    writeContract({
      address: AGENT_STAKING_ADDRESS as `0x${string}`,
      abi: agentStakingAbi.abi,
      functionName: "initiateUnstake",
    });
  };

  return { initiate, hash, isPending, isConfirming, isSuccess, error };
}

export function useUnstake() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const unstake = () => {
    writeContract({
      address: AGENT_STAKING_ADDRESS as `0x${string}`,
      abi: agentStakingAbi.abi,
      functionName: "unstake",
    });
  };

  return { unstake, hash, isPending, isConfirming, isSuccess, error };
}

// ============ Task Marketplace ============

export enum TaskType {
  Computation = 0,
  Research = 1,
  Trading = 2,
  Content = 3,
  Custom = 4,
}

export function usePostTask() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const postTask = (
    taskDataURI: string,
    reward: string,
    deadlineSeconds: bigint,
    taskType: TaskType,
    conditionHash: `0x${string}`
  ) => {
    writeContract({
      address: TASK_MARKETPLACE_ADDRESS as `0x${string}`,
      abi: taskMarketplaceAbi.abi,
      functionName: "postTask",
      args: [taskDataURI, parseEther(reward), deadlineSeconds, taskType, conditionHash],
    });
  };

  return { postTask, hash, isPending, isConfirming, isSuccess, error };
}

export function useApplyForTask() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const apply = (taskId: bigint, proposal: string) => {
    writeContract({
      address: TASK_MARKETPLACE_ADDRESS as `0x${string}`,
      abi: taskMarketplaceAbi.abi,
      functionName: "applyForTask",
      args: [taskId, proposal],
    });
  };

  return { apply, hash, isPending, isConfirming, isSuccess, error };
}

export function useClaimTask() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const claim = (taskId: bigint, worker: `0x${string}`) => {
    writeContract({
      address: TASK_MARKETPLACE_ADDRESS as `0x${string}`,
      abi: taskMarketplaceAbi.abi,
      functionName: "claimTask",
      args: [taskId, worker],
    });
  };

  return { claim, hash, isPending, isConfirming, isSuccess, error };
}

export function useSubmitWork() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const submit = (taskId: bigint, proofURI: string) => {
    writeContract({
      address: TASK_MARKETPLACE_ADDRESS as `0x${string}`,
      abi: taskMarketplaceAbi.abi,
      functionName: "submitWork",
      args: [taskId, proofURI],
    });
  };

  return { submit, hash, isPending, isConfirming, isSuccess, error };
}

export function useVerifyTask() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const verify = (taskId: bigint, approved: boolean) => {
    writeContract({
      address: TASK_MARKETPLACE_ADDRESS as `0x${string}`,
      abi: taskMarketplaceAbi.abi,
      functionName: "verifyTask",
      args: [taskId, approved],
    });
  };

  return { verify, hash, isPending, isConfirming, isSuccess, error };
}

export function useTaskOnChain(taskId?: bigint) {
  return useReadContract({
    address: TASK_MARKETPLACE_ADDRESS as `0x${string}`,
    abi: taskMarketplaceAbi.abi,
    functionName: "getTask",
    args: taskId !== undefined ? [taskId] : undefined,
    query: { enabled: taskId !== undefined && !!TASK_MARKETPLACE_ADDRESS },
  });
}

// ============ Agent Escrow ============

export function useCreateEscrow() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const create = (
    payee: `0x${string}`,
    amount: string,
    conditionHash: `0x${string}`,
    timeout: bigint,
    memo: string
  ) => {
    writeContract({
      address: AGENT_ESCROW_ADDRESS as `0x${string}`,
      abi: agentEscrowAbi.abi,
      functionName: "createEscrow",
      args: [payee, parseEther(amount), conditionHash, timeout, memo],
    });
  };

  return { create, hash, isPending, isConfirming, isSuccess, error };
}

export function useReleaseEscrow() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const release = (escrowId: bigint) => {
    writeContract({
      address: AGENT_ESCROW_ADDRESS as `0x${string}`,
      abi: agentEscrowAbi.abi,
      functionName: "releaseEscrow",
      args: [escrowId],
    });
  };

  return { release, hash, isPending, isConfirming, isSuccess, error };
}

// ============ Reputation Oracle ============

export function useReputation(address?: `0x${string}`) {
  return useReadContract({
    address: REPUTATION_ORACLE_ADDRESS as `0x${string}`,
    abi: reputationOracleAbi.abi,
    functionName: "getReputation",
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!REPUTATION_ORACLE_ADDRESS },
  });
}

export function useReputationTier(address?: `0x${string}`) {
  return useReadContract({
    address: REPUTATION_ORACLE_ADDRESS as `0x${string}`,
    abi: reputationOracleAbi.abi,
    functionName: "getTier",
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!REPUTATION_ORACLE_ADDRESS },
  });
}

// ============ Governance ============

export function useCreateProposal() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const propose = (
    description: string,
    metadataURI: string,
    targetContract: `0x${string}`,
    callData: `0x${string}`
  ) => {
    writeContract({
      address: AGENT_GOVERNANCE_ADDRESS as `0x${string}`,
      abi: agentGovernanceAbi.abi,
      functionName: "propose",
      args: [description, metadataURI, targetContract, callData],
    });
  };

  return { propose, hash, isPending, isConfirming, isSuccess, error };
}

export function useCastVote() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const vote = (proposalId: bigint, support: boolean) => {
    writeContract({
      address: AGENT_GOVERNANCE_ADDRESS as `0x${string}`,
      abi: agentGovernanceAbi.abi,
      functionName: "castVote",
      args: [proposalId, support],
    });
  };

  return { vote, hash, isPending, isConfirming, isSuccess, error };
}

export function useProposal(proposalId?: bigint) {
  return useReadContract({
    address: AGENT_GOVERNANCE_ADDRESS as `0x${string}`,
    abi: agentGovernanceAbi.abi,
    functionName: "getProposal",
    args: proposalId !== undefined ? [proposalId] : undefined,
    query: { enabled: proposalId !== undefined && !!AGENT_GOVERNANCE_ADDRESS },
  });
}

export function useProposalState(proposalId?: bigint) {
  return useReadContract({
    address: AGENT_GOVERNANCE_ADDRESS as `0x${string}`,
    abi: agentGovernanceAbi.abi,
    functionName: "getProposalState",
    args: proposalId !== undefined ? [proposalId] : undefined,
    query: { enabled: proposalId !== undefined && !!AGENT_GOVERNANCE_ADDRESS },
  });
}

export function useExecuteProposal() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const execute = (proposalId: bigint) => {
    writeContract({
      address: AGENT_GOVERNANCE_ADDRESS as `0x${string}`,
      abi: agentGovernanceAbi.abi,
      functionName: "executeProposal",
      args: [proposalId],
    });
  };

  return { execute, hash, isPending, isConfirming, isSuccess, error };
}
