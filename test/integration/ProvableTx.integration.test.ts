import {ProvableTx, Utils} from "../../lib";
// @ts-ignore
import {concatHeader, verifyCompactTx, verifyTx} from "./ClarityBitcoinClient.js";
import {BufferCV, cvToValue, getCVTypeString} from "@stacks/transactions";

jest.setTimeout(10000)

const integrationTests = (txType: string, txid: string) => {
    describe(`With a ${txType} Tx [txid: ${txid}]`, () => {
        let provableTx: ProvableTx;

        beforeEach(async () => {
            provableTx = await ProvableTx.fromTxId(txid)

        })

        test("verify tx using compact header", async () => {
            const {compactHeader, tx, proof} = provableTx.toCompactProofCV()
            const txIsMined = await verifyCompactTx(compactHeader, tx, proof)
            expect(cvToValue(txIsMined)?.value).toBe(true)
        })

        test("verify tx using header details", async () => {
            const {header, tx, proof} = provableTx.toProofCV()
            const txIsMined = await verifyTx(header, tx, proof)
            expect(cvToValue(txIsMined)?.value).toBe(true)
        })

        test("convert header details to a compact header", async () => {
            const {header} = provableTx.toProofCV()
            const result = await concatHeader(header)
            const returnedBlockHeader = getCVTypeString(result) === '(buff 80)' ? Utils.cvToBuffer(result as BufferCV).toString('hex') : result
            expect(returnedBlockHeader).toBe(provableTx.blockHeader.toString('hex'))
        })
    })
}

integrationTests('V0_P2WPKH', "85012e953f74df8e883bfa0201061c76559173ab60647a7fd20bccd31945c8b8")
integrationTests('P2PKH', "20f85e35d02e28ac89db8764e280db560de1baaa3ce66f15dcea349fb137879c")

