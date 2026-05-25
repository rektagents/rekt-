import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // 1. Deploy REKT Token
  const REKTToken = await ethers.getContractFactory("REKTToken");
  const token = await REKTToken.deploy(deployer.address);
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("REKTToken deployed to:", tokenAddress);

  // 2. Deploy Reward Distributor
  const RewardDistributor = await ethers.getContractFactory("RewardDistributor");
  const distributor = await RewardDistributor.deploy(tokenAddress, deployer.address);
  await distributor.waitForDeployment();
  const distributorAddress = await distributor.getAddress();
  console.log("RewardDistributor deployed to:", distributorAddress);

  // 3. Approve distributor to spend tokens (fund 100M REKT)
  const fundAmount = ethers.parseEther("100000000"); // 100M tokens
  const tx = await token.approve(distributorAddress, fundAmount);
  await tx.wait();
  console.log("Approved distributor to spend 100M REKT");

  // 4. Fund the reward pool
  const fundTx = await distributor.fundPool(fundAmount);
  await fundTx.wait();
  console.log("Funded reward pool with 100M REKT");

  console.log("\n--- Deployment Summary ---");
  console.log("REKTToken:", tokenAddress);
  console.log("RewardDistributor:", distributorAddress);
  console.log("Network:", (await ethers.provider.getNetwork()).name);
  console.log("Chain ID:", (await ethers.provider.getNetwork()).chainId);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
