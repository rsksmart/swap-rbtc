import { HardhatRuntimeEnvironment } from "hardhat/types";
import { ethers } from "hardhat";

module.exports = async function (hre: HardhatRuntimeEnvironment) { // HardhatRuntimeEnvironment
  const {deployments, network, getNamedAccounts} = hre;
  const { log } = deployments;
  const [deployer] = await ethers.getSigners();
  const { kovanSideToken, binanceSideToken } = await getNamedAccounts();

  const SwapRBTC = await deployments.get('SwapRBTC');
  const SwapRrbtcProxy = await deployments.get('SwapRbtcProxy');
  const swapContract = new ethers.Contract(SwapRrbtcProxy.address, SwapRBTC.abi, deployer);
  
  if(!network.live){
    return;
  }

  if(kovanSideToken){
    const containsSideToken = await swapContract.containsSideTokenBtc(kovanSideToken);
    if(containsSideToken){
      log('Token with address: ', kovanSideToken, ' already in contract.')
    }
    else {
      await swapContract.addSideTokenBtc(kovanSideToken);
      if(await swapContract.containsSideTokenBtc(kovanSideToken)){
        log('Added token with address: ', kovanSideToken)
      }
      else{
        log('Could not add the token with address: ', kovanSideToken)
      }  
    } 
  }

  if(binanceSideToken){
    const containsSideToken = await swapContract.containsSideTokenBtc(binanceSideToken);
    if(containsSideToken){
      log('Token with address: ', binanceSideToken, ' already in contract.')
    }
    else {
      await swapContract.addSideTokenBtc(binanceSideToken);
      if(await swapContract.containsSideTokenBtc(binanceSideToken)){
        log('Added token with address: ', binanceSideToken)
      }
      else{
        log('Could not add the token with address: ', binanceSideToken)
      }  
    } 
  }
};

module.exports.id = 'deploy_AddSideTokensToSwap'; // id required to prevent reexecution
module.exports.tags = ['AddSideTokenBtcToSwap'];
