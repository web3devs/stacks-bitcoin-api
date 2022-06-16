import {getBlock, getBlockHeader, getRawTransaction} from "./rpcclient.js" // TODO Why is the .js extension required?
import 'dotenv/config'
import {MerkleTree} from "merkletreejs"
import SHA256 from "crypto-js/sha256.js"
import {verifyBlockHeader, getReversedTxId, verifyProofOnStacks, getBlockHeaderHash} from "./ClarityBitcoinClient.js"
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

getTxProof(txid)
    .then(({blockHeader, stxBlockHeight}: ProvableTx) => getBlockHeaderHash(stxBlockHeight))
    // .then(({blockHeader, stxBlockHeight}: ProvableTx) =>
    //     verifyBlockHeader(blockHeader, stxBlockHeight))
    // .then(({ stxBlockHeight, blockHeader, tx, txIndex, proof }: ProvableTx) =>
    //     verifyProofOnStacks(stxBlockHeight, blockHeader, tx, txIndex, proof))
    // .then(async ({tx, txId}: ProvableTx): Promise<Buffer> => {
    //     const result = await getReversedTxId(tx)
    //     console.assert(reverseBuffer(Buffer.from(txId, 'hex')).equals(result), txId)
    //     return result
    // })
    .then(console.log)
    .catch(console.error)