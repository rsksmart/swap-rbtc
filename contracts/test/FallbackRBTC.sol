//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "../ISwapRBTC.sol";

contract FallbackRBTC {
    ISwapRBTC public swapRBTC;

    constructor(address contractAddress) {
        swapRBTC = ISwapRBTC(contractAddress);
    }

    receive() external payable {
        revert("Fallback RBTC reverting");
    }

    function deposit() payable external {
        // solhint-disable-next-line avoid-low-level-calls
        (bool successCall,) = payable(address(swapRBTC)).call{value: msg.value}("");
        require(successCall, "FallbackRBTC: depositRBTC failed");
    }

    function withdraw(uint256 amount) external {
        swapRBTC.withdrawalRBTC(amount);
    }
}