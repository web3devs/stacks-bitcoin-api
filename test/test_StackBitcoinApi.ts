//
// Some simple tests
//

//TODO More complete tests and use mocha

import { ProvableTx, Utils } from "../lib/index.js";
import { BufferCV, cvToValue, getCVTypeString } from "@stacks/transactions";
// @ts-ignore
import {concatHeader, verifyCompactTx, verifyTx} from "./ClarityBitcoinClient.js";

// const txid = "4a992428186ef340c1137509c484f55793afe6a091dc1ae40169794a4b68a52c"
// const txid = "20f85e35d02e28ac89db8764e280db560de1baaa3ce66f15dcea349fb137879c"
// const txid = "4204768f4e125d97d36cf7769adea9140fa28e359ad4d9757e8d8f86cd152050"
const txid = "85012e953f74df8e883bfa0201061c76559173ab60647a7fd20bccd31945c8b8"


const proofPromise = ProvableTx.fromTxId(txid)

/*******************
 * verifyCompactTx *
 *******************/
proofPromise
    .then(r => r.toCompactProofCV())
    .then(({compactHeader, tx, proof}) => verifyCompactTx(compactHeader, tx, proof))
    .then(result => cvToValue(result)?.value)
    .then(r => console.log('verifyCompactTx result:',r))
    .catch(e => { throw e })

/****************
 * concatHeader *
 ****************/
proofPromise
    .then(r => r.toProofCV())
    .then(({header}) => concatHeader(header))
    .then(result =>
        getCVTypeString(result) === '(buff 80)' ? Utils.cvToBuffer(result as BufferCV).toString('hex') : result
    )
    .then(console.log)
    .catch(console.error)

/************
 * verifyTx *
 ************/
proofPromise
    .then(r => r.toProofCV())
    .then(async ({header, tx, proof}) => verifyTx(header, tx, proof))
    .then(result => cvToValue(result)?.value)
    .then(r => console.log('verifyTx Result:', r))
    .catch(e => console.error(e))

// proofPromise
    // .then(r => {
    //     console.log(r.txDetail.vin[0].txinwitness)
    //     console.log('b:', r.tx.toString("hex"))
    //     r.tx = Buffer.from(
    //         r.tx.toString('hex')
    //         .replace(r.txDetail.vin[0].txinwitness[0], '')
    //         .replace(r.txDetail.vin[0].txinwitness[1], ''),
    //         'hex'
    //     )
    //     console.log("a:", r.tx.toString("hex"))
    //     return r
    // })
    // .then(r => r.toClassicTxCV())
    // .then(tx => calculateTxId(tx))
    // .then(r => cvToValue(r).slice(2))
    // .then(id => console.assert(id === txid, "transactions ids don't match"))
    // .catch(e => console.error(e))

