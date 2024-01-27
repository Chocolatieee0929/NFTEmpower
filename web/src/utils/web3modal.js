import { createWeb3Modal, defaultConfig } from '@web3modal/ethers5/react'

// 1. Get projectId at https://cloud.walletconnect.com
const projectId = '0d7b7c5359cf854f93dcb41e584ff02a';

// blast sepolia 测试网
// const mainnet = {
//   chainId:  168587773,
//   name: 'Blast Sepolia',
//   currency: 'BlaETH',
//   explorerUrl: 'https://testnet.blastscan.io',
//   rpcUrl: 'https://sepolia.blast.io'
// }

//  sepolia 测试网
const mainnet = {
  chainId:  11155111,
  name: 'Sepolia',
  currency: 'sepoliaETH',
  explorerUrl: 'https://sepolia.ethereum.io',
  rpcUrl: 'https://ethereum-sepolia.publicnode.com'
}


// const mainnet = {
//   chainId: 1337,
//   name: 'Local testnet',
//   currency: 'ETH',
//   explorerUrl: 'https://testnet.blastscan.io',
//   rpcUrl: 'http://127.0.0.1:8545',
// };

// 3. Create modal
const metadata = {
  name: 'Nft Bazaar',
  description: 'Create, Sell, Empower your NFTs',
  url: '',
  icons: [],
};
const ethersConfig = defaultConfig({ metadata, defaultChainId: 31337, rpcUrl: 'http://127.0.0.1:8545' });

createWeb3Modal({
  ethersConfig,
  chains: [mainnet],
  featuredWalletIds: ['metamask'],
  projectId,
});
