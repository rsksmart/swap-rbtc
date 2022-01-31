import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signers";
import chai, { expect } from 'chai';
import { solidity } from "ethereum-waffle";

chai.use(solidity);

import { BigNumber, Contract } from "ethers";
import { ethers, network } from "hardhat";

describe("Swap RBTC", function () {
  let swapRBTC: Contract, sideTokenBtc: Contract;
  const oneEther = ethers.utils.parseUnits("1.0", "ether");
  const halfEther = ethers.utils.parseUnits("0.5", "ether");
  const quarterEther = halfEther.div(2);
  const bnbContract = "0xB8c77482e45F1F44dE1745F52C74426C631bDD52";
  const nullAddress = "0x0000000000000000000000000000000000000000";
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

    swapRBTC = await factorySwapRBTC.deploy();
    await swapRBTC.initialize(sideTokenBtc.address);
  });

  it("Should Swap the side token BTC to RBTC", async function () {
    await sideTokenBtc.connect(minter).mint(sender.address, oneEther, "0x", "0x");
    const senderBalance: BigNumber = await sideTokenBtc.balanceOf(sender.address);

    expect(senderBalance.toString()).to.equals(oneEther.toString());

    await deployer.sendTransaction({
      to: swapRBTC.address,
      value: oneEther
    });

    await sideTokenBtc.connect(sender).approve(swapRBTC.address, halfEther);
    const balanceBeforeSwap = await sender.getBalance();
    const response = await swapRBTC.connect(sender).swapWRBTCtoRBTC(halfEther, sideTokenBtc.address);
    const receipt = await response.wait();

    const balanceAfterSwap = await sender.getBalance();
    const effectiveGasPrice = BigNumber.from(receipt.effectiveGasPrice);
    const gasUsed = BigNumber.from(receipt.gasUsed);
    const spentInGas = effectiveGasPrice.mul(gasUsed);
    expect(balanceAfterSwap).to.be.equal(balanceBeforeSwap.sub(spentInGas).add(halfEther))
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
    await expect(swapRBTC.connect(sender).withdrawalRBTC(halfEther)).to.be.revertedWith("SwapRBTC: amount > senderBalance");
  });

  it("Should Not be allowed to withdraw WRBTC When balance is not enough", async function () {
    await expect(swapRBTC.connect(sender).withdrawalWRBTC(halfEther, sideTokenBtc.address)).to.be.revertedWith("SwapRBTC: amount > senderBalance");
  });

  it("Should only owner be allowed to add a side token address", async function () {
    await expect(swapRBTC.connect(minter).addSideTokenBtc(sideTokenBtc.address)).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("Should not allow null address", async function () {
    await expect(swapRBTC.addSideTokenBtc(nullAddress)).to.be.revertedWith("SwapRBTC: sideBTC is null");
  });

  it("Should add side token address", async function () {
    await expect(swapRBTC.addSideTokenBtc(bnbContract)).to.be.emit(swapRBTC, 'sideTokenBtcAdded');
  });

  it("Should only owner be allowed to remove a side token address", async function () {
    await expect(swapRBTC.connect(minter).removeSideTokenBtc(sideTokenBtc.address)).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("Should not allow null address on remove side token", async function () {
    await expect(swapRBTC.removeSideTokenBtc(nullAddress)).to.be.revertedWith("SwapRBTC: sideBTC is null");
  });

  it("Should remove side token address", async function () {
    await expect(swapRBTC.removeSideTokenBtc(bnbContract)).to.be.emit(swapRBTC, 'sideTokenBtcRemoved');
  });

  it("Should have one side token", async function() {
    const lenSideToken = await swapRBTC.lengthSideTokenBtc();
    expect(lenSideToken.toString()).to.be.equal('1');
  });

  it('Should contain the side token after adding it', async function(){
    await swapRBTC.addSideTokenBtc(minter.address);
    expect(await swapRBTC.containsSideTokenBtc(minter.address)).to.be.equal(true);
  });

  it('Should have the sideTokenBtc address on index 1', async function() {
    await swapRBTC.addSideTokenBtc(minter.address);
    const address = await swapRBTC.sideTokenBtcAt(1);
    expect(address).to.be.equal(minter.address);
  });

  it("Should receive deposit as default behavior", async function () {
    const balanceBeforeDeposit = await sender.getBalance();
    const balanceInContractBeforeDeposit = await ethers.provider.getBalance(swapRBTC.address);
    const lockedAmountBefore = await swapRBTC.balance(sender.address);

    const depositedAmount = halfEther;

    const receipt = await sender.sendTransaction({
      to: swapRBTC.address,
      value: depositedAmount
    });
    const response = await receipt.wait();
    await expect(receipt).to.emit(swapRBTC, "Deposit");
    const balanceAfterDeposit = await sender.getBalance();
     const effectiveGasPrice = BigNumber.from(response.effectiveGasPrice);
    const gasUsed = BigNumber.from(response.gasUsed);

    const totalForTheDeposit = depositedAmount.add(effectiveGasPrice.mul(gasUsed));
    const spent = balanceBeforeDeposit.sub(balanceAfterDeposit);
    const balanceInContractAfterDeposit = await ethers.provider.getBalance(swapRBTC.address);
    const lockedAmountAfter = await swapRBTC.balance(sender.address);

    expect(spent).to.be.equal(totalForTheDeposit);
    expect(lockedAmountAfter).to.be.equal(lockedAmountBefore.add(depositedAmount));

    expect(balanceInContractAfterDeposit).to.be.equal(balanceInContractBeforeDeposit.add(depositedAmount));
  });

  it('sends tokens to a contract from an externally-owned account', async function () {
    await sideTokenBtc.connect(minter).mint(sender.address, oneEther, "0x", "0x");
    const senderBalance: BigNumber = await sideTokenBtc.balanceOf(sender.address);
    expect(senderBalance.toString()).to.equals(oneEther.toString());

    const prevBalance = await swapRBTC.balance(sender.address);

    const receipt = await sideTokenBtc.connect(sender).send(swapRBTC.address, halfEther, "0x");
    const lockedAmountAfter = await swapRBTC.balance(sender.address);

    await expect(receipt).to.emit(swapRBTC, "Deposit").withArgs(sender.address, halfEther, sideTokenBtc.address);
    expect(halfEther.add(prevBalance)).to.be.equal(lockedAmountAfter);
  });
  
  it('Sending a token reverts when balance is not enough', async function () {
    await expect(sideTokenBtc.send(swapRBTC.address, halfEther, "0x")).to.be.revertedWith("ERC777: transfer amount exceeds balance");
  });

  it('Sending a token reverts when token is not registered', async function () {
    const factorySideToken = await ethers.getContractFactory("SideToken");
    const anotherSideToken = await factorySideToken.deploy(
      "AnotherSideTokenBTC",
      "asWBTC",
      minter.address,
      1
    );
    await anotherSideToken.connect(minter).mint(sender.address, oneEther, "0x", "0x");
    await sideTokenBtc.connect(minter).mint(sender.address, oneEther, "0x", "0x");
    const senderBalance: BigNumber = await anotherSideToken.balanceOf(sender.address);
    expect(senderBalance).to.be.equal(oneEther);

    await expect(anotherSideToken.connect(sender).send(swapRBTC.address, halfEther, "0x")).to.be.revertedWith("SwapRBTC: Side Token not found");
  });
});
