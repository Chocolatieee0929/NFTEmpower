import {
  Card,
  CardBody,
  Image,
  Stack,
  Heading,
  Text,
  Divider,
  CardFooter,
  ButtonGroup,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  ModalFooter,
  FormControl,
  Input,
  InputRightAddon,
  useToast,
  InputGroup,
  VStack,
  FormLabel,
  FormHelperText,
} from '@chakra-ui/react';
import propTypes from 'prop-types';
import { useState } from 'react';
import { useSignTypedData, useAccount, useWriteContract, useReadContract, useConfig } from 'wagmi';
import {
  parseUnits,
  slice,
  keccak256,
  toBytes,
  hexToNumber,
  encodePacked,
  hexToSignature,
  formatUnits,
} from 'viem';
import { waitForTransactionReceipt } from '@wagmi/core';
import { addListingNftToDb } from '@/api/nft';
import supabase from '@/api/supabase';
const { default: ContractsInterface } = await import(`../contracts/${import.meta.env.VITE_NETWORK}.js`);

export default function TokenCard({
  tokenId,
  isSell,
  signature,
  price,
  deadline,
  owner,
  nftAddress,
  isApprovedForAll,
}) {
  const { isOpen: isSellModalOpen, onOpen, onClose } = useDisclosure();
  const [sellData, setSellData] = useState({
    price: '',
    whiteAddress: '',
  });
  const [isApprovedLoading, setIsApprovedLoading] = useState(false);
  const [isBuyLoading, setIsBuyLoading] = useState(false);
  const { signTypedData } = useSignTypedData();
  const providerConfig = useConfig();
  const { address } = useAccount();
  const toast = useToast();
  const { writeContract, writeContractAsync } = useWriteContract();
  const isSelf = (address || '').toLowerCase() === owner.toLowerCase();
  console.log(address, owner);
  function onSellChange(name, val) {
    val = (val || '').trim();
    setSellData({
      ...sellData,
      [name]: val,
    });
  }

  async function openSellModal() {
    if (!isApprovedForAll) {
      toast({
        title: '请先授权该系列 NFT 给 NFT Empower',
        status: 'info',
        position: 'top',
      });
      setIsApprovedLoading(true);
      const txHash = await writeContractAsync(
        {
          address: nftAddress,
          abi: ContractsInterface.NftCollection.abi,
          functionName: 'setApprovalForAll',
          args: [ContractsInterface.NftMarket.address, true],
        },
        {
          onReceipt: (receipt) => {
            console.log(receipt);
            toast({
              title: '授权成功',
              status: 'success',
              position: 'top',
            });
          },
          onError: (e) => {
            console.log(e);
            setIsApprovedLoading(false);
            toast({
              title: '授权失败',
              status: 'error',
              description: e.message,
              position: 'top',
            });
          },
        }
      );
      await waitForTransactionReceipt(providerConfig, {
        hash: txHash,
      });
      setIsApprovedLoading(false);
      toast({
        title: '授权完成',
        status: 'success',
        position: 'top',
      });
      return;
    }
    onOpen();
  }

  // 上架
  const { data: nonce } = useReadContract(
    {
      address: ContractsInterface.NftMarket.address,
      abi: ContractsInterface.NftMarket.abi,
      functionName: 'nonces',
      args: [address],
    },
    {
      onSuccess: (nonce) => {
        console.log(nonce);
      },
      onError: (e) => {
        console.log(e);
      },
    }
  );

  async function onList() {
    if (!sellData.price) {
      return toast({
        title: '请输入卖出价格（nbt token 数量）',
        status: 'error',
        position: 'top',
      });
    }
    let deadline = Math.floor(Date.now() / 1000) + 100_000;
    signTypedData(
      {
        types: {
          EIP712Domain: [
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
            { name: 'chainId', type: 'uint256' },
            { name: 'verifyingContract', type: 'address' },
          ],
          List: [
            { name: 'nftAddress', type: 'address' },
            { name: 'tokenId', type: 'uint8' },
            { name: 'price', type: 'uint256' },
            { name: 'nonce', type: 'uint256' },
            { name: 'deadline', type: 'uint256' },
          ],
        },
        primaryType: 'List',
        message: {
          nftAddress: nftAddress,
          tokenId: BigInt(tokenId),
          price: parseUnits(sellData.price, 18), // how many nbt token
          nonce,
          deadline: BigInt(deadline),
        },
        domain: {
          version: ContractsInterface.version,
          chainId: ContractsInterface.chainId,
          verifyingContract: ContractsInterface.NftMarket.address,
          name: 'NFTEmpower',
        },
      },
      {
        onSuccess: (signature) => {
          addListingNftToDb({
            tokenId,
            nftAddress,
            seller: address,
            price: sellData.price,
            deadline,
            sig: signature,
            whiteAddress: sellData.whiteAddress,
          }).then((r) => {
            toast({
              title: '上架成功',
              status: 'success',
              position: 'top',
            });
            onClose();
          });
        },
        onError: (e) => {
          console.log(e);
        },
      }
    );
    return;
    // await writeContractAsync({
    //   contract: ContractsInterface.NftMarket,
    //   method: 'permit',
    //   args: [
    //     nftAddress,
    //     tokenId,
    //     address,
    //     parseUnits(sellData.price, 18), // how many nbt token
    //     BigInt(Math.floor(Date.now() / 1000) + 100_000),
    //     keccak256(encodePacked(['address', 'uint256'], [address, Math.round(Math.random() * 1000000)])),
    //   ],
    //   onReceipt: (receipt) => {
    //     console.log(receipt);
    //     toast({
    //       title: '上架成功',
    //       status: 'success',
    //       position: 'top',
    //     });
    //   },
    //   onError: (e) => {
    //     console.log(e);
    //     toast({
    //       title: '上架失败',
    //       status: 'error',
    //       position: 'top',
    //     });
    //   },
    // });
  }

  // 点击购买 nft
  async function onBuyNft() {
    const { r, s, v } = hexToSignature(signature);
    setIsBuyLoading(true);
    const approveHash = await writeContractAsync(
      {
        address: ContractsInterface.NBT.address,
        abi: ContractsInterface.NBT.abi,
        functionName: 'approve',
        args: [ContractsInterface.NftMarket.address, parseUnits(price, 18)],
      },
      {
        onError(e) {
          toast({
            title: '购买失败',
            status: 'error',
            position: 'top',
            description: e.message,
          });
        },
      }
    );

    await waitForTransactionReceipt(providerConfig, {
      hash: approveHash,
    });
    const buyNftHash = await writeContractAsync(
      {
        address: ContractsInterface.NftMarket.address,
        abi: ContractsInterface.NftMarket.abi,
        functionName: 'buyNft',
        args: [nftAddress, BigInt(tokenId), parseUnits(price, 18), BigInt(deadline), v, r, s],
      },
      {
        onError: (e) => {
          console.log(e);
          toast({
            title: '购买失败',
            status: 'error',
            position: 'top',
            description: e.message,
          });
        },
      }
    );
    await waitForTransactionReceipt(providerConfig, {
      hash: buyNftHash,
    });
    toast({
      title: '购买成功',
      status: ' success',
      position: 'top',
    });
    // delete from db
    setIsBuyLoading(false);
    await supabase.from('ListingOrder').delete().eq('sig', signature);
  }

  return (
    <>
      <Card maxW="sm">
        <CardBody>
          <Image src="" alt="" borderRadius="lg" />
          <Stack mt="6" spacing="3">
            <Heading size="md">nftToken:{tokenId}</Heading>
            <Text>
              owner: {owner}
              {isSelf ? ' ( IS YOU ) ' : ''}
            </Text>
            <Text>nft: {nftAddress}</Text>
            {price && (
              <Text color="blue.600" fontSize="2xl">
                价格：{price}NBT
              </Text>
            )}
          </Stack>
        </CardBody>
        <Divider />
        <CardFooter>
          <ButtonGroup spacing="2">
            {isSell && !isSelf && (
              <Button variant="solid" colorScheme="blue" onClick={onBuyNft} isLoading={isBuyLoading}>
                Buy now
              </Button>
            )}
            {!isSell && isSelf && (
              <Button
                variant="ghost"
                colorScheme="blue"
                isLoading={isApprovedLoading}
                onClick={openSellModal}
              >
                Sell now
              </Button>
            )}
          </ButtonGroup>
        </CardFooter>
      </Card>
      <Modal isOpen={isSellModalOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>价格信息</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl isRequired>
              <VStack alignItems="left">
                <FormLabel>售卖价格(NBT数量)</FormLabel>
                <Input placeholder="NFT Sell Price" onChange={(e) => onSellChange('price', e.target.value)} />
                {/* <FormHelperText>用 NBT Token 购买</FormHelperText> */}
              </VStack>
            </FormControl>

            <br></br>
            <FormControl>
              <VStack alignItems="left">
                <FormLabel>可买白名单地址（可选）</FormLabel>
                <InputGroup>
                  <Input
                    placeholder="NFT Mint Price"
                    onChange={(e) => onSellChange('whiteAddress', e.target.value)}
                  />{' '}
                  <InputRightAddon>NBT Token</InputRightAddon>
                </InputGroup>
              </VStack>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={onList}>
              上架
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

TokenCard.propTypes = {
  tokenId: propTypes.string.isRequired,
  isSell: propTypes.bool,
  price: propTypes.string,
  isApprovedForAll: propTypes.bool,
  owner: propTypes.string.isRequired,
  nftAddress: propTypes.string.isRequired,
  signature: propTypes.string,
  deadline: propTypes.number,
};
