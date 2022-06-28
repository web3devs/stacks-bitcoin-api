import 'dotenv/config'
import {Buffer} from "buffer"
import {hexOrBufferToHex} from "./utils.js"

const {RPCURL, APIKEY} = process.env

const callRpc = async (method: string, params: any[]): Promise<any> => {
    // TODO Make this work with the bitcoin node in the clarinet integrate environment
    const init = {
        method: 'POST',
        body: JSON.stringify({
            "jsonrpc": "2.0",
            "id": Math.floor(Math.random() * Number.MAX_SAFE_INTEGER),
            "method": method,
            "params": params
        }),
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': APIKEY as string,
        }
    };
    const response = await fetch(RPCURL as string, init)
    console.assert(response.status !== 401, response.status)
    const responseJson: any = await response.json()
    console.assert(!responseJson.error, JSON.stringify(responseJson.error))
    return responseJson.result
}

export const getTransactionDetails = (txid: string | Buffer) =>
    callRpc('getrawtransaction', [hexOrBufferToHex(txid), true])

export const getRawBlockHeader = (blockhash: string | Buffer) =>
    callRpc('getblockheader', [hexOrBufferToHex(blockhash), false])

export const getBlockStats = (blockhash: string | Buffer) =>
    callRpc('getblock', [hexOrBufferToHex(blockhash), 1])