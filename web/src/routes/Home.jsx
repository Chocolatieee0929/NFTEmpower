import { useQuery } from '@tanstack/react-query';
import { fetchListingNfts } from '@/api/nft';
import TokenCard from '@/components/TokenCard';
import { Grid, GridItem, Heading } from '@chakra-ui/react';

export default function CollectionList() {
  const { isPending, error, data } = useQuery({
    queryKey: ['collections'],
    queryFn: () => fetchListingNfts(),
  });
  const orderList = (data && data.data) || [];
  return (
    <Grid templateColumns="repeat(4, 2fr)" gap={4} p="10">
      <Heading as="h4" size="md">
        NFT Collection Listed
      </Heading>
      {orderList &&
        orderList.map((item) => {
          return (
            <GridItem bg="blue.500" key={item.tokenId + item.nftAddress}>
              <TokenCard
                tokenId={item.tokenId}
                owner={item.seller}
                nftAddress={item.nftAddress}
                isSell={true}
                price={item.price}
                deadline={item.deadline}
                signature={item.sig}
              ></TokenCard>
            </GridItem>
          );
        })}
    </Grid>
  );
}
