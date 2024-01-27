// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.20;

import {ERC721} from '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import {EIP712} from '@openzeppelin/contracts/utils/cryptography/EIP712.sol';
import {Nonces} from '@openzeppelin/contracts/utils/Nonces.sol';
import {ECDSA} from '@openzeppelin/contracts/utils/cryptography/ECDSA.sol';

contract MyNft is ERC721, EIP712, Nonces {
  uint8 private _tokenIds;
  mapping(uint => string) public _tokenURIs;
  string private constant _version = '1.0';
  bytes32 private constant _PERMIT_TYPE =
    keccak256('Permit(address spender,uint8 tokenId,uint256 nonce,uint256 deadline)');

  error ExpiredSignature(uint256 deadline);
  error InvalideSigner(address signer, address owner);
  event Permited(
    address indexed owner,
    address indexed spender,
    uint8 tokenId,
    uint256 deadline,
    uint8 v,
    bytes32 r,
    bytes32 s
  );

  constructor(string memory name, string memory symbol) ERC721(name, symbol) EIP712(name, _version) {}

  function mint(address to, string memory uri) public returns (uint256) {
    _tokenIds++;
    _safeMint(to, _tokenIds);
    _tokenURIs[_tokenIds] = uri;
    return _tokenIds;
  }

  function tokenURI(uint8 tokenId) public view virtual returns (string memory) {
    return _tokenURIs[tokenId];
  }

  function permit(
    address owner,
    address spender,
    uint8 tokenId,
    uint256 deadline,
    uint8 v,
    bytes32 r,
    bytes32 s
  ) public {
    if (block.timestamp > deadline) {
      revert ExpiredSignature(deadline);
    }

    bytes32 structHash = keccak256(abi.encode(_PERMIT_TYPE, spender, tokenId, _useNonce(owner), deadline));

    bytes32 hash = _hashTypedDataV4(structHash);

    address signer = ECDSA.recover(hash, v, r, s);
    if (signer != owner) {
      revert InvalideSigner(signer, owner);
    }

    _approve(spender, tokenId, address(0));
    emit Permited(owner, spender, tokenId, deadline, v, r, s);
  }
}
