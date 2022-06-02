import {getBlockHeader, getRawTransaction, getTxOutProof} from "./rpcclient.js" // TODO Why is the .js extension required?
import {ParsedProof} from "./txproof.js";

const config = 'https://btc.getblock.io:443/testnet?api-key=3d54a50e-2442-483d-bddc-2029330b973e'

interface ProvableTx {
    txid: string,
    proof: ParsedProof,
    tx: string,
    blockheight: string,
    blockheader: string,
    blockhash: string
}

const txid = "acb58bc6014836adc65fc87b32d11c1deede76e422c46e029b7cc956e80e8f01"

export const getTxProof = async (txid: string): Promise<any> => {
    const { hex: tx, blockhash } = await getRawTransaction(txid, true)
    const {height, merkleroot} = await getBlockHeader(blockhash, true)
    const proof: any = await getTxOutProof([txid], blockhash)

    // TODO Solve this mystery
    const reversed = Buffer.from(new Uint8Array(Buffer.from(proof.hashes[1], 'hex')).reverse()).toString('hex')
    console.assert(txid !== reversed, "Why TF is the last hash the txid reversed????")

    return {txid, tx, proof, height, blockhash}
}

getTxProof(txid)
    .then(console.log)
    .catch(console.error)