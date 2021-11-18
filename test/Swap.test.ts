import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers, upgrades, network } from "hardhat";

describe("Swap RBTC", function () {
  let swapRBTC: Contract, wRBTC: Contract;
  const oneEther = ethers.utils.parseUnits("1.0", "ether");
  const halfEher = ethers.utils.parseUnits("0.5", "ether");
  let deployer: SignerWithAddress;

  beforeEach(async () => {
    [deployer] = await ethers.getSigners();
    const factorySwapRBTC = await ethers.getContractFactory("SwapRBTC");
    const factoryWRBTC = await ethers.getContractFactory("WRBTC");
    wRBTC = await factoryWRBTC.deploy();

    swapRBTC = await upgrades.deployProxy(factorySwapRBTC, [wRBTC.address]);
  });

  it("Should Swap the WRBTC to RBTC", async function () {
    await wRBTC.deposit({from: deployer.address, value: oneEther});
    const deployerBalance: BigNumber = await wRBTC.balanceOf(deployer.address);

    expect(deployerBalance.toString()).to.equals(oneEther.toString());
    await wRBTC.approve(swapRBTC.address, halfEher);

    const balanceBeforeSwap = await deployer.getBalance();
    const receipt = await swapRBTC.swapWRBTCtoRBTC(halfEher, {from: deployer.address});
    const balanceAfterSwap = await deployer.getBalance();

    const tx = await network.provider.send("eth_getTransactionReceipt", [receipt.hash]);
    const effectiveGasPrice = BigNumber.from(tx.effectiveGasPrice);
    const gasUsed = BigNumber.from(tx.gasUsed);

    expect(balanceAfterSwap.add(effectiveGasPrice.mul(gasUsed)).sub(halfEher.add(balanceBeforeSwap)).isZero()).to.be.true;
  });
});
