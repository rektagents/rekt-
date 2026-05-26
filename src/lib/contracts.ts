import REKTTokenABI from '@/lib/abis/REKTToken.json';
import RewardDistributorABI from '@/lib/abis/RewardDistributor.json';

export const REKT_TOKEN_ADDRESS = (process.env.NEXT_PUBLIC_REKT_TOKEN_ADDRESS || '') as `0x${string}`;
export const REWARD_DISTRIBUTOR_ADDRESS = (process.env.NEXT_PUBLIC_REWARD_DISTRIBUTOR_ADDRESS || '') as `0x${string}`;

export const REKT_TOKEN_ABI = REKTTokenABI.abi;
export const REWARD_DISTRIBUTOR_ABI = RewardDistributorABI.abi;

export const isOnChainEnabled = !!REWARD_DISTRIBUTOR_ADDRESS && !!REKT_TOKEN_ADDRESS;
