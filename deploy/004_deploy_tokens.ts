import { HardhatRuntimeEnvironment } from "hardhat/types";
import { ethers } from "hardhat";

module.exports = async function (hre: HardhatRuntimeEnvironment) { // HardhatRuntimeEnvironment
  const { deployments, network, getNamedAccounts } = hre;
  const { log } = deployments;
  const [deployer] = await ethers.getSigners();
  const { kovanSideToken, binanceSideToken } = await getNamedAccounts();

  const SwapRBTC = await deployments.get('SwapRBTC');
  const SwapRrbtcProxy = await deployments.get('SwapRbtcProxy');
  const swapContract = new ethers.Contract(SwapRrbtcProxy.address, SwapRBTC.abi, deployer);

  if (!network.live) {
    return;
  }

  if (kovanSideToken) {
    await tryAddTrustedToken(kovanSideToken, 'kovan', swapContract, log);
  }

  if (binanceSideToken) {
    await tryAddTrustedToken(binanceSideToken, 'binance', swapContract, log);
  }
};

async function tryAddTrustedToken(sideToken: string, networkName: string, swapContract: any, log: any) {
  const containsSideToken = await swapContract.containsSideTokenBtc(sideToken);
  if (containsSideToken) {
    log('Token with address:', sideToken, 'for network:', networkName, 'already in contract.')
  }
  else {
    await swapContract.addSideTokenBtc(sideToken);
    if (await swapContract.containsSideTokenBtc(sideToken)) {
      log('Added token with address:', sideToken, 'for network:', networkName)
    }
    else {
      log('Could not add the token with address:', sideToken, 'network:', networkName)
    }
  }
}

module.exports.id = 'deploy_AddSideTokensToSwap'; // id required to prevent reexecution
module.exports.tags = ['AddSideTokenBtcToSwap'];

