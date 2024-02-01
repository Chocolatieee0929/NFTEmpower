import { NftCreated as NftCreatedEvent } from '../generated/NftFactory/NftFactory';
import { NftCreated } from '../generated/schema';
import { NftCollection } from '../generated/templates';

export function handleNftCreated(event: NftCreatedEvent): void {
  let entity = new NftCreated(event.transaction.hash.concatI32(event.logIndex.toI32()));
  NftCollection.create(event.params.nftAddress);

  entity.nftAddress = event.params.nftAddress;
  entity.owner = event.params.owner;

  entity.name = event.params.name;
  entity.symbol = event.params.symbol;
  entity.mintPrice = event.params.mintPrice;
  entity.maxSupply = event.params.maxSupply;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}
