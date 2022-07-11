import {hexOrBufferToBuffer, hexOrBufferToHex, numberToBufferLE, reverseBuffer} from "./Utils.js"
import {getBlockStats, getRawBlockHeader, getTransactionDetails} from "./BitcoinRpcClient.js"
import {getStxBlockHeight} from "./BlockApiClient.js"
import {MerkleTree} from "merkletreejs"
import {BufferCV, bufferCV, listCV, tupleCV, uintCV} from "@stacks/transactions"
import SHA256 from "crypto-js/sha256.js"
import {Transaction} from "bitcoinjs-lib";

const SEGWIT_MARKER_OFFSET = 4
const SEGWIT_FLAG_OFFSET = 5;

export default class ProvableTx {
    readonly tx: Buffer
    readonly txId: Buffer
    readonly txIndex: number
    readonly stxBlockHeight: number
    readonly blockHeader: Buffer
    readonly proof: Buffer[]
    readonly txDetail: any
    readonly blockDetail: any

    private constructor(tx: Buffer, txId: Buffer, txIndex: number, stxBlockHeight: number, blockHeader: Buffer,
                proof: Buffer[], txDetail: any, blockDetail: any) {
        this.tx = tx
        this.txId = txId
        this.txIndex = txIndex
        this.stxBlockHeight = stxBlockHeight
        this.blockHeader = blockHeader
        this.proof = proof
        this.txDetail = txDetail
        this.blockDetail = blockDetail
    }

    // TODO There is some kind of race condition or buffer overrun happening when this function gets called more than once
    public static async fromTxId(txId: string | Buffer): Promise<ProvableTx> {
        const txIdHex = hexOrBufferToHex(txId)
        const txDetail = await getTransactionDetails(txIdHex)
        const tx = Buffer.from(txDetail.hex, 'hex')
        let txWithoutSegwit

        const isSegwit = tx.readInt8(SEGWIT_MARKER_OFFSET) === 0
        const segwitFlag = isSegwit ? tx.readInt8(SEGWIT_FLAG_OFFSET) : 0
        if (isSegwit) {
            if (segwitFlag === 1) {
                txWithoutSegwit = Transaction.fromHex(txDetail.hex)
                    .toBuffer(undefined, undefined, false) // TODO This requires a hacked bitcoinjs-lib
            } else {
                throw "unknown segwit flag value"
            }
        }

        const blockHeader = Buffer.from(await getRawBlockHeader(txDetail.blockhash), 'hex')
        const blockDetail = await getBlockStats(txDetail.blockhash)
        const stxBlockHeight = await getStxBlockHeight(blockDetail.height) as number
        const txIndex = blockDetail.tx.findIndex((id: string) => id === txId)

        const tree = new MerkleTree(blockDetail.tx, SHA256, {isBitcoinTree: true})
        const proof = tree.getProof(blockDetail.tx, txIndex).map(p => p.data)
        return new ProvableTx(
            txWithoutSegwit || tx,
            hexOrBufferToBuffer(txId),
            txIndex,
            stxBlockHeight,
            blockHeader,
            proof,
            txDetail,
            blockDetail
        )
    }

    toCompactProofCV() {
        return {
            compactHeader: this.getCompactHeaderCV(),
            tx: bufferCV(this.tx),
            proof: this.getProofCV(),
        }
    }

    toProofCV() {
        return {
            header: this.getHeaderCV(),
            tx: bufferCV(this.tx),
            proof: this.getProofCV()
        }
    }

    private getHeaderCV() {
        return tupleCV({
            version: bufferCV(reverseBuffer(Buffer.from(this.blockDetail.versionHex, 'hex'))),
            parent: bufferCV(reverseBuffer(Buffer.from(this.blockDetail.previousblockhash, 'hex'))),
            'merkle-root': bufferCV(reverseBuffer(Buffer.from(this.blockDetail.merkleroot, 'hex'))),
            timestamp: bufferCV(numberToBufferLE(this.blockDetail.time, 4)),
            nbits: bufferCV(reverseBuffer(Buffer.from(this.blockDetail.bits, 'hex'))),
            nonce: bufferCV(numberToBufferLE(this.blockDetail.nonce, 4)),
            height: uintCV(this.stxBlockHeight)
        });
    }

    private getProofCV() {
        return tupleCV({
            "tx-index": uintCV(this.txIndex),
            hashes: listCV<BufferCV>(this.proof.map(p => bufferCV(reverseBuffer(p)))),
            "tree-depth": uintCV(this.proof.length)
        });
    }

    private getCompactHeaderCV() {
        return tupleCV({
            header: bufferCV(this.blockHeader),
            height: uintCV(this.stxBlockHeight)
        });
    }
}
