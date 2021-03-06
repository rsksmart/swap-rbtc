//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./ISideToken.sol";
import "./ISwapRBTC.sol";
import "@openzeppelin/contracts/utils/introspection/IERC1820Registry.sol";
import "@openzeppelin/contracts/token/ERC777/IERC777Recipient.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/structs/EnumerableSetUpgradeable.sol";

contract SwapRBTC is Initializable, OwnableUpgradeable, ISwapRBTC, IERC777Recipient {
  using EnumerableSetUpgradeable for EnumerableSetUpgradeable.AddressSet;
  using SafeERC20Upgradeable for ISideToken;

  event sideTokenBtcAdded(address sideTokenBtc);
  event sideTokenBtcRemoved(address sideTokenBtc);
  event RbtcSwapRbtc(address sideTokenBtc, uint256 amountSwapped);
  event RbtcSwapSideToken(address sideTokenBtc, uint256 amountSwapped);
  event WithdrawalRBTC(address indexed src, uint256 wad);
  event WithdrawalSideTokenBtc(address indexed src, uint256 wad);
  event Deposit(address sender, uint256 amount, address tokenAddress);
  
  IERC1820Registry constant internal ERC1820 = IERC1820Registry(0x1820a4B7618BdE71Dce8cdc73aAB6C95905faD24);
  EnumerableSetUpgradeable.AddressSet internal enumerableSideTokenBtc;

  // ISideToken sideTokenBtc; // sideEthereumBTC
  address internal constant NULL_ADDRESS = address(0);
  uint256 public fee;

  mapping(address => uint256) public balance;

  function initialize(address sideTokenBtcContract) public initializer {
    // _setSideTokenBtc(sideTokenBtcContract);
    _addSideTokenBtc(sideTokenBtcContract);
    // keccak256("ERC777TokensRecipient")
    fee = 0;
    ERC1820.setInterfaceImplementer(address(this), 0xb281fc8c12954d22544db45de3159a39272895b169a852b314f9cc762e44c53b, address(this));
    __Ownable_init();
  }

  receive() external payable {
		// The fallback function is needed to receive RBTC
    _deposit(_msgSender(), msg.value, address(0));
	}

  function _deposit(address from, uint256 amount, address tokenAddress) internal {
    balance[from] += amount;
    emit Deposit(from, amount, tokenAddress);
	}

  function withdrawalRBTC(uint256 amount) external {
    require(address(this).balance >= amount, "SwapRBTC: amount > balance");
    require(balance[_msgSender()] >= amount, "SwapRBTC: amount > senderBalance");
    
    balance[_msgSender()] -= amount;

    // solhint-disable-next-line avoid-low-level-calls
    (bool successCall,) = payable(_msgSender()).call{value: amount}("");
    require(successCall, "SwapRBTC: withdrawalRBTC failed");

    emit WithdrawalRBTC(_msgSender(), amount);
  }

  function withdrawalSideTokenBtc(uint256 amount, address sideTokenBtcContract) external {
    require(enumerableSideTokenBtc.contains(sideTokenBtcContract), "SwapRBTC: Side Token not found");
    require(balance[_msgSender()] >= amount, "SwapRBTC: amount > senderBalance");

    ISideToken sideTokenBtc = ISideToken(sideTokenBtcContract);
    require(sideTokenBtc.balanceOf(address(this)) >= amount, "SwapRBTC: amount > balance");

    balance[_msgSender()] -= amount;
    bool successCall = IERC20(sideTokenBtcContract).transfer(_msgSender(), amount);
    require(successCall, "SwapRBTC: withdrawalSideTokenBtc failed");
    emit WithdrawalSideTokenBtc(_msgSender(), amount);
  }

  function _addSideTokenBtc(address sideTokenBtcContract) internal {
    require(sideTokenBtcContract != NULL_ADDRESS, "SwapRBTC: sideBTC is null");
    require(!enumerableSideTokenBtc.contains(sideTokenBtcContract), "SwapRBTC: side token already included");
    enumerableSideTokenBtc.add(sideTokenBtcContract);
    emit sideTokenBtcAdded(sideTokenBtcContract);
  }

  function addSideTokenBtc(address sideTokenBtcContract) public onlyOwner {
    _addSideTokenBtc(sideTokenBtcContract);
  }


  function _removeSideTokenBtc(address sideTokenBtcContract) internal {
    require(sideTokenBtcContract != NULL_ADDRESS, "SwapRBTC: sideBTC is null");
    require(enumerableSideTokenBtc.contains(sideTokenBtcContract), "SwapRBTC: side token not founded");
    enumerableSideTokenBtc.remove(sideTokenBtcContract);
    emit sideTokenBtcRemoved(sideTokenBtcContract);
  }

  function removeSideTokenBtc(address sideTokenBtcContract) public onlyOwner {
    _removeSideTokenBtc(sideTokenBtcContract);
  }

  function lengthSideTokenBtc() public view returns(uint256) {
    return enumerableSideTokenBtc.length();
  }

  function containsSideTokenBtc(address sideTokenBtcContract) public view returns(bool) {
    return enumerableSideTokenBtc.contains(sideTokenBtcContract);
  }

  function sideTokenBtcAt(uint256 index) public view returns(address) {
    return enumerableSideTokenBtc.at(index);
  }

  function swapSideTokenBtctoRBTC(uint256 amount, address sideTokenBtcContract) external override returns (uint256) {
    require(enumerableSideTokenBtc.contains(sideTokenBtcContract), "SwapRBTC: Side Token not found");
    ISideToken sideTokenBtc = ISideToken(sideTokenBtcContract);

    address payable sender = payable(_msgSender());
    require(sideTokenBtc.balanceOf(sender) >= amount, "SwapRBTC: not enough balance");

    bool successTransfer = sideTokenBtc.transferFrom(sender, address(this), amount);

    require(successTransfer, "SwapRBTC: Transfer sender failed");
    require(address(this).balance >= amount, "SwapRBTC: amount > balance");

    // solhint-disable-next-line avoid-low-level-calls
    (bool successCall,) = sender.call{value: amount}("");
    require(successCall, "SwapRBTC: Swap call failed");
    emit RbtcSwapRbtc(address(sideTokenBtc), amount);
    return amount;
  }

  function swapRBTCtoSideTokenBtc(uint256 amount, address sideTokenBtcContract) external payable override returns (uint256) {
    require(enumerableSideTokenBtc.contains(sideTokenBtcContract), "SwapRBTC: Side Token not found");
    ISideToken sideToken = ISideToken(sideTokenBtcContract);
    address sender = _msgSender();
    
    require(address(this).balance >= amount, "SwapRBTC: amount > balance");
    require(sideToken.balanceOf(address(this)) >= amount, "SwapRBTC: not enough balance");
    require(balance[sender] >= amount, "SwapRBTC: sender not enough balance");

    balance[sender] -= amount;
    bool successTransfer = IERC20(sideTokenBtcContract).transfer(sender, amount);

    require(successTransfer, "SwapRBTC: Transfer sender failed");

    emit RbtcSwapSideToken(address(sideToken), amount);
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
    address,
    address from,
    address to,
    uint amount,
    bytes calldata,
    bytes calldata
  ) external override {
    //Hook from ERC777address / ERC20
    address tokenAddress = _msgSender();
  	if(from == address(this)) return; // WARN: we don't deposit when the caller was the contract itself as that would duplicate the deposit.
		require(to == address(this), "SwapRBTC: Invalid 'to' address"); // verify that the 'to' address is the same as the address of this contract.
    require(enumerableSideTokenBtc.contains(tokenAddress), "SwapRBTC: Side Token not found");
    
    _deposit(from, amount, tokenAddress);
  }
}
