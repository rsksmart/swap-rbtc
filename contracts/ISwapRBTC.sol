// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ISwapRBTC {

  function swapWRBTCtoRBTC(uint256 amount, address sideTokenBtcContract) external returns (uint256);
  function withdrawalRBTC(uint256 amount) external;

}
