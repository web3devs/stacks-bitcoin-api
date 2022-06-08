import {getBlock, getBlockHeader, getRawTransaction, getTxOutProof} from "./rpcclient.js" // TODO Why is the .js extension required?
import {
    BufferCV,
    callReadOnlyFunction,
    listCV,
    tupleCV,
    uintCV,
    ClarityValue,
    bufferCVFromString, bufferCV, cvToValue,
} from "@stacks/transactions"
import 'dotenv/config'
import {MerkleTree} from "merkletreejs";
import SHA256 from "crypto-js/sha256.js"

const {CLARITY_BITCOIN_CONTRACT_NAME, CLARITY_BITCOIN_CONTRACT_ADDRESS} = process.env

interface ProvableTx {
    tx: Buffer,
    txId: string,
    txIndex: number,
    blockHeight: string,
    blockHeader: Buffer,
    treeDepth: number,
    proof: Buffer[],
}

const txid = "5a955dbb2f95609841e82a1fb2c913671e148eb21a923c6b5fe0e85314f63bb1"

const reverseBuffer = (src: Buffer): Buffer => {
    var buffer = Buffer.alloc(src.length)
    for (var i = 0, j = src.length - 1; i <= j; ++i, --j) {
        buffer[i] = src[j]
        buffer[j] = src[i]
    }
    return buffer
}

const getTxProof = async (txId: string): Promise<ProvableTx> => {
    const { blockhash, hex } = await getRawTransaction(txid, true)
    const tx = Buffer.from(hex, 'hex')
    const blockHeader = Buffer.from(await getBlockHeader(blockhash), 'hex')
    const { tx: txIds, height: blockHeight } = await getBlock(blockhash, 1)
    const txIndex = txIds.findIndex((id: string) => id === txId);
    const tree = new MerkleTree(txIds, SHA256, { isBitcoinTree: true });
    const treeDepth = tree.getDepth();
    const proof = tree.getProof(txId, txIndex).map(p => reverseBuffer(p.data));

    return { tx, txId, txIndex, blockHeight, blockHeader, treeDepth, proof }
}

const verifyProofOnStacks = async ({ blockHeight, blockHeader, tx, txIndex, proof, treeDepth }: ProvableTx): Promise<any> => {
    const functionName = 'was-tx-mined-compact'
    const functionArgs: ClarityValue[] = [
        tupleCV({
            header: bufferCV(blockHeader),
            height: uintCV(blockHeight),
        }),
        bufferCV(tx),
        tupleCV({
            "tx-index": uintCV(txIndex),
            hashes: listCV<BufferCV>(proof.map(p => bufferCV(p))),
            "tree-depth": uintCV(treeDepth)
        })
    ]
    const network = 'testnet'
    const senderAddress = 'ST24YYAWQ4DK4RKCKK1RP4PX0X5SCSXTWQXFGVCVY'

    const result = await callReadOnlyFunction({
        contractName: CLARITY_BITCOIN_CONTRACT_NAME as string,
        contractAddress: CLARITY_BITCOIN_CONTRACT_ADDRESS as string,
        functionName,
        functionArgs,
        network,
        senderAddress,
    })
    return cvToValue(result)
}

getTxProof(txid)
    .then(verifyProofOnStacks)
    .then(console.log) // FIXME Expecting true, getting false
    .catch(console.error)