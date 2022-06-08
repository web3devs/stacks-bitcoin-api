import varint from "varint";

export interface ParsedProof {
    blockHeader: string,
    txCount: number,
    hashes: string[],
    flags: string
}

export const parseRawProof = (proof: Buffer | string): ParsedProof => {
    let cursor = 0

    const proofBuff: Buffer = typeof proof === 'string' ? Buffer.from(proof, 'hex') : proof as Buffer

    const blockHeader = proofBuff.subarray(cursor, 80).toString('hex')
    cursor += 80

    const txCount = proofBuff.readUInt32LE(cursor)
    cursor += 4

    console.log('txcount:', txCount)

    const hashCount = varint.decode(proofBuff, cursor)
    cursor += varint.encodingLength(hashCount)

    let hashes = []
    for (let i = 0; i < hashCount; i++) {
        hashes.push(proofBuff.subarray(cursor, cursor + 32).toString('hex'))
        cursor += 32
    }
    const bytesOfFlagBits = varint.decode(proofBuff, cursor)
    cursor += varint.encodingLength(bytesOfFlagBits)

    const flags = proofBuff.subarray(cursor, cursor + bytesOfFlagBits).toString('hex')
    console.log('flag bits:', bytesOfFlagBits)
    console.log('flags:', flags)

    console.assert(cursor + bytesOfFlagBits === proofBuff.length, "Proof not read correctly")

    return {blockHeader, txCount, hashes, flags}
}

