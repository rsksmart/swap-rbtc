import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Address } from "hardhat-deploy/types";
let namedAccountsInstance: { [name: string]: string; } | null = null;

export async function getNamedAccountsInstance(
  hre: HardhatRuntimeEnvironment
): Promise<{ [name: string]: Address }> {
  if (namedAccountsInstance == null) {
    const { getNamedAccounts } = hre;
    namedAccountsInstance = await getNamedAccounts();
  }
  return namedAccountsInstance;
}

export async function getProxyAdminAddress(hre: HardhatRuntimeEnvironment) {
  const { deployments } = hre;
  const { proxyAdmin } = await getNamedAccountsInstance(hre);
  return proxyAdmin ?? (await deployments.get("ProxyAdmin")).address;
}

export async function getSideWrappedBtcAddress(hre: HardhatRuntimeEnvironment) {
  const { deployments } = hre;
  const { sideWtbtc } = await getNamedAccountsInstance(hre);
  return sideWtbtc ?? (await deployments.get("WTBTC")).address;
}

export async function getMultiSigAddress(hre: HardhatRuntimeEnvironment) {
  const { deployments } = hre;
  const { multiSig } = await getNamedAccountsInstance(hre);
  return multiSig ?? (await deployments.get("MultiSigWallet")).address;
}

export async function getBridgeProxyAddress(hre: HardhatRuntimeEnvironment) {
  const { deployments } = hre;
  const { bridgeProxy } = await getNamedAccountsInstance(hre);
  if (bridgeProxy) {
    return bridgeProxy;
  }
  const bridgeProxyDeployment = await deployments.getOrNull("BridgeProxy");
  if (bridgeProxyDeployment) {
    return bridgeProxyDeployment.address;
  }
  return bridgeProxyDeployment;
}

export async function getNftBridgeProxyAddress(hre: HardhatRuntimeEnvironment) {
  const { deployments } = hre;
  const { nftBridgeProxy } = await getNamedAccountsInstance(hre);

  if (nftBridgeProxy) {
    return nftBridgeProxy;
  }
  const nftBridgeProxyDeployment = await deployments.getOrNull(
    "NftBridgeProxy"
  );
  if (nftBridgeProxyDeployment) {
    return nftBridgeProxyDeployment.address;
  }
  return nftBridgeProxyDeployment;
}

export async function getFederatorProxyAddress(hre: HardhatRuntimeEnvironment) {
  const { deployments } = hre;
  const { federatorProxy } = await getNamedAccountsInstance(hre);

  if (federatorProxy) {
    return federatorProxy;
  }
  const federationProxyDeployment = await deployments.getOrNull(
    "FederationProxy"
  );
  if (federationProxyDeployment) {
    return federationProxyDeployment.address;
  }
  return federationProxyDeployment;
}

export async function getAllowTokensProxyAddress(
  hre: HardhatRuntimeEnvironment
) {
  const { deployments } = hre;
  const { allowTokensProxy } = await getNamedAccountsInstance(hre);

  if (allowTokensProxy) {
    return allowTokensProxy;
  }
  const allowTokensProxyDeployment = await deployments.getOrNull(
    "AllowTokensProxy"
  );
  if (allowTokensProxyDeployment) {
    return allowTokensProxyDeployment.address;
  }
  return allowTokensProxyDeployment;
}

export async function getSideTokenFactoryAddress(
  hre: HardhatRuntimeEnvironment
) {
  const { deployments } = hre;
  const { sideTokenFactory } = await getNamedAccountsInstance(hre);
  return (
    sideTokenFactory ?? (await deployments.get("SideTokenFactory")).address
  );
}
