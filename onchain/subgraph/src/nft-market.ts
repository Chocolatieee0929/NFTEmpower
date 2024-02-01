import {
  DeList as DeListEvent,
  EIP712DomainChanged as EIP712DomainChangedEvent,
  Listing as ListingEvent,
} from "../generated/NftMarket/NftMarket"
import { DeList, EIP712DomainChanged, Listing } from "../generated/schema"

export function handleDeList(event: DeListEvent): void {
  let entity = new DeList(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.nftAddress = event.params.nftAddress
  entity.tokenId = event.params.tokenId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleEIP712DomainChanged(
  event: EIP712DomainChangedEvent,
): void {
  let entity = new EIP712DomainChanged(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleListing(event: ListingEvent): void {
  let entity = new Listing(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.nftAddress = event.params.nftAddress
  entity.tokenId = event.params.tokenId
  entity.seller = event.params.seller
  entity.price = event.params.price

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
