// const {ethers, utils} = require('ethers')
const { ethers } = require('hardhat');
const hre = require('hardhat');

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  await deploy('MyNft1', {
    from: deployer,
    contract: 'MyNft',
    args: ['MyNft1', 'NFT1'],
    log: true,
  });
  await deploy('MyNft2', {
    from: deployer,
    contract: 'MyNft',
    args: ['MyNft2', 'NFT2'],
    log: true,
  });
  await deploy('Token1', {
    from: deployer,
    contract: 'Token',
    args: ['ETHAN TOKEN1', 'ET1', ethers.formatUnits('1', 0), ethers.parseEther('1')],
    log: true,
  });
  await deploy('Token2', {
    from: deployer,
    contract: 'Token',
    args: ['ETHAN TOKEN2', 'ET2', ethers.formatUnits('1', 0), ethers.parseEther('1')],
    log: true,
  });
  const nftMarket = await deploy('NftMarket', {
    from: deployer,
    args: [],
    log: true,
  });

  // add this contract to subgraph
  await hre.run('graph', {
    contractName: 'NftMarket',
    address: nftMarket.address,
    blockNumber: nftMarket.receipt.blockNumber,
  });
};
module.exports.tags = ['all'];
