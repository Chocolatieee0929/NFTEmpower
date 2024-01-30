import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import LoadingButton from '@mui/lab/LoadingButton';
import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import axios from 'axios';
import NftCard from '../components/NftCard';
import Stack from '@mui/material/Stack';
import { useAccount, useReadContract, useWriteContract, useSignTypedData } from 'wagmi';
import { get } from 'radash';
import { formatEther, getContract, parseUnits } from 'viem';

const { default: ContractsInterface } = await import(`../contracts/${import.meta.env.VITE_NETWORK}.js`);

// import useSigner from '../hooks/useSigner';

const TheGraphUrl = 'https://api.studio.thegraph.com/query/64098/nft-bazaar/version/latest';

async function fetchActivity(address) {
  const { data } = await axios.post(TheGraphUrl, {
    query: `{
        transfers(first: 50, where: {or:[ {from: "${address}"},{to: "${address}"} ]}) {
          from
          to
          tokenId
          blockNumber
          blockTimestamp
          id
        }
      }`,
  });
  return get(data, 'data.transfers', []);
}

async function fetchMyNfts(address) {
  const { data } = await axios.post(TheGraphUrl, {
    query: `{
        nftHolders(first: 100, where: {owner: "${address}"}) {
          owner
          tokenId
          id
          tokenAddress
        }
      }`,
  });
  return get(data, 'data.nftHolders', []);
}

export default function CreateNft() {
  const [tabName, setTabName] = useState('MyNft');
  const [transfers, setTransfers] = useState([]);
  const [myNftList, setMyNftList] = useState([]);
  const { address } = useAccount();
  const { data: hash, isPending: isMinting, writeContract } = useWriteContract();
  const { signTypedData } = useSignTypedData();

  const { data: nftCount } = useReadContract({
    abi: ContractsInterface.MyNft1.abi,
    address: ContractsInterface.MyNft1.address,
    functionName: 'balanceOf',
    args: [address],
  });

  useEffect(() => {
    fetchActivity(address).then((list) => {
      setTransfers(list);
    });
    fetchMyNfts(address).then((list) => {
      setMyNftList(list);
    });
  }, [tabName, isMinting, address]);

  async function Mint() {
    signTypedData(
      {
        types: {
          Permit: [
            { name: 'seller', type: 'address' },
            { name: 'tokenId', type: 'uint8' },
            { name: 'price', type: 'uint256' },
            { name: 'deadline', type: 'uint256' },
            { name: 'nonce', type: 'uint' },
          ],
        },
        primaryType: 'Permit',
        message: {
          seller: address,
          tokenId: BigInt('1'),
          price: parseUnits('1', 18),
          deadline: BigInt(Math.floor(Date.now() / 1000) + 100_000),
          nonce: 1,
        },
        domain: {
          version: ContractsInterface.version,
          chainId: ContractsInterface.chainId,
          verifyingContract: ContractsInterface.NftMarket.address,
          name: 'NftBazaar.com',
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
    const nftAddress = writeContract({
      abi: ContractsInterface.MyNft.abi,
      address: ContractsInterface.MyNft.address,
      functionName: 'mint',
      args: [address, 'ipfs://1111'],
    });
    console.log(nftAddress);
  }

  async function handleTabChange(e, value) {
    setTabName(value);
  }

  return (
    <div>
      <Container maxWidth={'sm'} style={{ padding: 0 }}>
        <br />
        {/* <Divider>MINT YOUR NFT</Divider> */}
        <br />
        <TabContext value={tabName}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <TabList onChange={handleTabChange} aria-label="lab API tabs example">
              <Tab label="My Nft" value="MyNft" />
              <Tab label="Activity" value="Activity" />
            </TabList>
          </Box>
          <TabPanel value="MyNft">
            <Box style={{ textAlign: 'center' }}>
              <p>nft数量：{nftCount}</p>
              {isMinting ? (
                <LoadingButton loading variant="outlined">
                  Minting..
                </LoadingButton>
              ) : (
                <Button variant="contained" color="success" onClick={Mint}>
                  Mint
                </Button>
              )}
              <br />
              <br />

              <Stack direction="row" spacing={2}>
                {myNftList.map((item) => {
                  return <NftCard key={item.tokenId} owner={item.owner} tokenId={item.tokenId} />;
                })}
              </Stack>
            </Box>
          </TabPanel>
          <TabPanel value="Activity">
            <ul>
              {transfers.map((item) => {
                return (
                  <li key={item.blockTimestamp}>
                    <p>From【{item.from}】</p>
                    <p>To: 【{item.to}】</p>
                    <p>
                      TokenId: {item.tokenId} BlockNumber: {item.blockNumber} BlockTimestamp:{' '}
                      {item.blockTimestamp}
                    </p>
                  </li>
                );
              })}
            </ul>
          </TabPanel>
        </TabContext>
      </Container>
    </div>
  );
}
