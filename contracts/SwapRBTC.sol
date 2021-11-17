//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./IWrapped.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract SwapRBTC is Initializable, OwnableUpgradeable {
  event WrappedBtcChanged(address newWrbtc);

  IWrapped public wrbtc;
  address internal constant NULL_ADDRESS = address(0);

  function initialize(address wrbtcContract) public initializer {
    setWrappedBTC(wrbtcContract);
  }

  receive () external payable {
		// The fallback function is needed to use WRBTC
		require(_msgSender() == address(wrbtc), "SwapRBTC: not wrapped BTC");
	}

  function setWrappedBTC(address wrbtcContract) public onlyOwner {
    require(wrbtcContract != NULL_ADDRESS, "SwapRBTC: wrbtc contract is null");
    wrbtc = IWrapped(wrbtcContract);
    emit WrappedBtcChanged(wrbtcContract);
  }

  function swapWRBTCtoRBTC(uint256 amount) external returns (uint256) {
    address payable sender = payable(msg.sender);
    wrbtc.transferFrom(sender, address(this), amount);
    wrbtc.withdraw(amount);
    require(address(this).balance >= amount, "SwapRBTC: amount > balance");

    // solhint-disable-next-line avoid-low-level-calls
    (bool success,) = sender.call{value: amount}("");
    require(success, "SwapRBTC: Swap call failed");
    return amount;
  }

}
