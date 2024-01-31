require('@nomicfoundation/hardhat-toolbox');
require('@nomicfoundation/hardhat-foundry');
require('hardhat-deploy');
require('hardhat-deploy-ethers');
require('@graphprotocol/hardhat-graph');

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: '0.8.20',
  networks: {
    hardhat: {
      chainId: 1337,
      // accounts: require('./config/hardhat-wallet.js'),
    },
    localhost: {
      url: 'http://127.0.0.1:8545',
      chainId: 31337,
      accounts: require('./config/localhost-wallet.js'),
    },
    sepolia: {
      url: 'https://ethereum-sepolia.publicnode.com',
      chainId: 11155111,
      accounts: require('./config/sepolia-wallet.js'),
    },
  },
  paths: {
    deploy: 'deploy',
    deployments: 'deployments',
    // imports: "imports",
  },
  namedAccounts: {
    deployer: 0,
  },
  subgraph: {
    name: 'nft-bazaar', // Defaults to the name of the root folder of the hardhat project
    product: 'subgraph-studio', // 'hosted-service'|'subgraph-studio', // Defaults to 'subgraph-studio'
    // node: 'http://127.0.0.1:8020',
    indexEvents: true, // Defaults to false
    allowSimpleName: true, // Defaults to `false` if product is `hosted-service` and `true` if product is `subgraph-studio`
  },
  paths: {
    subgraph: './subgraph', // Defaults to './subgraph'
  },
};
