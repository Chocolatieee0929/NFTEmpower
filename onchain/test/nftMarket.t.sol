//SPDX-License-Identifier:MIT
pragma solidity ^0.8.0;

import {BaseTest} from "./BaseTest.t.sol";
import {NftMarket} from "../contracts/NftMarketV2.sol";
import {NBToken} from "../contracts/NBToken.sol";
import {MyNft} from "../contracts/MyNft.sol";
import {console2} from "forge-std/Test.sol";

contract NftMarketTest is BaseTest {
    NBToken mytoken;

    MyNft public myNFT;
    NftMarket public nftMarket;

    address public nftDeployer;
    address public lori;
    address public alice;
    uint256 lori_fund = 1 * 10 ** 18;

    function setUp() public override {
        // NBToken = new NBToken();

        // myNFT = new MyNft();

        // vm.nftMarket = new NftMarket();
        // nftDeployer = msg.sender; // 记录部署者的地址

        // // 设立账户
        // alice = makeAddr("alice");
        // emit log_address(alice);
        // vm.deal(alice, 1 ether); // 1000000000000000000
        // lori = makeAddr("Lori");
        // emit log_address(lori);
        // vm.deal(lori, 1 ether); // 1000000000000000000

        // // 铸造NFT
        // uint256 token1_id = myNFT.mint(alice, "111");
        // console2.log("Alice mint first NFT which the tokenid is ", token1_id);
        // uint256 token2_id = myNFT.mint(alice, "222");
        // console2.log("Alice mint second NFT which the tokenid is ", token2_id);

        // // 给Lori转钱，用来买资金
        // // vm.prank(tokenAddress);
        // // token.approve(lori, 1 * 10 ** 18);
        // mytoken.transfer(lori, lori_fund);
        // uint256 LoriBalance = mytoken.balanceOf(lori);
        // console2.log("Lor address:", lori, "   balance:", LoriBalance);
    }

    function test_List_Nft() public {
        list();
    }

    function list() private {
        // uint256 _price = 10;
        // uint256 _nftTokenId = 1;
        // assertEq(myNFT.balanceOf(alice), 2);
        // vm.startPrank(alice);
        // // assert(myNFT.owner() == deployer);

        // myNFT.approve(address(nftMarket), _nftTokenId);

        // bool success = nftMarket.listNft(address(nftMarket), _price, _nftTokenId);
        // assertTrue(success);
        // //Retrieve the NftList associated with the given _nftTokenId
        // (address owner, uint256 price, uint256 nftTokenId) = nftMarket.nftApartment(address(nftMarket), _nftTokenId);

        // // Perform assertions or further checks on nftList
        // // For example, check if the owner and price are as expected
        // console2.log(msg.sender);
        // assertTrue(owner == alice, "Incorrect owner");
        // assertTrue(price == _price, "Incorrect price");
        // assertTrue(nftTokenId == _nftTokenId, "Incorrect NFT Token ID");

        // vm.stopPrank();
    }

    function buy() internal {
        // uint256 _nftTokenId = 1;
        // vm.startPrank(lori);
        // mytoken.approve(address(nftMarket), 10);
        // //(bool success,) = nftMarketAddress.call(abi.encodeWithSignature("buyNFT(uint256)", _nftTokenId));
        // (bool success,) =
        //     address(nftMarket).call(abi.encodeWithSignature("buyNFT(address,uint256)", address(nftMarket), _nftTokenId));
        // assertTrue(success, "test_buy failed.");
        // assertEq(token.balanceOf(alice), 10, "Alice didn't receive 10 token!");
        // assertEq(myNFT.balanceOf(alice), 1, "Alice still have two Nft.");
        // assertEq(myNFT.balanceOf(lori), 1, "Lori didn't receive NFT!");

        // mytoken.approve(address(nftMarket), 10);
        // //(bool success,) = nftMarketAddress.call(abi.encodeWithSignature("buyNFT(uint256)", _nftTokenId));
        // //
        // vm.expectRevert();
        // nftMarket.buyNFT(address(nftMarket), _nftTokenId);
    }

    function delist() private {
        // uint256 _nftTokenId = 1;
        // vm.startPrank(alice);
        // nftMarket.delistNft(nftAddress, _nftTokenId);
        // vm.expectRevert(nftMarket_NotExistNFT.selector);
        // nftMarket.buyNFT(nftAddress, _nftTokenId);
    }

    function buy_tokenWithCall(uint256 value) private {
        // uint256 _tokenId = 1;
        // uint256 price = nftMarket.getPrice(nftAddress, _tokenId);
        // vm.startPrank(lori);
        // if (value > lori_fund) {
        //     bytes memory InsufficientBalance =
        //         abi.encodeWithSelector(ERC20InsufficientBalance.selector, lori, lori_fund, value);
        //     vm.expectRevert(InsufficientBalance);
        // } else if (value < price) {
        //     vm.expectRevert();
        // }
        // bool success = token.transferWithCall(nftMarketAddress, value, abi.encode(nftAddress, _tokenId));
        // console2.log(success);
        // if (value > lori_fund) {
        //     assertFalse(success, unicode"测试：转钱数量超过Lori持有");
        // } else if (value < price) {
        //     // assertFalse(success, unicode"测试：买家金额小于NFT价格");
        //     // assertEq(myNFT.ownerOf(1), alice);
        // } else {
        //     assertTrue(success, unicode"测试：购买成功");
        //     assertEq(myNFT.ownerOf(1), lori);
        // }
    }

    function test_buy_nft() public {
        list();
        // buy();
        buy_tokenWithCall(10);
    }

    /// forge-config: default.fuzz.runs = 100
    function test_fuzz_tokenWithCall(uint256 value) public {
        vm.assume(value > 0);
        list();
        buy_tokenWithCall(value);
    }
}
