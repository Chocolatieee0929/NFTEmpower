import { newMockEvent } from "matchstick-as"
import { ethereum, Address } from "@graphprotocol/graph-ts"
import { NftCreated } from "../generated/NftFactory/NftFactory"

export function createNftCreatedEvent(
  nftAddress: Address,
  owner: Address
): NftCreated {
  let nftCreatedEvent = changetype<NftCreated>(newMockEvent())

  nftCreatedEvent.parameters = new Array()

  nftCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "nftAddress",
      ethereum.Value.fromAddress(nftAddress)
    )
  )
  nftCreatedEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )

  return nftCreatedEvent
}
