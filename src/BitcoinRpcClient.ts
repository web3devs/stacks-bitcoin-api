import { parseRawProof } from "./txproof.js";
import 'dotenv/config'

const VERBOSE = 2

const {RPCURL, APIKEY} = process.env

const callRpc = async (method: string, params: any[]): Promise<any> => {
    const response = await fetch(RPCURL as string, {
        method: 'POST',
        body: JSON.stringify({
            "jsonrpc": "2.0",
            "id": Math.floor(Math.random() * Number.MAX_SAFE_INTEGER),
            "method": method,
            "params": params
        }),
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': APIKEY as string
        }
    })
    const responseJson: any = await response.json()
    if (responseJson.error) throw responseJson.error
    return responseJson.result
}

export const getRawTransaction = (txid: string, verbose: boolean = false, blockhash?: string) =>
    callRpc('getrawtransaction', [txid, verbose, blockhash])

export const getBlockHeader = (blockhash: string, verbose: boolean = false) =>
    callRpc('getblockheader', [blockhash, verbose])

export const getTxOutProof = async (txids: String[], blockhash: string) =>
    parseRawProof(await callRpc('gettxoutproof', [txids, blockhash]))

export const getBlock = async (blockhash: String, verbosity: number = VERBOSE) =>
    callRpc('getblock', [blockhash, verbosity])