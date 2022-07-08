import {Buffer} from "buffer";
import {
    compareToRange,
    cvToBuffer, hexOrBufferToBuffer,
    hexOrBufferToHex,
    numberToBufferLE,
    RangeComparison,
    reverseBuffer
} from "../lib/Utils.js";
import {bufferCV, bufferCVFromString} from "@stacks/transactions";

describe('reverseBuffer', () => {
    test('it reverses the bytes in a buffer', () => {
        expect(reverseBuffer(Buffer.from('00010203', 'hex')).toString('hex')).toBe('03020100')
    })
})

describe('compareToRange', () => {
    test('entries below the range return BELOW', () => {
        expect(compareToRange(1, {min: 10, max: 20})).toBe(RangeComparison.Below)
    })

    test('entries above the range return ABOVE', () => {
        expect(compareToRange(30, {min: 10, max: 20})).toBe(RangeComparison.Above)
    })

    test('entries in the range return CONTAINED', () => {
        expect(compareToRange(15, {min: 10, max: 20})).toBe(RangeComparison.Contained)
    })
})

describe('cvToBuffer', () => {
    test('it converts a cvBuffer to a Buffer', () => {
        const expected = '000102ff'
        const input = bufferCV(Buffer.from(expected, 'hex'))
        expect(cvToBuffer(input).toString('hex')).toBe(expected)
    })
})

describe('numberToBufferLE', () => {
    test('4 bytes', () => {
        const expected = '01000000'
        expect(numberToBufferLE(1, 4).toString('hex')).toBe(expected)
    })
    test('default byte count (8 bytes)', () => {
        const expected = '0100000000000000'
        expect(numberToBufferLE(1).toString('hex')).toBe(expected)
    })
})

describe('hexOrBufferToHex', () => {
    test('accepts hex string', () => {
        const expected = "deadbeef"
        expect(hexOrBufferToHex(expected)).toBe(expected)
    })

    test('accepts buffer', () => {
        const expected = "deadbeef"
        expect(hexOrBufferToHex(Buffer.from(expected, 'hex'))).toBe(expected)
    })
})

describe('hexOrBufferToBuffer', () => {
    test('accepts hex string', () => {
        const expected = "deadbeef"
        expect(hexOrBufferToBuffer(expected).toString('hex')).toBe(expected)
    })

    test('accepts buffer', () => {
        const expected = "deadbeef"
        expect(hexOrBufferToBuffer(Buffer.from(expected, 'hex')).toString('hex')).toBe(expected)
    })
})