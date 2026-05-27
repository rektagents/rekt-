import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.create();

describe("AgentStaking", function () {
  async function deployStaking() {
    const [owner, agent1, agent2] = await ethers.getSigners();
    const token = await ethers.deployContract("REKTToken", [owner.address]);
    const minStake = ethers.parseEther("100");
    const staking = await ethers.deployContract("AgentStaking", [
      await token.getAddress(),
      owner.address,
      minStake,
    ]);

    await token.transfer(agent1.address, ethers.parseEther("10000"));
    await token.transfer(agent2.address, ethers.parseEther("10000"));
    await token.connect(agent1).approve(await staking.getAddress(), ethers.parseEther("10000"));
    await token.connect(agent2).approve(await staking.getAddress(), ethers.parseEther("10000"));

    return { staking, token, owner, agent1, agent2, minStake };
  }

  it("Should stake REKT tokens", async function () {
    const { staking, agent1 } = await deployStaking();
    const amount = ethers.parseEther("500");

    await expect(staking.connect(agent1).stake(amount)).to.emit(staking, "Staked");

    const stake = await staking.stakes(agent1.address);
    expect(stake.amount).to.equal(amount);
    expect(await staking.totalStaked()).to.equal(amount);
  });

  it("Should reject stake below minimum", async function () {
    const { staking, agent1 } = await deployStaking();
    await expect(staking.connect(agent1).stake(ethers.parseEther("50"))).to.be.revertedWith("Below minimum stake");
  });

  it("Should accumulate stakes", async function () {
    const { staking, agent1 } = await deployStaking();
    await staking.connect(agent1).stake(ethers.parseEther("200"));
    await staking.connect(agent1).stake(ethers.parseEther("300"));
    const stake = await staking.stakes(agent1.address);
    expect(stake.amount).to.equal(ethers.parseEther("500"));
  });

  it("Should initiate unstake with cooldown", async function () {
    const { staking, agent1 } = await deployStaking();
    await staking.connect(agent1).stake(ethers.parseEther("500"));
    await staking.connect(agent1).initiateUnstake();
    const stake = await staking.stakes(agent1.address);
    expect(stake.inCooldown).to.equal(true);
  });

  it("Should reject unstake before cooldown expires", async function () {
    const { staking, agent1 } = await deployStaking();
    await staking.connect(agent1).stake(ethers.parseEther("500"));
    await staking.connect(agent1).initiateUnstake();
    await expect(staking.connect(agent1).unstake()).to.be.revertedWith("Cooldown not finished");
  });

  it("Should allow unstake after cooldown", async function () {
    const { staking, token, agent1 } = await deployStaking();
    const amount = ethers.parseEther("500");

    await staking.connect(agent1).stake(amount);
    await staking.connect(agent1).initiateUnstake();

    await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60]);
    await ethers.provider.send("evm_mine", []);

    const balBefore = await token.balanceOf(agent1.address);
    await staking.connect(agent1).unstake();
    const balAfter = await token.balanceOf(agent1.address);
    expect(balAfter - balBefore).to.equal(amount);
  });

  it("Should return correct stake multiplier", async function () {
    const { staking, agent1, minStake } = await deployStaking();

    // No stake = 100 (1.00x)
    expect(await staking.getStakeMultiplier(agent1.address)).to.equal(100);

    // At minStake: ratio=100, multiplier=100
    await staking.connect(agent1).stake(minStake);
    expect(await staking.getStakeMultiplier(agent1.address)).to.equal(100);

    // At 500 REKT total: ratio=(500*100)/100=500, mult=100+((500-100)*200)/9900=108
    await staking.connect(agent1).stake(ethers.parseEther("400"));
    expect(await staking.getStakeMultiplier(agent1.address)).to.equal(108);
  });
});
