import { BigInt } from '@graphprotocol/graph-ts';
import { NftMarket, DeList, Listing } from '../generated/NftMarket/NftMarket';
import { NftTracer, NftListing } from '../generated/schema';
import { store } from '@graphprotocol/graph-ts';

export function handleDeList(event: DeList): void {
  let nftId = event.params.nftAddress.toHex() + '-' + event.params.tokenId.toString();
  store.remove('NftListing', nftId);
  let tracer = NftTracer.load(nftId);
  tracer!.isSell = false;
  tracer!.price = new BigInt(0);
  tracer!.save();

  // // Entities can be loaded from the store using a string ID; this ID
  // // needs to be unique across all entities of the same type
  // let entity = ExampleEntity.load(event.transaction.from);

  // // Entities only exist after they have been saved to the store;
  // // `null` checks allow to create entities on demand
  // if (!entity) {
  //   entity = new ExampleEntity(event.transaction.from);

  //   // Entity fields can be set using simple assignments
  //   entity.count = BigInt.fromI32(0);
  // }

  // // BigInt and BigDecimal math are supported
  // // entity.count = entity.count + BigInt.fromI32(1)

  // // Entity fields can be set based on event parameters
  // entity.nftAddress = event.params.nftAddress;
  // entity.tokenId = event.params.tokenId;

  // // Entities can be written to the store with `.save()`
  // entity.save();

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

export function handleListing(event: Listing): void {
  let nftId = event.params.nftAddress.toHex() + '-' + event.params.tokenId.toString();
  let entity = NftListing.load(nftId);
  let tracer = NftTracer.load(nftId);
  if (!entity) {
    entity = new NftListing(nftId);
  }

  entity.nft = event.params.nftAddress;
  entity.tokenId = event.params.tokenId;
  entity.price = event.params.price;
  entity.owner = event.params.seller;

  tracer!.isSell = true;
  tracer!.price = event.params.price;
  tracer!.save();

  entity.save();
}
