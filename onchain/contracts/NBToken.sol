// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol';
import '@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/math/Math.sol';
import '@openzeppelin/contracts/utils/ReentrancyGuard.sol';

/**
 * @title Dex, 质押ETH发放NBT凭证，NFTMarket通过NBT进行交易收取手续费
 */
contract NBToken is ERC20, ERC20Burnable, ERC20Permit, Ownable {

  event NBTokenStake(address indexed user, uint256 amount, uint256 profitPerShare);
  event NBTokenUnStake(address indexed user, uint256 amount, uint256 profitPerShare);
  event NBTokenCollect(address indexed user, uint256 amount);

  uint256 public profitPerShare;

  uint256 public updateInterval = 10;
  uint256 public lastUpdateNumber;

  uint256 internal totalStake;

  struct StakeInitial {
    uint256 stakeAmount;
    uint256 debt;
    uint256 initialProfitPerShare;
  }

  mapping(address => StakeInitial) internal stakeAccounts;

  mapping(address => uint256) internal borrowAccounts;

  constructor() ERC20('NftBazaarToken', 'NBT') ERC20Permit('NftBazaarToken') Ownable(msg.sender) {
    lastUpdateNumber = block.timestamp;
    totalStake = 0;
  }

  fallback() external payable{
    stake();
  }

  receive() external payable{
    stake();
  }

  function transfer(address to, uint256 value) public override returns (bool) {
        address _owner = _msgSender();
        _updateStake(_owner, value, false);
        _updateStake(to, value, true);
        _transfer(_owner, to, value);
        return true;
  }

  function transferFrom(address from, address to, uint256 value) public override returns (bool) {
        address spender = _msgSender();
        _updateStake(from, value, false);
        _updateStake(to, value, true);
        _spendAllowance(from, spender, value);
        _transfer(from, to, value);
        return true;
  }

  function _updateStake(address account, uint256 amount, bool add) internal {
    (totalStake, lastUpdateNumber ) 
        = lastUpdateNumber + updateInterval > block.number ? 
          (totalStake, lastUpdateNumber) : (totalSupply(), block.number);

    uint256 stakeBefore = stakeAccounts[account].stakeAmount;
    uint256 stakeAfter = add ? stakeBefore + amount : stakeBefore - amount;

    if(stakeBefore == 0) stakeAccounts[account].debt = 0;

    uint256 profit = getProfit(stakeBefore, stakeAccounts[account].initialProfitPerShare);
  
    stakeAccounts[account].stakeAmount = stakeAfter;
    stakeAccounts[account].debt + profit;
    stakeAccounts[account].initialProfitPerShare = profitPerShare;
  }

  function stake() public payable {
    _mint(msg.sender, msg.value);
    _updateStake(msg.sender, msg.value, true);
    emit NBTokenStake(msg.sender, msg.value, profitPerShare);
  }

  function unStake(uint256 amount) public {
    require(stakeAccounts[msg.sender].stakeAmount  <= amount, 'Insufficient balance');
    uint256 stakeBefore = stakeAccounts[msg.sender].stakeAmount;
    _burn(msg.sender, amount);
    _updateStake(msg.sender, amount, false);
    payable(msg.sender).transfer(amount);

    emit NBTokenUnStake(msg.sender, amount, profitPerShare);
  }

  function collect(uint256 amount) public {
    require(stakeAccounts[msg.sender].debt > amount, 'No profit to withdraw');
    stakeAccounts[msg.sender].debt -= amount;
    _updateStake(address(this), amount, false);
    transfer(msg.sender, amount);
    emit NBTokenCollect(msg.sender, amount);
  }

  function getProfit(uint256 amount, uint256 initialProfitPerShare) internal view returns (uint256) {
    if(amount == 0 || initialProfitPerShare <= profitPerShare) return 0;
    uint256 current_profitPerShare = profitPerShare;
    uint256 profit = amount * (current_profitPerShare - initialProfitPerShare);
    return profit;
  }

  function updateProfitPerShare(uint256 fee) internal {
    require(msg.sender == address(this), 'only contract');
    profitPerShare = profitPerShare + fee / totalSupply();
  }

  function collectFee() external onlyOwner {
    _updateStake(address(this), 0, false);
    uint256 debt = stakeAccounts[address(this)].debt;
    stakeAccounts[address(this)].debt = 0;
    transfer(owner(), debt);
  }
}
