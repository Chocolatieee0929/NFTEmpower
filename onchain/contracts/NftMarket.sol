// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Nonces.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {IERC721Receiver} from "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import "@openzeppelin/contracts-upgradeable/utils/cryptography/EIP712Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/NoncesUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

import {MyNft} from "./MyNft.sol";
import {SigUtils} from "./extension/SigUtils.sol";

/**
 * @title NftMarket contract
 * @dev This contract is used for listing and buying NFTs
 *
 * 合约功能：
 * 1. 存储NFT的拥有者挂单信息（listingNft）
 * 2. 获得授权，作为中间人，转移 卖家nft 和 买家的erc20 token
 */

// @custom:oz-upgrades
contract NftMarket is ReentrancyGuard, EIP712, Nonces {
    error NftNotListing();
    error InvalidNFTAddress();
    error InvalidSigner(address signer, address seller);
    error ExpiredSignature(uint256 deadline);
    error NotEnoughToken(uint256 balance, uint256 price);

    error TokenNotSupported();
    error TokenOrPriceNotValid();

    event Listing(address indexed nftAddress, uint256 tokenId, address seller, uint256 price);
    event DeList(address indexed nftAddress, uint256 tokenId);

    bytes32 private constant PERMIT_TYPEHASH =
        keccak256("List(address owner,address nftTokenAddress,uint256 price,uint256 nonce)");

    address immutable tokenAddress;

    constructor(address _tokenAddress) EIP712("NFTEmpower", "1") {
        tokenAddress = _tokenAddress;
    }

    function buyNFT(address nftAddress, uint8 tokenId, uint256 price, uint256 deadline, uint8 v, bytes32 r, bytes32 s)
        public
        nonReentrant
        returns (bool)
    {
        _permit(nftAddress, tokenId, price, deadline, v, r, s);
        _buyNft(msg.sender, nftAddress, tokenId, price);
        return true;
    }

    function _buyNft(address buyer, address nftAddress, uint8 tokenId, uint256 price) internal {
        // nft: seller --> buyer  contract approved
        address seller = MyNft(nftAddress).ownerOf(tokenId);
        IERC20(tokenAddress).transferFrom(buyer, seller, price);
        MyNft(nftAddress).safeTransferFrom(seller, buyer, tokenId);
        emit DeList(nftAddress, tokenId);
    }

    function _permit(address nftAddress, uint8 tokenId, uint256 price, uint256 deadline, uint8 v, bytes32 r, bytes32 s)
        internal
        returns (bool)
    {
        if (block.timestamp > deadline) {
            revert ExpiredSignature(deadline);
        }
        if (nftAddress == address(0)) {
            revert InvalidNFTAddress();
        }
        address seller = MyNft(nftAddress).ownerOf(tokenId);
        bytes32 structHash =
            keccak256(abi.encode(PERMIT_TYPEHASH, seller, nftAddress, price, _useNonce(address(this)), deadline));

        bytes32 hash = _hashTypedDataV4(structHash);

        address signer = ECDSA.recover(hash, v, r, s);
        if (signer != seller) {
            revert InvalidSigner(signer, seller);
        }
        return true;
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

    function tokenReceive(address from, address to, uint256 value, uint256 price, bytes calldata data)
        external
        nonReentrant
    {
        (address nftAddress, uint8 tokenId, uint256 deadline, uint8 v, bytes32 r, bytes32 s) =
            abi.decode(data, (address, uint8, uint256, uint8, bytes32, bytes32));
        if (value < price) revert NotEnoughToken(value, price);
        require(deadline >= block.timestamp, "NFTMarket error: Invalid deadline.");
        _permit(nftAddress, tokenId, price, deadline, v, r, s);
        address seller = MyNft(nftAddress).ownerOf(tokenId);
        IERC20(tokenAddress).transfer(seller, value);
        MyNft(nftAddress).safeTransferFrom(seller, from, tokenId);
    }

    fallback() external payable {}

    receive() external payable {}
}
