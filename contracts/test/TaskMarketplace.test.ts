import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.create();

describe("TaskMarketplace", function () {
  async function deployMarketplace() {
    const [owner, poster, worker] = await ethers.getSigners();
    const token = await ethers.deployContract("REKTToken", [owner.address]);
    const marketplace = await ethers.deployContract("TaskMarketplace", [
      await token.getAddress(),
      owner.address,
      owner.address,
    ]);

    await token.transfer(poster.address, ethers.parseEther("10000"));
    await token.connect(poster).approve(await marketplace.getAddress(), ethers.parseEther("10000"));

    return { marketplace, token, owner, poster, worker };
  }

  it("Should create a task with escrow", async function () {
    const { marketplace, poster } = await deployMarketplace();
    const reward = ethers.parseEther("100");
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 86400);

    await expect(
      marketplace.connect(poster).postTask("ipfs://task1", reward, deadline, 0, "0x" + "00".repeat(32))
    ).to.emit(marketplace, "TaskCreated");

    const task = await marketplace.getTask(1);
    expect(task.poster).to.equal(poster.address);
    expect(task.reward).to.equal(reward);
    expect(task.status).to.equal(0); // Open
  });

  it("Should allow worker to apply and poster to claim", async function () {
    const { marketplace, poster, worker } = await deployMarketplace();
    const reward = ethers.parseEther("100");
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 86400);

    await marketplace.connect(poster).postTask("ipfs://task1", reward, deadline, 0, "0x" + "00".repeat(32));

    await expect(
      marketplace.connect(worker).applyForTask(1, "I can do this")
    ).to.emit(marketplace, "ApplicationSubmitted");

    await expect(
      marketplace.connect(poster).claimTask(1, worker.address)
    ).to.emit(marketplace, "TaskClaimed");

    const task = await marketplace.getTask(1);
    expect(task.worker).to.equal(worker.address);
    expect(task.status).to.equal(1); // Claimed
  });

  it("Should handle full task lifecycle", async function () {
    const { marketplace, token, poster, worker } = await deployMarketplace();
    const reward = ethers.parseEther("100");
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 86400);

    await marketplace.connect(poster).postTask("ipfs://task1", reward, deadline, 0, "0x" + "00".repeat(32));
    await marketplace.connect(worker).applyForTask(1, "I'll do it");
    await marketplace.connect(poster).claimTask(1, worker.address);

    await expect(
      marketplace.connect(worker).submitWork(1, "ipfs://proof1")
    ).to.emit(marketplace, "WorkSubmitted");

    const taskAfterSubmit = await marketplace.getTask(1);
    expect(taskAfterSubmit.status).to.equal(2); // Submitted

    const balBefore = await token.balanceOf(worker.address);

    await expect(
      marketplace.connect(poster).verifyTask(1, true)
    ).to.emit(marketplace, "TaskVerified");

    const balAfter = await token.balanceOf(worker.address);
    const expectedPayout = reward - (reward * 250n) / 10000n;
    expect(balAfter - balBefore).to.equal(expectedPayout);
  });

  it("Should allow cancel with refund", async function () {
    const { marketplace, token, poster } = await deployMarketplace();
    const reward = ethers.parseEther("100");
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 86400);

    await marketplace.connect(poster).postTask("ipfs://task1", reward, deadline, 0, "0x" + "00".repeat(32));

    const balBefore = await token.balanceOf(poster.address);
    await marketplace.connect(poster).cancelTask(1);
    const balAfter = await token.balanceOf(poster.address);

    expect(balAfter - balBefore).to.equal(reward);

    const task = await marketplace.getTask(1);
    expect(task.status).to.equal(5); // Cancelled
  });

  it("Should reject non-poster verification", async function () {
    const { marketplace, poster, worker } = await deployMarketplace();
    const reward = ethers.parseEther("100");
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 86400);

    await marketplace.connect(poster).postTask("ipfs://task1", reward, deadline, 0, "0x" + "00".repeat(32));
    await marketplace.connect(worker).applyForTask(1, "I'll do it");
    await marketplace.connect(poster).claimTask(1, worker.address);
    await marketplace.connect(worker).submitWork(1, "ipfs://proof");

    await expect(
      marketplace.connect(worker).verifyTask(1, true)
    ).to.be.revertedWith("Only poster can verify");
  });
});
