import { network } from "hardhat";

const { ethers } = await network.create();

async function main() {
  const [deployer] = await ethers.getSigners();
  const deployerAddr = await deployer.getAddress();
  console.log("Deploying with:", deployerAddr);
  const bal = await ethers.provider.getBalance(deployerAddr);
  console.log("Balance:", ethers.formatEther(bal), "ETH");

  // 1. REKTToken
  const token = await ethers.deployContract("REKTToken", [deployerAddr]);
  const tokenAddr = await token.getAddress();
  console.log("1/10 REKTToken:", tokenAddr);

  // 2. AgentNFT
  const agentNFT = await ethers.deployContract("AgentNFT", [deployerAddr, tokenAddr]);
  const nftAddr = await agentNFT.getAddress();
  console.log("2/10 AgentNFT:", nftAddr);

  // 3. AgentRegistry
  const registry = await ethers.deployContract("AgentRegistry", [tokenAddr, deployerAddr]);
  const registryAddr = await registry.getAddress();
  console.log("3/10 AgentRegistry:", registryAddr);

  // 4. AgentStaking
  const minStake = ethers.parseEther("100");
  const staking = await ethers.deployContract("AgentStaking", [tokenAddr, deployerAddr, minStake]);
  const stakingAddr = await staking.getAddress();
  console.log("4/10 AgentStaking:", stakingAddr);

  // 5. RewardDistributor
  const distributor = await ethers.deployContract("RewardDistributor", [tokenAddr, deployerAddr]);
  const distributorAddr = await distributor.getAddress();
  console.log("5/10 RewardDistributor:", distributorAddr);

  // 6. Link RewardDistributor -> AgentNFT
  await (await distributor.setAgentNFT(nftAddr)).wait();
  console.log("   Linked RewardDistributor -> AgentNFT");

  // 7. ReputationOracle
  const oracle = await ethers.deployContract("ReputationOracle", [deployerAddr]);
  const oracleAddr = await oracle.getAddress();
  console.log("6/10 ReputationOracle:", oracleAddr);

  // 8. TaskMarketplace
  const marketplace = await ethers.deployContract("TaskMarketplace", [tokenAddr, deployerAddr, deployerAddr]);
  const marketplaceAddr = await marketplace.getAddress();
  console.log("7/10 TaskMarketplace:", marketplaceAddr);

  // 9. AgentEscrow
  const escrow = await ethers.deployContract("AgentEscrow", [tokenAddr, deployerAddr]);
  const escrowAddr = await escrow.getAddress();
  console.log("8/10 AgentEscrow:", escrowAddr);

  // 10. AgentGovernance
  const governance = await ethers.deployContract("AgentGovernance", [
    deployerAddr,
    stakingAddr,
    40320,  // ~1 week on Base (2s blocks)
    10,     // 10% quorum
    ethers.parseEther("1000"), // 1000 REKT to propose
  ]);
  const governanceAddr = await governance.getAddress();
  console.log("9/10 AgentGovernance:", governanceAddr);

  // 11. Fund reward pool (100M REKT)
  const fundAmount = ethers.parseEther("100000000");
  await (await token.approve(distributorAddr, fundAmount)).wait();
  await (await distributor.fundPool(fundAmount)).wait();
  console.log("10/10 Funded reward pool: 100M REKT");

  console.log("\n========== DEPLOYMENT COMPLETE ==========");
  console.log(`Network: Base Sepolia (chain ${((await ethers.provider.getNetwork()).chainId)})`);
  console.log(`Deployer: ${deployerAddr}`);

  console.log("\n========== ADD TO .env.local ==========");
  console.log(`NEXT_PUBLIC_REKT_TOKEN_ADDRESS=${tokenAddr}`);
  console.log(`NEXT_PUBLIC_AGENT_NFT_ADDRESS=${nftAddr}`);
  console.log(`NEXT_PUBLIC_AGENT_REGISTRY_ADDRESS=${registryAddr}`);
  console.log(`NEXT_PUBLIC_AGENT_STAKING_ADDRESS=${stakingAddr}`);
  console.log(`NEXT_PUBLIC_REWARD_DISTRIBUTOR_ADDRESS=${distributorAddr}`);
  console.log(`NEXT_PUBLIC_REPUTATION_ORACLE_ADDRESS=${oracleAddr}`);
  console.log(`NEXT_PUBLIC_TASK_MARKETPLACE_ADDRESS=${marketplaceAddr}`);
  console.log(`NEXT_PUBLIC_AGENT_ESCROW_ADDRESS=${escrowAddr}`);
  console.log(`NEXT_PUBLIC_AGENT_GOVERNANCE_ADDRESS=${governanceAddr}`);
  console.log("========================================");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
