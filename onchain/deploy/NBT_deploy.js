// const {ethers, utils} = require('ethers')
const { ethers } = require('hardhat');
const hre = require('hardhat');

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  console.log(deployer);

  const nbtDeployed = await deploy('NBT', {
    from: deployer,
    contract: 'NBToken',
    args: [deployer],
    log: true,
  });

  await hre.run('graph', {
    contractName: 'NBToken',
    address: nbtDeployed.address,
    abi: nbtDeployed.abi,
    mergeEntities: false,
    startBlock: nbtDeployed.receipt.blockNumber,
  });
};
module.exports.tags = ['NBT'];
