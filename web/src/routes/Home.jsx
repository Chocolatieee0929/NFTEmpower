import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { useAccount } from 'wagmi';

const { default: ContractsInterface } = await import(`../contracts/${import.meta.env.VITE_NETWORK}.js`);

const TheGraphUrl = 'https://api.studio.thegraph.com/query/64098/nft-bazaar/version/latest';

async function fetchActivity() {
  const { data } = await axios.post(TheGraphUrl, {
    query: `{
        transfers(first: 100) {
          from
          to
          tokenId
          blockNumber
          blockTimestamp
          id
        }
      }`,
  });
  return data.data.transfers;
}

async function fetchListingNfts() {
  const { data } = await axios.post(TheGraphUrl, {
    query: `{
        nftHolders(first: 100, where: {owner: "${ContractsInterface.NftMarket.address}"}) {
          owner
          tokenId
          from
          id
          tokenAddress
        }
      }`,
  });
  return data.data.nftHolders;
}

export default function Collections() {
  return <div>sdfdsf</div>;
}
