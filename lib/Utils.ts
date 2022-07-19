import {BufferCV, cvToValue} from "@stacks/transactions"
import {Buffer} from "buffer"
import BN from "bn.js";
import BigNumber from "bignumber.js";

export const hexOrBufferToHex = (hob: string | Buffer) => typeof hob === 'string' ? hob : hob.toString('hex')
export const hexOrBufferToBuffer = (hob: string | Buffer) => typeof hob === 'string' ? Buffer.from(hob, 'hex') : hob

export type Range = {
    min: number,
    max: number
}

export enum RangeComparison {
    Above = 1,
    Below = -1,
    Contained = 0,
}

export const compareToRange = (i: number, {min, max}: Range) =>
    i < min ? RangeComparison.Below : i > max ? RangeComparison.Above : RangeComparison.Contained

export const reverseBuffer = (buffer: Buffer): Buffer => {
    for (let i = 0, j = buffer.length - 1; i < j; ++i, --j) {
        [buffer[i], buffer[j]] = [buffer[j], buffer[i]]
    }
    return buffer
}

export const cvToBuffer = (cv: BufferCV): Buffer => Buffer.from(cvToValue(cv).slice(2), 'hex')


export const numberToBuffer = (value: BN | number | string, size: number = 8): Buffer => reverseBuffer(Buffer.from(
    new BN(value).toString(16, size * 2),
    'hex'
))
const toSatoshis = (v: number | string | BigNumber): BN => new BN(new BigNumber(v).shiftedBy(8).toString())
const toBitcoins = (v: number): string => new BigNumber(v).shiftedBy(-8).toString()
