import { Transfer as TransferEvent } from '../generated/NBToken/NBToken';
import { NbtTransfer } from '../generated/schema';

// export function handleApproval(event: ApprovalEvent): void {
//   let entity = new TokenApproval(
//     event.transaction.hash.concatI32(event.logIndex.toI32()),
//   )
//   entity.owner = event.params.owner
//   entity.spender = event.params.spender
//   entity.value = event.params.value

//   entity.blockNumber = event.block.number
//   entity.blockTimestamp = event.block.timestamp
//   entity.transactionHash = event.transaction.hash

//   entity.save()
// }

export function handleTransfer(event: TransferEvent): void {
  let entity = new NbtTransfer(event.transaction.hash.concatI32(event.logIndex.toI32()));
  entity.from = event.params.from;
  entity.to = event.params.to;
  entity.value = event.params.value;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}