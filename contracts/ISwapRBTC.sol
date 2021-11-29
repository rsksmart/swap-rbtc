// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ISwapRBTC {

  function swapWRBTCtoRBTC(uint256 amount) external returns (uint256);

  function getSideTokenBtc() external view returns (address);

}
