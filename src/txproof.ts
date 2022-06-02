import varint from "varint";

export interface ParsedProof {
    header: String,
    txCount: number,
    hashes: String[],
    flags: String
}

export const parseRawProof = (proof: Buffer | String): ParsedProof => {
    let cursor = 0

    const proofBuff: Buffer = typeof proof === 'string' ? Buffer.from(proof, 'hex') : proof as Buffer

    const header = proofBuff.subarray(cursor, 80).toString('hex')
    cursor += 80

    const txCount = proofBuff.readUInt32LE(cursor)
    cursor += 4

    const hashCount = varint.decode(proofBuff, cursor)
    cursor += varint.encodingLength(hashCount)

    let hashes = []
    for (let i = 0; i < hashCount; i++) {
        hashes.push(proofBuff.subarray(cursor, cursor + 32).toString('hex'))
        cursor += 32
    }
    const flagbitCount = varint.decode(proofBuff, cursor)
    cursor += varint.encodingLength(flagbitCount)

    const flagsLength = Math.ceil(8 / flagbitCount)
    const flags = proofBuff.subarray(cursor, cursor + flagsLength).toString('hex')

    cursor += flagsLength

    return {header, txCount, hashes, flags}
}

