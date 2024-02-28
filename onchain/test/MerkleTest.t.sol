// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import 'forge-std/Test.sol';
import '../contracts/NftCollection.sol';
import {MerkleProof} from '@openzeppelin/contracts/utils/cryptography/MerkleProof.sol';

contract MerkleTest is Test {
  // This unit test showcases how to use the MMR contract
  // to verify a proof generated from the counterpart Rust library.
  address[] public addresses;
  bytes32 public merkleRoot;
  bytes32[] public leafHashes;
  bytes32[] public hashes;

  function MerkleTreeBuild(uint256 addressCount) internal {
    // Define leaves values
    for (uint256 i = 0; i < addressCount; i++) {
      uint256 addInt = i * 113;
      addresses.push(address(uint160(addInt)));
    }
    merkleRoot = computeMerkleRoot();
    // console.logBytes32(merkleRoot);
  }

  function computeMerkleRoot() internal returns (bytes32) {
    address[] memory leaves = addresses;

    // 将地址转换为字节数组，并对每个地址计算 keccak256 哈希
    for (uint256 i = 0; i < leaves.length; i++) {
      leafHashes.push(keccak256(abi.encodePacked(leaves[i])));
      hashes.push(keccak256(abi.encodePacked(leaves[i])));
    }

    // 通过循环合并叶子节点的哈希，生成父节点，直到只剩下一个根节点
    while (leafHashes.length > 1) {
      if (leafHashes.length % 2 != 0) {
        leafHashes.push(leafHashes[leafHashes.length - 1]);
      }

      bytes32[] memory parents = new bytes32[](leafHashes.length / 2);

      for (uint256 i = 0; i < leafHashes.length; i += 2) {
        parents[i / 2] = _hashPair(leafHashes[i], leafHashes[i + 1]);
        hashes.push(parents[i / 2]);
      }
      leafHashes = parents;
    }
    return leafHashes[0];
  }

  function _hashPair(bytes32 a, bytes32 b) private pure returns (bytes32) {
    return a < b ? _efficientHash(a, b) : _efficientHash(b, a);
  }

  /**
   * @dev Implementation of keccak256(abi.encode(a, b)) that doesn't allocate or expand memory.
   */
  function _efficientHash(bytes32 a, bytes32 b) private pure returns (bytes32 value) {
    /// @solidity memory-safe-assembly
    assembly {
      mstore(0x00, a)
      mstore(0x20, b)
      value := keccak256(0x00, 0x40)
    }
  }

  function test_MerkleTree() public {
    MerkleTreeBuild(4);
    for (uint256 i = 0; i < hashes.length; i++) {
      console.logBytes32(hashes[i]);
    }
    bytes32[] memory proof = new bytes32[](2);
    proof[0] = hashes[1];
    proof[1] = hashes[5];
    bytes32 leaf = keccak256(abi.encodePacked(addresses[0]));
    // console.logBytes32(leaf);
    require(MerkleProof.verify(proof, merkleRoot, leaf), 'whitelist only to mint this NFT');
  }
}
