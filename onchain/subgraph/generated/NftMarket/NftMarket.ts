// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  ethereum,
  JSONValue,
  TypedMap,
  Entity,
  Bytes,
  Address,
  BigInt,
} from "@graphprotocol/graph-ts";

export class DeList extends ethereum.Event {
  get params(): DeList__Params {
    return new DeList__Params(this);
  }
}

export class DeList__Params {
  _event: DeList;

  constructor(event: DeList) {
    this._event = event;
  }

  get nftAddress(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get tokenId(): BigInt {
    return this._event.parameters[1].value.toBigInt();
  }
}

export class EIP712DomainChanged extends ethereum.Event {
  get params(): EIP712DomainChanged__Params {
    return new EIP712DomainChanged__Params(this);
  }
}

export class EIP712DomainChanged__Params {
  _event: EIP712DomainChanged;

  constructor(event: EIP712DomainChanged) {
    this._event = event;
  }
}

export class Listing extends ethereum.Event {
  get params(): Listing__Params {
    return new Listing__Params(this);
  }
}

export class Listing__Params {
  _event: Listing;

  constructor(event: Listing) {
    this._event = event;
  }

  get nftAddress(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get tokenId(): BigInt {
    return this._event.parameters[1].value.toBigInt();
  }

  get seller(): Address {
    return this._event.parameters[2].value.toAddress();
  }

  get price(): BigInt {
    return this._event.parameters[3].value.toBigInt();
  }
}

export class NftMarket__eip712DomainResult {
  value0: Bytes;
  value1: string;
  value2: string;
  value3: BigInt;
  value4: Address;
  value5: Bytes;
  value6: Array<BigInt>;

  constructor(
    value0: Bytes,
    value1: string,
    value2: string,
    value3: BigInt,
    value4: Address,
    value5: Bytes,
    value6: Array<BigInt>,
  ) {
    this.value0 = value0;
    this.value1 = value1;
    this.value2 = value2;
    this.value3 = value3;
    this.value4 = value4;
    this.value5 = value5;
    this.value6 = value6;
  }

  toMap(): TypedMap<string, ethereum.Value> {
    let map = new TypedMap<string, ethereum.Value>();
    map.set("value0", ethereum.Value.fromFixedBytes(this.value0));
    map.set("value1", ethereum.Value.fromString(this.value1));
    map.set("value2", ethereum.Value.fromString(this.value2));
    map.set("value3", ethereum.Value.fromUnsignedBigInt(this.value3));
    map.set("value4", ethereum.Value.fromAddress(this.value4));
    map.set("value5", ethereum.Value.fromFixedBytes(this.value5));
    map.set("value6", ethereum.Value.fromUnsignedBigIntArray(this.value6));
    return map;
  }

  getFields(): Bytes {
    return this.value0;
  }

  getName(): string {
    return this.value1;
  }

  getVersion(): string {
    return this.value2;
  }

  getChainId(): BigInt {
    return this.value3;
  }

  getVerifyingContract(): Address {
    return this.value4;
  }

  getSalt(): Bytes {
    return this.value5;
  }

  getExtensions(): Array<BigInt> {
    return this.value6;
  }
}

export class NftMarket extends ethereum.SmartContract {
  static bind(address: Address): NftMarket {
    return new NftMarket("NftMarket", address);
  }

  eip712Domain(): NftMarket__eip712DomainResult {
    let result = super.call(
      "eip712Domain",
      "eip712Domain():(bytes1,string,string,uint256,address,bytes32,uint256[])",
      [],
    );

    return new NftMarket__eip712DomainResult(
      result[0].toBytes(),
      result[1].toString(),
      result[2].toString(),
      result[3].toBigInt(),
      result[4].toAddress(),
      result[5].toBytes(),
      result[6].toBigIntArray(),
    );
  }

  try_eip712Domain(): ethereum.CallResult<NftMarket__eip712DomainResult> {
    let result = super.tryCall(
      "eip712Domain",
      "eip712Domain():(bytes1,string,string,uint256,address,bytes32,uint256[])",
      [],
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(
      new NftMarket__eip712DomainResult(
        value[0].toBytes(),
        value[1].toString(),
        value[2].toString(),
        value[3].toBigInt(),
        value[4].toAddress(),
        value[5].toBytes(),
        value[6].toBigIntArray(),
      ),
    );
  }

  isValidErc20(erc20: Address): boolean {
    let result = super.call("isValidErc20", "isValidErc20(address):(bool)", [
      ethereum.Value.fromAddress(erc20),
    ]);

    return result[0].toBoolean();
  }

  try_isValidErc20(erc20: Address): ethereum.CallResult<boolean> {
    let result = super.tryCall("isValidErc20", "isValidErc20(address):(bool)", [
      ethereum.Value.fromAddress(erc20),
    ]);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBoolean());
  }

  nonces(owner: Address): BigInt {
    let result = super.call("nonces", "nonces(address):(uint256)", [
      ethereum.Value.fromAddress(owner),
    ]);

    return result[0].toBigInt();
  }

  try_nonces(owner: Address): ethereum.CallResult<BigInt> {
    let result = super.tryCall("nonces", "nonces(address):(uint256)", [
      ethereum.Value.fromAddress(owner),
    ]);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  recoverSig(
    seller: Address,
    tokenId: i32,
    price: BigInt,
    deadline: i32,
    v: i32,
    r: Bytes,
    s: Bytes,
  ): Address {
    let result = super.call(
      "recoverSig",
      "recoverSig(address,uint8,uint256,uint16,uint8,bytes32,bytes32):(address)",
      [
        ethereum.Value.fromAddress(seller),
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(tokenId)),
        ethereum.Value.fromUnsignedBigInt(price),
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(deadline)),
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(v)),
        ethereum.Value.fromFixedBytes(r),
        ethereum.Value.fromFixedBytes(s),
      ],
    );

    return result[0].toAddress();
  }

  try_recoverSig(
    seller: Address,
    tokenId: i32,
    price: BigInt,
    deadline: i32,
    v: i32,
    r: Bytes,
    s: Bytes,
  ): ethereum.CallResult<Address> {
    let result = super.tryCall(
      "recoverSig",
      "recoverSig(address,uint8,uint256,uint16,uint8,bytes32,bytes32):(address)",
      [
        ethereum.Value.fromAddress(seller),
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(tokenId)),
        ethereum.Value.fromUnsignedBigInt(price),
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(deadline)),
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(v)),
        ethereum.Value.fromFixedBytes(r),
        ethereum.Value.fromFixedBytes(s),
      ],
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }
}

export class ConstructorCall extends ethereum.Call {
  get inputs(): ConstructorCall__Inputs {
    return new ConstructorCall__Inputs(this);
  }

  get outputs(): ConstructorCall__Outputs {
    return new ConstructorCall__Outputs(this);
  }
}

export class ConstructorCall__Inputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }

  get _tokenAddress(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class ConstructorCall__Outputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }
}

export class DefaultCall extends ethereum.Call {
  get inputs(): DefaultCall__Inputs {
    return new DefaultCall__Inputs(this);
  }

  get outputs(): DefaultCall__Outputs {
    return new DefaultCall__Outputs(this);
  }
}

export class DefaultCall__Inputs {
  _call: DefaultCall;

  constructor(call: DefaultCall) {
    this._call = call;
  }
}

export class DefaultCall__Outputs {
  _call: DefaultCall;

  constructor(call: DefaultCall) {
    this._call = call;
  }
}

export class BuyNftCall extends ethereum.Call {
  get inputs(): BuyNftCall__Inputs {
    return new BuyNftCall__Inputs(this);
  }

  get outputs(): BuyNftCall__Outputs {
    return new BuyNftCall__Outputs(this);
  }
}

export class BuyNftCall__Inputs {
  _call: BuyNftCall;

  constructor(call: BuyNftCall) {
    this._call = call;
  }

  get nftAddress(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get tokenId(): i32 {
    return this._call.inputValues[1].value.toI32();
  }

  get price(): BigInt {
    return this._call.inputValues[2].value.toBigInt();
  }

  get deadline(): BigInt {
    return this._call.inputValues[3].value.toBigInt();
  }

  get v(): i32 {
    return this._call.inputValues[4].value.toI32();
  }

  get r(): Bytes {
    return this._call.inputValues[5].value.toBytes();
  }

  get s(): Bytes {
    return this._call.inputValues[6].value.toBytes();
  }
}

export class BuyNftCall__Outputs {
  _call: BuyNftCall;

  constructor(call: BuyNftCall) {
    this._call = call;
  }
}

export class TokenReceiveCall extends ethereum.Call {
  get inputs(): TokenReceiveCall__Inputs {
    return new TokenReceiveCall__Inputs(this);
  }

  get outputs(): TokenReceiveCall__Outputs {
    return new TokenReceiveCall__Outputs(this);
  }
}

export class TokenReceiveCall__Inputs {
  _call: TokenReceiveCall;

  constructor(call: TokenReceiveCall) {
    this._call = call;
  }

  get from(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get to(): Address {
    return this._call.inputValues[1].value.toAddress();
  }

  get value(): BigInt {
    return this._call.inputValues[2].value.toBigInt();
  }

  get data(): Bytes {
    return this._call.inputValues[3].value.toBytes();
  }
}

export class TokenReceiveCall__Outputs {
  _call: TokenReceiveCall;

  constructor(call: TokenReceiveCall) {
    this._call = call;
  }
}