import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.create();

describe("ReputationOracle", function () {
  async function deployOracle() {
    const [owner, agent1, agent2, caller] = await ethers.getSigners();
    const oracle = await ethers.deployContract("ReputationOracle", [owner.address]);
    await oracle.authorizeCaller(caller.address, true);
    return { oracle, owner, agent1, agent2, caller };
  }

  // recordTaskOutcome(agent, rewardAmount, outcome, qualityScore)
  // outcome: 0 = failed, 1 = success (on-time), 2 = success (late)

  it("Should record a successful task", async function () {
    const { oracle, caller, agent1 } = await deployOracle();

    await expect(
      oracle.connect(caller).recordTaskOutcome(agent1.address, 1000n, 1, 8000)
    ).to.emit(oracle, "ReputationUpdated");

    const score = await oracle.getReputation(agent1.address);
    expect(score.tasksAttempted).to.equal(1);
    expect(score.tasksSucceeded).to.equal(1);
    expect(score.tasksOnTime).to.equal(1);
  });

  it("Should record a failed task", async function () {
    const { oracle, caller, agent1 } = await deployOracle();

    await oracle.connect(caller).recordTaskOutcome(agent1.address, 0, 0, 2000);

    const score = await oracle.getReputation(agent1.address);
    expect(score.tasksAttempted).to.equal(1);
    expect(score.tasksSucceeded).to.equal(0);
  });

  it("Should compute tier correctly", async function () {
    const { oracle, caller, agent1 } = await deployOracle();

    for (let i = 0; i < 5; i++) {
      await oracle.connect(caller).recordTaskOutcome(agent1.address, 1000n, 1, 9500);
    }

    const tier = await oracle.getTier(agent1.address);
    expect(["Bronze", "Silver", "Gold", "Platinum"]).to.include(tier);
  });

  it("Should allow peer ratings", async function () {
    const { oracle, agent1, agent2, caller } = await deployOracle();

    await oracle.connect(caller).recordTaskOutcome(agent1.address, 1000n, 1, 8000);
    await expect(
      oracle.connect(agent2).submitPeerRating(agent1.address, 9000)
    ).to.emit(oracle, "PeerRatingSubmitted");
  });

  it("Should reject unauthorized callers", async function () {
    const { oracle, agent1, agent2 } = await deployOracle();

    await expect(
      oracle.connect(agent2).recordTaskOutcome(agent1.address, 1000n, 1, 8000)
    ).to.be.revertedWith("Not authorized");
  });

  it("Should reject peer self-rating", async function () {
    const { oracle, agent1, caller } = await deployOracle();

    await oracle.connect(caller).recordTaskOutcome(agent1.address, 1000n, 1, 8000);

    await expect(
      oracle.connect(agent1).submitPeerRating(agent1.address, 9000)
    ).to.be.revertedWith("Can't rate yourself");
  });
});
