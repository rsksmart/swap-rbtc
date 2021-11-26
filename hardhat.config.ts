import * as dotenv from "dotenv";
import { task } from "hardhat/config";
import { HardhatUserConfig } from 'hardhat/types';
import 'hardhat-deploy';
import "hardhat-gas-reporter";
import "solidity-coverage";
import "@nomiclabs/hardhat-ethers";
import "hardhat-erc1820";

import {
  RSK_TEST_NET_CHAIN_ID,
  RSK_MAIN_NET_CHAIN_ID,
  KOVAN_TEST_NET_CHAIN_ID
} from "./utils/chains";

import "@openzeppelin/hardhat-upgrades";

dotenv.config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const ACCOUNTS = {
  count: 10,
  mnemonic: process.env.MNEMONIC,
  path: "m/44'/60'/0'/0",
};


function getMultiSigAddressesByChainId() {
  const multiSigAddressesByChainId: {
    [index: number]: string
  } = {};
  multiSigAddressesByChainId[KOVAN_TEST_NET_CHAIN_ID] = '0x040007b1804ad78a97f541bebed377dcb60e4138';
  multiSigAddressesByChainId[RSK_MAIN_NET_CHAIN_ID] = '0x040007b1804ad78a97f541bebed377dcb60e4138';
  multiSigAddressesByChainId[RSK_TEST_NET_CHAIN_ID] = '0x88f6b2bc66f4c31a3669b9b1359524abf79cfc4a';
  return multiSigAddressesByChainId;
}

function getProxyAdminAddressesByChainId() {
  const proxyAdminAddressesByChainId: {
    [index: number]: string
  } = {};
  proxyAdminAddressesByChainId[KOVAN_TEST_NET_CHAIN_ID] = '0xe4d351911a6d599f91a3db1843e2ecb0f851e7e6';
  proxyAdminAddressesByChainId[RSK_MAIN_NET_CHAIN_ID] = '0x12ed69359919fc775bc2674860e8fe2d2b6a7b5d';
  proxyAdminAddressesByChainId[RSK_TEST_NET_CHAIN_ID] = '0x8c35e166d2dea7a8a28aaea11ad7933cdae4b0ab';
  return proxyAdminAddressesByChainId;
}

function getBridgeProxyAddressesByChainId() {
  const bridgeProxyAddressesByChainId: {
    [index: number]: string
  } = {};
  bridgeProxyAddressesByChainId[KOVAN_TEST_NET_CHAIN_ID] = '0x12ed69359919fc775bc2674860e8fe2d2b6a7b5d';
  bridgeProxyAddressesByChainId[RSK_MAIN_NET_CHAIN_ID] = '0x9d11937e2179dc5270aa86a3f8143232d6da0e69';
  bridgeProxyAddressesByChainId[RSK_TEST_NET_CHAIN_ID] = '0x684a8a976635fb7ad74a0134ace990a6a0fcce84';
  return bridgeProxyAddressesByChainId;
}

function getSideWbtcAddressesByChainId() {
  const sideWbtcAddressesByChainId: {
    [index: number]: string
  } = {};
  sideWbtcAddressesByChainId[RSK_TEST_NET_CHAIN_ID] = '0xb94e4a2ab8057d55a5764861ea1e3104614ce944';
  return sideWbtcAddressesByChainId;
}


/**
 * @type import('hardhat/config').HardhatUserConfig
 */
const config: HardhatUserConfig = {
  solidity: "0.8.2",
  networks: {
    kovan: {
      url: process.env.KOVAN_URL || "",
      accounts: ACCOUNTS,
      saveDeployments: true,
      chainId: KOVAN_TEST_NET_CHAIN_ID,
    },
    // RSK
    rsktestnet: {
      live: true,
      url: 'https://public-node.testnet.rsk.co',
      blockGasLimit: 6800000,
      gasPrice: 68000000, // 0.06 gwei
      chainId: RSK_TEST_NET_CHAIN_ID,
      hardfork: 'istanbul', // London hardfork is incompatible with RSK gasPrice
      accounts: ACCOUNTS
    },
  },
  namedAccounts: {
    deployer: 0,
    tokenOwner: 1,
    multiSig: getMultiSigAddressesByChainId(),
    proxyAdmin: getProxyAdminAddressesByChainId(),
    bridgeProxy: getBridgeProxyAddressesByChainId(),
    sideWtbtc: getSideWbtcAddressesByChainId(),
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;
