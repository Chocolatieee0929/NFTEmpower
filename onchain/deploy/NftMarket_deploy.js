// const {ethers, utils} = require('ethers')
const { ethers } = require('hardhat');
const hre = require('hardhat');
module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const NbtContract = await deployments.get('NBT');
  const NftMarket = await deploy('NftMarket', {
    from: deployer,
    contract: 'NftMarket',
    args: [NbtContract.address],
    log: true,
  });
  // add this contract to subgraph
  // await hre.run('graph', {
  //   contractName: 'NftMarket',
  //   address: NftMarket.address,
  //   abi: NftMarket.abi,
  //   mergeEntities: false,
  //   startBlock: NftMarket.receipt.blockNumber,
  // });
};
module.exports.tags = ['NftMarket'];
