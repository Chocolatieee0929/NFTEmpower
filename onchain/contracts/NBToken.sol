// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title nftbazaar token nftbazaar生态代币
 */
contract NBToken is ERC20, ERC20Burnable, ERC20Permit, Ownable {
    constructor(address initialOwner)
        ERC20("NftBazaarToken", "NBT")
        ERC20Permit("NftBazaarToken")
        Ownable(initialOwner)
    {
        _mint(msg.sender, 100000000 * 10 ** decimals());
    }
}
