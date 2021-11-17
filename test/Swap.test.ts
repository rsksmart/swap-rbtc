import { expect } from "chai";
import { ethers } from "hardhat";

describe("Swap RBTC", function () {

  beforeEach(async () => {
    const [deployer] = await ethers.getSigners();
    const factorySwapRBTC = ethers.getContractFactory("SwapRBTC");
    // const SwapRBTC = await upgrades.deployProxy(factorySwapRBTC, [42]);
  });

  it("Should return the new greeting once it's changed", async function () {
    // const Greeter = await ethers.getContractFactory("Greeter");
    // const greeter = await Greeter.deploy("Hello, world!");
    // await greeter.deployed();

    // expect(await greeter.greet()).to.equal("Hello, world!");

    // const setGreetingTx = await greeter.setGreeting("Hola, mundo!");

    // // wait until the transaction is mined
    // await setGreetingTx.wait();

    // expect(await greeter.greet()).to.equal("Hola, mundo!");
  });
});
