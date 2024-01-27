// const {ethers, utils} = require('ethers')
const { ethers } = require('hardhat');
const hre = require('hardhat');

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  await deploy('NftCollection', {
    from: deployer,
    contract: 'NftCollection',
    args: [],
    log: true,
  });
};
module.exports.tags = ['NftCollection'];
