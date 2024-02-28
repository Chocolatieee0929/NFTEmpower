//SPDX-License-Identifier:MIT
pragma solidity ^0.8.0;

import {console2, Test} from 'forge-std/Test.sol';

import {NftMarket} from '../contracts/NftMarket.sol';
import {NBToken} from '../contracts/NBToken.sol';

import {NftFactory} from '../contracts/NftFactory.sol';
import {NftCollection} from '../contracts/NftCollection.sol';
import {IERC721} from '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import {IOutswapV1Router} from 'contracts/interface/IOutswapV1.sol';
import {NftFlash} from 'contracts/MarketFlash.sol';

import {SigUtils} from './extension/SigUtils.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

contract testCollection is NftCollection {
  uint256 public _nextTokenId = 1;

  function mint(address to) public returns (uint256) {
    uint256 tokenId = _nextTokenId++;
    _mint(to, tokenId);
    return tokenId;
  }
}

contract NftMarketTest is Test {
  // NBToken public myToken;

  NftMarket public nftMarket;

  address internal deployer = vm.envAddress("LOCAL_DEPLOYER");

  /* 
  Factory address:  0xc3e53F4d16Ae77Db1c982e75a937B9f60FE63690
  Router address:  0x84eA74d481Ee0A5332c457a4d796187F6Ba67fEB
  WETH address:  0xE6E340D132b5f46d1e472DebcD681B2aBc16e57E
   */
  NBToken public myToken = NBToken(0x5FbDB2315678afecb367f032d93F642f64180aa3);
  address public route = 0x84eA74d481Ee0A5332c457a4d796187F6Ba67fEB;
  address token = 0x4ed7c70F96B99c776995fB64377f0d4aB3B0e1C1; // 用来贷款买nft
  NftFlash flash;
  
  address public lori;
  uint256 internal loriPK;
  address public alice;
  uint256 internal alicePK;
  uint256 lori_fund = 0.5 * 1e18;
  address public Bob;

  NftFactory factory;
  testCollection collection; // nft模板
  testCollection nft; // nft实例
  bytes[] data;

  function setUp() public {
    // 创建nftMarket, 代币token
    deployer = vm.envAddress('LOCAL_DEPLOYER');
    vm.startPrank(deployer);
    // myToken = new NBToken(deployer);
    nftMarket = new NftMarket(address(myToken));

    // 设立账户
    alicePK = 0xA11CE;
    loriPK = 0xA11CF;
    alice = vm.addr(alicePK);
    emit log_address(alice);
    vm.deal(alice, 1 ether); // 1000000000000000000

    lori = vm.addr(loriPK);
    emit log_address(lori);
    vm.deal(lori, 1 ether); // 1000000000000000000
    deal(token,lori,100000000000000000000);

    Bob = vm.addr(0xB0B);

    // 创建nft模板，以及工厂合约
    collection = new testCollection();
    factory = new NftFactory(address(collection));

    // 创建nft实例
    address nftAddress = CreateCollection();
    nft = testCollection(nftAddress);
    uint256 token1_id = nft.mint(alice);
    console2.log('Alice mint first NFT which the tokenid is ', token1_id);
    uint256 token2_id = nft.mint(alice);
    console2.log('Alice mint second NFT which the tokenid is ', token2_id);

    // 给Lori转钱，用来买资金
    myToken.transfer(lori, lori_fund);
    uint256 LoriBalance = myToken.balanceOf(lori);
    console2.log('Lor address:', lori, '   balance:', LoriBalance);

    // 创建nftFlash合约
    IERC20(token).transfer(Bob, lori_fund);
    flash = new NftFlash(address(nftMarket), address(myToken), route, IOutswapV1Router(route).WETH());
    vm.stopPrank();
  }

  function CreateCollection() public returns (address) {
    bytes32 salt = keccak256(abi.encode(address(this)));
    address nftAddress = factory.deployNft('test', 'test', 10000, 10, salt);
    console2.log('nftAddress', nftAddress);
    return nftAddress;
  }

  function listSign(
    address owner,
    uint8 tokenId,
    uint256 value,
    uint256 deadline,
    uint256 structType
  ) private view returns (bytes32) {
    if (structType == 1) {
      SigUtils.PermitParams memory params = SigUtils.PermitParams({
        nftAddress: address(nft),
        tokenId: tokenId,
        price: value,
        nonce: nftMarket.nonces(msg.sender),
        deadline: deadline
      });
      return SigUtils.getTypeDataHash(nftMarket.DOMAIN_SEPARATOR(), params);
    } else {
      SigUtils.TokenParams memory params = SigUtils.TokenParams({
        owner: owner,
        spender: address(nftMarket),
        value: value,
        nonce: myToken.nonces(owner),
        deadline: deadline
      });
      console2.log('owner', params.owner);
      console2.log('owner', params.spender);
      return SigUtils.getTypeDataHash(myToken.DOMAIN_SEPARATOR(), params);
    }
  }

  function listNft(uint256 tokenId, uint256 price) internal returns (uint8 v1, bytes32 r1, bytes32 s1, uint256 deadline){
    nft.setApprovalForAll(address(nftMarket), true);
    deadline = block.timestamp + 10000;
    bytes32 digest1 = listSign(alice, 1, price, deadline, 1);
    (v1, r1, s1) = vm.sign(alicePK, digest1);
  }

  function errorPermitTwice(uint256 price) public {
    vm.prank(alice);
    nft.setApprovalForAll(address(nftMarket), true);
    uint256 deadline = block.timestamp + 10000;
    bytes32 digest1 = listSign(alice, 1, price, deadline, 1);
    bytes32 digest2 = listSign(alice, 2, price, deadline, 1);
    (uint8 v1, bytes32 r1, bytes32 s1) = vm.sign(alicePK, digest1);
    (uint8 v2, bytes32 r2, bytes32 s2) = vm.sign(alicePK, digest2);

    // 买家购买
    vm.startPrank(lori);
    myToken.approve(address(nftMarket), price * 2);

    nftMarket.buyNft(address(nft), 1, price, deadline, v1, r1, s1);
    vm.expectRevert();
    nftMarket.buyNft(address(nft), 2, price, deadline, v2, r2, s2);
  }

  function payTokenaddress(
    address nftAddress,
    uint8 tokenId,
    uint256 deadline,
    uint8 v,
    bytes32 r,
    bytes32 s
  ) public returns (bytes[] memory) {
    // 调用_permit函数进行权限验证,进行预授权
    data.push(
      abi.encodeWithSignature('erc20Permit(uint256,uint256,uint8,bytes32,bytes32)', 100, deadline, v, r, s)
    );
    data.push(abi.encodeWithSignature('claimNFT(address,address,uint8)', msg.sender, nftAddress, tokenId));
  }

  function test_multicall() public {
    uint256 price = 100;
    vm.prank(alice);
    nft.setApprovalForAll(address(nftMarket), true);

    uint256 deadline = block.timestamp + 10000;
    vm.startPrank(lori);
    bytes32 digest1 = listSign(lori, 1, price, deadline, 2);
    (uint8 v1, bytes32 r1, bytes32 s1) = vm.sign(loriPK, digest1);

    payTokenaddress(address(nft), 1, deadline, v1, r1, s1);
    console2.log('emit multicall.....');
    nftMarket.multicall(data);
  }

  function test_errorPermitTwice() public {
    errorPermitTwice(100);
  }

  /// forge-config: default.fuzz.runs = 100
  function test_fuzz_permit(uint256 price) public {
    // 上架nft
    vm.assume(price > 0);
    vm.startPrank(alice);
    (uint8 v1, bytes32 r1, bytes32 s1, uint256 deadline) = listNft(1, price);
    vm.stopPrank();

    // 购买nft
    vm.startPrank(lori);
    uint256 beforeBalance = myToken.balanceOf(lori);
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
    console2.log('beforeBalance', beforeBalance);
    console2.log('afterBalance', afterBalance);
    vm.stopPrank();
  }

  function test_flashTokenBuyNft() public {
    uint256 price = 10;
    // 上架nft
    vm.startPrank(alice);
    (uint8 v1, bytes32 r1, bytes32 s1, uint256 deadline) = listNft(1, price);
    vm.stopPrank();
    
    // 购买NFT
    vm.startPrank(Bob);
    console2.log("tokens[0] amonut:", IERC20(token).balanceOf(address(Bob)));
    IERC20(token).approve(address(flash), price+5);
    flash.flashBuyNft(token,price+5, price, abi.encodeWithSignature("buyNft(address,address,uint8,uint256,uint256,uint8,bytes32,bytes32)",Bob, address(nft), 1, price, deadline, v1, r1, s1));
    assertEq(nft.ownerOf(1), Bob);

  }

  function test_tokenToNBTBuyNft() public {
    uint256 price = 10;
    // 上架nft
    vm.startPrank(alice);
    (uint8 v1, bytes32 r1, bytes32 s1, uint256 deadline) = listNft(1, price);
    vm.stopPrank();

    vm.startPrank(deployer);
    IERC20(token).approve(route, 2000);
    IOutswapV1Router(route).addLiquidityETH{value: 3000}(
            token,
            2000,
            0,
            0,
            deployer,
            block.timestamp + 1 days
        );
    vm.stopPrank();
    
    vm.startPrank(lori);
    IERC20(token).approve(address(flash), price+5);
    flash.flashBuyNft(token, price+5, price, abi.encodeWithSignature("buyNft(address,address,uint8,uint256,uint256,uint8,bytes32,bytes32)",Bob, address(nft), 1, price, deadline, v1, r1, s1));
    assertEq(nft.ownerOf(1), Bob);
    vm.stopPrank();
  }

  function test_flashETHBuyNft() public {
    uint256 price = 10;
    // 上架nft
    vm.startPrank(alice);
    (uint8 v1, bytes32 r1, bytes32 s1, uint256 deadline) = listNft(1, price);
    vm.stopPrank();
    
    // 购买NFT
    address WETH = 0xE6E340D132b5f46d1e472DebcD681B2aBc16e57E;
    vm.startPrank(lori);
    flash.flashBuyNft{value: price+5}(WETH, price+5, price, abi.encodeWithSignature("buyNft(address,address,uint8,uint256,uint256,uint8,bytes32,bytes32)",Bob, address(nft), 1, price, deadline, v1, r1, s1));
    assertEq(nft.ownerOf(1), Bob);
    

  }
}
