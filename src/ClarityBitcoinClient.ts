import {
    BufferCV,
    bufferCV,
    callReadOnlyFunction,
    ClarityValue,
    cvToValue,
    listCV,
    tupleCV,
    uintCV
} from "@stacks/transactions";

const {
    CLARITY_BITCOIN_CONTRACT_NAME,
    CLARITY_BITCOIN_CONTRACT_ADDRESS,
    NETWORK,
    SENDER_ADDRESS
} = process.env

const reverseBuffer = (buffer: Buffer): Buffer => {
    for (let i = 0, j = buffer.length - 1; i < j; ++i, --j) {
        [buffer[i], buffer[j]] = [buffer[j], buffer[i]]
    }
    return buffer
}

console.assert(
    reverseBuffer(Buffer.from('00010203', 'hex'))
        .equals(Buffer.from('03020100', 'hex')),
    'Reverse buffer failed'
)

const cvToBuffer = (cv: BufferCV): Buffer => Buffer.from(cvToValue(cv).slice(2), 'hex')

export const verifyBlockHeader = async (blockHeader: Buffer, stxBlockHeight: number): Promise<boolean> => {
    // (verify-block-header (headerbuff (buff 80)) (expected-block-height uint))
    const result = await callReadOnlyFunction({
        contractName: CLARITY_BITCOIN_CONTRACT_NAME as string,
        contractAddress: CLARITY_BITCOIN_CONTRACT_ADDRESS as string,
        functionName: 'verify-block-header',
        functionArgs: [
            bufferCV(blockHeader),
            uintCV(stxBlockHeight)
        ],
        network: NETWORK as any,
        senderAddress: SENDER_ADDRESS as string,
    })
    return cvToValue(result)
}

export const getReversedTxId = async (tx: Buffer): Promise<Buffer> => {
    // (define-read-only (get-reversed-txid (tx (buff 1024)))
    const result = await callReadOnlyFunction({
        contractName: CLARITY_BITCOIN_CONTRACT_NAME as string,
        contractAddress: CLARITY_BITCOIN_CONTRACT_ADDRESS as string,
        functionName: 'get-reversed-txid',
        functionArgs: [bufferCV(tx)],
        network: NETWORK as any,
        senderAddress: SENDER_ADDRESS as string,
    }) as BufferCV
    return cvToBuffer(result)
}

export const verifyProofOnStacks = async (stxBlockHeight: number, blockHeader: Buffer, tx: Buffer, txIndex: number, proof: Buffer[]): Promise<boolean> => {
    console.assert(blockHeader.length === 80, "header length incorrect")
    console.assert(tx.length <= 1024, "tx too long")

    const result = await callReadOnlyFunction({
        contractName: CLARITY_BITCOIN_CONTRACT_NAME as string,
        contractAddress: CLARITY_BITCOIN_CONTRACT_ADDRESS as string,
        functionName: 'was-tx-mined-compact',
        functionArgs: [
            tupleCV({
                header: bufferCV(blockHeader),
                height: uintCV(stxBlockHeight),
            }),
            bufferCV(tx),
            tupleCV({
                "tx-index": uintCV(txIndex),
                hashes: listCV<BufferCV>(proof.map(hash => bufferCV(reverseBuffer(hash)))),
                "tree-depth": uintCV(proof.length)
            })
        ],
        network: NETWORK as any,
        senderAddress: SENDER_ADDRESS as string,
    })
    return cvToValue(result).value
}
