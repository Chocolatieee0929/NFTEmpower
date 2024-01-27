// const {ethers, utils} = require('ethers')
const { ethers } = require('hardhat');
const hre = require('hardhat');
module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const NftContract = await deployments.get('NftCollection');
  const NftFactory = await deploy('NftFactory', {
    from: deployer,
    contract: 'NftFactory',
    args: [NftContract.address],
    log: true,
  });
  // add this contract to subgraph
  // await hre.run('graph', {
  //   contractName: 'NftFactory',
  //   address: NftFactory.address,
  //   abi: NftFactory.abi,
  //   blockNumber: NftFactory.receipt.blockNumber,
  // });
};
module.exports.tags = ['NftFactory'];
