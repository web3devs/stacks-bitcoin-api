//
// Some simple tests
//

import { Proof, ClarityBitcoinClient, Utils } from "../lib/index.js";
import { BufferCV, cvToValue, getCVTypeString } from "@stacks/transactions";

// const txid = "4a992428186ef340c1137509c484f55793afe6a091dc1ae40169794a4b68a52c"
const txid = "20f85e35d02e28ac89db8764e280db560de1baaa3ce66f15dcea349fb137879c"
// const txid = "4204768f4e125d97d36cf7769adea9140fa28e359ad4d9757e8d8f86cd152050"


const proofPromise = Proof.getTxProof(txid)

proofPromise
    .then(Proof.toCompactProofCV)
    .then(({compactHeader, tx, proof}) => ClarityBitcoinClient.verifyCompactTx(compactHeader, tx, proof))
    .then(result => cvToValue(result)?.value)
    .then(r => console.log('verifyCompactTx result:',r))
    .catch(e => {
        throw e
    })

proofPromise
    .then(Proof.toProofCV)
    .then(({header}) => ClarityBitcoinClient.concatHeader(header))
    .then(result =>
        getCVTypeString(result) === '(buff 80)' ? Utils.cvToBuffer(result as BufferCV).toString('hex') : result
    )
    .then(console.log)
    .catch(console.error)

proofPromise
    .then(Proof.toProofCV)
    .then(async ({header, tx, proof}) => ClarityBitcoinClient.verifyTx(header, tx, proof))
    .then(result => cvToValue(result)?.value)
    .then(r => console.log('verifyTx Result:', r))
    .catch(e => console.error(e))
