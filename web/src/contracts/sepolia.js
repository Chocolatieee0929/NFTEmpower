import data from '@nft-bazaar/onchain/forapp/sepolia/artifacts.json';

export default {
  nftVersion: '1.0',
  networkName: data.name,
  ...data.contracts,
  chainId: data.chainId,
};
