import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { get } from 'radash';

async function loadList(address) {
  const { data } = await axios.post(import.meta.env.VITE_THEGRAPH, {
    query: address
      ? `{
      nftCreateds(first: 1000, where: {address: "${address}"}) {
          nft
          owner
        }
      }`
      : `{
        nftCreateds(first: 1000) {
            nft
            owner
          }
        }`,
  });
  return get(data, 'data.nftCreateds', []);
}

export default function CollectionList(address) {
  const { isPending, error, data } = useQuery({
    queryKey: ['collection-list'],
    queryFn: () => loadList(address),
  });
  return <div>list</div>;
}
