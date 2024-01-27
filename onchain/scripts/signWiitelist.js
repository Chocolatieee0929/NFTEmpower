const hre = require('hardhat');
const deployerPrivateKey = require('../config/hardhat-wallets')[0].privateKey;

/**
 * 对某个地址进行白名单签名
 */
async function main() {
  // create a wallet instance/signer from a private key
  const wallet = new hre.ethers.Wallet(deployerPrivateKey);
  // const signer = wallet.connect(hre.ethers.provider);
  const signTypedData = {
    domain: {
      version: '1',
      name: 'witelist',
      chainId: 1337,
      verifyingContract: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    },
    primaryType: 'whiteList',
    types: {
      EIP712Domain: [],
      Message: [{ name: 'white', type: 'Info' }],
      Info: [
        { name: 'address', type: 'address' },
        { name: 'nftAddress', type: 'address' },
      ],
      xxx: [{ name: 'sdfsf', type: 'address' }],
    },
    message: {
      white: {
        address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        nftAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      },
    },
  };
  const sig = await wallet.signTypedData(signTypedData.domain, signTypedData.types, signTypedData.message);
  console.log(sig);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
