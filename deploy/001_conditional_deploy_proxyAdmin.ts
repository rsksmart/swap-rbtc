import { HardhatRuntimeEnvironment } from "hardhat/types";

module.exports = async function (hre: HardhatRuntimeEnvironment) { // HardhatRuntimeEnvironment
  const {getNamedAccounts, deployments} = hre;
  const {deployer, proxyAdmin} = await getNamedAccounts();
  const {deploy, log} = deployments;

  if (proxyAdmin) {
    return;
  }

  const deployResult = await deploy('ProxyAdmin', {
    from: deployer,
    log: true
  });

  if (deployResult.newlyDeployed) {
    log(`Contract ProxyAdmin deployed at ${deployResult.address} using ${deployResult.receipt?.gasUsed.toString()} gas`);
  }
};

module.exports.id = 'deploy_proxyAdmin'; // id required to prevent reexecution
module.exports.tags = ['ProxyAdmin'];