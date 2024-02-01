// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC721Receiver} from "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

import "@openzeppelin/contracts/utils/Nonces.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import "@openzeppelin/contracts-upgradeable/utils/cryptography/EIP712Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/NoncesUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

/**
 * @title NftMarket contract
 * @dev This contract is used for listing and buying NFTs
 *
 * 合约功能：
 * 1. 存储NFT的拥有者挂单信息（listingNft）
 * 2. 获得授权，作为中间人，转移 卖家nft 和 买家的erc20 token
 */
contract NftMarket is EIP712, ReentrancyGuard, Nonces {
    using SafeERC20 for IERC20;

    error NftNotListing();
    error NftHasListed();
    error TokenNotSupported();
    error TokenOrPriceNotValid();
    error ERC2612ExpiredSignature(uint256 deadline);
    error ERC2612InvalidSigner(address signer, address seller);

    event Listing(address indexed nftAddress, uint256 tokenId, address seller, uint256 price);
    event DeList(address indexed nftAddress, uint256 tokenId);

    bytes32 private constant PERMIT_TYPEHASH =
        keccak256("List(address nftAddress, uint8 tokenId, uint256 price,uint256 nonce,uint256 deadline)");
    address private tokenAddress;

    constructor(address _tokenAddress) EIP712("NftMarket", "1") {
        tokenAddress = _tokenAddress;
    }

    function buyNft(address nftAddress, uint8 tokenId, uint256 price, uint256 deadline, uint8 v, bytes32 r, bytes32 s)
        public
        nonReentrant
    {
        if (nftAddress == address(0) || tokenId == 0) revert NftNotListing();

        address seller = IERC721(nftAddress).ownerOf(tokenId);

        _permit(seller, nftAddress, tokenId, price, _useNonce(address(this)), deadline, v, r, s);

        IERC20(tokenAddress).safeTransferFrom(msg.sender, seller, price);
        IERC721(nftAddress).safeTransferFrom(seller, msg.sender, tokenId);
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

    function recoverSig(address seller, uint8 tokenId, uint256 price, uint16 deadline, uint8 v, bytes32 r, bytes32 s)
        external
        pure
        returns (address)
    {
        bytes32 hash = keccak256(abi.encodePacked(seller, tokenId, price, deadline));
        address signer = ecrecover(hash, v, r, s);
        return signer;
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
        (address nftAddress, uint8 tokenId, uint256 price, uint256 deadline, uint8 v, bytes32 r, bytes32 s) =
            abi.decode(data, (address, uint8, uint256, uint256, uint8, bytes32, bytes32));

        require(value >= price, "NFTMarket error: Insufficient money.");
        address seller = IERC721(nftAddress).ownerOf(tokenId);

        if (!IERC721(nftAddress).isApprovedForAll(seller, address(this))) revert NftNotListing();
        _permit(seller, nftAddress, tokenId, price, _useNonce(address(this)), deadline, v, r, s);

        IERC20(tokenAddress).safeTransfer(seller, value);
        IERC721(nftAddress).safeTransferFrom(seller, from, tokenId);
    }

    fallback() external payable {}
    receive() external payable {}
}
