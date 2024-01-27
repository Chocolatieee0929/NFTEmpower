import { BigInt } from '@graphprotocol/graph-ts';
import { NftCreated as NftCreatedEvent } from '../generated/NftFactory/NftFactory';
import { NftCreated } from '../generated/schema';
import { NftCollection } from '../generated/templates';

export function handleNftCreated(event: NftCreatedEvent): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  let entity = new NftCreated(event.transaction.hash.concatI32(event.logIndex.toI32()));

  NftCollection.create(event.params.nftAddress);
  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand

  // BigInt and BigDecimal math are supported
  // entity.count = entity.count + BigInt.fromI32(1);

  // Entity fields can be set based on event parameters
  entity.nft = event.params.nftAddress;
  entity.owner = event.params.owner;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  // Entities can be written to the store with `.save()`
  entity.save();

  // Note: If a handler doesn't require existing field values, it is faster
  // _not_ to load the entity from the store. Instead, create it fresh with
  // `new Entity(...)`, set the fields that should be updated and save the
  // entity back to the store. Fields that were not set or unset remain
  // unchanged, allowing for partial updates to be applied.

  // It is also possible to access smart contracts from mappings. For
  // example, the contract that has emitted the event can be connected to
  // with:
  //
  // let contract = Contract.bind(event.address)
  //
  // The following functions can then be called on this contract to access
  // state variables and other data:
  //
  // - contract.isValidErc20(...)
  // - contract.nftsListed(...)
  // - contract.recoverSig(...)
}
