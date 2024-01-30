// a form component build with mui framework for creating a new collection
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';
import { encodePacked, parseEther, parseUnits, keccak256 } from 'viem';
import { useEffect } from 'react';

const { default: ContractsInterface } = await import(`../../contracts/${import.meta.env.VITE_NETWORK}.js`);
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';

console.log('ContractsInterface', ContractsInterface);

export default function CollectionCreate() {
  const { data: hash, isPending, writeContract } = useWriteContract();
  const {
    data: nftAddress,
    isLoading,
    status,
  } = useWaitForTransactionReceipt({
    hash,
  });
  const { address } = useAccount();
  function handleSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    // eslint-disable-next-line no-console

    // console.log(ContractsInterface.NftFactory.abi);
    writeContract(
      {
        address: ContractsInterface.NftFactory.address,
        abi: ContractsInterface.NftFactory.abi,
        functionName: 'deployNft',
        args: [
          data.get('collectionName'),
          data.get('collectionSymbol'),
          parseUnits(data.get('collectionSupply')),
          parseEther(data.get('collectionMintPrice')),
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
          console.log('error', error);
        },
        onSuccess: (success) => {
          console.log('success', success);
        },
      }
    );
  }

  useEffect(() => {
    console.log(status, nftAddress);
  }, [status, nftAddress]);

  return (
    <Box
      sx={{
        marginTop: 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Typography component="h3" variant="h5">
        {isPending}Create Ysour NFT Collection{hash}
      </Typography>
      <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
        <Grid container spacing={2} maxWidth={400}>
          <Grid item xs={12}>
            <TextField
              name="collectionName"
              required
              fullWidth
              id="collectionName"
              label="Collection Name"
              autoFocus
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              id="collectionSymbol"
              label="Collection Symbol"
              name="collectionSymbol"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              id="collectionSupply"
              label="MaxSupply of NFTs"
              name="collectionSupply"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              name="collectionMintPrice"
              label="NFT Mint Price (ETH)"
              id="collectionMintPrice"
            />
          </Grid>
          {/* <Grid item xs={12}>
            <FormControlLabel
              control={<Checkbox value="allowExtraEmails" color="primary" />}
              label="I want to receive inspiration, marketing promotions and updates via email."
            />
          </Grid> */}
        </Grid>
        {!isPending && !isLoading ? (
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
            Start Create
          </Button>
        ) : (
          <LoadingButton loading fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
            Creating
          </LoadingButton>
        )}
      </Box>
    </Box>
  );
}
