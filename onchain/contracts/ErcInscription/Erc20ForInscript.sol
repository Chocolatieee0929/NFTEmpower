// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {ERC20} from '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract ERC20Impl is ERC20 {
  constructor(string memory name, string memory symbol) ERC20(name, symbol) {}

  function mint(address to, uint amount) public {
    _mint(to, amount);
  }
}

contract Erc20ForInscript {
  ERC20Impl public implementation;
  uint private _perMint;

  function init(string memory name, string memory symbol, uint totalApply, uint perMint) external {
    implementation = new ERC20Impl(name, symbol);
    implementation.mint(address(0), totalApply);
    _perMint = perMint;
  }

  function mint(address to) external {
    implementation.mint(to, _perMint);
  }
}
