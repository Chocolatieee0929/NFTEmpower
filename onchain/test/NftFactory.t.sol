// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import 'forge-std/Test.sol';
import {NftFactory} from '../contracts/NftFactory.sol';
import {NftCollection} from '../contracts/NftCollection.sol';
import {IERC721} from '@openzeppelin/contracts/token/ERC721/IERC721.sol';

//sdf
contract NftFacotryTest is Test {
  NftFactory factory;
  NftCollection collection;
  address alice = makeAddr('alice');

  function setUp() public {
    collection = new NftCollection();
    factory = new NftFactory(address(collection));
  }

  /*
    function deployNft(
    string memory name,
    string memory symbol,
    uint256 maxSupply,
    uint256 mintPrice,
    bytes32 salt
  ) 
  */
  function test_CreateCollection() public {
    bytes32 salt = keccak256(abi.encode(address(this)));
    address nftAddress = factory.deployNft('test', 'test', 10000, 10, salt);
    console2.log('nftAddress', nftAddress);
    IERC721 nft = IERC721(nftAddress);
    nftAddress.call{value: 10}(abi.encodeWithSignature('mintNft(address)', alice));
  }
}
