import { Network } from "hardhat/types"

export const ETHEREUM_MAIN_NET_CHAIN_ID = 1;
export const RSK_MAIN_NET_CHAIN_ID = 30;
export const RSK_TEST_NET_CHAIN_ID = 31;
export const KOVAN_TEST_NET_CHAIN_ID = 42;
export const RINKEBY_TEST_NET_CHAIN_ID = 4;
export const BSC_MAIN_NET_CHAIN_ID = 56;
export const BSC_TEST_NET_CHAIN_ID = 97;
export const GANACHE_DEV_MIRROR_CHAIN_ID = 5776;
export const GANACHE_DEV_NET_CHAIN_ID = 5777;
export const HARDHAT_TEST_NET_CHAIN_ID = 31337;

/** Network example
  config: {
    accounts: 'remote',
    live: false,
    network_id: 5777,
  },
  saveDeployments: false,
  tags: (2) ['integrationTest', 'local'],
  live: false,
  name: 'development'
*/
export function isRSK(network: Network) {
  const chainID = network.config.chainId;
  return [RSK_MAIN_NET_CHAIN_ID, RSK_TEST_NET_CHAIN_ID].includes(chainID ?? 0);
}

export function isMainnet(network: Network) {
  const chainID = network.config.chainId;
  return [ETHEREUM_MAIN_NET_CHAIN_ID, RSK_MAIN_NET_CHAIN_ID, BSC_MAIN_NET_CHAIN_ID].includes(chainID ?? 0);
}
