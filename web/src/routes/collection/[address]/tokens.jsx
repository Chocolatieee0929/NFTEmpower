import { useState, useEffect, useRef } from 'react';
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
  Input,
  Stack,
  Heading,
  useToast,
  AbsoluteCenter,
  Divider,
  Drawer,
  VStack,
  useDisclosure,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
} from '@chakra-ui/react';
import { getNft, fetchNftTokens } from '@/api/nft';
import { useQuery } from '@tanstack/react-query';
import TokenCard from '@/components/TokenCard';
const { default: ContractsInterface } = await import(`../../../contracts/${import.meta.env.VITE_NETWORK}.js`);

export default function CollectionTokens() {
  const account = useAccount();
  const { data: txHash, isPending: isTxPending, writeContractAsync } = useWriteContract();
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

  const { isOpen, onOpen, onClose } = useDisclosure()
  const btnRef = useRef()

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
          toast({
            status: 'error',
            title: '交易失败',
            description: e.message,
          });
        },
      }
    );
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
          <Button colorScheme="green" variant="link" onClick={onOpen}>
            设置白名单可 mint
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
      <Drawer
        isOpen={isOpen}
        placement='right'
        onClose={onClose}
        finalFocusRef={btnRef}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>白名单地址</DrawerHeader>

          <DrawerBody>
            <VStack>
            <Input placeholder='address here 0x...' />
            <Input placeholder='address here 0x...' />
            <Input placeholder='address here 0x...' />
            <Input placeholder='address here 0x...' />
            <Input placeholder='address here 0x...' />
            <Input placeholder='address here 0x...' />
            </VStack>
          </DrawerBody>

          <DrawerFooter>
            <Button variant='outline' mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme='blue'>Save</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}
