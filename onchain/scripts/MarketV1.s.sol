// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import 'forge-std/Script.sol';
import './BaseScript.s.sol';

import {Upgrades, Options} from "openzeppelin-foundry-upgrades/Upgrades.sol";

contract MarketV1 is BaseScript {
    address public proxy;
    function run() public broadcaster {}

    function deployFirst() public broadcaster {
        Options memory opts;
        opts.unsafeSkipAllChecks = true;
        address proxy = Upgrades.deployTransparentProxy(
            "NftMarket.sol",
            deployer, // INITIAL_OWNER_ADDRESS_FOR_PROXY_ADMIN,
            "", // abi.encodeCall(MyContract.initialize, ("arguments for the initialize function")
            opts
        );
        getInformation(proxy);
        // console.log(deployer); //0x3F3cFa84D3825185C897cC6FCaac35431169Dc2F
    }

    function upgradeSecond() public broadcaster {
        address proxy = 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512;
        console.log("After:", Upgrades.getImplementationAddress(proxy));
        Options memory opts;
        opts.unsafeSkipAllChecks = true;
        opts.referenceContract = "NftMarket.sol";

        // proxy: 0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6
        Upgrades.upgradeProxy(proxy, "NftMarketV2.sol:NftMarketV2", "", opts);
        console.log("After:", Upgrades.getImplementationAddress(proxy));
    }

    function getInformation(address proxy) public {
        address implementation = Upgrades.getImplementationAddress(proxy);
        console.log(implementation);

        bytes32 ADMIN_SLOT = bytes32(uint256(keccak256("eip1967.proxy.admin")) - 1);
        address admin = address(uint160(uint256(bytes32(vm.load(address(proxy), ADMIN_SLOT)))));

        console.logBytes32(vm.load(address(proxy), ADMIN_SLOT));
        console.log("NftMarket v1 deployed on %s", address(proxy));
        console.log("Contract admin:", admin);
        console.log("msg.sender", msg.sender);
        console.log("deployer", deployer);
    }
}
