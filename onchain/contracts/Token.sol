// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/Address.sol";

interface onTokenRecived {
    function tokenRecived(address from, uint256 amount, bytes calldata data) external returns (bool);
}

contract Token is IERC20 {
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public totalSupply;
    mapping(address => uint256) public _balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    error NoTokenRecivedCallback();

    constructor(string memory _name, string memory _symbol, uint8 _decimals, uint256 _totalSupply) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        totalSupply = _totalSupply;
        _balanceOf[msg.sender] = _totalSupply;
    }

    function transferSafe(address to, uint256 amount, bytes calldata data) external returns (bool) {
        transfer(to, amount);
        if (isContract(to)) {
            try onTokenRecived(to).tokenRecived(msg.sender, amount, data) returns (bool isSuccess) {
                if (!isSuccess) revert NoTokenRecivedCallback();
            } catch Error(string memory reason) {
                revert NoTokenRecivedCallback();
            }
        }
        return true;
    }

    function transfer(address to, uint256 amount) public override returns (bool) {
        require(_balanceOf[msg.sender] >= amount, "Not enough balance");
        _balanceOf[msg.sender] -= amount;
        _balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external override returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFromSafe(address from, address to, uint256 amount, bytes calldata data) public returns (bool) {
        transferFrom(from, to, amount);
        if (isContract(to)) {
            try onTokenRecived(to).tokenRecived(msg.sender, amount, data) returns (bool isSuccess) {
                if (!isSuccess) revert NoTokenRecivedCallback();
            } catch Error(string memory reason) {
                revert NoTokenRecivedCallback();
            }
        }
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) public returns (bool) {
        require(allowance[from][to] >= amount, "Not enough allowance");
        require(_balanceOf[from] >= amount, "Not enough balance");
        _balanceOf[from] -= amount;
        _balanceOf[to] += amount;
        allowance[from][to] -= amount;
        emit Transfer(from, to, amount);
        return true;
    }

    function _checkCallbackIsValid(address to) internal {}

    function balanceOf(address account) external view override returns (uint256) {
        return _balanceOf[account];
    }

    function isContract(address _addr) public view returns (bool) {
        uint32 size;
        assembly {
            size := extcodesize(_addr)
        }
        return (size > 0);
    }
}
