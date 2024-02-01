import axios from 'axios';
import { get } from 'radash';

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
