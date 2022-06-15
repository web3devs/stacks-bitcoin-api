import {BufferCV, bufferCV, callReadOnlyFunction, ClarityValue, cvToValue, uintCV} from "@stacks/transactions";

const {
    CLARITY_BITCOIN_CONTRACT_NAME,
    CLARITY_BITCOIN_CONTRACT_ADDRESS,
    NETWORK,
    SENDER_ADDRESS
} = process.env

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

const cvToBuffer = (cv: BufferCV): Buffer => Buffer.from(cvToValue(cv).slice(2), 'hex')
export const getReversedTxId = async (tx: Buffer): Promise<Buffer> => {
    // (define-read-only (get-reversed-txid (tx (buff 1024)))
    const functionName = 'get-reversed-txid'
    const functionArgs: ClarityValue[] = [
        bufferCV(tx)
    ]

    const result = await callReadOnlyFunction({
        contractName: CLARITY_BITCOIN_CONTRACT_NAME as string,
        contractAddress: CLARITY_BITCOIN_CONTRACT_ADDRESS as string,
        functionName,
        functionArgs,
        network: NETWORK as any,
        senderAddress: SENDER_ADDRESS as string,
    }) as BufferCV
    return cvToBuffer(result)
}
