import { useQuery } from '@tanstack/react-query';
import { get } from 'radash';
import { fetchNftCollections } from '@/api/nft';
import NftCollection from '@/components/NftCollection';
import { Box, Button, Flex, Grid, GridItem, Heading, Spacer, useToast } from '@chakra-ui/react';

export default function CollectionList() {
  const { isPending, error, data } = useQuery({
    queryKey: ['collections'],
    queryFn: () => fetchNftCollections(),
  });
  return (
    <Box p="10">
      <Heading as="h4" size="md" p="6">
        NFT Collections Created
      </Heading>
      <Grid templateColumns="repeat(4, 2fr)" gap={4}>
        {data &&
          data.map &&
          data.map((item) => {
            return (
              <GridItem bg="blue.500" key={item.nftAddress}>
                <NftCollection
                  owner={item.owner}
                  nftAddress={item.nftAddress}
                  name={item.name}
                ></NftCollection>
              </GridItem>
            );
          })}
      </Grid>
    </Box>
  );
}
