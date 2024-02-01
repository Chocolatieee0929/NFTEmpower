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
import { useSignTypedData, useAccount, useWriteContract, useReadContract } from 'wagmi';
import { parseUnits, keccak256, encodePacked } from 'viem';

const { default: ContractsInterface } = await import(`../contracts/${import.meta.env.VITE_NETWORK}.js`);

export default function TokenCard({ tokenId, isSell, price, owner, nftAddress }) {
  const { isOpen: isSellModalOpen, onOpen, onClose } = useDisclosure();
  const [sellData, setSellData] = useState({
    price: '',
    whiteAddress: '',
  });
  const { signTypedData } = useSignTypedData();
  const { address } = useAccount();
  const toast = useToast();
  const { writeContractAsync } = useWriteContract();
  const isApprovedForAll = useReadContract({
    abi: ContractsInterface.NftCollection.abi,
    address: nftAddress,
    args: [address, ContractsInterface.NftMarket.address],
    functionName: 'isApprovedForAll',
  });

  console.log(isApprovedForAll);

  function onSellChange(name, val) {
    val = (val || '').trim();
    setSellData({
      ...sellData,
      [name]: val,
    });
  }

  async function openSellModal() {}

  async function onList() {
    if (!sellData.price) {
      return toast({
        title: '请输入卖出价格（nbt token 数量）',
        status: 'error',
        position: 'top',
      });
    }
    await writeContractAsync({
      contract: ContractsInterface.NftMarket,
      method: 'permit',
      args: [
        nftAddress,
        tokenId,
        address,
        parseUnits(sellData.price, 18), // how many nbt token
        BigInt(Math.floor(Date.now() / 1000) + 100_000),
        keccak256(encodePacked(['address', 'uint256'], [address, Math.round(Math.random() * 1000000)])),
      ],
      onReceipt: (receipt) => {
        console.log(receipt);
        toast({
          title: '上架成功',
          status: 'success',
          position: 'top',
        });
      },
      onError: (e) => {
        console.log(e);
        toast({
          title: '上架失败',
          status: 'error',
          position: 'top',
        });
      },
    });
    signTypedData(
      {
        types: {
          Permit: [
            { name: 'nft', type: 'address' },
            { name: 'tokenId', type: 'uint8' },
            { name: 'seller', type: 'address' },
            { name: 'price', type: 'uint256' },
            { name: 'deadline', type: 'uint256' },
            { name: 'nonce', type: 'bytes32' },
          ],
        },
        primaryType: 'Permit',
        message: {
          nft: nftAddress,
          tokenId: BigInt(tokenId),
          seller: address,
          price: parseUnits(sellData.price, 18), // how many nbt token
          deadline: BigInt(Math.floor(Date.now() / 1000) + 100_000),
          nonce: keccak256(
            encodePacked(['address', 'uint256'], [address, Math.round(Math.random() * 1000000)])
          ),
        },
        domain: {
          version: ContractsInterface.version,
          chainId: ContractsInterface.chainId,
          verifyingContract: ContractsInterface.NftMarket.address,
          name: 'nft-empower.com',
        },
      },
      {
        onSuccess: (signature) => {
          console.log(signature);
        },
        onError: (e) => {
          console.log(e);
        },
      }
    );
  }

  return (
    <>
      <Card maxW="sm">
        <CardBody>
          <Image src="" alt="" borderRadius="lg" />
          <Stack mt="6" spacing="3">
            <Heading size="md">nftToken:{tokenId}</Heading>
            <Text>owner: {owner}</Text>
            <Text>nft: {nftAddress}</Text>
            {price && (
              <Text color="blue.600" fontSize="2xl">
                {price}
              </Text>
            )}
          </Stack>
        </CardBody>
        <Divider />
        <CardFooter>
          <ButtonGroup spacing="2">
            {isSell && (
              <Button variant="solid" colorScheme="blue">
                Buy now
              </Button>
            )}
            {!isSell && (
              <Button variant="ghost" colorScheme="blue" onClick={openSellModal}>
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
            <FormControl isRequired>
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
  owner: propTypes.string.isRequired,
  nftAddress: propTypes.string.isRequired,
};
