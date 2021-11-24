//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./ISideToken.sol";
import "./ISwapRBTC.sol";
import "@openzeppelin/contracts/utils/introspection/IERC1820Registry.sol";
import "@openzeppelin/contracts/token/ERC777/IERC777Recipient.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract SwapRBTC is Initializable, OwnableUpgradeable, ISwapRBTC, IERC777Recipient {
  event WrappedBtcChanged(address sideTokenBtc);
  event RbtcSwapRbtc(address sideTokenBtc, uint256 amountSwapped);
  event Withdrawal(address indexed src, uint256 wad, address sideTokenBtc);
  event Received(address sender, uint256 amount);
  event TokenReceived(
    address operator,
    address from,
    address to,
    uint256 amount,
    bytes userData,
    bytes operatorData
  );

  IERC1820Registry constant internal ERC1820 = IERC1820Registry(0x1820a4B7618BdE71Dce8cdc73aAB6C95905faD24);
  ISideToken public sideTokenBtc; // sideEthereumBTC
  address internal constant NULL_ADDRESS = address(0);

  function initialize(address sideTokenBtcContract) public initializer {
    _setSideTokenBtc(sideTokenBtcContract);
    // keccak256("ERC777TokensRecipient")
    ERC1820.setInterfaceImplementer(address(this), 0xb281fc8c12954d22544db45de3159a39272895b169a852b314f9cc762e44c53b, address(this));
  }

  receive () external payable {
		// The fallback function is needed to use WRBTC
		// require(_msgSender() == address(sideTokenBtc), "SwapRBTC: not sideBTC address");
    emit Received(msg.sender, msg.value);
	}

  function _setSideTokenBtc(address sideTokenBtcContract) internal {
    require(sideTokenBtcContract != NULL_ADDRESS, "SwapRBTC: sideBTC is null");
    sideTokenBtc = ISideToken(sideTokenBtcContract);
    emit WrappedBtcChanged(sideTokenBtcContract);
  }

  function setWrappedBtc(address sideTokenBtcContract) public onlyOwner {
    _setSideTokenBtc(sideTokenBtcContract);
  }

  function swapWRBTCtoRBTC(uint256 amount) external override returns (uint256) {
    address payable sender = payable(msg.sender);
    require(sideTokenBtc.balanceOf(sender) >= amount, "SwapRBTC: not enough balance");

    bool successTransfer = sideTokenBtc.transferFrom(sender, address(this), amount);
    emit Withdrawal(sender, amount, address(sideTokenBtc));

    require(successTransfer, "SwapRBTC: Transfer sender failed");
    require(address(this).balance >= amount, "SwapRBTC: amount > balance");

    sideTokenBtc.burn(amount, "");

    // solhint-disable-next-line avoid-low-level-calls
    (bool successCall,) = sender.call{value: amount}("");
    require(successCall, "SwapRBTC: Swap call failed");
    emit RbtcSwapRbtc(address(sideTokenBtc), amount);

    return amount;
  }

  /**
    * @dev Called by an `IERC777` token contract whenever tokens are being
    * moved or created into a registered account (`to`). The type of operation
    * is conveyed by `from` being the zero address or not.
    *
    * This call occurs _after_ the token contract's state is updated, so
    * `IERC777.balanceOf`, etc., can be used to query the post-operation state.
    *
    * This function may revert to prevent the operation from being executed.
  */
  function tokensReceived(
    address operator,
    address from,
    address to,
    uint amount,
    bytes calldata userData,
    bytes calldata operatorData
  ) external override {
    emit TokenReceived(operator, from, to, amount, userData, operatorData);
  }

}
