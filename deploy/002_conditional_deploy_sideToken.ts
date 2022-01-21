import { Wallet } from "ethers";
import { ethers } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const { deploy1820 } = require("deploy-eip-1820")
//import {deploy1820} from "deploy-eip-1820";

module.exports = async function (hre: HardhatRuntimeEnvironment) { // HardhatRuntimeEnvironment
  const {getNamedAccounts, deployments, network} = hre;
  const {deployer, minter, sideToken} = await getNamedAccounts();
  const {deploy, log} = deployments;
  const [wallet] = await ethers.getSigners();

  if (sideToken) {
    return;
  }

  if (!network.live) {
    await deploy1820(wallet);
  }

  const deployResult = await deploy("SideToken", {
      from: deployer,
      args: [
        "SideTokenBTC",
        "sWBTC",
        deployer,
        1],
      log: true
    });

  if (deployResult.newlyDeployed) {
    log(`Contract SideTokenBTC deployed at ${deployResult.address}`);
  }
};

module.exports.id = 'deploy_SideTokenBTC'; // id required to prevent reexecution
module.exports.tags = ['SideTokenBTC'];