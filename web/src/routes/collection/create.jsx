import { encodePacked, parseEther, parseUnits, keccak256, parseEventLogs } from 'viem';
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
const { default: ContractsInterface } = await import(`../../contracts/${import.meta.env.VITE_NETWORK}.js`);

import {
  FormControl,
  FormLabel,
  Input,
  Container,
  VStack,
  Button,
  HStack,
  Heading,
  useToast,
} from '@chakra-ui/react';

export default function CollectionCreate() {
  const { data: txHash, isPending: isTxPending, writeContractAsync } = useWriteContract();
  const {
    status: receiptStatus,
    data: blockData,
    isLoading: isWaitReceipt,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });
  const [formData, setFormData] = useState({});
  const toast = useToast();
  const toastIdRef = useRef();
  const { address } = useAccount();
  const navigate = useNavigate();
  async function handleSubmit() {
    await writeContractAsync(
      {
        address: ContractsInterface.NftFactory.address,
        abi: ContractsInterface.NftFactory.abi,
        functionName: 'deployNft',
        args: [
          formData.name,
          formData.symbol,
          parseUnits(formData.maxSupply),
          parseEther(formData.mintPrice),
          // bytes32 salt
          keccak256(
            encodePacked(
              ['address', 'string'],
              [address, (Math.random() * 1000000).toString().substring(0, 5)]
            )
          ),
        ],
        gas: 280000n,
      },
      {
        onTransactionHash: (txHash) => {
          // eslint-disable-next-line no-console
          console.log('txHash', txHash);
        },
        onReceipt: (receipt) => {
          // eslint-disable-next-line no-console
          console.log('receipt', receipt);
        },
        onError: (error) => {
          // eslint-disable-next-line no-console
          console.log('writeContract error', error);
          toast({
            title: '交易失败',
            status: 'error',
            position: 'top',
            description: error.message,
          });
        },
        onSuccess: () => {
          // console.log('writeContract success', success);
          toastIdRef.current = toast({
            title: '交易成功，等待区块确认',
            status: 'loading',
            position: 'top',
            duration: null,
            isClosable: true,
          });
        },
      }
    );

    // const transactionReceipt = await waitForTransactionReceipt(config, {
    //   hash: txHash,
    //   chainId: 11155111,
    //   onReplaced: (replacement) => console.log(replacement),
    // });
  }

  function updateToast(opts) {
    if (toastIdRef.current) {
      toast.update(toastIdRef.current, { ...opts, duration: 5000 });
    } else {
      toast(opts);
    }
  }

  useEffect(() => {
    if (receiptStatus === 'error') {
      console.log('err blockData', blockData);
      updateToast({
        title: '区块确认失败:',
        status: 'error',
        position: 'top',
      });
    }
    if (receiptStatus === 'success') {
      const logs = parseEventLogs({
        abi: ContractsInterface.NftFactory.abi,
        eventName: 'NftCreated',
        logs: blockData.logs,
      });
      updateToast({
        status: 'success',
        title: '创建成功',
        position: 'top',
      });
      navigate(`/collection/${logs[0].args.nftAddress}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receiptStatus]);

  function onChange(name, value) {
    value = (value || '').trim();
    setFormData({ ...formData, ...{ [name]: value } });
  }

  return (
    <Container w="md" mt="20">
      <VStack spacing={4} align="stretch">
        <FormLabel as="legend" textAlign="center">
          <Heading as="h4" size="md">
            Create Your NFT Collection
          </Heading>
        </FormLabel>
        <FormControl isRequired>
          <Input placeholder="Your NFT Name" onChange={(e) => onChange('name', e.target.value)} />
        </FormControl>
        <FormControl isRequired>
          <HStack>
            <Input placeholder="Your NFT Symbol" onChange={(e) => onChange('symbol', e.target.value)} />
          </HStack>
        </FormControl>
        <FormControl isRequired>
          <HStack>
            <Input
              placeholder="Set Your NFT Max Supply"
              onChange={(e) => onChange('maxSupply', e.target.value)}
            />
          </HStack>
        </FormControl>
        <FormControl isRequired>
          <HStack>
            <Input placeholder="NFT Mint Price" onChange={(e) => onChange('mintPrice', e.target.value)} />
          </HStack>
        </FormControl>
        <Button colorScheme="blue" onClick={handleSubmit} isLoading={isTxPending || isWaitReceipt}>
          Start Create
        </Button>
      </VStack>
    </Container>
  );
}
