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
// import NftCard from '../components/NftCard';
import Stack from '@mui/material/Stack';
import { useAccount, useReadContract, useWriteContract, useSignTypedData } from 'wagmi';
import { get } from 'radash';
import { formatEther, parseEther, getContract, parseUnits } from 'viem';
import { useParams } from 'react-router-dom';

const { default: ContractsInterface } = await import(`../../../contracts/${import.meta.env.VITE_NETWORK}.js`);

console.log(ContractsInterface);
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
  const { data: hash, isPending: isMinting, writeContract } = useWriteContract();
  const { signTypedData } = useSignTypedData();
  const { nftAddress } = useParams();
  // useEffect(() => {
  //   fetchActivity(address).then((list) => {
  //     setTransfers(list);
  //   });
  //   fetchMyNfts(address).then((list) => {
  //     setMyNftList(list);
  //   });
  // }, [tabName, isMinting, address]);

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
    const data = writeContract(
      {
        abi: ContractsInterface.NftCollection.abi,
        address: nftAddress,
        functionName: 'mintNft',
        args: [account.address],
        account,
        value: parseEther('0.0001'),
      },
      {
        onSettled(receipt) {
          console.log(receipt);
        },
        onError(e) {
          console.log(e);
        },
      }
    );
    console.log(data);
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
              <p>nft数量：</p>
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

              {/* <Stack direction="row" spacing={2}>
                {myNftList.map((item) => {
                  return <NftCard key={item.tokenId} owner={item.owner} tokenId={item.tokenId} />;
                })}
              </Stack> */}
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
