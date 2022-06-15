import {getBlock, getBlockHeader, getRawTransaction} from "./rpcclient.js" // TODO Why is the .js extension required?
import {
    BufferCV,
    bufferCV,
    callReadOnlyFunction,
    ClarityValue,
    cvToValue,
    listCV,
    tupleCV,
    uintCV,
} from "@stacks/transactions"
import 'dotenv/config'
import {MerkleTree} from "merkletreejs"
import SHA256 from "crypto-js/sha256.js"
import {verifyBlockHeader} from "./ClarityBitcoinClient.js"
import {getStxBlockHeight} from "./BlockApiClient.js"

const {
    CLARITY_BITCOIN_CONTRACT_NAME,
    CLARITY_BITCOIN_CONTRACT_ADDRESS,
    NETWORK,
    SENDER_ADDRESS
} = process.env

interface ProvableTx {
    tx: Buffer,
    txId: string,
    txIndex: number,
    stxBlockHeight: number,
    blockHeader: Buffer,
    proof: Buffer[],
}

const txid = "20f85e35d02e28ac89db8764e280db560de1baaa3ce66f15dcea349fb137879c"

const reverseBuffer = (src: Buffer): Buffer => {
    var buffer = Buffer.alloc(src.length)
    for (var i = 0, j = src.length - 1; i <= j; ++i, --j) {
        buffer[i] = src[j]
        buffer[j] = src[i]
    }
    return buffer
}

const getTxProof = async (txId: string): Promise<ProvableTx> => {
    // TODO Make this work for segwit txs
    // console.log(await getRawTransaction(txid, true))
    const { blockhash, hex } = await getRawTransaction(txid, true)
    const tx = Buffer.from(hex, 'hex')
    // console.log(tx.length)
    const blockHeader = Buffer.from(await getBlockHeader(blockhash), 'hex')
    // console.log(reverseBuffer(blockHeader.subarray(36, 68)).toString('hex'))
    const { tx: txIds, height } = await getBlock(blockhash, 1)
    const stxBlockHeight = await getStxBlockHeight(height) as number
    const txIndex = txIds.findIndex((id: string) => id === txId);
    const tree = new MerkleTree(txIds, SHA256, { isBitcoinTree: true });
    // console.log(tree.toString())
    const treeDepth = tree.getDepth();
    const proof = tree.getProof(txId, txIndex).map(p => p.data);

    console.assert(proof.length === treeDepth, "treeDepth and proof don't match")

    return { tx, txId, txIndex, stxBlockHeight, blockHeader, proof }
}


const getBlockHeaderHash = async (blockHeight: number): Promise<any> => {
    // (get-bc-h-hash (bh uint))
    const functionName = 'get-bc-h-hash'
    const functionArgs: ClarityValue[] = [
        uintCV(58225)
    ]

    const result = await callReadOnlyFunction({
        contractName: CLARITY_BITCOIN_CONTRACT_NAME as string,
        contractAddress: CLARITY_BITCOIN_CONTRACT_ADDRESS as string,
        functionName,
        functionArgs,
        network: NETWORK as any,
        senderAddress: SENDER_ADDRESS as string,
    })
    return cvToValue(result)

}

const getReversedTxId = async ({tx, txId}: ProvableTx): Promise<any> => {
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
    })
    console.assert(reverseBuffer(Buffer.from(txId, 'hex')).toString('hex') === cvToValue(result), txId)
    return cvToValue(result)
}

const verifyProofOnStacks = async ({ stxBlockHeight, blockHeader, tx, txIndex, proof }: ProvableTx): Promise<boolean> => {
    console.assert(blockHeader.length === 80, "header length incorrect")
    console.assert(tx.length <= 1024, "tx too long")
    // console.log(proof.map(p => p.toString('hex')))
    // console.log(txIndex)

    const functionName = 'was-tx-mined-compact'
    const functionArgs: ClarityValue[] = [
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
    ]
    const result = await callReadOnlyFunction({
        contractName: CLARITY_BITCOIN_CONTRACT_NAME as string,
        contractAddress: CLARITY_BITCOIN_CONTRACT_ADDRESS as string,
        functionName,
        functionArgs,
        network: NETWORK as any,
        senderAddress: SENDER_ADDRESS as string,
    })
    return cvToValue(result).value
}

getTxProof(txid)
    // .then(getBlockHeaderHash)
    .then(({blockHeader, stxBlockHeight}: ProvableTx): Promise<boolean> =>
        verifyBlockHeader(blockHeader, stxBlockHeight))
    // .then(verifyProofOnStacks)
    // .then(getReversedTxId)
    .then(console.log)
    .catch(console.error)