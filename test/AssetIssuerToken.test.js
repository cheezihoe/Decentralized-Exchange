const { ethers } = require("hardhat");
const { expect } = require("chai");
const { BigNumber } = require("ethers");
require("@nomicfoundation/hardhat-chai-matchers");

describe("AssetIssuerToken Contract", function () {
  let AssetIssuerToken;
  let assetIssuerToken;
  let owner;
  let recipient;
  let nonOwner;

  before(async () => {
    [owner, recipient, nonOwner] = await ethers.getSigners();

    // Deploy the AssetIssuerToken contract
    AssetIssuerToken = await ethers.getContractFactory("AssetIssuerToken");
    assetIssuerToken = await AssetIssuerToken.deploy("AssetIssuerToken", "AIT", 1000000);
  });

  it("should deploy the contract with the correct name, symbol, and initial supply", async () => {
    expect(await assetIssuerToken.name()).to.equal("AssetIssuerToken");
    expect(await assetIssuerToken.symbol()).to.equal("AIT");
    expect(await assetIssuerToken.totalSupply()).to.equal(1000000);
    expect(await assetIssuerToken.balanceOf(owner.address)).to.equal(1000000);
  });

  it("should not allow non-owners to mint new tokens", async () => {
    await expect(assetIssuerToken.connect(nonOwner).mint(nonOwner.address, 1000)).to.be.revertedWith(
      "Only the owner can perform this action"
    );
  });

  it("should allow the owner to burn tokens", async () => {
    const amountToBurn = 500;

    await expect(assetIssuerToken.burn(owner.address, amountToBurn))
      .to.emit(assetIssuerToken, "Transfer")
      .withArgs(owner.address, "0x0000000000000000000000000000000000000000", amountToBurn);
  });

  it("should not allow non-owners to burn tokens", async () => {
    await expect(assetIssuerToken.connect(nonOwner).burn(recipient.address, 500)).to.be.revertedWith(
      "Only the owner can perform this action"
    );
  });
});