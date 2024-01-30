// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "./BaseScript.s.sol";

import {Upgrades, Options} from "openzeppelin-foundry-upgrades/Upgrades.sol";

contract CounterScript is BaseScript {
    function run() public broadcaster {
        Options memory opts;
        //   opts.unsafeSkipAllChecks = true;

        address proxy = Upgrades.deployTransparentProxy(
            "NftMarket.sol",
            deployer, // INITIAL_OWNER_ADDRESS_FOR_PROXY_ADMIN,
            "", // abi.encodeCall(MyContract.initialize, ("arguments for the initialize function")
            opts
        );

        console.log("NftMarket v1 deployed on %s", address(proxy));
    }
}
