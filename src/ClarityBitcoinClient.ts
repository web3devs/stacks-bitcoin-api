import {
    broadcastTransaction,
    BufferCV,
    bufferCV,
    callReadOnlyFunction,
    cvToJSON,
    cvToValue,
    ListCV,
    listCV,
    SomeCV,
    TupleCV,
    tupleCV,
    TxBroadcastResult,
    uintCV,
    UIntCV
} from "@stacks/transactions";

import BN from "bn.js";
import {cvToBuffer, reverseBuffer} from "./utils.js";
import {ClarityValue} from "@stacks/transactions/src/clarity/clarityValue";

const {
    CLARITY_BITCOIN_CONTRACT_NAME,
    CACHE_TX_CONTRACT_NAME,
    CLARITY_BITCOIN_CONTRACT_ADDRESS,
    NETWORK,
    SENDER_ADDRESS,
} = process.env


// export const verifyBlockHeader = async (blockHeader: Buffer, stxBlockHeight: number): Promise<boolean> => {
//     // (verify-block-header (headerbuff (buff 80)) (expected-block-height uint))
//     const result = await callReadOnlyFunction({
//         contractName: CLARITY_BITCOIN_CONTRACT_NAME as string,
//         contractAddress: CLARITY_BITCOIN_CONTRACT_ADDRESS as string,
//         functionName: 'verify-block-header',
//         functionArgs: [
//             bufferCV(blockHeader),
//             uintCV(stxBlockHeight)
//         ],
//         network: NETWORK as any,
//         senderAddress: SENDER_ADDRESS as string,
//     })
//     return cvToValue(result)
// }

// export const verifyProof = async (
//     stxBlockHeight: number,
//     blockHeader: Buffer,
//     tx: Buffer,
//     txIndex: number,
//     proof: Buffer[]
// ): Promise<boolean> => {
//     console.assert(blockHeader.length === 80, "header length incorrect")
//     console.assert(tx.length <= 1024, "tx too long")
//
//     const result = await callReadOnlyFunction({
//         contractName: CLARITY_BITCOIN_CONTRACT_NAME as string,
//         contractAddress: CLARITY_BITCOIN_CONTRACT_ADDRESS as string,
//         functionName: 'was-tx-mined-compact',
//         functionArgs: [
//             tupleCV({
//                 header: bufferCV(blockHeader),
//                 height: uintCV(stxBlockHeight),
//             }),
//             bufferCV(tx),
//             tupleCV({
//                 "tx-index": uintCV(txIndex),
//                 hashes: listCV<BufferCV>(proof.map(hash => bufferCV(reverseBuffer(hash)))),
//                 "tree-depth": uintCV(proof.length)
//             })
//         ],
//         network: NETWORK as any,
//         senderAddress: SENDER_ADDRESS as string,
//     })
//     return cvToValue(result).value
// }
//
// export const getBlockHeaderHash = async (stxBlockHeight: number): Promise<Buffer> => {
//     // (get-bc-h-hash (bh uint))
//     const result = await callReadOnlyFunction({
//         contractName: CLARITY_BITCOIN_CONTRACT_NAME as string,
//         contractAddress: CLARITY_BITCOIN_CONTRACT_ADDRESS as string,
//         functionName: 'get-bc-h-hash',
//         functionArgs: [uintCV(stxBlockHeight)],
//         network: NETWORK as any,
//         senderAddress: SENDER_ADDRESS as string,
//     }) as SomeCV<BufferCV>
//     return cvToBuffer(result.value)
// }
//
// const numberToBufferCV = (value: BN | number | string, size: number = 8): BufferCV => bufferCV(reverseBuffer(Buffer.from(
//     new BN(value).toString(16, size * 2),
//     'hex'
// )))
//
// interface TxOutput {
//     value: BN,
//     scriptPubKey: Buffer
// }
//
// const txOutputToTupleCV = ({value, scriptPubKey}: TxOutput): TupleCV => tupleCV({
//     value: numberToBufferCV(value),
//     scriptPubKey: bufferCV(scriptPubKey)
// })
//
// export const concatOut = async (txOutput: TxOutput): Promise<Buffer> => {
//     const result = await callReadOnlyFunction({
//         contractName: CLARITY_BITCOIN_CONTRACT_NAME as string,
//         contractAddress: CLARITY_BITCOIN_CONTRACT_ADDRESS as string,
//         functionName: 'concat-out',
//         functionArgs: [
//             txOutputToTupleCV(txOutput),
//             bufferCV(Buffer.alloc(0))
//         ],
//         network: NETWORK as any,
//         senderAddress: SENDER_ADDRESS as string,
//     })
//     return cvToBuffer(result as BufferCV)
// }
//
// export const concatOuts = async (outputs: TxOutput[]): Promise<Buffer> => {
//     const result = await callReadOnlyFunction({
//         contractName: CLARITY_BITCOIN_CONTRACT_NAME as string,
//         contractAddress: CLARITY_BITCOIN_CONTRACT_ADDRESS as string,
//         functionName: 'concat-outs',
//         functionArgs: [
//             listCV<TupleCV>(outputs.map(txOutputToTupleCV)),
//         ],
//         network: NETWORK as any,
//         senderAddress: SENDER_ADDRESS as string,
//     })
//     return cvToBuffer(result as BufferCV)
// }

// interface TxInput {
//     txid: Buffer,
//     index: number,
//     scriptSig: Buffer,
//     sequence: number,
// }

// const txInputToTupleCV = ({txid, index, scriptSig, sequence}: TxInput) => tupleCV({
//     outpoint: tupleCV({
//         hash: bufferCV(reverseBuffer(txid)),
//         index: numberToBufferCV(index, 4)
//     }),
//     scriptSig: bufferCV(scriptSig),
//     sequence: numberToBufferCV(sequence, 4)
// })
//
// export const concatIns = async (txInputs: TxInput[]): Promise<Buffer> => {
//     const result = await callReadOnlyFunction({
//         contractName: CLARITY_BITCOIN_CONTRACT_NAME as string,
//         contractAddress: CLARITY_BITCOIN_CONTRACT_ADDRESS as string,
//         functionName: 'concat-in',
//         functionArgs: [
//             listCV<TupleCV>(txInputs.map(txInputToTupleCV))
//         ],
//         network: NETWORK as any,
//         senderAddress: SENDER_ADDRESS as string,
//     })
//     return cvToBuffer(result as BufferCV)
// }
//

export type TxOutputCV = {
    value: UIntCV,
    scriptPubKey: BufferCV
}

export type TxInputOutpoint = {
    hash: BufferCV,
    index: UIntCV
}

export type TxInputCV = {
    outpoint: TupleCV<TxInputOutpoint>,
    scriptSig: BufferCV,
    sequence: UIntCV
}

export type TxDataCV = {
    version: BufferCV,
    ins: ListCV<TupleCV<TxInputCV>>,
    outs: ListCV<TupleCV<TxOutputCV>>
    locktime: BufferCV
}

export type CompactHeaderDataCV = {
    header: BufferCV,
    height: UIntCV
}

export type HeaderDataCV = {
    version: BufferCV,
    parent: BufferCV,
    "merkle-root": BufferCV,
    timestamp: BufferCV,
    nbits: BufferCV,
    nonce: BufferCV,
    height: UIntCV
}

export const concatTx = async (tx: TupleCV<TxDataCV>): Promise<Buffer> => {
    const result = await callReadOnlyFunction({
        contractName: CLARITY_BITCOIN_CONTRACT_NAME as string,
        contractAddress: CLARITY_BITCOIN_CONTRACT_ADDRESS as string,
        functionName: 'concat-tx',
        functionArgs: [tx],
        network: NETWORK as any,
        senderAddress: SENDER_ADDRESS as string,
    })
    return cvToBuffer(result as BufferCV)
}

export const verifyCompactTx = (header: TupleCV, tx: BufferCV, proof: TupleCV,): Promise<ClarityValue> =>
    callReadOnlyFunction({
        contractName: CLARITY_BITCOIN_CONTRACT_NAME as string,
        contractAddress: CLARITY_BITCOIN_CONTRACT_ADDRESS as string,
        functionName: 'was-tx-mined-compact',
        functionArgs: [header, tx, proof],
        network: NETWORK as any,
        senderAddress: SENDER_ADDRESS as string,
    });

export const verifyTx = (header: TupleCV, tx: BufferCV, proof: TupleCV): Promise<ClarityValue> =>
    callReadOnlyFunction({
        contractName: CLARITY_BITCOIN_CONTRACT_NAME as string,
        contractAddress: CLARITY_BITCOIN_CONTRACT_ADDRESS as string,
        functionName: 'was-tx-mined',
        functionArgs: [header, tx, proof],
        network: NETWORK as any,
        senderAddress: SENDER_ADDRESS as string,
    })

export const concatHeader = (header: TupleCV,): Promise<ClarityValue> =>
    callReadOnlyFunction({
        contractName: CLARITY_BITCOIN_CONTRACT_NAME as string,
        contractAddress: CLARITY_BITCOIN_CONTRACT_ADDRESS as string,
        functionName: 'concat-header',
        functionArgs: [header],
        network: NETWORK as any,
        senderAddress: SENDER_ADDRESS as string,
    })

export const parseTx = (tx: BufferCV): Promise<ClarityValue> =>
    callReadOnlyFunction({
        contractName: CLARITY_BITCOIN_CONTRACT_NAME as string,
        contractAddress: CLARITY_BITCOIN_CONTRACT_ADDRESS as string,
        functionName: 'parse-tx',
        functionArgs: [tx],
        network: NETWORK as any,
        senderAddress: SENDER_ADDRESS as string,
    })

