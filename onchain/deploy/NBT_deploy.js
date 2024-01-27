// const {ethers, utils} = require('ethers')
const { ethers } = require('hardhat');
const hre = require('hardhat');

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  await deploy('NBT', {
    from: deployer,
    contract: 'NBToken',
    args: [deployer],
    log: true,
  });
};
module.exports.tags = ['NBT'];
