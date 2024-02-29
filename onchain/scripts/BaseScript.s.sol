// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Script, console} from 'forge-std/Script.sol';

abstract contract BaseScript is Script {
  address internal deployer = vm.envAddress("LOCAL_DEPLOYER");
  string internal mnemonic;

  function saveContract(string memory network, string memory name, address addr) public {
    string memory json1 = 'key';
    string memory finalJson = vm.serializeAddress(json1, 'address', addr);
    string memory dirPath = string.concat(string.concat('output/', network), '/');
    vm.writeJson(finalJson, string.concat(dirPath, string.concat(name, '.json')));
  }

  modifier broadcaster() {
    vm.startBroadcast(deployer);
    _;
    vm.stopBroadcast();
  }
}
