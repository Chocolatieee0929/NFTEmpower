// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC721Receiver} from "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/EIP712Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/NoncesUpgradeable.sol";
import {MyNft} from "./MyNft.sol";

// import './Token.sol';

/**
 * @title NftMarket contract
 * @dev This contract is used for listing and buying NFTs
 *
 * 合约功能：
 * 1. 存储NFT的拥有者挂单信息（listingNft）
 * 2. 获得授权，作为中间人，转移 卖家nft 和 买家的erc20 token
 */
contract NftMarket is EIP712Upgradeable, NoncesUpgradeable {
    struct NftItemListed {
        uint256 price;
        address seller;
        address erc20; // 如果为0x0，则表示eth
    }

    error NftNotListing();
    error NftHasListed();
    error TokenNotSupported();
    error TokenOrPriceNotValid();

    event Listing(address indexed nftAddress, uint256 tokenId, address seller, uint256 price);
    event DeList(address indexed nftAddress, uint256 tokenId);

    mapping(address => mapping(uint8 => NftItemListed)) public nftsListed;

    constructor() {
        _disableInitializers();
    }

    function buyNft(address nftAddress, uint8 tokenId) public {
        if (nftsListed[nftAddress][tokenId].seller == address(0)) {
            delete nftsListed[nftAddress][tokenId];
            revert NftNotListing();
        }

        if (nftsListed[nftAddress][tokenId].erc20 == address(0)) {
            // eth
            payable(nftsListed[nftAddress][tokenId].seller).transfer(nftsListed[nftAddress][tokenId].price);
        } else {
            // erc20
            IERC20(nftsListed[nftAddress][tokenId].erc20).transferFrom(
                msg.sender, nftsListed[nftAddress][tokenId].seller, nftsListed[nftAddress][tokenId].price
            );
        }

        // nft: seller --> contract -> buyer
        MyNft(nftAddress).transferFrom(nftsListed[nftAddress][tokenId].seller, address(this), tokenId);
        MyNft(nftAddress).transferFrom(address(this), msg.sender, tokenId);

        delete nftsListed[nftAddress][tokenId];
        emit DeList(nftAddress, tokenId);
    }

    function listNFT(
        address nftAddress,
        uint8 tokenId,
        address erc20,
        uint256 price,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        if (nftsListed[nftAddress][tokenId].seller == address(0)) {
            revert NftHasListed();
        }
        if (price <= 0 || isValidErc20(erc20) == false) {
            revert TokenOrPriceNotValid();
        }

        NftItemListed memory newNftItem;
        newNftItem.seller = msg.sender;
        newNftItem.price = price;
        newNftItem.erc20 = erc20;
        nftsListed[nftAddress][tokenId] = newNftItem;

        MyNft(nftAddress).permit(msg.sender, address(this), tokenId, deadline, v, r, s);

        emit Listing(nftAddress, tokenId, msg.sender, price);

        // MyNft(nftAddress).safeTransferFrom(msg.sender, address(this), nftTokenId, abi.encode(nftAddress));
    }

    /**
     *  当用户取消授权（下架时调用）
     */
    function deListNFT(address nftAddress, uint8 tokenId) external {
        require(nftsListed[nftAddress][tokenId].seller == msg.sender, "not the owner");
        delete nftsListed[nftAddress][tokenId];
        emit DeList(nftAddress, tokenId);
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
}
