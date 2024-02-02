import data from '@nft-bazaar/onchain/forapp/sepolia/artifacts.json';

export default {
  version: '1',
  networkName: data.name,
  ...data.contracts,
  chainId: data.chainId,
};
