// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library SigUtils {
    bytes32 private constant PERMIT_TYPEHASH =
        keccak256("List(address nftAddress,uint8 tokenId,uint256 price,uint256 nonce,uint256 deadline)");

    struct PermitParams {
        address nftAddress;
        uint8 tokenId;
        uint256 price;
        uint256 nonce;
        uint256 deadline;
    }

    function getStructHash(PermitParams memory params) internal pure returns (bytes32) {
        return keccak256(
            abi.encode(PERMIT_TYPEHASH, params.nftAddress, params.tokenId, params.price, params.nonce, params.deadline)
        );
    }

    // EIP712 = hash(19_01, DOMAINHASH, STRUCTHASH)
    function getTypeDataHash(bytes32 domainSeparator, PermitParams memory params)
        public
        pure
        returns (bytes32 digest)
    {
        bytes32 structHash = getStructHash(params);
        assembly {
            let ptr := mload(0x40)
            mstore(ptr, hex"1901")
            mstore(add(ptr, 0x02), domainSeparator)
            mstore(add(ptr, 0x22), structHash)
            digest := keccak256(ptr, 0x42)
        }
    }
}
