// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import '@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721PausableUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721BurnableUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/utils/cryptography/EIP712Upgradeable.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721VotesUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
import '@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol';
import {MerkleProof} from '@openzeppelin/contracts/utils/cryptography/MerkleProof.sol';

/**
 * Nft模板合约，使用 upgradeable 合約
 */
contract NftCollection is
  Initializable,
  ERC721Upgradeable,
  ERC721PausableUpgradeable,
  OwnableUpgradeable,
  ERC721BurnableUpgradeable,
  EIP712Upgradeable,
  ERC721VotesUpgradeable,
  ReentrancyGuardUpgradeable
{
  uint256 private _nextTokenId;
  uint256 public maxSupply;
  uint256 public mintedCount;
  uint256 public mintPrice;
  bytes32 private merkleRoot;

  /// @custom:oz-upgrades-unsafe-allow constructor
  constructor() {
    _disableInitializers();
  }

  function initialize(
    address initialOwner,
    string memory _name,
    string memory _symbol,
    uint256 _maxSupply,
    uint256 _mintPrice
  ) public initializer {
    __ERC721_init(_name, _symbol);
    maxSupply = _maxSupply;
    mintPrice = _mintPrice;
    __ERC721Pausable_init();
    __Ownable_init(initialOwner);
    __ERC721Burnable_init();
    __EIP712_init(_name, '1');
    __ERC721Votes_init();
  }

  function pause() public onlyOwner {
    _pause();
  }

  function setMerkleRoot(bytes32 _merkleRoot) external onlyOwner {
    merkleRoot = _merkleRoot;
  }

  function unpause() public onlyOwner {
    _unpause();
  }

  function mintNft(address _to) external payable whenNotPaused nonReentrant {
    require(mintedCount < maxSupply, 'Over maxSupply');
    require(msg.value == mintPrice, 'Mint price not correct');
    mintedCount += 1;
    safeMint(_to);
  }

  function mintWithWhitelist(
    address _to,
    bytes32[] calldata merkleProof
  ) external whenNotPaused nonReentrant {
    require(
      MerkleProof.verify(merkleProof, merkleRoot, keccak256(abi.encodePacked(_to))),
      'whitelist only to mint this NFT'
    );
    require(mintedCount < maxSupply, 'Over maxSupply');
    mintedCount += 1;
    safeMint(_to);
  }

  function safeMint(address to) internal {
    uint256 tokenId = _nextTokenId++;
    _safeMint(to, tokenId);
  }

  function withdraw() external onlyOwner {
    payable(owner()).transfer(address(this).balance);
  }

  // The following functions are overrides required by Solidity.

  function _update(
    address to,
    uint256 tokenId,
    address auth
  )
    internal
    override(ERC721Upgradeable, ERC721PausableUpgradeable, ERC721VotesUpgradeable)
    returns (address)
  {
    return super._update(to, tokenId, auth);
  }

  function _increaseBalance(
    address account,
    uint128 value
  ) internal override(ERC721Upgradeable, ERC721VotesUpgradeable) {
    super._increaseBalance(account, value);
  }
}
