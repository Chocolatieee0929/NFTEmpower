// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import {IERC20Permit} from '@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol';
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';

import '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import {Multicall} from '@openzeppelin/contracts/utils/Multicall.sol';
import {Nonces} from '@openzeppelin/contracts/utils/Nonces.sol';
import {EIP712} from '@openzeppelin/contracts/utils/cryptography/EIP712.sol';
import {ECDSA} from '@openzeppelin/contracts/utils/cryptography/ECDSA.sol';
import {ReentrancyGuard} from '@openzeppelin/contracts/utils/ReentrancyGuard.sol';
import {AccessManaged} from '@openzeppelin/contracts/access/manager/AccessManaged.sol';

import {MerkleProof} from '@openzeppelin/contracts/utils/cryptography/MerkleProof.sol';

contract NftMarket is Nonces, EIP712, Multicall, ReentrancyGuard, AccessManaged {
  using SafeERC20 for *;

  error NftNotListing();
  error NftHasListed();
  error TokenNotSupported();
  error TokenOrPriceNotValid();
  error ERC2612ExpiredSignature(uint256 deadline);
  error ERC2612InvalidSigner(address signer, address seller);
  event Listing(address indexed nftAddress, uint256 tokenId, address seller, uint256 price);
  event DeList(address indexed nftAddress, uint256 tokenId);

  uint256 immutable FEEBASE = 10 ** 3;
  uint256 immutable FEERATE = 200;

  bytes32 private constant PERMIT_TYPEHASH =
    keccak256('List(address nftAddress,uint8 tokenId,uint256 price,uint256 nonce,uint256 deadline)');
  address private NBT;
  mapping(bytes32 nftFeature => uint256) private  _nftFeatureNonces;

  constructor(address _NBT, address initialAuthority) EIP712('NFTEmpower', '1') AccessManaged(initialAuthority){
    NBT = _NBT;
  }

  function DOMAIN_SEPARATOR() external view virtual returns (bytes32) {
    return _domainSeparatorV4();
  }

  function nonces(address owner, address nftAddress, uint8 tokenId) public view returns (uint256) {
    bytes32 nftFeature = keccak256(abi.encode(owner, nftAddress, tokenId));
    return _nftFeatureNonces[nftFeature];
  }

  function _useNonce(address owner, address nftAddress, uint8 tokenId) internal returns (uint256) {
    bytes32 nftFeature = keccak256(abi.encode(owner, nftAddress, tokenId));

    unchecked {
      // It is important to do x++ and not ++x here.
      return _nftFeatureNonces[nftFeature]++;
    }
  }

  function buyNft(address nftAddress, uint8 tokenId,uint256 price, uint256 deadline, uint8 v,bytes32 r,bytes32 s) public nonReentrant {
    if (nftAddress == address(0)) revert NftNotListing();
    _buyNft(_msgSender(), _msgSender(), nftAddress, tokenId, price, deadline, v, r, s);
  }

  function buyNft(address to, address nftAddress, uint8 tokenId,uint256 price, uint256 deadline, uint8 v,bytes32 r,bytes32 s) public nonReentrant {
    if (nftAddress == address(0)) revert NftNotListing();
    _buyNft(_msgSender(), to, nftAddress, tokenId, price, deadline, v, r, s);
  }

  function _buyNft(
    address buyer,
    address to,
    address nftAddress,
    uint8 tokenId,
    uint256 price,
    uint256 deadline,
    uint8 v,
    bytes32 r,
    bytes32 s
  ) internal {
    address seller = IERC721(nftAddress).ownerOf(tokenId);

    uint256 fee = price * FEERATE / FEEBASE;

    _permit(seller, nftAddress, tokenId, price, _useNonce(seller, nftAddress, tokenId), deadline, v, r, s);

    IERC20(NBT).transferFrom(buyer, seller, price);
    IERC20(NBT).transferFrom(buyer, NBT, fee); // 手续费
    IERC721(nftAddress).transferFrom(seller, to, tokenId);
  }

  function _permit(
    address seller,
    address nftAddress,
    uint8 tokenId,
    uint256 price,
    uint256 nonce,
    uint256 deadline,
    uint8 v,
    bytes32 r,
    bytes32 s
  ) internal view {
    if (block.timestamp > deadline) {
      revert ERC2612ExpiredSignature(deadline);
    }

    bytes32 structHash = keccak256(abi.encode(PERMIT_TYPEHASH, nftAddress, tokenId, price, nonce, deadline));

    bytes32 hash = _hashTypedDataV4(structHash);

    address signer = ECDSA.recover(hash, v, r, s);

    if (signer != seller) {
      revert ERC2612InvalidSigner(signer, seller);
    }
  }

  function isValidErc20(address erc20) public view returns (bool) {
    if (erc20 == address(0)) {
      return true; // do as eth
    }
    IERC20 token = IERC20(erc20);
    try token.totalSupply() returns (uint256) {
      try token.balanceOf(msg.sender) returns (uint256) {
        return true;
      } catch {
        return false;
      }
    } catch {
      return false;
    }
  }

  function tokenReceive(address from, address to, uint256 value, bytes calldata data) external nonReentrant {
    (address nftAddress, uint8 tokenId, uint256 price, uint256 deadline, uint8 v, bytes32 r, bytes32 s) = abi
      .decode(data, (address, uint8, uint256, uint256, uint8, bytes32, bytes32));
    require(value >= price, 'NFTMarket error: Insufficient money.');
    address seller = IERC721(nftAddress).ownerOf(tokenId);

    if (!IERC721(nftAddress).isApprovedForAll(seller, address(this))) revert NftNotListing();
    _permit(seller, nftAddress, tokenId, price, _useNonce(seller), deadline, v, r, s);

    IERC20(NBT).transferFrom(seller, from, value);
    IERC721(nftAddress).transferFrom(seller, from, tokenId);
  }

  function claimNFT(address buyer, address nftAddress, uint8 tokenId) internal {
    uint256 price = 100;
    address seller = IERC721(nftAddress).ownerOf(tokenId);
    IERC20(NBT).safeTransferFrom(buyer, seller, price);
    IERC721(nftAddress).safeTransferFrom(seller, buyer, tokenId);
  }

  function erc20Permit(uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s) public {
    IERC20Permit(NBT).permit(msg.sender, address(this), value, deadline, v, r, s);
  }

  fallback() external payable {}

  receive() external payable {}
}
