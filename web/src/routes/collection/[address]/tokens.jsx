import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
// import NftCard from '../components/NftCard';
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useSignTypedData,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { get } from 'radash';
import { formatEther, parseEther, getContract, parseUnits } from 'viem';
import { useParams } from 'react-router-dom';
import {
  Container,
  Center,
  Button,
  Text,
  Grid,
  Box,
  GridItem,
  Stack,
  Heading,
  useToast,
  AbsoluteCenter,
  Divider,
} from '@chakra-ui/react';
import { getNft, fetchNftTokens } from '@/api/nft';
import { useQuery } from '@tanstack/react-query';
import TokenCard from '@/components/TokenCard';
const { default: ContractsInterface } = await import(`../../../contracts/${import.meta.env.VITE_NETWORK}.js`);

// async function fetchMyNfts(address) {
//   const { data } = await axios.post(TheGraphUrl, {
//     query: `{
//         nftHolders(first: 100, where: {owner: "${address}"}) {
//           owner
//           tokenId
//           id
//           tokenAddress
//         }
//       }`,
//   });
//   return get(data, 'data.nftHolders', []);
// }

export default function CollectionTokens() {
  const [tabName, setTabName] = useState('MyNft');
  const [transfers, setTransfers] = useState([]);
  const [myNftList, setMyNftList] = useState([]);
  const account = useAccount();
  const { data: txHash, isPending: isTxPending, writeContractAsync } = useWriteContract();
  const { signTypedData } = useSignTypedData();
  const { nftAddress } = useParams();
  const { error, data: nftDetail } = useQuery({
    queryKey: ['getNft'],
    queryFn: () => getNft(nftAddress),
  });
  const { data: tokenList } = useQuery({
    queryKey: ['fetchNftTokens'],
    queryFn: () => fetchNftTokens(nftAddress),
  });
  const toast = useToast();
  const {
    data: blockData,
    status,
    isLoading: isWaitReceipt,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });
  const { data: isApprovedForAll } = useReadContract({
    abi: ContractsInterface.NftCollection.abi,
    address: nftAddress,
    args: [account.address, ContractsInterface.NftMarket.address],
    functionName: 'isApprovedForAll',
  });

  useEffect(() => {
    if (status === 'error') {
      toast({
        title: '交易失败',
        status: 'error',
        position: 'top',
      });
    }
    if (status === 'success') {
      toast({
        title: 'mint成功',
        status: 'success',
        position: 'top',
      });
      console.log(blockData);
    }
  }, [status]);

  async function Mint() {
    // signTypedData(
    //   {
    //     types: {
    //       Permit: [
    //         { name: 'seller', type: 'address' },
    //         { name: 'tokenId', type: 'uint8' },
    //         { name: 'price', type: 'uint256' },
    //         { name: 'deadline', type: 'uint256' },
    //         { name: 'nonce', type: 'uint' },
    //       ],
    //     },
    //     primaryType: 'Permit',
    //     message: {
    //       seller: address,
    //       tokenId: BigInt('1'),
    //       price: parseUnits('1', 18),
    //       deadline: BigInt(Math.floor(Date.now() / 1000) + 100_000),
    //       nonce: 1,
    //     },
    //     domain: {
    //       version: ContractsInterface.version,
    //       chainId: ContractsInterface.chainId,
    //       verifyingContract: ContractsInterface.NftMarket.address,
    //       name: 'NftBazaar.com',
    //     },
    //   },
    //   {
    //     onSuccess: (signature) => {
    //       console.log(signature);
    //     },
    //     onError: (e) => {
    //       console.log(e);
    //     },
    //   }
    // );
    const data = await writeContractAsync(
      {
        abi: ContractsInterface.NftCollection.abi,
        address: nftAddress,
        functionName: 'mintNft',
        args: [account.address],
        account,
        value: nftDetail.mintPrice,
      },
      {
        onSettled(receipt) {
          console.log(receipt);
        },
        onError(e) {
          // console.log(e);
          toast({
            status: 'error',
            title: '交易失败',
            description: e.message,
          });
        },
      }
    );
    console.log(data);
  }

  async function handleTabChange(e, value) {
    setTabName(value);
  }

  return (
    <Box p="6" width="100%">
      <Center width="100%">
        <Stack spacing={3}>
          <Text fontSize="md">owner: {nftDetail && nftDetail.owner}</Text>
          <Text fontSize="md">Mint Price: {nftDetail && formatEther(nftDetail.mintPrice)}</Text>
          <Button colorScheme="green" onClick={Mint} isLoading={isWaitReceipt || isTxPending}>
            Mint
          </Button>
        </Stack>
      </Center>
      <Box>
        <Box position="relative" padding="10">
          <Divider />
          <AbsoluteCenter bg="white" px="4">
            <Heading as="h4" size="md">
              Tokens Minted
            </Heading>
          </AbsoluteCenter>
        </Box>

        <Grid templateColumns="repeat(4, 2fr)" gap={4}>
          {tokenList &&
            tokenList.map((token) => {
              return (
                <GridItem bg="blue.500" key={token.tokenId}>
                  <TokenCard
                    tokenId={token.tokenId}
                    owner={token.owner}
                    isApprovedForAll={isApprovedForAll}
                    nftAddress={nftAddress}
                    isSell={false}
                  ></TokenCard>
                </GridItem>
              );
            })}
        </Grid>
      </Box>
    </Box>
  );
}
