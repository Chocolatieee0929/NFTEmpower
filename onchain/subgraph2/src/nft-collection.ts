import { Transfer as TransferEvent } from '../generated/templates/NftCollection/NftCollection';
import { NftTransfer, NftTracer } from '../generated/schema';
import { BigInt } from '@graphprotocol/graph-ts';

export function handleTransfer(event: TransferEvent): void {
  let entity = new NftTransfer(event.transaction.hash.concatI32(event.logIndex.toI32()));
  entity.from = event.params.from;
  entity.to = event.params.to;
  entity.tokenId = event.params.tokenId;
  entity.nft = event.address;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();

  let nftId = event.address.toHex() + '-' + event.params.tokenId.toString();

  // // string to bytes
  let holder = NftTracer.load(nftId);
  if (holder == null) {
    holder = new NftTracer(nftId);
  }
  holder.tokenId = event.params.tokenId;
  holder.nft = event.address;
  holder.owner = event.params.to;
  holder.from = event.params.from;
  holder.isSell = false;
  holder.price = new BigInt(0);
  holder.save();
}
