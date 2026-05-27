import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.create();

describe("REKTToken", function () {
  it("Should deploy with correct name, symbol, and max supply", async function () {
    const [owner] = await ethers.getSigners();
    const token = await ethers.deployContract("REKTToken", [owner.address]);

    expect(await token.name()).to.equal("REKT");
    expect(await token.symbol()).to.equal("REKT");
    expect(await token.MAX_SUPPLY()).to.equal(ethers.parseEther("1000000000"));
    expect(await token.totalSupply()).to.equal(ethers.parseEther("1000000000"));
    expect(await token.balanceOf(owner.address)).to.equal(ethers.parseEther("1000000000"));
  });

  it("Should revert minting beyond max supply", async function () {
    const [owner] = await ethers.getSigners();
    const token = await ethers.deployContract("REKTToken", [owner.address]);

    await expect(
      token.mint(owner.address, ethers.parseEther("1"))
    ).to.be.revertedWith("Exceeds max supply");
  });

  it("Should revert minting from non-owner", async function () {
    const [owner, other] = await ethers.getSigners();
    const token = await ethers.deployContract("REKTToken", [owner.address]);

    await expect(
      token.connect(other).mint(other.address, ethers.parseEther("1"))
    ).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
  });
});
