import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.create();

describe("AgentNFT", function () {
  async function deployAgentNFT() {
    const [owner, agent1, agent2] = await ethers.getSigners();
    const token = await ethers.deployContract("REKTToken", [owner.address]);
    const agentNFT = await ethers.deployContract("AgentNFT", [owner.address, await token.getAddress()]);
    return { agentNFT, token, owner, agent1, agent2 };
  }

  it("Should register an agent and mint an NFT", async function () {
    const { agentNFT, agent1 } = await deployAgentNFT();

    const tx = await agentNFT.connect(agent1).registerAgent("MyAgent", "defi", "ipfs://meta1");
    const receipt = await tx.wait();

    expect(await agentNFT.totalAgents()).to.equal(1);
    expect(await agentNFT.walletToToken(agent1.address)).to.equal(1);
    expect(await agentNFT.isRegistered(agent1.address)).to.equal(true);

    const info = await agentNFT.agentInfo(1);
    expect(info.creator).to.equal(agent1.address);
    expect(info.name).to.equal("MyAgent");
    expect(info.category).to.equal("defi");
    expect(info.isActive).to.equal(true);
  });

  it("Should prevent double registration from same wallet", async function () {
    const { agentNFT, agent1 } = await deployAgentNFT();

    await agentNFT.connect(agent1).registerAgent("Agent1", "defi", "ipfs://m1");
    await expect(
      agentNFT.connect(agent1).registerAgent("Agent2", "trading", "ipfs://m2")
    ).to.be.revertedWith("Already registered");
  });

  it("Should allow metadata updates", async function () {
    const { agentNFT, agent1 } = await deployAgentNFT();

    await agentNFT.connect(agent1).registerAgent("Agent", "defi", "ipfs://old");
    await agentNFT.connect(agent1).updateMetadata(1, "ipfs://new");

    const info = await agentNFT.agentInfo(1);
    expect(info.isActive).to.equal(true);
  });

  it("Should allow deactivation and reactivation", async function () {
    const { agentNFT, agent1 } = await deployAgentNFT();

    await agentNFT.connect(agent1).registerAgent("Agent", "defi", "ipfs://m");
    expect(await agentNFT.isRegistered(agent1.address)).to.equal(true);

    await agentNFT.connect(agent1).deactivateAgent(1);
    expect(await agentNFT.isRegistered(agent1.address)).to.equal(false);

    await agentNFT.connect(agent1).reactivateAgent(1);
    expect(await agentNFT.isRegistered(agent1.address)).to.equal(true);
  });

  it("Should update wallet mapping on transfer", async function () {
    const { agentNFT, agent1, agent2 } = await deployAgentNFT();

    await agentNFT.connect(agent1).registerAgent("Agent", "defi", "ipfs://m");
    expect(await agentNFT.walletToToken(agent1.address)).to.equal(1);

    await agentNFT.connect(agent1).transferFrom(agent1.address, agent2.address, 1);
    expect(await agentNFT.walletToToken(agent1.address)).to.equal(0);
    expect(await agentNFT.walletToToken(agent2.address)).to.equal(1);
    expect(await agentNFT.ownerOf(1)).to.equal(agent2.address);
  });

  it("Should track agents by category", async function () {
    const { agentNFT, agent1, agent2 } = await deployAgentNFT();

    await agentNFT.connect(agent1).registerAgent("A1", "defi", "ipfs://m1");
    await agentNFT.connect(agent2).registerAgent("A2", "defi", "ipfs://m2");

    const defiAgents = await agentNFT.getAgentsByCategory("defi");
    expect(defiAgents.length).to.equal(2);
  });

  it("Should revert registration with empty name", async function () {
    const { agentNFT, agent1 } = await deployAgentNFT();

    await expect(
      agentNFT.connect(agent1).registerAgent("", "defi", "ipfs://m")
    ).to.be.revertedWith("Name required");
  });
});
