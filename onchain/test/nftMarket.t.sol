//SPDX-License-Identifier:MIT
pragma solidity ^0.8.0;

import {console2, Test} from "forge-std/Test.sol";

import {NftMarket} from "../contracts/NftMarket.sol";
import {NBToken} from "../contracts/NBToken.sol";

import {NftFactory} from "../contracts/NftFactory.sol";
import {NftCollection} from "../contracts/NftCollection.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";

import {SigUtils} from "./extension/SigUtils.sol";

contract testCollection is NftCollection {
    uint256 public _nextTokenId = 1;

    function mint(address to) public returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _mint(to, tokenId);
        return tokenId;
    }
}

contract NftMarketTest is Test {
    NBToken public myToken;

    NftMarket public nftMarket;

    address public deployer;
    address public lori;
    address public alice;
    uint256 internal alicePK;
    uint256 lori_fund = 0.5 * 1e18;

    NftFactory factory;
    testCollection collection; // nft模板
    testCollection nft; // nft实例

    function setUp() public {
        // 创建nftMarket, 代币token
        deployer = vm.envAddress("LOCAL_DEPLOYER");
        vm.prank(deployer);
        myToken = new NBToken(deployer);
        nftMarket = new NftMarket(address(myToken));

        // 设立账户
        alicePK = 0xA11CE;
        alice = vm.addr(alicePK);
        emit log_address(alice);
        vm.deal(alice, 1 ether); // 1000000000000000000
        lori = makeAddr("Lori");
        emit log_address(lori);
        vm.deal(lori, 1 ether); // 1000000000000000000

        // 创建nft模板，以及工厂合约
        collection = new testCollection();
        factory = new NftFactory(address(collection));

        // 创建nft实例
        address nftAddress = CreateCollection();
        nft = testCollection(nftAddress);
        uint256 token1_id = nft.mint(alice);
        console2.log("Alice mint first NFT which the tokenid is ", token1_id);
        uint256 token2_id = nft.mint(alice);
        console2.log("Alice mint second NFT which the tokenid is ", token2_id);

        // 给Lori转钱，用来买资金
        vm.prank(deployer);
        myToken.transfer(lori, lori_fund);
        uint256 LoriBalance = myToken.balanceOf(lori);
        console2.log("Lor address:", lori, "   balance:", LoriBalance);
    }

    function CreateCollection() public returns (address) {
        bytes32 salt = keccak256(abi.encode(address(this)));
        address nftAddress = factory.deployNft("test", "test", 10000, 10, salt);
        console2.log("nftAddress", nftAddress);
        return nftAddress;
    }

    function listSign(uint8 tokenId, uint256 price, uint256 deadline) private view returns (bytes32) {
        /*
        struct PermitParams {
            address nftAddress;
            uint8 tokenId;
            uint256 price;
            uint256 nonce;
            uint256 deadline;
        }
        */
        SigUtils.PermitParams memory params = SigUtils.PermitParams({
            nftAddress: address(nft),
            tokenId: tokenId,
            price: price,
            nonce: nftMarket.nonces(alice),
            deadline: deadline
        });

        return SigUtils.getTypeDataHash(nftMarket.DOMAIN_SEPARATOR(), params);
    }

    function permitOnce(uint256 price) public {
        // 卖家将nft全部授权给nftmarket
        vm.prank(alice);
        nft.setApprovalForAll(address(nftMarket), true);
        uint256 deadline = block.timestamp + 10000;
        bytes32 digest1 = listSign(1, price, deadline);
        (uint8 v1, bytes32 r1, bytes32 s1) = vm.sign(alicePK, digest1);

        // 买家购买
        uint256 beforeBalance = myToken.balanceOf(lori);
        vm.startPrank(lori);
        myToken.approve(address(nftMarket), price);

        bool expectRevert = price > lori_fund;
        if (expectRevert) {
            vm.expectRevert();
            nftMarket.buyNft(address(nft), 1, price, deadline, v1, r1, s1);
            return;
        }
        nftMarket.buyNft(address(nft), 1, price, deadline, v1, r1, s1);

        uint256 afterBalance = myToken.balanceOf(lori);
        assertEq(nft.ownerOf(1), lori);
        assertEq(beforeBalance - price, afterBalance);
        console2.log("beforeBalance", beforeBalance);
        console2.log("afterBalance", afterBalance);
    }

    function errorPermitTwice(uint256 price) public {
        vm.prank(alice);
        nft.setApprovalForAll(address(nftMarket), true);
        uint256 deadline = block.timestamp + 10000;
        bytes32 digest1 = listSign(1, price, deadline);
        bytes32 digest2 = listSign(2, price, deadline);
        (uint8 v1, bytes32 r1, bytes32 s1) = vm.sign(alicePK, digest1);
        (uint8 v2, bytes32 r2, bytes32 s2) = vm.sign(alicePK, digest2);

        // 买家购买
        vm.startPrank(lori);
        myToken.approve(address(nftMarket), price * 2);

        nftMarket.buyNft(address(nft), 1, price, deadline, v1, r1, s1);
        vm.expectRevert();
        nftMarket.buyNft(address(nft), 2, price, deadline, v2, r2, s2);
    }

    function payTokenaddress(address nftAddress, uint8 tokenId, uint256 deadline, uint8 v, bytes32 r, bytes32 s) public {
        // 调用_permit函数进行权限验证,进行预授权
        bytes[2] memory data;
        bytes memory data1 = abi.encodeWithSignature("permit(address,address,uint256,uint256,uint256,uint8,bytes32,bytes32)", 
            msg.sender, address(this), 100, myToken.nonces(msg.sender), deadline, v, r, s);
        data[0] = abi.encodeWithSignature("(address,bytes)", address(myToken), data1);
        data[1] = abi.encodeWithSignature("(address,bytes)", nftAddress,
            abi.encodeWithSignature("claimNFT(address,address,uint8)", msg.sender, nftAddress, tokenId));
        nftMarket.multicall(data);
    }

    function test_errorPermitTwice() public {
        errorPermitTwice(100);
    }

    /// forge-config: default.fuzz.runs = 100
    function test_fuzz_permit(uint256 price) public {
        vm.assume(price > 0);
        permitOnce(price);
    }

    function buy_tokenWithCall(uint256 value) private {}

    /// forge-config: default.fuzz.runs = 100
    function test_fuzz_tokenWithCall(uint256 value) public {
        vm.assume(value > 0);
        // list();
        buy_tokenWithCall(value);
    }
}
