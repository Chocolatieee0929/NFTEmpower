import Container from '@mui/material/Container';
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
import { useAccount } from 'wagmi';

const { default: ContractsInterface } = await import(`../contracts/${import.meta.env.VITE_NETWORK}.js`);

const TheGraphUrl = 'https://api.studio.thegraph.com/query/64098/nft-bazaar/version/latest';

async function fetchActivity() {
  const { data } = await axios.post(TheGraphUrl, {
    query: `{
        transfers(first: 100) {
          from
          to
          tokenId
          blockNumber
          blockTimestamp
          id
        }
      }`,
  });
  return data.data.transfers;
}

async function fetchListingNfts() {
  const { data } = await axios.post(TheGraphUrl, {
    query: `{
        nftHolders(first: 100, where: {owner: "${ContractsInterface.NftMarket.address}"}) {
          owner
          tokenId
          from
          id
          tokenAddress
        }
      }`,
  });
  return data.data.nftHolders;
}

export default function CreateNft() {
  const [isMinting, setIsMinting] = useState(false);
  const [tabName, setTabName] = useState('Listing');
  const [transfers, setTransfers] = useState([]);
  const [nftListing, setNftListing] = useState([]);
  const { address } = useAccount();

  useEffect(() => {
    fetchActivity(address).then((list) => {
      setTransfers(list);
    });
    fetchListingNfts(address).then((list) => {
      setNftListing(list);
    });
  }, [tabName, isMinting, address]);

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
              <Tab label="Listing Nft" value="Listing" />
              <Tab label="Activity" value="Activity" />
            </TabList>
          </Box>
          <TabPanel value="Listing">
            <Box style={{ textAlign: 'center' }}>
              <Stack direction="row" spacing={2}>
                {nftListing.map((item) => {
                  return (
                    <NftCard
                      key={item.tokenId}
                      owner={item.owner}
                      tokenId={item.tokenId}
                      isForSale
                      from={item.from}
                    />
                  );
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
