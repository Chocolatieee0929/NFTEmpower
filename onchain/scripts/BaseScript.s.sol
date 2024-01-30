// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "forge-std/Script.sol";

abstract contract BaseScript is Script {
    address internal deployer;
    string internal mnemonic;

    function setUp() public virtual {
        // string memory rpc = vm.envString("SEPOLIA_RPC_URL");
        // uint256 sepolia = vm.createFork(rpc);
        // vm.selectFork(sepolia);
        deployer = vm.envAddress("DEPLOYER");
    }

    function saveContract(string memory network, string memory name, address addr) public {
        string memory json1 = "key";
        string memory finalJson = vm.serializeAddress(json1, "address", addr);
        string memory dirPath = string.concat(string.concat("output/", network), "/");
        vm.writeJson(finalJson, string.concat(dirPath, string.concat(name, ".json")));
    }

    modifier broadcaster() {
        vm.startBroadcast(deployer);
        _;
        vm.stopBroadcast();
    }
}
