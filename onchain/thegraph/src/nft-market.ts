import {
  List as ListEvent,
  deList as deListEvent,
} from "../generated/NftMarket/NftMarket"
import { List, deList } from "../generated/schema"

export function handleList(event: ListEvent): void {
  let entity = new List(
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

export function handledeList(event: deListEvent): void {
  let entity = new deList(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.nftAddress = event.params.nftAddress
  entity.tokenId = event.params.tokenId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
