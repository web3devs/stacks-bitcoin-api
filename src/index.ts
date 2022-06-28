import {getBlockStats, getRawBlockHeader, getTransactionDetails} from "./BitcoinRpcClient.js" // TODO Why is the .js extension required?
import 'dotenv/config'
import {MerkleTree} from "merkletreejs"
import SHA256 from "crypto-js/sha256.js"
import {getStxBlockHeight} from "./BlockApiClient.js"
import BigNumber from 'BigNumber.js'
import BN from "bn.js";
import {cvToBuffer, hexOrBufferToBuffer, hexOrBufferToHex, numberToBuffer, reverseBuffer} from "./utils.js";
import {verifyCompactTx, verifyTx, concatHeader} from "./ClarityBitcoinClient.js";
import {
    BufferCV,
    bufferCV,
    cvToValue,
    getCVTypeString,
    getTypeString,
    listCV,
    tupleCV,
    uintCV
} from "@stacks/transactions";
import {ClarityValue} from "@stacks/transactions/dist/clarity";

const {
    CLARITY_BITCOIN_CONTRACT_NAME,
    CLARITY_BITCOIN_CONTRACT_ADDRESS,
    NETWORK,
    SENDER_ADDRESS
} = process.env

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

// const txid = "4a992428186ef340c1137509c484f55793afe6a091dc1ae40169794a4b68a52c"
const txid = "20f85e35d02e28ac89db8764e280db560de1baaa3ce66f15dcea349fb137879c"
// const txid = "4204768f4e125d97d36cf7769adea9140fa28e359ad4d9757e8d8f86cd152050"

const getTxProof = async (txId: string | Buffer): Promise<ProvableTx> => {
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

export const toCompactProofCV = async (
    {
        tx,
        txIndex,
        proof,
        blockHeader,
        stxBlockHeight
    }: ProvableTx): Promise<any> => {
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

export const toProofCV = async (
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
    }: ProvableTx): Promise<any> => {
    return {
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
        }),
    }
}

const proofPromise = getTxProof(txid)

proofPromise
    .then(toCompactProofCV)
    .then(({compactHeader, tx, proof}) => verifyCompactTx(compactHeader, tx, proof))
    .then(result => cvToValue(result)?.value)
    .then(r => console.log('verifyCompactTx result:',r))
    .catch(e => {
        throw e
    })

proofPromise
    .then(toProofCV)
    .then(({header}) => concatHeader(header))
    .then(result =>
        getCVTypeString(result) === '(buff 80)' ? cvToBuffer(result as BufferCV).toString('hex') : result
    )
    .then(console.log)
    .catch(console.error)

proofPromise
    .then(toProofCV)
    .then(async ({header, tx, proof}) => verifyTx(header, tx, proof))
    .then(result => cvToValue(result)?.value)
    .then(r => console.log('verifyTx Result:', r))
    .catch(e => console.error(e))
