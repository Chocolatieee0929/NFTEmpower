// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "contracts/NftMarket.sol";
import "contracts/interface/IOutswapV1.sol";

contract NftFlash is IOutswapV1Callee {
    address public NBT;
    address public route;
    address public WETH;
    address public nftMarket;

    constructor(address _nftMarket, address _NBT, address _route, address _WETH) {
        nftMarket = _nftMarket;
        NBT = _NBT;
        route = _route;
        WETH = _WETH;
    }

    function flashBuyNft(
    address token,
    uint256 amountIn,
    uint256 price,
    bytes memory data
  )  payable external {
        if(token != WETH){
            IERC20(token).transferFrom(msg.sender, address(this), amountIn);
        }
        
        swapToken(token, NBT, amountIn, price, block.timestamp + 1 days);
        IERC20(NBT).approve(nftMarket, price);
        (bool success,) = nftMarket.call(data);
        require(success, "buyNft failed");
    }

    function swapToken(address tokenIn,address tokenOut, uint256 amountInMax, uint256 amountOut, uint256 deadline) internal returns(uint256[] memory amounts){

        address[] memory path;
        if (tokenIn == WETH) {
            path = new address[](2);
            path[0] = WETH;
            path[1] = tokenOut;
            uint[] memory amounts = IOutswapV1Router(route).swapETHForExactTokens{value: amountInMax}(
                amountOut,
                path,
                address(this),
                deadline
            );
        } 
        else if(tokenOut == WETH){
            IERC20(tokenIn).approve(address(IOutswapV1Router(route)), amountInMax);
            path = new address[](2);
            path[0] = tokenIn;
            path[1] = WETH;
            uint[] memory amounts = IOutswapV1Router(route).swapTokensForExactETH(
                amountOut,
                amountInMax,
                path,
                address(this),
                deadline
            );
        }
        else {
            if(IOutswapV1Factory(IOutswapV1Router(route).factory()).getPair(tokenIn, tokenOut) == address(0)){
                IERC20(tokenIn).approve(address(IOutswapV1Router(route)), amountInMax);
                path = new address[](3);
                path[0] = tokenIn;
                path[1] = WETH;
                path[2] = tokenOut;
            }
            else {
                path = new address[](2);
                path[0] = tokenIn;
                path[1] = tokenOut;
            }
            
            uint[] memory amounts = IOutswapV1Router(route).swapTokensForExactTokens(
                amountOut,
                amountInMax,
                path,
                address(this),
                deadline
            ); 
        }

    }

    function OutswapV1Call(address sender, uint amount0, uint amount1, bytes calldata data) external view override {
        address token0 = IOutswapV1Pair(msg.sender).token0(); // 获取token0地址
        address token1 = IOutswapV1Pair(msg.sender).token1(); // 获取token1地址
        assert(msg.sender == IOutswapV1Factory(IOutswapV1Router(route).factory()).getPair(token0, token1)); // ensure that msg.sender is a V2 pair
    
        // 解码calldata
        (address tokenBorrow, uint256 amount) = abi.decode(data, (address, uint256));
        require(tokenBorrow == NBT, "token borrow != IERC20(NBT)oken");
    }

    fallback() external payable {}

    receive() external payable {}

}