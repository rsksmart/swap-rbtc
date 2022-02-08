//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC777/IERC777.sol";

contract SideTokenTest is IERC777 {

    function transferFrom(
        address,
        address,
        uint256
    ) public virtual returns (bool) {
        return false;
    }

    function authorizeOperator(address) external {

    }

    function balanceOf(address) external pure returns (uint256) {
        return 1000000000000000000;
    }

    function burn(uint256, bytes calldata) external {

    }

    function defaultOperators() external pure returns (address[] memory) {
        address[] memory addressList;
        return addressList;
    }

    function granularity() external pure returns (uint256) {
        return 0;
    }

    function isOperatorFor(address, address) external pure returns (bool) {
        return false;
    }

    function name() external pure returns (string memory) {
        return "SideTokenTest";
    }

    function revokeOperator(address) external {

    }

    function symbol() external pure returns (string memory) {
        return "SideTest";
    }

    function totalSupply() external pure returns (uint256) {
        return 0;
    }

    function operatorBurn(
        address,
        uint256,
        bytes calldata,
        bytes calldata
    ) external {

    }

    function operatorSend(
        address,
        address,
        uint256,
        bytes calldata,
        bytes calldata
    ) external {

    }

    function send(
        address,
        uint256,
        bytes calldata
    ) external {

    }
}
