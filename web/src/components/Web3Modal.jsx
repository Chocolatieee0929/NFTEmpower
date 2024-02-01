import { createWeb3Modal } from '@web3modal/wagmi/react';
import PropTypes from 'prop-types';
import { WagmiProvider } from 'wagmi';
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';
import { mainnet } from 'wagmi/chains';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// 0. Setup queryClient
const queryClient = new QueryClient();

// 1. Get projectId at https://cloud.walletconnect.com
const projectId = '0d7b7c5359cf854f93dcb41e584ff02a';

// 2. Create wagmiConfig
const metadata = {
  name: 'Nft Bazaar',
  description: 'Create, Sell, Empower your NFTs',
  url: '',
  icons: [],
};

// blast sepolia 测试网
// const mainnet = {
//   chainId:  168587773,
//   name: 'Blast Sepolia',
//   currency: 'BlaETH',
//   explorerUrl: 'https://testnet.blastscan.io',
//   rpcUrl: 'https://sepolia.blast.io'
// }

const localnet = {
  id: 31337,
  name: 'localhost',
  nativeCurrency: {
    decimals: 18,
    name: 'LEther',
    symbol: 'LETH',
  },
  rpcUrls: {
    default: { http: ['http://127.0.0.1:8545'] },
  },
};

const sepolia = {
  id: 11_155_111,
  name: 'Sepolia',
  nativeCurrency: { name: 'Sepolia Ether', symbol: 'SEP', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://ethereum-sepolia.publicnode.com'],
    },
  },
};

const config = defaultWagmiConfig({
  projectId,
  metadata,
  chains: [sepolia],
});

// 3. Create modal
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
});

export default function Web3Modal({ children }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}

Web3Modal.propTypes = {
  children: PropTypes.node.isRequired,
};
