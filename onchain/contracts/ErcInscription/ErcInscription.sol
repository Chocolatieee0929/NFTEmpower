// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.20;

import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {Erc20ForInscript} from "./Erc20ForInscript.sol";


contract Erc20Inscription {
  address private _erc2ImplementationAddress;
  constructor(address _implementation) {
    _erc2ImplementationAddress = _implementation;
  }
  function deployInscription(string memory name, string memory symbol, uint totalSupply, uint perMint) external returns (address) {
    Erc20ForInscript implementation = Erc20ForInscript(Clones.clone(_erc2ImplementationAddress));
    implementation.init(name, symbol, totalSupply, perMint);
  }
  function mintInscription(address tokenAddr) external {
    Erc20ForInscript(tokenAddr).mint(msg.sender);
  }
}
