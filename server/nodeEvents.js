/**
 * 用 etherjs 監聽區塊鏈事件
 */

import { ethers, utils } from "ethers";
import * as tokenContract from "./compiled-contract/token.js";
import * as nftContractData from "./compiled-contract/nft.js";
import * as nftMarketContractData from "./compiled-contract/nft-market.js";

import db from "./db.js";

export default async function runListener() {
  const provider = new ethers.providers.JsonRpcProvider(
    "http://127.0.0.1:8545",
  );

  provider.on("error", (error) => console.log(error));
  // 判断连接是否成功
  provider.on("pending", (tx) => console.log("pending", tx));
  // 监听新的区块
  provider.on("block", (blockNumber) => console.log("new block", blockNumber));

  const nftContract = new ethers.Contract(
    nftContractData.contractAddress,
    nftContractData.contractABI,
    provider,
  );
  const nftMarketContract = new ethers.Contract(
    nftMarketContractData.contractAddress,
    nftMarketContractData.contractABI,
    provider,
  );

  console.log(" start listen contract events...");
  // listen contract events

  nftContract.on("Transfer", (from, to, tokenId, event) => {
    console.log("nft Transfer", from, to, tokenId);
    tokenId = utils.formatUnits(tokenId, 0);
    db.update(
      {
        tokenId,
      },
      {
        transactionHash: event.transactionHash,
        owner: to,
        tokenId,
        from,
      },
      {
        upsert: true,
      },
    );
  });

  nftMarketContract.on("List", (nftAddress, tokenId, seller, price) => {
    console.log("nftMarket List", nftAddress, tokenId, seller, price);
    tokenId = utils.formatUnits(tokenId, 0);

    db.update(
      {
        tokenId,
        owner: nftMarketContractData.contractAddress,
      },
      {
        tokenId,
        owner: nftMarketContractData.contractAddress,
        seller,
        price: utils.formatUnits(price, 18),
      },
      {
        upsert: true,
      },
    );
  });

  nftMarketContract.on("deList", (nftAddress, tokenId) => {
    console.log("nftMarket deList", nftAddress, utils.formatUnits(tokenId, 0));
    // db.update({
    //   tokenId,
    // }, {
    //   tokenId,
    //   owner: nftMarketContractData.contractAddress,
    //   seller: '',
    //   price: 0
    // }, {
    //   upsert: true
    // })
  });
}
