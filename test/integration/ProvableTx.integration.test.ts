// @ts-ignore
import _ from 'lodash'
import { ProvableTx, Utils } from '../../lib'
// @ts-ignore
import { concatHeader, parseTx, verifyCompactTx, verifyTx } from './ClarityBitcoinClient.js'
import { bufferCV, BufferCV, cvToValue, getCVTypeString } from '@stacks/transactions'

jest.setTimeout(10000)

const integrationTests = (txType: string, txid: string) => {
    describe(`With a "${txType}" Tx [txid: "${txid}"]`, () => {
        let provableTx: ProvableTx
        let original: ProvableTx

        beforeEach(async () => {
            provableTx = await ProvableTx.fromTxId(txid)
            original = _.cloneDeep(provableTx)
        })

        afterEach(() => {
            // Sanity check: provableTx should not be mutated
            expect(provableTx).toEqual(original)
        })

        test('verify tx using compact header', async () => {
            const { compactHeader, tx, proof } = provableTx.toCompactProofCV()
            const txIsMined = await verifyCompactTx(compactHeader, tx, proof)
            expect(cvToValue(txIsMined)?.value).toEqual(true)
        })

        test('verify tx using header details', async () => {
            const { header, tx, proof } = provableTx.toProofCV()
            const txIsMined = await verifyTx(header, tx, proof)
            expect(cvToValue(txIsMined)?.value).toEqual(true)
        })

        test('convert header details to a compact header', async () => {
            const { header } = provableTx.toProofCV()
            const result = await concatHeader(header)
            const returnedBlockHeader =
                getCVTypeString(result) === '(buff 80)' ? Utils.cvToBuffer(result as BufferCV).toString('hex') : result
            expect(returnedBlockHeader).toEqual(provableTx.blockHeader.toString('hex'))
        })

        test('parse the proven part of a tx', async () => {
            const expectedScriptPubKeys = provableTx.txDetail.vout.map((o: any) => o.scriptPubKey?.hex)
            const expectedOutputValues = provableTx.txDetail.vout.map((o: any) => BigInt(Math.round(o.value * 10 ** 8)))
            const isCoinbase = provableTx.txDetail.vin.map(({ coinbase }: any) => !!coinbase).includes(true)
            const expectedInputs = provableTx.txDetail.vin.map(({ txid, vout, sequence, scriptSig }: any) => ({
                txid,
                vout: (Number.isInteger(vout) && BigInt(vout)) || BigInt(0),
                sequence: BigInt(sequence),
                scriptSig: scriptSig?.hex || '',
            }))

            const result = await parseTx(bufferCV(provableTx.tx))

            // Outputs

            // @ts-ignore
            const outs = result?.value?.data?.outs?.list.map(({ data: { scriptPubKey, value } }) => ({
                scriptPubKey: scriptPubKey.buffer,
                value: value.value,
            }))

            // Check the script pub keys
            const actualScriptPubKeys = outs.map((o: { scriptPubKey: Buffer }) => o.scriptPubKey.toString('hex'))
            expect(actualScriptPubKeys).toEqual(expectedScriptPubKeys)

            // Check the output values
            const actualValues = outs.map((o: any) => o.value)
            expect(actualValues).toEqual(expectedOutputValues)

            if (!isCoinbase) {
                // Inputs
                // @ts-ignore
                const actualInputs = result?.value?.data?.ins?.list.map(({ data }) => ({
                    txid: data.outpoint?.data?.hash?.buffer.toString('hex'),
                    vout: data.outpoint?.data?.index?.value,
                    scriptSig: data.scriptSig?.buffer?.toString('hex'),
                    sequence: data.sequence?.value,
                }))
                expect(actualInputs).toEqual(expectedInputs)
            }

            // The rest
            // @ts-ignore
            expect(result?.value?.data?.version?.value).toBe(BigInt(provableTx.txDetail.version))
            // @ts-ignore
            expect(result?.value?.data?.locktime?.value).toBe(BigInt(provableTx.txDetail.locktime))
        })
    })
}

describe('integration tests', () => {
    integrationTests('V0_P2WPKH', '85012e953f74df8e883bfa0201061c76559173ab60647a7fd20bccd31945c8b8')
    integrationTests('segwit P2PKH', '24618fc27cb73c5d5df6ad9a63695f7c665d8b1a6e0b52a1c4674ec8b79b0851')
    integrationTests('segwit P2SH', 'c80a4bb16a4fae389974bbde99a1d28ce9d4edc709f0b339055787fa1a1eec1d')
    integrationTests('standard P2PKH', '33fb9cfbbe8dbd2b48eb15333962cf35e6d5efc12843e717e61386cd219d0ce2')
    integrationTests('standard P2PKH+OP_RETURN', '846570b2050b2d1cfd183be6bad0970ad6b60b099c6a2d585eb7a39865782bd5')
    integrationTests('standard P2SH', '75cdf7e0f9d2345c8ce4c5b45ad4ee483bf6c2d99bf503cea225132e20889ef4')
    integrationTests('V1_P2TR', '3c45aaa49e8654e747a33c307964bd5725b3a06b7e2c938bdac25e98c90a4592')
    integrationTests('coinbase', '750b1fe1ecf1dcc364fdfd864fae1958144a74403e16b13fdd4c780b59a5ce5e')
})
