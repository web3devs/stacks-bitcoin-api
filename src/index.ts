import {getBlock, getBlockHeader, getRawTransaction} from "./BitcoinRpcClient.js" // TODO Why is the .js extension required?
import 'dotenv/config'
import {MerkleTree} from "merkletreejs"
import SHA256 from "crypto-js/sha256.js"
import {getBlockHeaderHash, getReversedTxId, verifyBlockHeader, verifyProofOnStacks} from "./ClarityBitcoinClient.js"
import {getStxBlockHeight} from "./BlockApiClient.js"
import BigNumber from 'BigNumber.js'

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

const txProofPromise = getTxProof(txid)

txProofPromise
    .then(({blockHeader, stxBlockHeight}: ProvableTx) => getBlockHeaderHash(stxBlockHeight))
    .then(r => console.log(`getBlockheaderHash ${r.toString('hex')}`))
    .catch(console.error)

txProofPromise
    .then(({blockHeader, stxBlockHeight}: ProvableTx) =>
        verifyBlockHeader(blockHeader, stxBlockHeight))
    .then(r => console.log(`verifyBlockHeader ${r}`))
    .catch(console.error)

txProofPromise
    .then(({ stxBlockHeight, blockHeader, tx, txIndex, proof }: ProvableTx) =>
        verifyProofOnStacks(stxBlockHeight, blockHeader, tx, txIndex, proof))
    .then(r => console.log(`verifyProofOfStacks ${r}`))
    .catch(console.error)

txProofPromise
    .then(({tx, txId}: ProvableTx) => getReversedTxId(tx))
    .then(r => console.log(`getReversedTxId ${r.toString('hex')}`))
    .catch(console.error)

const SATOSHIS_PER_BITCOIN = new BigNumber("100000000")
const toSatoshis = (v: number): string => new BigNumber(v).times(SATOSHIS_PER_BITCOIN).toString()

/*
{
    "value": 0.00006121,
    "n": 1,
    "scriptPubKey": {
      "asm": "OP_DUP OP_HASH160 0000000000000000000000000000000000000000 OP_EQUALVERIFY OP_CHECKSIG",
      "desc": "addr(mfWxJ45yp2SFn7UciZyNpvDKrzbhyfKrY8)#ydtjlapp",
      "hex": "76a914000000000000000000000000000000000000000088ac",
      "address": "mfWxJ45yp2SFn7UciZyNpvDKrzbhyfKrY8",
      "type": "pubkeyhash"
    }
  },
*/

getRawTransaction(txid, true)
    .then(({vin, vout, hex}) => {
        // console.log(JSON.stringify(vin, undefined, 2))
        // console.log(JSON.stringify(vout, undefined, 2))
        const outputs = vout.map(({value, scriptPubKey: {hex}}: any) => (
            {value: toSatoshis(value), scriptPubKey: Buffer.from(hex, 'hex')}
        ))
        return outputs


    })
    .then(console.log)
    .catch(console.error)