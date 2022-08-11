import { BufferCV, callReadOnlyFunction, ListCV, TupleCV, uintCV, UIntCV } from '@stacks/transactions'

import { cvToBuffer } from '../../lib/Utils.js'
import { ClarityValue } from '@stacks/transactions/src/clarity/clarityValue'

const { CLARITY_BITCOIN_CONTRACT_NAME, CLARITY_BITCOIN_CONTRACT_ADDRESS, NETWORK, SENDER_ADDRESS } = process.env

export type TxOutputCV = {
    value: UIntCV
    scriptPubKey: BufferCV
}

export type TxInputOutpoint = {
    hash: BufferCV
    index: UIntCV
}

export type TxInputCV = {
    outpoint: TupleCV<TxInputOutpoint>
    scriptSig: BufferCV
    sequence: UIntCV
}

export type TxDataCV = {
    version: BufferCV
    ins: ListCV<TupleCV<TxInputCV>>
    outs: ListCV<TupleCV<TxOutputCV>>
    locktime: BufferCV
}

export type CompactHeaderDataCV = {
    header: BufferCV
    height: UIntCV
}

export type HeaderDataCV = {
    version: BufferCV
    parent: BufferCV
    'merkle-root': BufferCV
    timestamp: BufferCV
    nbits: BufferCV
    nonce: BufferCV
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

export const verifyCompactTx = (header: TupleCV, tx: BufferCV, proof: TupleCV): Promise<ClarityValue> =>
    callReadOnlyFunction({
        contractName: CLARITY_BITCOIN_CONTRACT_NAME as string,
        contractAddress: CLARITY_BITCOIN_CONTRACT_ADDRESS as string,
        functionName: 'was-tx-mined-compact',
        functionArgs: [header, tx, proof],
        network: NETWORK as any,
        senderAddress: SENDER_ADDRESS as string,
    })

export const verifyTx = (header: TupleCV, tx: BufferCV, proof: TupleCV): Promise<ClarityValue> =>
    callReadOnlyFunction({
        contractName: CLARITY_BITCOIN_CONTRACT_NAME as string,
        contractAddress: CLARITY_BITCOIN_CONTRACT_ADDRESS as string,
        functionName: 'was-tx-mined',
        functionArgs: [header, tx, proof],
        network: NETWORK as any,
        senderAddress: SENDER_ADDRESS as string,
    })

export const concatHeader = (header: TupleCV): Promise<ClarityValue> =>
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

export const getBlockHeaderHash = (stxBlockHeight: number): Promise<ClarityValue> =>
    // (get-bc-h-hash (bh uint))
    callReadOnlyFunction({
        contractName: CLARITY_BITCOIN_CONTRACT_NAME as string,
        contractAddress: CLARITY_BITCOIN_CONTRACT_ADDRESS as string,
        functionName: 'get-bc-h-hash',
        functionArgs: [uintCV(stxBlockHeight)],
        network: NETWORK as any,
        senderAddress: SENDER_ADDRESS as string,
    })

export const calculateTxId = (tx: BufferCV): Promise<ClarityValue> =>
    // (get-txid (tx (buff 1024)))
    callReadOnlyFunction({
        contractName: CLARITY_BITCOIN_CONTRACT_NAME as string,
        contractAddress: CLARITY_BITCOIN_CONTRACT_ADDRESS as string,
        functionName: 'get-txid',
        functionArgs: [tx],
        network: NETWORK as any,
        senderAddress: SENDER_ADDRESS as string,
    })
