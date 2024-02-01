import axios from 'axios';
import { get } from 'radash';
import supabase from './supabase';

const graphApi = `https://api.studio.thegraph.com/query/64098/nftempower/version/latest`;

export function getNft(nftAddress) {
  return axios
    .post(graphApi, {
      query: `{
        nftCreateds(where:{nftAddress: "${nftAddress}"}) {
            nftAddress
            owner
            blockTimestamp
            name
            mintPrice
            maxSupply
          }
        }`,
    })
    .then((res) => get(res.data, 'data.nftCreateds', [])[0]);
}

export function fetchNftCollections() {
  return axios
    .post(graphApi, {
      query: `{
        nftCreateds {
          name
          nftAddress
          owner
          mintPrice
          }
        }`,
    })
    .then((res) => get(res.data, 'data.nftCreateds', []));
}

export async function fetchNftTokens(nftAddress) {
  return axios
    .post(graphApi, {
      query: `{
        nftTracers(where:{nft: "${nftAddress}"}) {
          owner
          from
          nft
          tokenId
          }
        }`,
    })
    .then((res) => get(res.data, 'data.nftTracers', []));
}

export async function fetchListingNfts() {
  return await supabase.from('ListingOrder').select('*');
}

export async function addListingNftToDb(data) {
  return await supabase.from('ListingOrder').insert([data]).select();
}
