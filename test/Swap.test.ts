import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers, upgrades, network } from "hardhat";

describe("Swap RBTC", function () {
  let swapRBTC: Contract, sideTokenBtc: Contract;
  const oneEther = ethers.utils.parseUnits("1.0", "ether");
  const halfEher = ethers.utils.parseUnits("0.5", "ether");
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
    await sideTokenBtc.connect(sender).approve(swapRBTC.address, halfEher);

    await deployer.sendTransaction({
      to: swapRBTC.address,
      value: oneEther
    });

    const balanceBeforeSwap = await sender.getBalance();
    const receipt = await swapRBTC.connect(sender).swapWRBTCtoRBTC(halfEher, sideTokenBtc.address);
    const balanceAfterSwap = await sender.getBalance();

    const tx = await network.provider.send("eth_getTransactionReceipt", [receipt.hash]);
    const effectiveGasPrice = BigNumber.from(tx.effectiveGasPrice);
    const gasUsed = BigNumber.from(tx.gasUsed);

    expect(balanceAfterSwap.add(effectiveGasPrice.mul(gasUsed)).sub(halfEher.add(balanceBeforeSwap)).isZero()).to.be.true;
  });
});
