// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Clones} from '@openzeppelin/contracts/proxy/Clones.sol';
import {NftCollection} from './NftCollection.sol';

contract NftFactory {
  address private _nftImplementationAddress;
  event NftCreated(address indexed nftAddress, address indexed owner);

  constructor(address _implementation) {
    _nftImplementationAddress = _implementation;
  }

  function deployNft(
    string memory name,
    string memory symbol,
    uint256 maxSupply,
    uint256 mintPrice,
    bytes32 salt
  ) external returns (address) {
    // implementation = NftCollection(Clones.clone(_nftImplementationAddress));
    address clone = Clones.cloneDeterministic(_nftImplementationAddress, salt);
    NftCollection(clone).initialize(msg.sender, name, symbol, maxSupply, mintPrice);
    emit NftCreated(clone, msg.sender);
    return clone;
  }
}
