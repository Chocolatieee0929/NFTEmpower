import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import { List, deList } from "../generated/NftMarket/NftMarket"

export function createListEvent(
  nftAddress: Address,
  tokenId: BigInt,
  seller: Address,
  price: BigInt
): List {
  let listEvent = changetype<List>(newMockEvent())

  listEvent.parameters = new Array()

  listEvent.parameters.push(
    new ethereum.EventParam(
      "nftAddress",
      ethereum.Value.fromAddress(nftAddress)
    )
  )
  listEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )
  listEvent.parameters.push(
    new ethereum.EventParam("seller", ethereum.Value.fromAddress(seller))
  )
  listEvent.parameters.push(
    new ethereum.EventParam("price", ethereum.Value.fromUnsignedBigInt(price))
  )

  return listEvent
}

export function createdeListEvent(
  nftAddress: Address,
  tokenId: BigInt
): deList {
  let deListEvent = changetype<deList>(newMockEvent())

  deListEvent.parameters = new Array()

  deListEvent.parameters.push(
    new ethereum.EventParam(
      "nftAddress",
      ethereum.Value.fromAddress(nftAddress)
    )
  )
  deListEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )

  return deListEvent
}
