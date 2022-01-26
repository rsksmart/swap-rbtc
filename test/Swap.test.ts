import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signers";
import chai, { expect } from 'chai';
import { solidity } from "ethereum-waffle";
chai.use(solidity);

import { BigNumber, Contract } from "ethers";
import { ethers, upgrades, network } from "hardhat";

describe("Swap RBTC", function () {
  let swapRBTC: Contract, sideTokenBtc: Contract;
  const oneEther = ethers.utils.parseUnits("1.0", "ether");
  const halfEther = ethers.utils.parseUnits("0.5", "ether");
  const quarterEther = halfEther.div(2);
  let deployer: SignerWithAddress, minter: SignerWithAddress, sender: SignerWithAddress;

  beforeEach(async () => {
    [deployer, minter, sender] = await ethers.getSigners();
    const factorySwapRBTC = await ethers.getContractFactory("SwapRBTC");
    const factorySideToken = await ethers.getContractFactory("SideToken");

    sideTokenBtc = await factorySideToken.deploy(
      "SideTokenBTC",
      "sWBTC",
      minter.address,
      1
    );

    swapRBTC = await upgrades.deployProxy(factorySwapRBTC, [sideTokenBtc.address]);
  });

  it("Should Swap the side token BTC to RBTC", async function () {
    await sideTokenBtc.connect(minter).mint(sender.address, oneEther, "0x", "0x");
    const senderBalance: BigNumber = await sideTokenBtc.balanceOf(sender.address);

    expect(senderBalance.toString()).to.equals(oneEther.toString());
    await sideTokenBtc.connect(sender).approve(swapRBTC.address, halfEther);

    await deployer.sendTransaction({
      to: swapRBTC.address,
      value: oneEther
    });

    const balanceBeforeSwap = await sender.getBalance();
    const receipt = await swapRBTC.connect(sender).swapWRBTCtoRBTC(halfEther, sideTokenBtc.address);
    const balanceAfterSwap = await sender.getBalance();

    const tx = await network.provider.send("eth_getTransactionReceipt", [receipt.hash]);
    const effectiveGasPrice = BigNumber.from(tx.effectiveGasPrice);
    const gasUsed = BigNumber.from(tx.gasUsed);

    expect(balanceAfterSwap.add(effectiveGasPrice.mul(gasUsed)).sub(halfEther.add(balanceBeforeSwap)).isZero()).to.be.true;
  });

  it("Should Revert swap when transfer amount exceeds allowance", async function () {
    await sideTokenBtc.connect(minter).mint(sender.address, halfEther, "0x", "0x");
    const senderBalance: BigNumber = await sideTokenBtc.balanceOf(sender.address);

    expect(senderBalance.toString()).to.equals(halfEther.toString());
    await sideTokenBtc.connect(sender).approve(swapRBTC.address, quarterEther);

    await deployer.sendTransaction({
      to: swapRBTC.address,
      value: oneEther
    });

    await expect(swapRBTC.connect(sender).swapWRBTCtoRBTC(halfEther, sideTokenBtc.address))
      .to.be.revertedWith("ERC777: transfer amount exceeds allowance");
  });

  it("Should Not be allowed to withdraw RBTC When balance is not enough", async function () {
    const quarterEther = halfEther.div(2);
    await sideTokenBtc.connect(minter).mint(sender.address, halfEther, "0x", "0x");
    // const senderBalance: BigNumber = await sideTokenBtc.balanceOf(sender.address);

    // expect(senderBalance.toString()).to.equals(halfEther.toString());
    // await sideTokenBtc.connect(sender).approve(swapRBTC.address, quarterEther);

    // await deployer.sendTransaction({
    //   to: swapRBTC.address,
    //   value: oneEther
    // });

    // const balanceBeforeSwap = await sender.getBalance();
    // const receipt = await swapRBTC.connect(sender).swapWRBTCtoRBTC(quarterEther, sideTokenBtc.address);
    // const balanceAfterSwap = await sender.getBalance();

    // const tx = await network.provider.send("eth_getTransactionReceipt", [receipt.hash]);
    // const effectiveGasPrice = BigNumber.from(tx.effectiveGasPrice);
    // const gasUsed = BigNumber.from(tx.gasUsed);

    // expect(balanceAfterSwap.add(effectiveGasPrice.mul(gasUsed)).sub(quarterEther.add(balanceBeforeSwap)).isZero()).to.be.true;
    await expect(swapRBTC.connect(sender).withdrawalRBTC(halfEther)).to.be.revertedWith("SwapRBTC: amount > senderBalance");
  });

  it("Should Not be allowed to withdraw WRBTC When balance is not enough", async function () {
    await sideTokenBtc.connect(minter).mint(sender.address, halfEther, "0x", "0x");
    // const senderBalance: BigNumber = await sideTokenBtc.balanceOf(sender.address);

    // expect(senderBalance.toString()).to.equals(halfEther.toString());
    // await sideTokenBtc.connect(sender).approve(swapRBTC.address, quarterEther);

    // await deployer.sendTransaction({
    //   to: swapRBTC.address,
    //   value: oneEther
    // });

    // const balanceBeforeSwap = await sender.getBalance();
    // const receipt = await swapRBTC.connect(sender).swapWRBTCtoRBTC(quarterEther, sideTokenBtc.address);
    // const balanceAfterSwap = await sender.getBalance();

    // const tx = await network.provider.send("eth_getTransactionReceipt", [receipt.hash]);
    // const effectiveGasPrice = BigNumber.from(tx.effectiveGasPrice);
    // const gasUsed = BigNumber.from(tx.gasUsed);

    // expect(balanceAfterSwap.add(effectiveGasPrice.mul(gasUsed)).sub(quarterEther.add(balanceBeforeSwap)).isZero()).to.be.true;

    await expect(swapRBTC.connect(sender).withdrawalWRBTC(halfEther, sideTokenBtc.address)).to.be.revertedWith("SwapRBTC: amount > senderBalance");
  });
});
