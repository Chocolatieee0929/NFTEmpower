// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {console} from 'forge-std/console.sol';

library SigUtils {
  bytes32 private constant LIST_TYPEHASH =
    keccak256('List(address nftAddress,uint8 tokenId,uint256 price,uint256 nonce,uint256 deadline)');

  bytes32 private constant TOKEN_TYPEHASH =
    keccak256('Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)');

  struct PermitParams {
    address nftAddress;
    uint8 tokenId;
    uint256 price;
    uint256 nonce;
    uint256 deadline;
  }

  struct TokenParams {
    address owner;
    address spender;
    uint256 value;
    uint256 nonce;
    uint256 deadline;
  }

  //abi.encode(PERMIT_TYPEHASH, owner, spender, value, _useNonce(owner), deadline)
  function getStructHash(TokenParams memory params) internal pure returns (bytes32) {
    return
      keccak256(
        abi.encode(TOKEN_TYPEHASH, params.owner, params.spender, params.value, params.nonce, params.deadline)
      );
  }

  function getStructHash(PermitParams memory params) internal pure returns (bytes32) {
    return keccak256(abi.encode(LIST_TYPEHASH, params));
  }

  // EIP712 = hash(19_01, DOMAINHASH, STRUCTHASH)
  function getTypeDataHash(
    bytes32 domainSeparator,
    PermitParams memory params
  ) public pure returns (bytes32 digest) {
    bytes32 structHash = getStructHash(params);
    assembly {
      let ptr := mload(0x40)
      mstore(ptr, hex'1901')
      mstore(add(ptr, 0x02), domainSeparator)
      mstore(add(ptr, 0x22), structHash)
      digest := keccak256(ptr, 0x42)
    }
  }

  function getTypeDataHash(
    bytes32 domainSeparator,
    TokenParams memory params
  ) public view returns (bytes32 digest) {
    bytes32 structHash = getStructHash(params);
    console.logBytes32(structHash);
    assembly {
      let ptr := mload(0x40)
      mstore(ptr, hex'1901')
      mstore(add(ptr, 0x02), domainSeparator)
      mstore(add(ptr, 0x22), structHash)
      digest := keccak256(ptr, 0x42)
    }
  }
}
