import { useEffect } from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import propTypes from 'prop-types';
import { useAccount, useReadContract, useSignTypedData, useWriteContract } from 'wagmi';
import { formatEther, getContract, parseUnits } from 'viem';

const { default: ContractsInterface } = await import(`../contracts/${import.meta.env.VITE_NETWORK}.js`);

// async function sellNft(signer, tokenId, price) {
//   const myNftContract = new Contract(MyNftDeployData.address, MyNftDeployData.abi, signer);
//   const nftMarketContract = new Contract(NftMarketDeployData.address, NftMarketDeployData.abi, signer);

//   const approvedAddress = await myNftContract.getApproved(ethers.BigNumber.from(tokenId));
//   let tx;
//   if (approvedAddress !== NftMarketDeployData.address) {
//     tx = await myNftContract.approve(NftMarketDeployData.address, ethers.BigNumber.from(tokenId));
//     await tx.wait();
//   }
//   tx = await nftMarketContract.listNFT(
//     MyNftDeployData.address,
//     ethers.BigNumber.from(tokenId),
//     ethers.utils.parseEther(price)
//   );
//   tx.wait();
//   console.log(tx);
// }

// async function buyNft(signer, seller, tokenId) {
//   const amount = ethers.utils.parseEther('0.1');
//   const tokenContract = new Contract(TokenDeployData.address, TokenDeployData.abi, signer);
//   const nftMarketContract = new Contract(NftMarketDeployData.address, NftMarketDeployData.abi, signer);

//   const approvedAmount = await tokenContract.allowance(await signer.getAddress(), seller);

//   console.log(ethers.utils.formatUnits(approvedAmount, 18), amount);
//   let tx;
//   if (approvedAmount || approvedAmount < amount) {
//     console.log('go to approve');
//     tx = await tokenContract.approve(seller, amount);
//     await tx.wait();
//   }
//   console.log('go to buy');
//   tx = await nftMarketContract.buyNFT(MyNftDeployData.address, ethers.BigNumber.from(tokenId), amount);
//   tx.wait();
//   console.log(tx);
// }

export default function NftCard({ owner, tokenId, name, from, imageUri, price, isForSale }) {
  const { address } = useAccount();
  const { data: hash, isPending, writeContract } = useWriteContract();
  const { signTypedData } = useSignTypedData();
  const amount = 1;
  function buyNft() {
    writeContract({
      address: ContractsInterface.NftMarket.address,
      abi: ContractsInterface.NftMarket.abi,
      method: 'buyNFT',
      args: [ContractsInterface.MyNft1.address, tokenId, price],
    });
  }
  console.log('sdfds');

  async function sellNft() {
    // writeContract({
    //   address: ContractsInterface.NftMarket.address,
    //   abi: ContractsInterface.NftMarket.abi,
    //   method: 'listNFT',
    //   args: [ContractsInterface.MyNft.address, tokenId, price],
    // });
  }

  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardMedia component="img" alt="" height="140" image="/static/images/cards/contemplative-reptile.jpg" />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {tokenId}
          {isForSale ? <span> For Sale: {price}</span> : null}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {isForSale ? <span>seller: {from}</span> : <span>owner: {owner}</span>}
        </Typography>
      </CardContent>
      <CardActions>
        {isForSale ? (
          <Button size="small" onClick={() => buyNft()}>
            Buy
          </Button>
        ) : (
          <Button size="small" onClick={() => sellNft()}>
            Sell
          </Button>
        )}
      </CardActions>
    </Card>
  );
}

NftCard.propTypes = {
  owner: propTypes.string.isRequired,
  from: propTypes.string,
  tokenId: propTypes.string.isRequired,
  name: propTypes.string,
  imageUri: propTypes.string,
  price: propTypes.number,
  isForSale: propTypes.bool,
};
