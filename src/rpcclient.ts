import fetch from "node-fetch";
import { parseRawProof } from "./txproof.js";
import 'dotenv/config'

const rpcUrl = process.env.RPCURL as string
const apiKey = process.env.APIKEY as string

const callRpc = async (method: string, params: any[]): Promise<any> => {
    const response = await fetch(rpcUrl, {
        method: 'POST',
        body: JSON.stringify({
            "jsonrpc": "2.0",
            "id": Math.floor(Math.random() * Number.MAX_SAFE_INTEGER),
            "method": method,
            "params": params
        }),
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey
        }
    })

    const responseJson: any = await response.json()

    if (responseJson.error) throw responseJson.error

    return responseJson.result
}

export const getRawTransaction = (txid: string, verbose: boolean = false) =>
    callRpc('getrawtransaction', [txid, verbose])

export const getBlockHeader = (blockhash: string, verbose: boolean = false) =>
    callRpc('getblockheader', [blockhash, verbose])

export const getTxOutProof = async (txids: String[], blockhash: string) =>
    parseRawProof(await callRpc('gettxoutproof', [txids, blockhash]))
