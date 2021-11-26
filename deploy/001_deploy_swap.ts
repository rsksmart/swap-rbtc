import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import {
  getProxyAdminAddress,
  getSideWrappedBtcAddress,
} from "../utils/address";
import { ethers } from "hardhat";
import { DeployResult } from "hardhat-deploy/dist/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();
  const proxyAdminAddress = await getProxyAdminAddress(hre);
  const sideWrappedBtcAddress = await getSideWrappedBtcAddress(hre);

  const factorySwapRBTC = await ethers.getContractFactory(
    "SwapRBTC",
    proxyAdminAddress
  );

  const deploySwap: DeployResult = await deploy('SwapRBTC', {
    from: deployer,
    log: true
  });

  const swapInitializeParams = [sideWrappedBtcAddress];
  const swapInstance = factorySwapRBTC.attach(deploySwap.address);
  const encodedSwapInitialize = swapInstance.interface.encodeFunctionData("initialize", swapInitializeParams);

  // await swapInstance.callStatic.initialize(swapInitializeParams);
  // const swapInterface = new ethers.utils.Interface(deploySwap.abi);
  // swapInterface.encodeFunctionData

  // using ethers
  // const deployedContract = await upgrades.deployProxy(factorySwapRBTC, [sideWrappedBtcAddress], {
  //   kind: "transparent",
  // });

  await deploy('SwapRbtcProxy', {
    from: deployer,
    contract: 'TransparentUpgradeableProxy',
    args: [
      deploySwap.address,
      proxyAdminAddress,
      encodedSwapInitialize
    ],
    log: true
  });
};
export default func;
func.id = "SwapWTBTCtoRBTC";
func.tags = ["Swap"];
