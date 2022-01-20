const SwapRbtcProxy = 'SwapRbtcProxy';
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import {
  getProxyAdminAddress,
  getSideWrappedBtcAddress,
} from "../utils/address";
import { isRSK } from "../utils/chains";
import { ethers } from "hardhat";
import { DeployResult } from "hardhat-deploy/dist/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy, log } = deployments;

  const { deployer } = await getNamedAccounts();
  const proxyAdminAddress = await getProxyAdminAddress(hre);
  const sideWrappedBtcAddress = await getSideWrappedBtcAddress(hre);

  const factorySwapRBTC = await ethers.getContractFactory(
    "SwapRBTC"
  );

  const deploySwap: DeployResult = await deploy('SwapRBTC', {
    from: deployer,
    log: true
  });

  const swapInitializeParams = [sideWrappedBtcAddress];
  const swapInstance = factorySwapRBTC.attach(deploySwap.address);
  const encodedSwapInitialize = swapInstance.interface.encodeFunctionData("initialize", swapInitializeParams);

  let constructorArguments = [
    deploySwap.address,
    proxyAdminAddress,
    encodedSwapInitialize
  ];

  const deployProxyResult = await deploy('SwapRbtcProxy', {
    from: deployer,
    contract: 'TransparentUpgradeableProxy',
    args: constructorArguments,
    log: true
  });

  if (deployProxyResult.newlyDeployed) {
    log(`Contract ${SwapRbtcProxy} deployed at ${deployProxyResult.address} using ${deployProxyResult.receipt?.gasUsed.toString()} gas`);

    if(network.live && !isRSK(network)) {
      log(`Startig Verification of ${deploySwap.address}`);
      await hre.run("verify:verify", {
        address: deploySwap.address,
        constructorArguments: constructorArguments,
      });
    }
  }
};
export default func;
func.id = "SwapWTBTCtoRBTC";
func.tags = ["Swap"];
