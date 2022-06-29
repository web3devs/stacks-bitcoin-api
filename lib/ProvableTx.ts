import {hexOrBufferToBuffer, hexOrBufferToHex, numberToBuffer, reverseBuffer} from "./Utils.js"
import {getBlockStats, getRawBlockHeader, getTransactionDetails} from "./BitcoinRpcClient.js"
import {getStxBlockHeight} from "./BlockApiClient.js"
import {MerkleTree} from "merkletreejs"
import {BufferCV, bufferCV, listCV, tupleCV, uintCV} from "@stacks/transactions"
import SHA256 from "crypto-js/sha256.js"

interface ProvableTx {
    tx: Buffer,
    txId: Buffer,
    txIndex: number,
    stxBlockHeight: number,
    blockHeader: Buffer,
    proof: Buffer[],
    txDetail: any,
    blockDetail: any,
}

export const getTxProof = async (txId: string | Buffer): Promise<ProvableTx> => {
    // TODO Make this work for segwit txs
    // TODO add handling of unknown transaction errors
    const txIdHex = hexOrBufferToHex(txId)
    const txDetail = await getTransactionDetails(txIdHex)
    const blockHeader = Buffer.from(await getRawBlockHeader(txDetail.blockhash), 'hex')
    const blockDetail = await getBlockStats(txDetail.blockhash)
    const stxBlockHeight = await getStxBlockHeight(blockDetail.height) as number
    const txIndex = blockDetail.tx.findIndex((id: string) => id === txId)
    const tree = new MerkleTree(blockDetail.tx, SHA256, {isBitcoinTree: true})
    const proof = tree.getProof(blockDetail.tx, txIndex).map(p => p.data)
    return {
        tx: Buffer.from(txDetail.hex, "hex"),
        txId: hexOrBufferToBuffer(txId),
        txIndex,
        stxBlockHeight,
        blockHeader,
        proof,
        txDetail,
        blockDetail
    }
}

export const toCompactProofCV = (
    {
        tx,
        txIndex,
        proof,
        blockHeader,
        stxBlockHeight
    }: ProvableTx) => {
    return {
        compactHeader: tupleCV({
            header: bufferCV(blockHeader),
            height: uintCV(stxBlockHeight)
        }),
        tx: bufferCV(tx),
        proof: tupleCV({
            "tx-index": uintCV(txIndex),
            hashes: listCV<BufferCV>(proof.map(p => bufferCV(reverseBuffer(p)))),
            "tree-depth": uintCV(proof.length)
        }),
    }
}

export const toProofCV = (
    {
        tx,
        txIndex,
        proof,
        stxBlockHeight,
        blockDetail: {
            versionHex,
            previousblockhash,
            merkleroot,
            time,
            bits,
            nonce
        }
    }: ProvableTx) => ({
        header: tupleCV({
            version: bufferCV(reverseBuffer(Buffer.from(versionHex, 'hex'))),
            parent: bufferCV(reverseBuffer(Buffer.from(previousblockhash, 'hex'))),
            'merkle-root': bufferCV(reverseBuffer(Buffer.from(merkleroot, 'hex'))),
            timestamp: bufferCV(numberToBuffer(time, 4)),
            nbits: bufferCV(reverseBuffer(Buffer.from(bits, 'hex'))),
            nonce: bufferCV(numberToBuffer(nonce, 4)),
            height: uintCV(stxBlockHeight)
        }),
        tx: bufferCV(tx),
        proof: tupleCV({
            "tx-index": uintCV(txIndex),
            hashes: listCV<BufferCV>(proof.map(p => bufferCV(reverseBuffer(p)))),
            "tree-depth": uintCV(proof.length)
        })
    })
