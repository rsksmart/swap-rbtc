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
  HARDHAT_TEST_NET_CHAIN_ID
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

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
const config: HardhatUserConfig = {
  solidity: "0.8.9",
  networks: {
    hardhat: {
      live: false,
      blockGasLimit: 6800000,
      chainId: HARDHAT_TEST_NET_CHAIN_ID,
      gasPrice: 60000000,
      hardfork: 'istanbul', // London hardfork is incompatible with RSK gasPrice

      tags: ['test', 'local'],
    },
    // RSK
    rsktestnet: {
      live: true,
      url: 'https://public-node.testnet.rsk.co',
      blockGasLimit: 6800000,
      gasPrice: 68000000, // 0.06 gwei
      chainId: RSK_TEST_NET_CHAIN_ID,
      hardfork: 'istanbul', // London hardfork is incompatible with RSK gasPrice
      accounts: {
        count: 1,
        mnemonic: process.env.MNEMONIC,
        path: "m/44'/60'/0'/0",
      }
    },
  },
  namedAccounts: {
    deployer: 0,
    multiSig: getMultiSigAddressesByChainId(),
    proxyAdmin: getProxyAdminAddressesByChainId(),
    sideToken: getSideWbtcAddressesByChainId(),
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};



function getMultiSigAddressesByChainId() {
  const multiSigAddressesByChainId: {
    [index: number]: string
  } = {};
  multiSigAddressesByChainId[RSK_MAIN_NET_CHAIN_ID] = '0x040007b1804ad78a97f541bebed377dcb60e4138';
  multiSigAddressesByChainId[RSK_TEST_NET_CHAIN_ID] = '0x88f6b2bc66f4c31a3669b9b1359524abf79cfc4a';
  return multiSigAddressesByChainId;
}

function getProxyAdminAddressesByChainId() {
  const proxyAdminAddressesByChainId: {
    [index: number]: string
  } = {};
  proxyAdminAddressesByChainId[RSK_MAIN_NET_CHAIN_ID] = '0x12ed69359919fc775bc2674860e8fe2d2b6a7b5d';
  proxyAdminAddressesByChainId[RSK_TEST_NET_CHAIN_ID] = '0x8c35e166d2dea7a8a28aaea11ad7933cdae4b0ab';
  return proxyAdminAddressesByChainId;
}

function getSideWbtcAddressesByChainId() {
  const sideWbtcAddressesByChainId: {
    [index: number]: string
  } = {};
  sideWbtcAddressesByChainId[RSK_TEST_NET_CHAIN_ID] = '0xb94e4a2ab8057d55a5764861ea1e3104614ce944';
  return sideWbtcAddressesByChainId;
}

export default config;
