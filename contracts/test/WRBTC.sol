// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2020 ThinkAndDev

import "../IWrapped.sol";

pragma solidity ^0.8.0;

contract WRBTC is IWrapped {
  string public name = "Wrapped RBTC";
  string public symbol = "WRBTC";
  uint8 public decimals = 18;

  event Approval(address indexed src, address indexed guy, uint256 wad);
  event Transfer(address indexed src, address indexed dst, uint256 wad);
  event Deposit(address indexed dst, uint256 wad);
  event Withdrawal(address indexed src, uint256 wad);

  mapping(address => uint256) public balanceOf;
  mapping(address => mapping(address => uint256)) public allowance;

  receive() external payable {
    deposit();
  }

  function deposit() public payable {
    balanceOf[msg.sender] += msg.value;
    emit Deposit(msg.sender, msg.value);
  }

  function withdraw(uint256 wad) override external {
    require(balanceOf[msg.sender] >= wad, "WRBTC: not enough balance");
    balanceOf[msg.sender] -= wad;
    payable(msg.sender).transfer(wad);
    emit Withdrawal(msg.sender, wad);
  }

  function totalSupply() external view override returns (uint256) {
    return address(this).balance;
  }

  function approve(address guy, uint256 wad) external override returns (bool) {
    allowance[msg.sender][guy] = wad;
    emit Approval(msg.sender, guy, wad);
    return true;
  }

  function transfer(address dst, uint256 wad) external override returns (bool) {
    return transferFrom(msg.sender, dst, wad);
  }

  function transferFrom(
    address src,
    address dst,
    uint256 wad
  ) public override returns (bool) {
    require(balanceOf[src] >= wad, "WRBTC: src not enough balance");

    if (src != msg.sender && allowance[src][msg.sender] != type(uint256).max) {
      require(allowance[src][msg.sender] >= wad, "WRBTC: not enough allowence");
      allowance[src][msg.sender] -= wad;
    }

    balanceOf[src] -= wad;
    balanceOf[dst] += wad;

    emit Transfer(src, dst, wad);

    return true;
  }
}
