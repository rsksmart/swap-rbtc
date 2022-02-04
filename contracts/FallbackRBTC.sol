//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract FallbackRBTC {
    receive() external payable {
        revert();
    }
}